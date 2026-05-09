import { accountDetailCategoryLabels, accountTypeLabels, money, normalizeDetailCategory } from "../utils/accounting.js";

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
        <table className="w-full min-w-[860px] text-right text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-3 py-3 font-semibold">الحساب</th>
              <th className="px-3 py-3 font-semibold">التصنيف الرئيسي</th>
              <th className="px-3 py-3 font-semibold">التصنيف التفصيلي</th>
              <th className="px-3 py-3 font-semibold">مدين</th>
              <th className="px-3 py-3 font-semibold">دائن</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {statements.rows.map((row) => (
              <tr key={row.id} className="text-slate-700 dark:text-slate-200">
                <td className="px-3 py-3 font-medium">{row.name}</td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{accountTypeLabels[row.type]}</td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{accountDetailCategoryLabels[normalizeDetailCategory(row.type, row.detailCategory)]}</td>
                <td className="px-3 py-3">{money(row.debit)}</td>
                <td className="px-3 py-3">{money(row.credit)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <td className="px-3 py-4 font-bold" colSpan="3">الإجمالي</td>
              <td className="px-3 py-4 font-bold">{money(statements.totalDebit)}</td>
              <td className="px-3 py-4 font-bold">{money(statements.totalCredit)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
