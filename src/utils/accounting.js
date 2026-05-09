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
    .filter((account) => account.cashFlowTag === "financingLoan" || account.cashFlowTag === "capital")
    .reduce((sum, account) => sum + Math.abs(netAmount(account)), 0);

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
