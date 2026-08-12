import { LineChart } from "lucide-react";
import { computeFinancialAnalysis, money } from "../utils/accounting.js";

function formatValue(item) {
  if (item.value === null || !Number.isFinite(item.value)) return "—";
  if (item.format === "money") return money(item.value);
  if (item.format === "percent") return `${item.value.toFixed(1)}%`;
  if (item.format === "times") return `${item.value.toFixed(2)}×`;
  return item.value.toFixed(2);
}

export default function FinancialAnalysisReport({ title, statements }) {
  const analysis = computeFinancialAnalysis(statements);

  return (
    <section className="print-card rounded-lg border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200">
          <LineChart size={18} />
        </span>
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
      </div>
      <div className="space-y-4">
        {analysis.groups.map((group) => (
          <div key={group.title} className="overflow-hidden rounded-lg border border-slate-100 dark:border-slate-800">
            <div className="bg-slate-50 px-4 py-3 dark:bg-slate-950">
              <h3 className="font-bold text-slate-800 dark:text-slate-100">{group.title}</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {group.items.map((item) => (
                <div key={item.label} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[220px_1fr]">
                  <div className="flex items-center justify-between gap-3 sm:block">
                    <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                    <span className="font-bold text-slate-950 dark:text-white sm:mt-1 sm:block">{formatValue(item)}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{item.note}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
