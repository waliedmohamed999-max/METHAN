export const sampleAccounts = [
  { id: crypto.randomUUID(), accountCode: "111", name: "النقدية والبنوك", type: "Assets", detailCategory: "currentAssets", openingDebit: 850000, openingCredit: 0, debit: 185000, credit: 0, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), accountCode: "112", name: "الذمم المدينة", type: "Assets", detailCategory: "currentAssets", openingDebit: 210000, openingCredit: 0, debit: 72000, credit: 0, cashFlowTag: "receivablesChange" },
  { id: crypto.randomUUID(), accountCode: "113", name: "المخزون", type: "Assets", detailCategory: "currentAssets", openingDebit: 165000, openingCredit: 0, debit: 58000, credit: 0, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), accountCode: "121", name: "الأثاث والمعدات", type: "Assets", detailCategory: "fixedAssets", openingDebit: 480000, openingCredit: 0, debit: 125000, credit: 0, cashFlowTag: "investingPurchase" },
  { id: crypto.randomUUID(), accountCode: "122", name: "مجمع الإهلاك", type: "Assets", detailCategory: "contraAssets", openingDebit: 0, openingCredit: 96000, debit: 0, credit: 18000, cashFlowTag: "depreciation" },
  { id: crypto.randomUUID(), accountCode: "211", name: "الذمم الدائنة", type: "Liabilities", detailCategory: "currentLiabilities", openingDebit: 0, openingCredit: 260000, debit: 0, credit: 62000, cashFlowTag: "payablesChange" },
  { id: crypto.randomUUID(), accountCode: "221", name: "قرض طويل الأجل", type: "Liabilities", detailCategory: "longTermLiabilities", openingDebit: 0, openingCredit: 500000, debit: 0, credit: 90000, cashFlowTag: "financingLoan" },
  { id: crypto.randomUUID(), accountCode: "311", name: "رأس المال", type: "Equity", detailCategory: "capital", openingDebit: 0, openingCredit: 800000, debit: 0, credit: 200000, cashFlowTag: "capital" },
  { id: crypto.randomUUID(), accountCode: "312", name: "أرباح مبقاة أول المدة", type: "Equity", detailCategory: "retainedEarnings", openingDebit: 0, openingCredit: 49000, debit: 0, credit: 14000, cashFlowTag: "capital" },
  { id: crypto.randomUUID(), accountCode: "313", name: "المسحوبات", type: "Equity", detailCategory: "drawings", openingDebit: 0, openingCredit: 0, debit: 12000, credit: 0, cashFlowTag: "drawings" },
  { id: crypto.randomUUID(), accountCode: "411", name: "إيرادات الخدمات", type: "Revenue", detailCategory: "operatingRevenue", openingDebit: 0, openingCredit: 0, debit: 0, credit: 176000, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), accountCode: "511", name: "مصروف الرواتب", type: "Expenses", detailCategory: "operatingExpenses", openingDebit: 0, openingCredit: 0, debit: 52000, credit: 0, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), accountCode: "512", name: "مصروف الإيجار", type: "Expenses", detailCategory: "administrativeExpenses", openingDebit: 0, openingCredit: 0, debit: 22000, credit: 0, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), accountCode: "513", name: "مصروف الإهلاك", type: "Expenses", detailCategory: "depreciationExpenses", openingDebit: 0, openingCredit: 0, debit: 18000, credit: 0, cashFlowTag: "depreciation" },
  { id: crypto.randomUUID(), accountCode: "514", name: "مصروفات تشغيلية أخرى", type: "Expenses", detailCategory: "operatingExpenses", openingDebit: 0, openingCredit: 0, debit: 16000, credit: 0, cashFlowTag: "operating" }
];
