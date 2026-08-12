const cashMainId = crypto.randomUUID();
const receivablesMainId = crypto.randomUUID();

export const sampleAccounts = [
  { id: cashMainId, accountCode: "111", name: "النقدية والبنوك", type: "Assets", detailCategory: "currentAssets", parentId: null, openingDebit: 0, openingCredit: 0, debit: 0, credit: 0, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), accountCode: "111-1", name: "الصندوق", type: "Assets", detailCategory: "currentAssets", parentId: cashMainId, openingDebit: 300000, openingCredit: 0, debit: 60000, credit: 0, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), accountCode: "111-2", name: "البنك الأهلي - حساب جاري", type: "Assets", detailCategory: "currentAssets", parentId: cashMainId, openingDebit: 550000, openingCredit: 0, debit: 125000, credit: 0, cashFlowTag: "operating" },
  { id: receivablesMainId, accountCode: "112", name: "الذمم المدينة", type: "Assets", detailCategory: "currentAssets", parentId: null, openingDebit: 0, openingCredit: 0, debit: 0, credit: 0, cashFlowTag: "receivablesChange" },
  { id: crypto.randomUUID(), accountCode: "112-1", name: "عملاء - شركة الأمل", type: "Assets", detailCategory: "currentAssets", parentId: receivablesMainId, openingDebit: 130000, openingCredit: 0, debit: 40000, credit: 0, cashFlowTag: "receivablesChange" },
  { id: crypto.randomUUID(), accountCode: "112-2", name: "عملاء - مؤسسة النور", type: "Assets", detailCategory: "currentAssets", parentId: receivablesMainId, openingDebit: 80000, openingCredit: 0, debit: 32000, credit: 0, cashFlowTag: "receivablesChange" },
  { id: crypto.randomUUID(), accountCode: "113", name: "المخزون", type: "Assets", detailCategory: "currentAssets", parentId: null, openingDebit: 165000, openingCredit: 0, debit: 58000, credit: 0, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), accountCode: "121", name: "الأثاث والمعدات", type: "Assets", detailCategory: "fixedAssets", parentId: null, openingDebit: 480000, openingCredit: 0, debit: 125000, credit: 0, cashFlowTag: "investingPurchase" },
  { id: crypto.randomUUID(), accountCode: "122", name: "مجمع الإهلاك", type: "Assets", detailCategory: "contraAssets", parentId: null, openingDebit: 0, openingCredit: 96000, debit: 0, credit: 18000, cashFlowTag: "depreciation" },
  { id: crypto.randomUUID(), accountCode: "211", name: "الذمم الدائنة", type: "Liabilities", detailCategory: "currentLiabilities", parentId: null, openingDebit: 0, openingCredit: 260000, debit: 0, credit: 62000, cashFlowTag: "payablesChange" },
  { id: crypto.randomUUID(), accountCode: "221", name: "قرض طويل الأجل", type: "Liabilities", detailCategory: "longTermLiabilities", parentId: null, openingDebit: 0, openingCredit: 500000, debit: 0, credit: 90000, cashFlowTag: "financingLoan" },
  { id: crypto.randomUUID(), accountCode: "311", name: "رأس المال", type: "Equity", detailCategory: "capital", parentId: null, openingDebit: 0, openingCredit: 800000, debit: 0, credit: 200000, cashFlowTag: "capital" },
  { id: crypto.randomUUID(), accountCode: "312", name: "أرباح مبقاة أول المدة", type: "Equity", detailCategory: "retainedEarnings", parentId: null, openingDebit: 0, openingCredit: 49000, debit: 0, credit: 14000, cashFlowTag: "capital" },
  { id: crypto.randomUUID(), accountCode: "313", name: "المسحوبات", type: "Equity", detailCategory: "drawings", parentId: null, openingDebit: 0, openingCredit: 0, debit: 12000, credit: 0, cashFlowTag: "drawings" },
  { id: crypto.randomUUID(), accountCode: "411", name: "إيرادات الخدمات", type: "Revenue", detailCategory: "operatingRevenue", parentId: null, openingDebit: 0, openingCredit: 0, debit: 0, credit: 176000, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), accountCode: "511", name: "مصروف الرواتب", type: "Expenses", detailCategory: "operatingExpenses", parentId: null, openingDebit: 0, openingCredit: 0, debit: 52000, credit: 0, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), accountCode: "512", name: "مصروف الإيجار", type: "Expenses", detailCategory: "administrativeExpenses", parentId: null, openingDebit: 0, openingCredit: 0, debit: 22000, credit: 0, cashFlowTag: "operating" },
  { id: crypto.randomUUID(), accountCode: "513", name: "مصروف الإهلاك", type: "Expenses", detailCategory: "depreciationExpenses", parentId: null, openingDebit: 0, openingCredit: 0, debit: 18000, credit: 0, cashFlowTag: "depreciation" },
  { id: crypto.randomUUID(), accountCode: "514", name: "مصروفات تشغيلية أخرى", type: "Expenses", detailCategory: "operatingExpenses", parentId: null, openingDebit: 0, openingCredit: 0, debit: 16000, credit: 0, cashFlowTag: "operating" }
];
