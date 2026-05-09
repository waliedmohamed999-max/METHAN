import { accountDetailCategoryLabels, accountTypeLabels, money, normalizeDetailCategory } from "../utils/accounting.js";

function amount(value) {
  return Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

export default function TrialBalanceTable({ statements }) {
  return (
    <section className="print-card rounded-lg border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">ميزان المراجعة</h2>
        <span className={`rounded-md px-3 py-1 text-sm font-semibold ${statements.balancedTrial ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200"}`}>
          {statements.balancedTrial ? "متوازن" : `فرق ${money(Math.abs(statements.totalDebit - statements.totalCredit))}`}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1320px] border-collapse text-right text-xs">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="border border-slate-300 px-2 py-2 font-semibold" rowSpan="2">رقم</th>
              <th className="border border-slate-300 px-2 py-2 font-semibold" rowSpan="2">الحساب</th>
              <th className="border border-slate-300 px-2 py-2 font-semibold" rowSpan="2">التصنيف</th>
              <th className="border border-slate-300 px-2 py-2 font-semibold" colSpan="2">رصيد بداية</th>
              <th className="border border-slate-300 px-2 py-2 font-semibold" colSpan="2">فترة</th>
              <th className="border border-slate-300 px-2 py-2 font-semibold" colSpan="2">رصيد الفترة</th>
              <th className="border border-slate-300 px-2 py-2 font-semibold" colSpan="2">رصيد نهاية</th>
            </tr>
            <tr>
              <th className="border border-slate-300 px-2 py-2 font-semibold">مدين</th>
              <th className="border border-slate-300 px-2 py-2 font-semibold">دائن</th>
              <th className="border border-slate-300 px-2 py-2 font-semibold">مدين</th>
              <th className="border border-slate-300 px-2 py-2 font-semibold">دائن</th>
              <th className="border border-slate-300 px-2 py-2 font-semibold">مدين</th>
              <th className="border border-slate-300 px-2 py-2 font-semibold">دائن</th>
              <th className="border border-slate-300 px-2 py-2 font-semibold">مدين</th>
              <th className="border border-slate-300 px-2 py-2 font-semibold">دائن</th>
            </tr>
          </thead>
          <tbody>
            {statements.trialBalanceRows.map((row) => (
              <tr key={row.id} className="text-slate-700 dark:text-slate-200">
                <td className="border border-slate-300 px-2 py-2 text-center">{row.accountCode}</td>
                <td className="border border-slate-300 px-2 py-2 font-medium">{row.name}</td>
                <td className="border border-slate-300 px-2 py-2 text-slate-500 dark:text-slate-400">{accountDetailCategoryLabels[normalizeDetailCategory(row.type, row.detailCategory)] || accountTypeLabels[row.type]}</td>
                <td className="border border-slate-300 px-2 py-2 text-left font-mono">{amount(row.openingDebit)}</td>
                <td className="border border-slate-300 px-2 py-2 text-left font-mono">{amount(row.openingCredit)}</td>
                <td className="border border-slate-300 px-2 py-2 text-left font-mono">{amount(row.debit)}</td>
                <td className="border border-slate-300 px-2 py-2 text-left font-mono">{amount(row.credit)}</td>
                <td className="border border-slate-300 px-2 py-2 text-left font-mono text-blue-600">{amount(row.periodBalanceDebit)}</td>
                <td className="border border-slate-300 px-2 py-2 text-left font-mono text-blue-600">{amount(row.periodBalanceCredit)}</td>
                <td className="border border-slate-300 px-2 py-2 text-left font-mono">{amount(row.endingDebit)}</td>
                <td className="border border-slate-300 px-2 py-2 text-left font-mono">{amount(row.endingCredit)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <td className="border border-slate-300 px-2 py-3 font-bold" colSpan="3">الإجمالي</td>
              <td className="border border-slate-300 px-2 py-3 text-left font-mono font-bold">{amount(statements.totalOpeningDebit)}</td>
              <td className="border border-slate-300 px-2 py-3 text-left font-mono font-bold">{amount(statements.totalOpeningCredit)}</td>
              <td className="border border-slate-300 px-2 py-3 text-left font-mono font-bold">{amount(statements.totalDebit)}</td>
              <td className="border border-slate-300 px-2 py-3 text-left font-mono font-bold">{amount(statements.totalCredit)}</td>
              <td className="border border-slate-300 px-2 py-3 text-left font-mono font-bold text-blue-600">{amount(statements.totalPeriodBalanceDebit)}</td>
              <td className="border border-slate-300 px-2 py-3 text-left font-mono font-bold text-blue-600">{amount(statements.totalPeriodBalanceCredit)}</td>
              <td className="border border-slate-300 px-2 py-3 text-left font-mono font-bold">{amount(statements.totalEndingDebit)}</td>
              <td className="border border-slate-300 px-2 py-3 text-left font-mono font-bold">{amount(statements.totalEndingCredit)}</td>
            </tr>
            <tr className="bg-white text-slate-950 dark:bg-slate-900 dark:text-white">
              <td className="border border-slate-300 px-2 py-2 font-bold" colSpan="3">الصافي</td>
              <td className="border border-slate-300 px-2 py-2 text-left font-mono font-bold" colSpan="2">{amount(Math.abs(statements.totalOpeningDebit - statements.totalOpeningCredit))}</td>
              <td className="border border-slate-300 px-2 py-2 text-left font-mono font-bold" colSpan="2">{amount(Math.abs(statements.totalDebit - statements.totalCredit))}</td>
              <td className="border border-slate-300 px-2 py-2 text-left font-mono font-bold" colSpan="2">{amount(Math.abs(statements.totalPeriodBalanceDebit - statements.totalPeriodBalanceCredit))}</td>
              <td className="border border-slate-300 px-2 py-2 text-left font-mono font-bold" colSpan="2">{amount(Math.abs(statements.totalEndingDebit - statements.totalEndingCredit))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
