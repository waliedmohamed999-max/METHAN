import { Building2, CalendarDays, RotateCcw, Upload } from "lucide-react";

export default function CompanySettings({ profile, setProfile, onReset, onImportBackup }) {
  function updateProfile(key, value) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="print-card rounded-lg border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <Building2 size={19} className="text-teal-600" />
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">بيانات المنشأة</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
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
      <div className="no-print mt-4 flex flex-wrap gap-2">
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
    </section>
  );
}
