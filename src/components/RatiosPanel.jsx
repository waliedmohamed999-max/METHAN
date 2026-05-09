import { money } from "../utils/accounting.js";

function percent(value) {
  return `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`;
}

export default function RatiosPanel({ statements }) {
  const profitMargin = statements.revenueTotal ? (statements.netIncome / statements.revenueTotal) * 100 : 0;
  const debtToAssets = statements.totals.Assets ? (statements.totals.Liabilities / statements.totals.Assets) * 100 : 0;
  const expenseRatio = statements.revenueTotal ? (statements.expensesTotal / statements.revenueTotal) * 100 : 0;

  const ratios = [
    ["هامش صافي الربح", percent(profitMargin)],
    ["نسبة المصروفات للإيرادات", percent(expenseRatio)],
    ["نسبة الخصوم للأصول", percent(debtToAssets)],
    ["صافي التدفق النقدي", money(statements.cashFlow.netCashFlow)]
  ];

  return (
    <section className="print-card rounded-lg border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white">مؤشرات مالية</h2>
      <div className="mt-4 grid gap-3">
        {ratios.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-slate-950">
            <span className="text-slate-500 dark:text-slate-400">{label}</span>
            <span className="font-bold text-slate-950 dark:text-white">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
