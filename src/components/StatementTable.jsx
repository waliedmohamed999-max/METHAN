import { accountDetailCategoryLabels, money, normalizeDetailCategory } from "../utils/accounting.js";

export default function StatementTable({ title, rows, totalLabel, totalValue }) {
  return (
    <section className="print-card rounded-lg border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
        <span className="rounded-md bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800 dark:text-slate-300">{rows.length} حساب</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-right text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-3 py-3 font-semibold">الحساب</th>
              <th className="px-3 py-3 font-semibold">التصنيف التفصيلي</th>
              <th className="px-3 py-3 font-semibold">مدين</th>
              <th className="px-3 py-3 font-semibold">دائن</th>
              <th className="px-3 py-3 font-semibold">الرصيد</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.id} className="text-slate-700 dark:text-slate-200">
                <td className="px-3 py-3 font-medium">{row.name}</td>
                <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{accountDetailCategoryLabels[normalizeDetailCategory(row.type, row.detailCategory)]}</td>
                <td className="px-3 py-3">{money(row.debit)}</td>
                <td className="px-3 py-3">{money(row.credit)}</td>
                <td className="px-3 py-3 font-semibold">{money(Math.abs((row.debit || 0) - (row.credit || 0)))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 text-slate-950 dark:border-slate-700 dark:text-white">
              <td className="px-3 py-4 font-bold" colSpan="2">{totalLabel}</td>
              <td className="px-3 py-4"></td>
              <td className="px-3 py-4"></td>
              <td className="px-3 py-4 font-bold">{money(totalValue)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
