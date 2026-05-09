import { money } from "../utils/accounting.js";

export default function DetailedStatement({ title, sections }) {
  return (
    <section className="print-card rounded-lg border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between bg-slate-50 px-4 py-3 dark:bg-slate-950">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">{section.title}</h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">{section.rows.length} بند</span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {section.rows.length ? (
                section.rows.map((row) => (
                  <div key={row.id || row.label} className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 text-sm">
                    <span className="text-slate-600 dark:text-slate-300">{row.label}</span>
                    <span className={Number(row.value) < 0 ? "font-semibold text-rose-600" : "font-semibold text-slate-950 dark:text-white"}>{money(row.value)}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-slate-400">لا توجد بنود</div>
              )}
            </div>
            <div className="grid grid-cols-[1fr_auto] gap-4 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-950 dark:bg-emerald-950 dark:text-emerald-50">
              <span>{section.totalLabel}</span>
              <span>{money(section.totalValue)}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
