import * as XLSX from "xlsx";

export const accountTypes = ["Assets", "Liabilities", "Equity", "Revenue", "Expenses"];

export const accountTypeLabels = {
  Assets: "الأصول",
  Liabilities: "الخصوم",
  Equity: "حقوق الملكية",
  Revenue: "الإيرادات",
  Expenses: "المصروفات"
};

export const accountDetailCategories = {
  Assets: [
    { value: "currentAssets", label: "أصول متداولة" },
    { value: "fixedAssets", label: "أصول ثابتة" },
    { value: "contraAssets", label: "أصول مقابلة" },
    { value: "otherAssets", label: "أصول أخرى" }
  ],
  Liabilities: [
    { value: "currentLiabilities", label: "خصوم متداولة" },
    { value: "longTermLiabilities", label: "خصوم طويلة الأجل" },
    { value: "otherLiabilities", label: "خصوم أخرى" }
  ],
  Equity: [
    { value: "capital", label: "رأس المال" },
    { value: "retainedEarnings", label: "أرباح مبقاة" },
    { value: "drawings", label: "مسحوبات" },
    { value: "currentYearResult", label: "نتيجة العام" }
  ],
  Revenue: [
    { value: "operatingRevenue", label: "إيرادات تشغيلية" },
    { value: "nonOperatingRevenue", label: "إيرادات غير تشغيلية" },
    { value: "otherRevenue", label: "إيرادات أخرى" }
  ],
  Expenses: [
    { value: "operatingExpenses", label: "مصروفات تشغيلية" },
    { value: "administrativeExpenses", label: "مصروفات إدارية" },
    { value: "sellingExpenses", label: "مصروفات بيعية" },
    { value: "financeExpenses", label: "مصروفات تمويلية" },
    { value: "depreciationExpenses", label: "مصروفات إهلاك" },
    { value: "otherExpenses", label: "مصروفات أخرى" }
  ]
};

export const accountDetailCategoryLabels = Object.fromEntries(
  Object.values(accountDetailCategories).flat().map((category) => [category.value, category.label])
);

export function defaultDetailCategory(type) {
  return accountDetailCategories[type]?.[0]?.value || "";
}

export function normalizeDetailCategory(type, detailCategory) {
  const allowed = accountDetailCategories[type] || [];
  return allowed.some((category) => category.value === detailCategory) ? detailCategory : defaultDetailCategory(type);
}

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

export function splitDebitCredit(value) {
  const amount = normalizeNumber(value);
  return {
    debit: amount > 0 ? amount : 0,
    credit: amount < 0 ? Math.abs(amount) : 0
  };
}

export function accountStatementAmount(account) {
  const openingDebit = normalizeNumber(account.openingDebit);
  const openingCredit = normalizeNumber(account.openingCredit);
  const periodDebit = normalizeNumber(account.debit);
  const periodCredit = normalizeNumber(account.credit);

  if (account.type === "Assets") return openingDebit - openingCredit + periodDebit - periodCredit;
  if (account.type === "Expenses") return periodDebit - periodCredit;
  if (account.type === "Revenue") return periodCredit - periodDebit;
  return openingCredit - openingDebit + periodCredit - periodDebit;
}

export function accountParentOptions(accounts, excludeId) {
  return accounts.filter((account) => !account.parentId && account.id !== excludeId && account.name.trim());
}

export function buildTrialBalanceGroups(trialBalanceRows) {
  const sumFields = ["openingDebit", "openingCredit", "debit", "credit", "periodBalanceDebit", "periodBalanceCredit", "endingDebit", "endingCredit"];
  const mainAccounts = trialBalanceRows.filter((account) => !account.parentId);

  return mainAccounts.map((main) => {
    const children = trialBalanceRows.filter((account) => account.parentId === main.id);
    if (!children.length) return { ...main, children: [], isGroup: false };
    const totals = Object.fromEntries(sumFields.map((field) => [field, main[field] + children.reduce((sum, child) => sum + child[field], 0)]));
    return { ...main, ...totals, children, isGroup: true };
  });
}

export function calculateStatements(accounts) {
  const rows = accounts
    .filter((account) => account.name.trim())
    .map((account) => ({
      ...account,
      accountCode: account.accountCode || "",
      parentId: account.parentId || null,
      openingDebit: normalizeNumber(account.openingDebit),
      openingCredit: normalizeNumber(account.openingCredit),
      debit: normalizeNumber(account.debit),
      credit: normalizeNumber(account.credit),
      detailCategory: normalizeDetailCategory(account.type, account.detailCategory)
    }));
  const totalOpeningDebit = rows.reduce((sum, account) => sum + normalizeNumber(account.openingDebit), 0);
  const totalOpeningCredit = rows.reduce((sum, account) => sum + normalizeNumber(account.openingCredit), 0);
  const totalDebit = rows.reduce((sum, account) => sum + normalizeNumber(account.debit), 0);
  const totalCredit = rows.reduce((sum, account) => sum + normalizeNumber(account.credit), 0);
  // Group-header accounts (parent of subs) that carry no direct balance of their own are excluded from the
  // flat statement/ratio breakdowns below, since their subs already represent them there; the full list
  // (including zero-balance group headers) is still used for the trial balance and grand totals above.
  const groupParentIds = new Set(rows.filter((account) => account.parentId).map((account) => account.parentId));
  const detailRows = rows.filter((account) => !(groupParentIds.has(account.id) && accountStatementAmount(account) === 0));
  const byType = Object.fromEntries(accountTypes.map((type) => [type, detailRows.filter((account) => account.type === type)]));
  const byDetail = Object.fromEntries(
    Object.entries(accountDetailCategories).flatMap(([type, categories]) =>
      categories.map((category) => [
        category.value,
        detailRows.filter((account) => account.type === type && account.detailCategory === category.value)
      ])
    )
  );
  const trialBalanceRows = rows.map((account) => {
    const periodNet = normalizeNumber(account.debit) - normalizeNumber(account.credit);
    const openingNet = normalizeNumber(account.openingDebit) - normalizeNumber(account.openingCredit);
    const periodBalance = splitDebitCredit(periodNet);
    const endingBalance = splitDebitCredit(openingNet + periodNet);

    return {
      ...account,
      periodBalanceDebit: periodBalance.debit,
      periodBalanceCredit: periodBalance.credit,
      endingDebit: endingBalance.debit,
      endingCredit: endingBalance.credit
    };
  });
  const totalPeriodBalanceDebit = trialBalanceRows.reduce((sum, account) => sum + account.periodBalanceDebit, 0);
  const totalPeriodBalanceCredit = trialBalanceRows.reduce((sum, account) => sum + account.periodBalanceCredit, 0);
  const totalEndingDebit = trialBalanceRows.reduce((sum, account) => sum + account.endingDebit, 0);
  const totalEndingCredit = trialBalanceRows.reduce((sum, account) => sum + account.endingCredit, 0);
  const totals = Object.fromEntries(accountTypes.map((type) => [type, byType[type].reduce((sum, account) => sum + accountStatementAmount(account), 0)]));
  const detailTotals = Object.fromEntries(
    Object.keys(byDetail).map((detailCategory) => [detailCategory, byDetail[detailCategory].reduce((sum, account) => sum + accountStatementAmount(account), 0)])
  );

  const revenueTotal = totals.Revenue;
  const expensesTotal = totals.Expenses;
  const netIncome = revenueTotal - expensesTotal;
  const drawings = byType.Equity
    .filter((account) => account.cashFlowTag === "drawings" || account.name.includes("مسحوبات"))
    .reduce((sum, account) => sum + Math.abs(accountStatementAmount(account)), 0);
  const beginningCapital = byType.Equity
    .filter((account) => account.cashFlowTag !== "drawings")
    .reduce((sum, account) => sum + accountStatementAmount(account), 0);
  const endingEquity = beginningCapital + netIncome - drawings;
  const liabilitiesAndEquity = totals.Liabilities + endingEquity;

  const depreciation = detailRows
    .filter((account) => account.cashFlowTag === "depreciation" || account.name.includes("إهلاك"))
    .reduce((sum, account) => sum + Math.abs(accountStatementAmount(account)), 0);
  const receivablesChange = detailRows
    .filter((account) => account.cashFlowTag === "receivablesChange" || account.name.includes("ذمم مدينة"))
    .reduce((sum, account) => sum - Math.abs(accountStatementAmount(account)), 0);
  const payablesChange = detailRows
    .filter((account) => account.cashFlowTag === "payablesChange" || account.name.includes("ذمم دائنة"))
    .reduce((sum, account) => sum + Math.abs(accountStatementAmount(account)), 0);
  const operatingCashFlow = netIncome + depreciation + receivablesChange + payablesChange;
  const investingCashFlow = detailRows
    .filter((account) => account.cashFlowTag === "investingPurchase")
    .reduce((sum, account) => sum - Math.abs(accountStatementAmount(account)), 0);
  const financingCashFlow = detailRows
    .filter((account) => account.cashFlowTag === "financingLoan" || account.cashFlowTag === "capital" || account.cashFlowTag === "drawings")
    .reduce((sum, account) => sum + (account.cashFlowTag === "drawings" ? -Math.abs(accountStatementAmount(account)) : Math.abs(accountStatementAmount(account))), 0);
  const detailedRows = {
    incomeRevenue: byType.Revenue.map((account) => ({ id: account.id, label: account.name, value: accountStatementAmount(account), account })),
    incomeExpenses: byType.Expenses.map((account) => ({ id: account.id, label: account.name, value: -Math.abs(accountStatementAmount(account)), account })),
    assets: byType.Assets.map((account) => ({ id: account.id, label: account.name, value: accountStatementAmount(account), account })),
    liabilities: byType.Liabilities.map((account) => ({ id: account.id, label: account.name, value: accountStatementAmount(account), account })),
    equityAccounts: byType.Equity.map((account) => ({ id: account.id, label: account.name, value: accountStatementAmount(account), account })),
    equityOpening: byType.Equity
      .filter((account) => account.cashFlowTag !== "drawings")
      .map((account) => ({ id: account.id, label: account.name, value: accountStatementAmount(account), account })),
    equityDrawings: byType.Equity
      .filter((account) => account.cashFlowTag === "drawings" || account.name.includes("مسحوبات"))
      .map((account) => ({ id: account.id, label: account.name, value: -Math.abs(accountStatementAmount(account)), account })),
    cashDepreciation: detailRows
      .filter((account) => account.cashFlowTag === "depreciation" || account.name.includes("إهلاك"))
      .map((account) => ({ id: account.id, label: account.name, value: Math.abs(accountStatementAmount(account)), account })),
    cashReceivables: detailRows
      .filter((account) => account.cashFlowTag === "receivablesChange" || account.name.includes("ذمم مدينة"))
      .map((account) => ({ id: account.id, label: account.name, value: -Math.abs(accountStatementAmount(account)), account })),
    cashPayables: detailRows
      .filter((account) => account.cashFlowTag === "payablesChange" || account.name.includes("ذمم دائنة"))
      .map((account) => ({ id: account.id, label: account.name, value: Math.abs(accountStatementAmount(account)), account })),
    cashInvesting: detailRows
      .filter((account) => account.cashFlowTag === "investingPurchase")
      .map((account) => ({ id: account.id, label: account.name, value: -Math.abs(accountStatementAmount(account)), account })),
    cashFinancing: detailRows
      .filter((account) => account.cashFlowTag === "financingLoan" || account.cashFlowTag === "capital" || account.cashFlowTag === "drawings")
      .map((account) => ({
        id: account.id,
        label: account.name,
        value: account.cashFlowTag === "drawings" ? -Math.abs(accountStatementAmount(account)) : Math.abs(accountStatementAmount(account)),
        account
      }))
  };
  const detailedSections = {
    income: [
      ...accountDetailCategories.Revenue.map((category) => ({
        title: category.label,
        rows: byDetail[category.value].map((account) => ({ id: account.id, label: account.name, value: accountStatementAmount(account), account })),
        totalLabel: `إجمالي ${category.label}`,
        totalValue: detailTotals[category.value]
      })),
      ...accountDetailCategories.Expenses.map((category) => ({
        title: category.label,
        rows: byDetail[category.value].map((account) => ({ id: account.id, label: account.name, value: -Math.abs(accountStatementAmount(account)), account })),
        totalLabel: `إجمالي ${category.label}`,
        totalValue: -Math.abs(detailTotals[category.value])
      })),
      { title: "نتيجة الفترة", rows: [{ id: "net-income", label: "صافي الربح", value: netIncome }], totalLabel: "صافي الربح", totalValue: netIncome }
    ],
    financialPosition: [
      ...accountDetailCategories.Assets.map((category) => ({
        title: category.label,
        rows: byDetail[category.value].map((account) => ({ id: account.id, label: account.name, value: accountStatementAmount(account), account })),
        totalLabel: `إجمالي ${category.label}`,
        totalValue: detailTotals[category.value]
      })),
      ...accountDetailCategories.Liabilities.map((category) => ({
        title: category.label,
        rows: byDetail[category.value].map((account) => ({ id: account.id, label: account.name, value: accountStatementAmount(account), account })),
        totalLabel: `إجمالي ${category.label}`,
        totalValue: detailTotals[category.value]
      })),
      ...accountDetailCategories.Equity.map((category) => ({
        title: category.label,
        rows: byDetail[category.value].map((account) => ({ id: account.id, label: account.name, value: accountStatementAmount(account), account })),
        totalLabel: `إجمالي ${category.label}`,
        totalValue: detailTotals[category.value]
      })),
      { title: "ملخص المعادلة", rows: [{ id: "assets-total", label: "إجمالي الأصول", value: totals.Assets }, { id: "liabilities-equity-total", label: "إجمالي الخصوم وحقوق الملكية", value: liabilitiesAndEquity }], totalLabel: "فرق المعادلة", totalValue: totals.Assets - liabilitiesAndEquity }
    ]
  };

  return {
    rows,
    trialBalanceRows,
    trialBalanceGroups: buildTrialBalanceGroups(trialBalanceRows),
    totalOpeningDebit,
    totalOpeningCredit,
    totalDebit,
    totalCredit,
    totalPeriodBalanceDebit,
    totalPeriodBalanceCredit,
    totalEndingDebit,
    totalEndingCredit,
    balancedTrial: Math.abs(totalDebit - totalCredit) < 0.01,
    byType,
    byDetail,
    totals,
    detailTotals,
    revenueTotal,
    expensesTotal,
    netIncome,
    beginningCapital,
    drawings,
    endingEquity,
    liabilitiesAndEquity,
    financialPositionBalanced: Math.abs(totals.Assets - liabilitiesAndEquity) < 0.01,
    detailedRows,
    detailedSections,
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
      const columns = line.split(/\t|,/).map((column) => column.trim());
      const looksLikeAccountCode = columns.length >= 7;
      const [accountCode = "", name = "", type = "Assets", maybeDetail = "", openingDebit = "0", openingCredit = "0", debit = "0", credit = "0", cashFlowTag = "operating"] = looksLikeAccountCode ? columns : ["", ...columns];
      const legacyName = looksLikeAccountCode ? name : columns[0] || "";
      const legacyType = looksLikeAccountCode ? type : columns[1] || "Assets";
      const legacyMaybeDetailOrDebit = looksLikeAccountCode ? maybeDetail : columns[2] || "0";
      const legacyMaybeDebitOrCredit = looksLikeAccountCode ? debit : columns[3] || "0";
      const legacyMaybeCredit = looksLikeAccountCode ? credit : columns[4] || "0";
      const finalType = accountTypes.includes(legacyType.trim()) ? legacyType.trim() : "Assets";
      const hasDetailColumn = Object.values(accountDetailCategories).flat().some((category) => category.value === legacyMaybeDetailOrDebit.trim() || category.label === legacyMaybeDetailOrDebit.trim());
      const detailCategory = hasDetailColumn
        ? Object.values(accountDetailCategories).flat().find((category) => category.value === legacyMaybeDetailOrDebit.trim() || category.label === legacyMaybeDetailOrDebit.trim()).value
        : defaultDetailCategory(finalType);
      return {
        id: crypto.randomUUID(),
        accountCode: looksLikeAccountCode ? accountCode : "",
        name: legacyName.trim(),
        type: finalType,
        detailCategory,
        parentId: null,
        openingDebit: normalizeNumber(looksLikeAccountCode ? openingDebit : 0),
        openingCredit: normalizeNumber(looksLikeAccountCode ? openingCredit : 0),
        debit: normalizeNumber(looksLikeAccountCode ? debit : hasDetailColumn ? legacyMaybeDebitOrCredit : legacyMaybeDetailOrDebit),
        credit: normalizeNumber(looksLikeAccountCode ? credit : hasDetailColumn ? legacyMaybeCredit : legacyMaybeDebitOrCredit),
        cashFlowTag: looksLikeAccountCode ? cashFlowTag || "operating" : "operating"
      };
    });
}

export const trialBalanceTemplateHeader = [
  "رقم الحساب",
  "اسم الحساب",
  "النوع",
  "التصنيف التفصيلي",
  "رقم الحساب الرئيسي",
  "رصيد بداية مدين",
  "رصيد بداية دائن",
  "حركة مدين",
  "حركة دائن",
  "تصنيف التدفق النقدي"
];

function resolveTypeFromLabel(value) {
  const text = String(value ?? "").trim();
  if (accountTypes.includes(text)) return text;
  const found = Object.entries(accountTypeLabels).find(([, label]) => label === text);
  return found ? found[0] : "Assets";
}

function resolveDetailCategoryFromLabel(type, value) {
  const text = String(value ?? "").trim();
  const allowed = accountDetailCategories[type] || [];
  const found = allowed.find((category) => category.value === text || category.label === text);
  return found ? found.value : defaultDetailCategory(type);
}

function resolveCashFlowTagFromLabel(value) {
  const text = String(value ?? "").trim();
  const found = cashFlowTags.find((tag) => tag.value === text || tag.label === text);
  return found ? found.value : "operating";
}

export function accountsFromSheetRows(sheetRows) {
  const dataRows = sheetRows
    .map((row) => (row || []).map((cell) => (cell === undefined || cell === null ? "" : String(cell).trim())))
    .filter((row) => row.some((cell) => cell !== ""));
  if (!dataRows.length) return [];

  const firstCell = (dataRows[0][0] || "").toLowerCase();
  const secondCell = (dataRows[0][1] || "").toLowerCase();
  const looksLikeHeader = firstCell.includes("رقم") || firstCell.includes("account") || secondCell.includes("اسم") || secondCell.includes("name");
  const body = looksLikeHeader ? dataRows.slice(1) : dataRows;

  const codeToId = new Map();
  const drafts = body
    .map((columns) => {
      const [accountCode = "", name = "", typeCell = "", detailCell = "", parentCode = "", openingDebit = "0", openingCredit = "0", debit = "0", credit = "0", cashFlowCell = ""] = columns;
      const id = crypto.randomUUID();
      if (accountCode.trim()) codeToId.set(accountCode.trim(), id);
      const type = resolveTypeFromLabel(typeCell);

      return {
        id,
        accountCode: accountCode.trim(),
        name: name.trim(),
        type,
        detailCategory: resolveDetailCategoryFromLabel(type, detailCell),
        parentCode: parentCode.trim(),
        openingDebit: normalizeNumber(openingDebit),
        openingCredit: normalizeNumber(openingCredit),
        debit: normalizeNumber(debit),
        credit: normalizeNumber(credit),
        cashFlowTag: resolveCashFlowTagFromLabel(cashFlowCell)
      };
    })
    .filter((account) => account.name);

  return drafts.map(({ parentCode, ...account }) => ({
    ...account,
    parentId: parentCode && codeToId.has(parentCode) ? codeToId.get(parentCode) : null
  }));
}

export async function readTrialBalanceExcelFile(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
  return accountsFromSheetRows(rows);
}

export function downloadTrialBalanceTemplate() {
  const sample = ["111", "الصندوق", "الأصول", "أصول متداولة", "", "50000", "0", "12000", "0", "تشغيلي"];
  const worksheet = XLSX.utils.aoa_to_sheet([trialBalanceTemplateHeader, sample]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ميزان المراجعة");
  XLSX.writeFile(workbook, "نموذج-ميزان-المراجعة.xlsx");
}

export function computeAuditOpinion(statements) {
  const totalAssets = statements.totals.Assets || 0;
  const trialDiff = Math.abs(statements.totalDebit - statements.totalCredit);
  const positionDiff = Math.abs(statements.totals.Assets - statements.liabilitiesAndEquity);
  const trialMateriality = totalAssets ? trialDiff / totalAssets : trialDiff > 0 ? 1 : 0;
  const positionMateriality = totalAssets ? positionDiff / totalAssets : positionDiff > 0 ? 1 : 0;
  const classificationOk = statements.rows.length > 0 && statements.rows.every((account) => account.type && account.name.trim());

  let type = "unqualified";
  if (trialMateriality > 0.05) type = "disclaimer";
  else if (positionMateriality > 0.15) type = "adverse";
  else if (!statements.balancedTrial || !statements.financialPositionBalanced || !classificationOk) type = "qualified";

  const labels = {
    unqualified: "رأي غير متحفظ (نظيف)",
    qualified: "رأي متحفظ",
    adverse: "رأي سلبي (معاكس)",
    disclaimer: "الامتناع عن إبداء الرأي"
  };

  return { type, label: labels[type], trialDiff, positionDiff, trialMateriality, positionMateriality, classificationOk };
}

function qualifiedBasisText(statements, evaluation) {
  const issues = [];
  if (!statements.balancedTrial) {
    issues.push(`وجود فرق قدره ${money(evaluation.trialDiff)} بين إجمالي المدين وإجمالي الدائن في ميزان المراجعة`);
  }
  if (!statements.financialPositionBalanced) {
    issues.push(`وجود فرق قدره ${money(evaluation.positionDiff)} بين إجمالي الأصول وإجمالي الخصوم وحقوق الملكية`);
  }
  if (!evaluation.classificationOk) {
    issues.push("وجود حسابات غير مكتملة البيانات من حيث الاسم أو النوع المحاسبي");
  }
  const issuesText = issues.length ? `لاحظنا ${issues.join("، كما لاحظنا ")}.` : "";
  return `${issuesText} وفيما عدا الأثر المحتمل لما سبق، قمنا بمراجعتنا وفقًا لمعايير المراجعة المتعارف عليها، وحصلنا على أدلة مراجعة كافية وملائمة لتكوين رأينا المتحفظ.`.trim();
}

export function buildAuditOpinionReport(profile, statements) {
  const evaluation = computeAuditOpinion(statements);
  const company = profile.companyName || "المنشأة";
  const period = `${profile.periodStart} إلى ${profile.periodEnd}`;

  const basisTextByType = {
    unqualified: "لقد قمنا بمراجعتنا وفقًا لمعايير المراجعة المتعارف عليها. تتطلب تلك المعايير أن نخطط ونؤدي أعمال المراجعة للحصول على تأكيد معقول حول ما إذا كانت القوائم المالية خالية من أي تحريف جوهري، سواء كان ناتجًا عن غش أو خطأ. ونعتقد أن أدلة المراجعة التي حصلنا عليها كافية وملائمة لتكوين رأينا.",
    qualified: qualifiedBasisText(statements, evaluation),
    adverse: `تبين لنا وجود فرق جوهري ومنتشر قدره ${money(evaluation.positionDiff)} بين إجمالي الأصول من جهة، وإجمالي الخصوم وحقوق الملكية من جهة أخرى، بما يمثل ما نسبته ${(evaluation.positionMateriality * 100).toFixed(1)}% تقريبًا من إجمالي الأصول. ونظرًا لجسامة هذا الأثر وشموله لعناصر رئيسية من القوائم المالية، فإننا نرى أن القوائم المالية بمجملها لا تعبر تعبيرًا عادلًا عن المركز المالي للمنشأة.`,
    disclaimer: `لم يكن ميزان المراجعة متوازنًا، إذ بلغ الفرق بين إجمالي المدين وإجمالي الدائن ${money(evaluation.trialDiff)}، بما يمثل ما نسبته ${(evaluation.trialMateriality * 100).toFixed(1)}% تقريبًا من إجمالي الأصول. ونظرًا لعدم اتزان السجلات المحاسبية الأساسية، لم نتمكن من تنفيذ إجراءات المراجعة اللازمة أو الحصول على أدلة مراجعة كافية وملائمة بشأنها.`
  };

  const opinionTextByType = {
    unqualified: `في رأينا، فإن القوائم المالية المرفقة تعبر بصورة عادلة، من كافة النواحي الجوهرية، عن المركز المالي لـ${company} كما في ${profile.periodEnd}، وعن نتائج أعمالها وتدفقاتها النقدية للفترة المنتهية في ذلك التاريخ، وفقًا لمعايير المحاسبة المتعارف عليها.`,
    qualified: `في رأينا، باستثناء الآثار المحتملة للأمر المشار إليه في فقرة أساس الرأي المتحفظ أعلاه، فإن القوائم المالية المرفقة تعبر بصورة عادلة، من كافة النواحي الجوهرية، عن المركز المالي لـ${company} كما في ${profile.periodEnd}، وعن نتائج أعمالها وتدفقاتها النقدية للفترة المنتهية في ذلك التاريخ، وفقًا لمعايير المحاسبة المتعارف عليها.`,
    adverse: `في رأينا، ونظرًا لجسامة الأثر الموضح في فقرة أساس الرأي المعاكس أعلاه، فإن القوائم المالية المرفقة لا تعبر بصورة عادلة عن المركز المالي لـ${company} كما في ${profile.periodEnd}، ولا عن نتائج أعمالها وتدفقاتها النقدية للفترة المنتهية في ذلك التاريخ، وفقًا لمعايير المحاسبة المتعارف عليها.`,
    disclaimer: "نظرًا لجسامة الأمر الموضح في فقرة أساس الامتناع عن إبداء الرأي أعلاه، لم نتمكن من الحصول على أدلة مراجعة كافية وملائمة لتكوين رأي فني حول هذه القوائم المالية، وبناءً عليه فإننا لا نبدي رأيًا حولها."
  };

  const titleByType = {
    unqualified: "الرأي",
    qualified: "الرأي المتحفظ",
    adverse: "الرأي المعاكس",
    disclaimer: "الامتناع عن إبداء الرأي"
  };

  const basisTitleByType = {
    unqualified: "أساس الرأي",
    qualified: "أساس الرأي المتحفظ",
    adverse: "أساس الرأي المعاكس",
    disclaimer: "أساس الامتناع عن إبداء الرأي"
  };

  return {
    ...evaluation,
    title: "تقرير مراجع الحسابات المستقل",
    addressee: `السادة/ الشركاء والمساهمين في ${company} المحترمين`,
    period,
    intro: `لقد قمنا بمراجعة القوائم المالية المرفقة لـ${company}، والمشتملة على قائمة المركز المالي كما في ${profile.periodEnd}، وقوائم الدخل والتدفقات النقدية والتغير في حقوق الملكية عن الفترة من ${profile.periodStart} إلى ${profile.periodEnd}، وملخصًا لأهم السياسات المحاسبية المتبعة.`,
    managementResponsibility: "إن الإدارة هي المسؤولة عن إعداد هذه القوائم المالية وعرضها بصورة عادلة وفقًا لمعايير المحاسبة المتعارف عليها، وعن نظام الرقابة الداخلية الذي تراه ضروريًا لإعداد قوائم مالية خالية من تحريف جوهري سواء كان ناتجًا عن غش أو خطأ.",
    auditorResponsibility: "تتمثل مسؤوليتنا في إبداء رأي حول هذه القوائم المالية استنادًا إلى مراجعتنا. لقد قمنا بأعمال المراجعة وفقًا لمعايير المراجعة المتعارف عليها التي تتطلب التزامنا بالمتطلبات الأخلاقية والتخطيط للمراجعة وأدائها للحصول على تأكيد معقول بشأن خلو القوائم المالية من أي تحريف جوهري.",
    basisTitle: basisTitleByType[evaluation.type],
    basisText: basisTextByType[evaluation.type],
    opinionTitle: titleByType[evaluation.type],
    opinionText: opinionTextByType[evaluation.type],
    auditFirmName: profile.auditFirmName || "....................................",
    auditorName: profile.auditorName || "....................................",
    licenseNumber: profile.licenseNumber || "....................",
    reportCity: profile.reportCity || "...................."
  };
}

export function formatAuditOpinionText(report) {
  return [
    report.title,
    "",
    report.addressee,
    "",
    report.intro,
    "",
    "مسؤولية الإدارة عن القوائم المالية",
    report.managementResponsibility,
    "",
    "مسؤولية المراجع",
    report.auditorResponsibility,
    "",
    report.basisTitle,
    report.basisText,
    "",
    report.opinionTitle,
    report.opinionText,
    "",
    `${report.reportCity}، ${report.period.split(" إلى ")[1] || ""}`,
    `مكتب المراجعة: ${report.auditFirmName}`,
    `المراجع القانوني: ${report.auditorName}`,
    `رقم الترخيص: ${report.licenseNumber}`,
    "التوقيع: ...................................."
  ].join("\n");
}

export function computeFinancialAnalysis(statements) {
  const currentAssets = statements.detailTotals.currentAssets || 0;
  const currentLiabilities = statements.detailTotals.currentLiabilities || 0;
  const inventory = 0;
  const totalAssets = statements.totals.Assets || 0;
  const totalLiabilities = statements.totals.Liabilities || 0;
  const totalEquity = statements.endingEquity || 0;
  const revenue = statements.revenueTotal || 0;
  const netIncome = statements.netIncome || 0;

  const currentRatio = currentLiabilities ? currentAssets / currentLiabilities : null;
  const workingCapital = currentAssets - currentLiabilities;
  const quickRatio = currentLiabilities ? (currentAssets - inventory) / currentLiabilities : null;
  const netMargin = revenue ? (netIncome / revenue) * 100 : null;
  const expenseRatio = revenue ? (statements.expensesTotal / revenue) * 100 : null;
  const returnOnAssets = totalAssets ? (netIncome / totalAssets) * 100 : null;
  const returnOnEquity = totalEquity ? (netIncome / totalEquity) * 100 : null;
  const debtToAssets = totalAssets ? (totalLiabilities / totalAssets) * 100 : null;
  const debtToEquity = totalEquity ? (totalLiabilities / totalEquity) * 100 : null;
  const equityToAssets = totalAssets ? (totalEquity / totalAssets) * 100 : null;
  const assetTurnover = totalAssets ? revenue / totalAssets : null;

  function rate(value, thresholds, labels) {
    if (value === null || !Number.isFinite(value)) return labels.unknown;
    if (value < thresholds[0]) return labels.low;
    if (value < thresholds[1]) return labels.mid;
    return labels.high;
  }

  const groups = [
    {
      title: "نسب السيولة",
      items: [
        {
          label: "نسبة التداول",
          value: currentRatio,
          format: "ratio",
          note:
            currentRatio === null
              ? "لا تتوفر بيانات كافية عن الأصول أو الخصوم المتداولة."
              : currentRatio >= 1.5
                ? "نسبة تداول جيدة تعكس قدرة مريحة على سداد الالتزامات قصيرة الأجل."
                : currentRatio >= 1
                  ? "نسبة تداول مقبولة، لكنها قريبة من الحد الأدنى الآمن ويُنصح بمتابعتها."
                  : "نسبة تداول أقل من الواحد الصحيح، ما يشير إلى ضغط محتمل على السيولة قصيرة الأجل."
        },
        {
          label: "رأس المال العامل",
          value: workingCapital,
          format: "money",
          note: workingCapital >= 0 ? "رأس المال العامل موجب، ما يعني تغطية الأصول المتداولة للخصوم المتداولة." : "رأس المال العامل سالب، ما يستدعي مراجعة إدارة السيولة قصيرة الأجل."
        }
      ]
    },
    {
      title: "نسب الربحية",
      items: [
        {
          label: "هامش صافي الربح",
          value: netMargin,
          format: "percent",
          note: rate(netMargin, [5, 15], {
            unknown: "لا توجد إيرادات مسجلة لحساب الهامش.",
            low: "هامش ربح منخفض نسبيًا، يُوصى بمراجعة هيكل التكاليف والمصروفات.",
            mid: "هامش ربح متوسط ضمن نطاق مقبول.",
            high: "هامش ربح مرتفع يعكس كفاءة تشغيلية جيدة."
          })
        },
        {
          label: "نسبة المصروفات إلى الإيرادات",
          value: expenseRatio,
          format: "percent",
          note: expenseRatio === null ? "لا توجد إيرادات مسجلة." : expenseRatio > 90 ? "المصروفات تستهلك الجزء الأكبر من الإيرادات، ما يقلص هامش الربح." : "المصروفات ضمن نطاق مقبول مقارنة بالإيرادات."
        },
        {
          label: "العائد على الأصول (ROA)",
          value: returnOnAssets,
          format: "percent",
          note: rate(returnOnAssets, [2, 8], {
            unknown: "لا تتوفر أصول لحساب العائد.",
            low: "عائد منخفض على الأصول، ما قد يشير إلى ضعف كفاءة استخدام الأصول.",
            mid: "عائد متوسط على الأصول.",
            high: "عائد جيد على الأصول يعكس كفاءة تشغيلية مرتفعة."
          })
        },
        {
          label: "العائد على حقوق الملكية (ROE)",
          value: returnOnEquity,
          format: "percent",
          note: rate(returnOnEquity, [5, 15], {
            unknown: "لا تتوفر حقوق ملكية موجبة لحساب العائد.",
            low: "عائد منخفض على حقوق الملكية مقارنة بمتوسطات السوق.",
            mid: "عائد متوسط على حقوق الملكية.",
            high: "عائد مرتفع على حقوق الملكية يعكس عائدًا جيدًا لأصحاب المنشأة."
          })
        }
      ]
    },
    {
      title: "نسب الرفع المالي والملاءة",
      items: [
        {
          label: "نسبة الخصوم إلى الأصول",
          value: debtToAssets,
          format: "percent",
          note: debtToAssets === null ? "لا تتوفر بيانات كافية عن الأصول." : debtToAssets > 60 ? "اعتماد مرتفع نسبيًا على التمويل بالدين، ما يزيد المخاطر المالية." : "اعتماد معتدل على الدين في تمويل الأصول."
        },
        {
          label: "نسبة الخصوم إلى حقوق الملكية",
          value: debtToEquity,
          format: "percent",
          note: debtToEquity === null ? "حقوق الملكية غير موجبة لحساب هذه النسبة." : debtToEquity > 100 ? "الدين يفوق حقوق الملكية، ما يستدعي متابعة هيكل التمويل." : "هيكل تمويل متوازن نسبيًا بين الدين وحقوق الملكية."
        },
        {
          label: "نسبة حقوق الملكية إلى الأصول",
          value: equityToAssets,
          format: "percent",
          note: "توضح نسبة تمويل الأصول من موارد الملاك الذاتية مقابل التمويل الخارجي."
        }
      ]
    },
    {
      title: "نسب الكفاءة التشغيلية",
      items: [
        {
          label: "معدل دوران الأصول",
          value: assetTurnover,
          format: "times",
          note: assetTurnover === null ? "لا تتوفر أصول كافية لحساب المعدل." : assetTurnover >= 1 ? "كفاءة جيدة في استخدام الأصول لتوليد الإيرادات." : "معدل دوران منخفض، ما قد يشير إلى أصول غير مستغلة بالكامل."
        },
        {
          label: "صافي التدفق النقدي",
          value: statements.cashFlow.netCashFlow,
          format: "money",
          note: statements.cashFlow.netCashFlow >= 0 ? "تدفق نقدي موجب يدعم استمرارية السيولة." : "تدفق نقدي سالب يستدعي مراجعة مصادر واستخدامات النقدية."
        }
      ]
    }
  ];

  return { groups };
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
