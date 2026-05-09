import { useEffect, useMemo, useState } from "react";
import { BarChart3, Download, FileSpreadsheet, Moon, Printer, Sun } from "lucide-react";
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from "chart.js";
import { Pie } from "react-chartjs-2";
import AccountsInput from "./components/AccountsInput.jsx";
import AccountingNotes from "./components/AccountingNotes.jsx";
import CompanySettings from "./components/CompanySettings.jsx";
import DetailedStatement from "./components/DetailedStatement.jsx";
import MetricCard from "./components/MetricCard.jsx";
import PrintableReport from "./components/PrintableReport.jsx";
import RatiosPanel from "./components/RatiosPanel.jsx";
import StatementTable from "./components/StatementTable.jsx";
import TrialBalanceTable from "./components/TrialBalanceTable.jsx";
import ValidationPanel from "./components/ValidationPanel.jsx";
import { sampleAccounts } from "./data/sampleAccounts.js";
import { accountDetailCategoryLabels, accountStatementAmount, accountTypeLabels, calculateStatements, downloadCsv, money, normalizeDetailCategory } from "./utils/accounting.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const tabs = [
  { id: "trial", label: "ميزان المراجعة" },
  { id: "income", label: "قائمة الدخل" },
  { id: "position", label: "المركز المالي" },
  { id: "cash", label: "التدفقات النقدية" },
  { id: "equity", label: "حقوق الملكية" },
  { id: "balance", label: "الميزانية العمومية" },
  { id: "report", label: "تقرير شامل" }
];

function readStoredAccounts() {
  try {
    return JSON.parse(localStorage.getItem("mizan.accounts")) || sampleAccounts;
  } catch {
    return sampleAccounts;
  }
}

function readStoredProfile() {
  try {
    return JSON.parse(localStorage.getItem("mizan.profile")) || defaultProfile;
  } catch {
    return defaultProfile;
  }
}

const defaultProfile = {
  companyName: "شركة ميزان التجارية",
  periodStart: "2026-01-01",
  periodEnd: "2026-12-31"
};

export default function App() {
  const [accounts, setAccounts] = useState(readStoredAccounts);
  const [profile, setProfile] = useState(readStoredProfile);
  const [activeTab, setActiveTab] = useState("trial");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("mizan.theme") === "dark");
  const statements = useMemo(() => calculateStatements(accounts), [accounts]);

  useEffect(() => {
    localStorage.setItem("mizan.accounts", JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem("mizan.profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("mizan.theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  function exportExcel() {
    const sectionRows = [
      ["قائمة الدخل التفصيلية", "الإيرادات حسب الحساب", "", ""],
      ...statements.detailedRows.incomeRevenue.map((row) => ["قائمة الدخل التفصيلية", "الإيرادات", row.label, row.value]),
      ["قائمة الدخل التفصيلية", "المصروفات حسب الحساب", "", ""],
      ...statements.detailedRows.incomeExpenses.map((row) => ["قائمة الدخل التفصيلية", "المصروفات", row.label, row.value]),
      ["التدفقات النقدية التفصيلية", "تعديلات الإهلاك", "", ""],
      ...statements.detailedRows.cashDepreciation.map((row) => ["التدفقات النقدية التفصيلية", "الإهلاك", row.label, row.value]),
      ["التدفقات النقدية التفصيلية", "تغير الذمم المدينة", "", ""],
      ...statements.detailedRows.cashReceivables.map((row) => ["التدفقات النقدية التفصيلية", "الذمم المدينة", row.label, row.value]),
      ["التدفقات النقدية التفصيلية", "تغير الذمم الدائنة", "", ""],
      ...statements.detailedRows.cashPayables.map((row) => ["التدفقات النقدية التفصيلية", "الذمم الدائنة", row.label, row.value]),
      ["التدفقات النقدية التفصيلية", "استثمارية", "", ""],
      ...statements.detailedRows.cashInvesting.map((row) => ["التدفقات النقدية التفصيلية", "استثمارية", row.label, row.value]),
      ["التدفقات النقدية التفصيلية", "تمويلية", "", ""],
      ...statements.detailedRows.cashFinancing.map((row) => ["التدفقات النقدية التفصيلية", "تمويلية", row.label, row.value]),
      ["حقوق الملكية التفصيلية", "رأس المال أول المدة", "", ""],
      ...statements.detailedRows.equityOpening.map((row) => ["حقوق الملكية التفصيلية", "رأس المال", row.label, row.value]),
      ["حقوق الملكية التفصيلية", "المسحوبات", "", ""],
      ...statements.detailedRows.equityDrawings.map((row) => ["حقوق الملكية التفصيلية", "المسحوبات", row.label, row.value])
    ];
    const categorySectionRows = [
      ...statements.detailedSections.income.flatMap((section) => section.rows.map((row) => ["قائمة الدخل حسب التصنيف التفصيلي", section.title, row.label, row.value])),
      ...statements.detailedSections.financialPosition.flatMap((section) => section.rows.map((row) => ["المركز المالي حسب التصنيف التفصيلي", section.title, row.label, row.value]))
    ];
    const summaryRows = [
      ["القائمة", "البند", "القيمة"],
      ["ميزان المراجعة", "إجمالي المدين", statements.totalDebit],
      ["ميزان المراجعة", "إجمالي الدائن", statements.totalCredit],
      ["قائمة الدخل", "الإيرادات", statements.revenueTotal],
      ["قائمة الدخل", "المصروفات", statements.expensesTotal],
      ["قائمة الدخل", "صافي الربح", statements.netIncome],
      ["المركز المالي", "الأصول", statements.totals.Assets],
      ["المركز المالي", "الخصوم + حقوق الملكية", statements.liabilitiesAndEquity],
      ["التدفقات النقدية", "صافي التدفق النقدي", statements.cashFlow.netCashFlow],
      [],
      ["تفاصيل الحسابات", "رقم الحساب", "اسم الحساب", "النوع", "التصنيف التفصيلي", "بداية مدين", "بداية دائن", "حركة مدين", "حركة دائن", "رصيد القائمة"],
      ...statements.rows.map((account) => [
        "تفاصيل الحسابات",
        account.accountCode,
        account.name,
        accountTypeLabels[account.type],
        accountDetailCategoryLabels[normalizeDetailCategory(account.type, account.detailCategory)],
        account.openingDebit,
        account.openingCredit,
        account.debit,
        account.credit,
        accountStatementAmount(account)
      ]),
      [],
      ["تفاصيل القوائم", "القسم", "البند", "القيمة"],
      ...sectionRows,
      [],
      ["تفاصيل التصنيفات", "القائمة", "التصنيف التفصيلي", "البند", "القيمة"],
      ...categorySectionRows
    ];

    downloadCsv("mizan-financial-statements.csv", summaryRows);
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify({ profile, accounts }, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "mizan-backup.json";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function importBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        if (Array.isArray(payload.accounts)) setAccounts(payload.accounts);
        if (payload.profile) setProfile({ ...defaultProfile, ...payload.profile });
      } catch {
        window.alert("تعذر قراءة ملف النسخة الاحتياطية.");
      } finally {
        event.target.value = "";
      }
    };
    reader.readAsText(file);
  }

  function resetData() {
    if (!window.confirm("سيتم حذف البيانات الحالية واستعادة نموذج فارغ. هل تريد المتابعة؟")) return;
    setAccounts([{ id: crypto.randomUUID(), accountCode: "", name: "", type: "Assets", detailCategory: "currentAssets", openingDebit: 0, openingCredit: 0, debit: 0, credit: 0, cashFlowTag: "operating" }]);
  }

  const chartData = {
    labels: ["الإيرادات", "المصروفات"],
    datasets: [
      {
        data: [statements.revenueTotal, statements.expensesTotal],
        backgroundColor: ["#0f766e", "#e11d48"],
        borderWidth: 0
      }
    ]
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="screen-only">
      <header className="no-print border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-lg bg-teal-600 text-white">
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">ميزان</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">لوحة تحويل ميزان المراجعة إلى قوائم مالية</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => setDarkMode((value) => !value)} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              {darkMode ? "Light" : "Dark"}
            </button>
            <button onClick={exportExcel} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900">
              <FileSpreadsheet size={18} />
              Excel
            </button>
            <button onClick={exportBackup} className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-900">
              <Download size={18} />
              Backup
            </button>
            <button onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950">
              <Printer size={18} />
              PDF
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_340px] lg:px-6">
        <div className="space-y-6">
          <CompanySettings profile={profile} setProfile={setProfile} onReset={resetData} onImportBackup={importBackup} />

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="توازن ميزان المراجعة" value={statements.balancedTrial ? "متوازن" : "غير متوازن"} tone={statements.balancedTrial ? "green" : "red"} detail={`${money(statements.totalDebit)} / ${money(statements.totalCredit)}`} />
            <MetricCard label="صافي الربح" value={money(statements.netIncome)} tone={statements.netIncome >= 0 ? "green" : "red"} detail="الإيرادات ناقص المصروفات" />
            <MetricCard label="الأصول" value={money(statements.totals.Assets)} detail="إجمالي أرصدة الأصول" />
            <MetricCard label="معادلة المركز المالي" value={statements.financialPositionBalanced ? "مطابقة" : "تحتاج مراجعة"} tone={statements.financialPositionBalanced ? "green" : "amber"} detail="الأصول = الخصوم + حقوق الملكية" />
          </section>

          <AccountsInput accounts={accounts} setAccounts={setAccounts} />

          <nav className="no-print flex gap-2 overflow-x-auto rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`shrink-0 rounded-md px-4 py-2 text-sm font-semibold ${activeTab === tab.id ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
                {tab.label}
              </button>
            ))}
          </nav>

          <TabContent activeTab={activeTab} statements={statements} profile={profile} />
        </div>

        <aside className="space-y-6">
          <ValidationPanel statements={statements} />
          <RatiosPanel statements={statements} />
          <section className="print-card rounded-lg border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold">تحليل سريع</h2>
            <div className="mt-4 h-64">
              <Pie data={chartData} options={{ maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { usePointStyle: true } } } }} />
            </div>
          </section>
          <section className="print-card rounded-lg border border-slate-200 bg-white p-5 text-sm shadow-panel dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold">جاهزية التوسع</h2>
            <div className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
              <p>المنطق المحاسبي مفصول في طبقة مستقلة، ما يسهل نقله لاحقًا إلى API.</p>
              <p>كل حساب يحمل تصنيفًا للتدفقات النقدية، ويمكن تحويله لاحقًا إلى دليل حسابات كامل.</p>
              <button onClick={() => setAccounts(sampleAccounts)} className="no-print inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
                <Download size={16} />
                استعادة بيانات تجريبية
              </button>
            </div>
          </section>
          <AccountingNotes />
        </aside>
      </div>
      <div className="no-print mx-auto max-w-7xl px-4 pb-8 lg:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-panel dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">تصدير التقرير المالي</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">تحميل ميزان المراجعة والقوائم المالية كاملة بتنسيق PDF احترافي.</p>
          </div>
          <button onClick={() => window.print()} className="inline-flex h-11 items-center gap-2 rounded-md bg-teal-600 px-5 text-sm font-semibold text-white hover:bg-teal-700">
            <Printer size={18} />
            تحميل PDF
          </button>
        </div>
      </div>
      </div>
      <div className="print-only">
        <PrintableReport profile={profile} statements={statements} />
      </div>
    </main>
  );
}

function TabContent({ activeTab, statements, profile }) {
  const periodLabel = `${profile.companyName} | ${profile.periodStart} إلى ${profile.periodEnd}`;

  if (activeTab === "trial") {
    return <TrialBalanceTable statements={statements} />;
  }

  if (activeTab === "income") {
    return (
      <DetailedStatement
        title={`قائمة الدخل التفصيلية - ${periodLabel}`}
        sections={statements.detailedSections.income}
      />
    );
  }

  if (activeTab === "position") {
    return <DetailedStatement title={`قائمة المركز المالي التفصيلية - ${periodLabel}`} sections={statements.detailedSections.financialPosition} />;
  }

  if (activeTab === "cash") {
    return (
      <DetailedStatement
        title={`قائمة التدفقات النقدية التفصيلية - ${periodLabel}`}
        sections={[
          { title: "بداية التدفق التشغيلي", rows: [{ id: "net-income", label: "صافي الربح", value: statements.netIncome }], totalLabel: "صافي الربح", totalValue: statements.netIncome },
          { title: "تفصيل تعديلات الإهلاك", rows: statements.detailedRows.cashDepreciation, totalLabel: "إجمالي الإهلاك المضاف", totalValue: statements.cashFlow.depreciation },
          { title: "تفصيل تغير الذمم المدينة", rows: statements.detailedRows.cashReceivables, totalLabel: "إجمالي أثر الذمم المدينة", totalValue: statements.cashFlow.receivablesChange },
          { title: "تفصيل تغير الذمم الدائنة", rows: statements.detailedRows.cashPayables, totalLabel: "إجمالي أثر الذمم الدائنة", totalValue: statements.cashFlow.payablesChange },
          { title: "التدفقات الاستثمارية حسب الحساب", rows: statements.detailedRows.cashInvesting, totalLabel: "صافي التدفق الاستثماري", totalValue: statements.cashFlow.investingCashFlow },
          { title: "التدفقات التمويلية حسب الحساب", rows: statements.detailedRows.cashFinancing, totalLabel: "صافي التدفق التمويلي", totalValue: statements.cashFlow.financingCashFlow },
          { title: "نتيجة التدفقات النقدية", rows: [{ id: "net-cash", label: "صافي التدفق النقدي", value: statements.cashFlow.netCashFlow }], totalLabel: "صافي التدفق النقدي", totalValue: statements.cashFlow.netCashFlow }
        ]}
      />
    );
  }

  if (activeTab === "equity") {
    return (
      <DetailedStatement
        title={`قائمة التغير في حقوق الملكية التفصيلية - ${periodLabel}`}
        sections={[
          { title: "حسابات رأس المال أول المدة", rows: statements.detailedRows.equityOpening, totalLabel: "إجمالي رأس المال أول المدة", totalValue: statements.beginningCapital },
          { title: "إضافة صافي الربح", rows: [{ id: "net-income", label: "صافي ربح الفترة", value: statements.netIncome }], totalLabel: "صافي الربح", totalValue: statements.netIncome },
          { title: "تفصيل المسحوبات", rows: statements.detailedRows.equityDrawings, totalLabel: "إجمالي المسحوبات", totalValue: -statements.drawings },
          { title: "رأس المال آخر المدة", rows: [{ id: "ending-equity", label: "رأس المال آخر المدة", value: statements.endingEquity }], totalLabel: "رأس المال آخر المدة", totalValue: statements.endingEquity }
        ]}
      />
    );
  }

  if (activeTab === "report") {
    return (
      <div className="space-y-6">
        <TrialBalanceTable statements={statements} />
        <DetailedStatement
          title={`قائمة الدخل التفصيلية - ${periodLabel}`}
          sections={statements.detailedSections.income}
        />
        <DetailedStatement title={`قائمة المركز المالي التفصيلية - ${periodLabel}`} sections={statements.detailedSections.financialPosition} />
        <DetailedStatement
          title={`قائمة التدفقات النقدية التفصيلية - ${periodLabel}`}
          sections={[
            { title: "بداية التدفق التشغيلي", rows: [{ id: "net-income", label: "صافي الربح", value: statements.netIncome }], totalLabel: "صافي الربح", totalValue: statements.netIncome },
            { title: "تفصيل تعديلات الإهلاك", rows: statements.detailedRows.cashDepreciation, totalLabel: "إجمالي الإهلاك المضاف", totalValue: statements.cashFlow.depreciation },
            { title: "تفصيل تغير الذمم المدينة", rows: statements.detailedRows.cashReceivables, totalLabel: "إجمالي أثر الذمم المدينة", totalValue: statements.cashFlow.receivablesChange },
            { title: "تفصيل تغير الذمم الدائنة", rows: statements.detailedRows.cashPayables, totalLabel: "إجمالي أثر الذمم الدائنة", totalValue: statements.cashFlow.payablesChange },
            { title: "التدفقات الاستثمارية حسب الحساب", rows: statements.detailedRows.cashInvesting, totalLabel: "صافي التدفق الاستثماري", totalValue: statements.cashFlow.investingCashFlow },
            { title: "التدفقات التمويلية حسب الحساب", rows: statements.detailedRows.cashFinancing, totalLabel: "صافي التدفق التمويلي", totalValue: statements.cashFlow.financingCashFlow },
            { title: "نتيجة التدفقات النقدية", rows: [{ id: "net-cash", label: "صافي التدفق النقدي", value: statements.cashFlow.netCashFlow }], totalLabel: "صافي التدفق النقدي", totalValue: statements.cashFlow.netCashFlow }
          ]}
        />
        <DetailedStatement
          title={`قائمة التغير في حقوق الملكية التفصيلية - ${periodLabel}`}
          sections={[
            { title: "حسابات رأس المال أول المدة", rows: statements.detailedRows.equityOpening, totalLabel: "إجمالي رأس المال أول المدة", totalValue: statements.beginningCapital },
            { title: "إضافة صافي الربح", rows: [{ id: "net-income", label: "صافي ربح الفترة", value: statements.netIncome }], totalLabel: "صافي الربح", totalValue: statements.netIncome },
            { title: "تفصيل المسحوبات", rows: statements.detailedRows.equityDrawings, totalLabel: "إجمالي المسحوبات", totalValue: -statements.drawings },
            { title: "رأس المال آخر المدة", rows: [{ id: "ending-equity", label: "رأس المال آخر المدة", value: statements.endingEquity }], totalLabel: "رأس المال آخر المدة", totalValue: statements.endingEquity }
          ]}
        />
      </div>
    );
  }

  return <DetailedStatement title={`الميزانية العمومية التفصيلية - ${periodLabel}`} sections={statements.detailedSections.financialPosition} />;
}

function SimpleStatement({ title, rows }) {
  return (
    <section className="print-card rounded-lg border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
      <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-100 dark:divide-slate-800 dark:border-slate-800">
        {rows.map(([label, value], index) => (
          <div key={label} className={`flex items-center justify-between gap-4 px-4 py-3 ${index === rows.length - 1 ? "bg-slate-50 font-bold dark:bg-slate-950" : ""}`}>
            <span className="text-slate-600 dark:text-slate-300">{label}</span>
            <span className={Number(value) < 0 ? "font-semibold text-rose-600" : "font-semibold text-slate-950 dark:text-white"}>{money(value)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
