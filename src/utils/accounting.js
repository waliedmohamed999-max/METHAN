export const accountTypes = ["Assets", "Liabilities", "Equity", "Revenue", "Expenses"];

export const accountTypeLabels = {
  Assets: "الأصول",
  Liabilities: "الخصوم",
  Equity: "حقوق الملكية",
  Revenue: "الإيرادات",
  Expenses: "المصروفات"
};

export const cashFlowTags = [
  { value: "operating", label: "تشغيلي" },
  { value: "depreciation", label: "إهلاك" },
  { value: "receivablesChange", label: "تغير الذمم المدينة" },
  { value: "payablesChange", label: "تغير الذمم الدائنة" },
  { value: "investingPurchase", label: "شراء أصول" },
  { value: "financingLoan", label: "قروض وتمويل" },
  { value: "capital", label: "رأس المال" },
  { value: "drawings", label: "مسحوبات" }
];

export const cashFlowTagLabels = Object.fromEntries(cashFlowTags.map((tag) => [tag.value, tag.label]));

export function money(value) {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

export function normalizeNumber(value) {
  const parsed = Number(String(value ?? "").replaceAll(",", "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

export function netAmount(account) {
  const debit = normalizeNumber(account.debit);
  const credit = normalizeNumber(account.credit);
  if (account.type === "Assets" || account.type === "Expenses") return debit - credit;
  return credit - debit;
}

export function calculateStatements(accounts) {
  const rows = accounts.filter((account) => account.name.trim());
  const totalDebit = rows.reduce((sum, account) => sum + normalizeNumber(account.debit), 0);
  const totalCredit = rows.reduce((sum, account) => sum + normalizeNumber(account.credit), 0);
  const byType = Object.fromEntries(accountTypes.map((type) => [type, rows.filter((account) => account.type === type)]));
  const totals = Object.fromEntries(accountTypes.map((type) => [type, byType[type].reduce((sum, account) => sum + netAmount(account), 0)]));

  const revenueTotal = totals.Revenue;
  const expensesTotal = totals.Expenses;
  const netIncome = revenueTotal - expensesTotal;
  const drawings = byType.Equity
    .filter((account) => account.cashFlowTag === "drawings" || account.name.includes("مسحوبات"))
    .reduce((sum, account) => sum + Math.abs(netAmount(account)), 0);
  const beginningCapital = byType.Equity
    .filter((account) => account.cashFlowTag !== "drawings")
    .reduce((sum, account) => sum + netAmount(account), 0);
  const endingEquity = beginningCapital + netIncome - drawings;
  const liabilitiesAndEquity = totals.Liabilities + endingEquity;

  const depreciation = rows
    .filter((account) => account.cashFlowTag === "depreciation" || account.name.includes("إهلاك"))
    .reduce((sum, account) => sum + Math.abs(netAmount(account)), 0);
  const receivablesChange = rows
    .filter((account) => account.cashFlowTag === "receivablesChange" || account.name.includes("ذمم مدينة"))
    .reduce((sum, account) => sum - Math.abs(netAmount(account)), 0);
  const payablesChange = rows
    .filter((account) => account.cashFlowTag === "payablesChange" || account.name.includes("ذمم دائنة"))
    .reduce((sum, account) => sum + Math.abs(netAmount(account)), 0);
  const operatingCashFlow = netIncome + depreciation + receivablesChange + payablesChange;
  const investingCashFlow = rows
    .filter((account) => account.cashFlowTag === "investingPurchase")
    .reduce((sum, account) => sum - Math.abs(netAmount(account)), 0);
  const financingCashFlow = rows
    .filter((account) => account.cashFlowTag === "financingLoan" || account.cashFlowTag === "capital" || account.cashFlowTag === "drawings")
    .reduce((sum, account) => sum + (account.cashFlowTag === "drawings" ? -Math.abs(netAmount(account)) : Math.abs(netAmount(account))), 0);
  const detailedRows = {
    incomeRevenue: byType.Revenue.map((account) => ({ id: account.id, label: account.name, value: netAmount(account), account })),
    incomeExpenses: byType.Expenses.map((account) => ({ id: account.id, label: account.name, value: -Math.abs(netAmount(account)), account })),
    assets: byType.Assets.map((account) => ({ id: account.id, label: account.name, value: netAmount(account), account })),
    liabilities: byType.Liabilities.map((account) => ({ id: account.id, label: account.name, value: netAmount(account), account })),
    equityAccounts: byType.Equity.map((account) => ({ id: account.id, label: account.name, value: netAmount(account), account })),
    equityOpening: byType.Equity
      .filter((account) => account.cashFlowTag !== "drawings")
      .map((account) => ({ id: account.id, label: account.name, value: netAmount(account), account })),
    equityDrawings: byType.Equity
      .filter((account) => account.cashFlowTag === "drawings" || account.name.includes("مسحوبات"))
      .map((account) => ({ id: account.id, label: account.name, value: -Math.abs(netAmount(account)), account })),
    cashDepreciation: rows
      .filter((account) => account.cashFlowTag === "depreciation" || account.name.includes("إهلاك"))
      .map((account) => ({ id: account.id, label: account.name, value: Math.abs(netAmount(account)), account })),
    cashReceivables: rows
      .filter((account) => account.cashFlowTag === "receivablesChange" || account.name.includes("ذمم مدينة"))
      .map((account) => ({ id: account.id, label: account.name, value: -Math.abs(netAmount(account)), account })),
    cashPayables: rows
      .filter((account) => account.cashFlowTag === "payablesChange" || account.name.includes("ذمم دائنة"))
      .map((account) => ({ id: account.id, label: account.name, value: Math.abs(netAmount(account)), account })),
    cashInvesting: rows
      .filter((account) => account.cashFlowTag === "investingPurchase")
      .map((account) => ({ id: account.id, label: account.name, value: -Math.abs(netAmount(account)), account })),
    cashFinancing: rows
      .filter((account) => account.cashFlowTag === "financingLoan" || account.cashFlowTag === "capital" || account.cashFlowTag === "drawings")
      .map((account) => ({
        id: account.id,
        label: account.name,
        value: account.cashFlowTag === "drawings" ? -Math.abs(netAmount(account)) : Math.abs(netAmount(account)),
        account
      }))
  };

  return {
    rows,
    totalDebit,
    totalCredit,
    balancedTrial: Math.abs(totalDebit - totalCredit) < 0.01,
    byType,
    totals,
    revenueTotal,
    expensesTotal,
    netIncome,
    beginningCapital,
    drawings,
    endingEquity,
    liabilitiesAndEquity,
    financialPositionBalanced: Math.abs(totals.Assets - liabilitiesAndEquity) < 0.01,
    detailedRows,
    cashFlow: {
      depreciation,
      receivablesChange,
      payablesChange,
      operatingCashFlow,
      investingCashFlow,
      financingCashFlow,
      netCashFlow: operatingCashFlow + investingCashFlow + financingCashFlow
    }
  };
}

export function parseExcelPaste(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line, index) => {
      if (index !== 0) return true;
      const normalized = line.toLowerCase();
      return !(
        normalized.includes("account") ||
        normalized.includes("الحساب") ||
        normalized.includes("اسم الحساب")
      );
    })
    .map((line) => {
      const [name = "", type = "Assets", debit = "0", credit = "0"] = line.split(/\t|,/);
      const normalizedType = accountTypes.includes(type.trim()) ? type.trim() : "Assets";
      return {
        id: crypto.randomUUID(),
        name: name.trim(),
        type: normalizedType,
        debit: normalizeNumber(debit),
        credit: normalizeNumber(credit),
        cashFlowTag: "operating"
      };
    });
}

export function downloadCsv(filename, rows) {
  const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}
