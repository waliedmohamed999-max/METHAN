export const sampleAccounts = [
  { id: crypto.randomUUID(), name: "النقدية والبنوك", type: "Assets", detailCategory: "currentAssets", debit: 185000, credit: 0, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), name: "الذمم المدينة", type: "Assets", detailCategory: "currentAssets", debit: 72000, credit: 0, cashFlowTag: "receivablesChange" },
  { id: crypto.randomUUID(), name: "المخزون", type: "Assets", detailCategory: "currentAssets", debit: 58000, credit: 0, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), name: "الأثاث والمعدات", type: "Assets", detailCategory: "fixedAssets", debit: 125000, credit: 0, cashFlowTag: "investingPurchase" },
  { id: crypto.randomUUID(), name: "مجمع الإهلاك", type: "Assets", detailCategory: "contraAssets", debit: 0, credit: 18000, cashFlowTag: "depreciation" },
  { id: crypto.randomUUID(), name: "الذمم الدائنة", type: "Liabilities", detailCategory: "currentLiabilities", debit: 0, credit: 62000, cashFlowTag: "payablesChange" },
  { id: crypto.randomUUID(), name: "قرض طويل الأجل", type: "Liabilities", detailCategory: "longTermLiabilities", debit: 0, credit: 90000, cashFlowTag: "financingLoan" },
  { id: crypto.randomUUID(), name: "رأس المال", type: "Equity", detailCategory: "capital", debit: 0, credit: 200000, cashFlowTag: "capital" },
  { id: crypto.randomUUID(), name: "أرباح مبقاة أول المدة", type: "Equity", detailCategory: "retainedEarnings", debit: 0, credit: 14000, cashFlowTag: "capital" },
  { id: crypto.randomUUID(), name: "المسحوبات", type: "Equity", detailCategory: "drawings", debit: 12000, credit: 0, cashFlowTag: "drawings" },
  { id: crypto.randomUUID(), name: "إيرادات الخدمات", type: "Revenue", detailCategory: "operatingRevenue", debit: 0, credit: 176000, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), name: "مصروف الرواتب", type: "Expenses", detailCategory: "operatingExpenses", debit: 52000, credit: 0, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), name: "مصروف الإيجار", type: "Expenses", detailCategory: "administrativeExpenses", debit: 22000, credit: 0, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), name: "مصروف الإهلاك", type: "Expenses", detailCategory: "depreciationExpenses", debit: 18000, credit: 0, cashFlowTag: "depreciation" },
  { id: crypto.randomUUID(), name: "مصروفات تشغيلية أخرى", type: "Expenses", detailCategory: "operatingExpenses", debit: 16000, credit: 0, cashFlowTag: "operating" }
];
