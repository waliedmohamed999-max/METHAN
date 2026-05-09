export default function MetricCard({ label, value, tone = "slate", detail }) {
  const tones = {
    slate: "border-slate-200 bg-white text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-white",
    green: "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-50",
    red: "border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-50",
    amber: "border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50"
  };

  return (
    <div className={`print-card rounded-lg border p-4 shadow-panel ${tones[tone]}`}>
      <p className="text-sm opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-normal">{value}</p>
      {detail ? <p className="mt-2 text-xs opacity-70">{detail}</p> : null}
    </div>
  );
}
