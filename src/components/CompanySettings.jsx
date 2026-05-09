import { Building2, CalendarDays, RotateCcw, Upload } from "lucide-react";

export default function CompanySettings({ profile, setProfile, onReset, onImportBackup }) {
  function updateProfile(key, value) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="print-card workspace-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200">
            <Building2 size={18} />
          </span>
          <div>
            <h2 className="text-base font-black text-slate-950 dark:text-white">بيانات المنشأة</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">تظهر في رأس التقارير وملف PDF</p>
          </div>
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">
            <Upload size={16} />
            استيراد نسخة
            <input type="file" accept="application/json" className="hidden" onChange={onImportBackup} />
          </label>
          <button onClick={onReset} className="inline-flex items-center gap-2 rounded-md border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950">
            <RotateCcw size={16} />
            تفريغ البيانات
          </button>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr_1fr]">
        <label className="block text-sm">
          <span className="mb-1 block text-slate-500 dark:text-slate-400">اسم المنشأة</span>
          <input value={profile.companyName} onChange={(event) => updateProfile("companyName", event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 flex items-center gap-1 text-slate-500 dark:text-slate-400"><CalendarDays size={15} /> بداية الفترة</span>
          <input type="date" value={profile.periodStart} onChange={(event) => updateProfile("periodStart", event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </label>
        <label className="block text-sm">
          <span className="mb-1 flex items-center gap-1 text-slate-500 dark:text-slate-400"><CalendarDays size={15} /> نهاية الفترة</span>
          <input type="date" value={profile.periodEnd} onChange={(event) => updateProfile("periodEnd", event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
        </label>
      </div>
    </section>
  );
}
