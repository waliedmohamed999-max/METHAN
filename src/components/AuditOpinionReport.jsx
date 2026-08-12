import { RotateCcw, ShieldCheck } from "lucide-react";
import { buildAuditOpinionReport, formatAuditOpinionText } from "../utils/accounting.js";

const toneByType = {
  unqualified: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  qualified: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  adverse: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200",
  disclaimer: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
};

const signatureFields = [
  { key: "auditFirmName", label: "اسم مكتب المراجعة" },
  { key: "auditorName", label: "اسم المراجع القانوني" },
  { key: "licenseNumber", label: "رقم الترخيص" },
  { key: "reportCity", label: "مدينة إصدار التقرير" }
];

export default function AuditOpinionReport({ profile, setProfile, statements, overrideText, onChangeOverride }) {
  const report = buildAuditOpinionReport(profile, statements);
  const defaultText = formatAuditOpinionText(report);
  const displayText = overrideText || defaultText;

  function updateProfile(key, value) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="print-card rounded-lg border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200">
            <ShieldCheck size={18} />
          </span>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">تقرير رأي مراجع الحسابات المستقل</h2>
        </div>
        <span className={`rounded-md border px-3 py-1.5 text-sm font-bold ${toneByType[report.type]}`}>{report.label}</span>
      </div>

      <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
        يُقترح نوع الرأي تلقائيًا استنادًا إلى نتائج فحص توازن ميزان المراجعة ومعادلة المركز المالي واكتمال تصنيف الحسابات. يمكنك مراجعة النص وتعديله يدويًا قبل الطباعة.
      </p>

      <div className="no-print mb-4 grid gap-3 rounded-lg border border-slate-200 p-4 dark:border-slate-800 sm:grid-cols-2 lg:grid-cols-4">
        {signatureFields.map((field) => (
          <label key={field.key} className="block text-xs">
            <span className="mb-1 block font-semibold text-slate-500 dark:text-slate-400">{field.label}</span>
            <input
              value={profile[field.key] || ""}
              onChange={(event) => updateProfile(field.key, event.target.value)}
              className="w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>
        ))}
      </div>

      <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-slate-50 px-4 py-3 text-sm dark:bg-slate-950">
        <span className="text-slate-600 dark:text-slate-300">نص التقرير قابل للتعديل الكامل قبل الاعتماد أو الطباعة. تعديل بيانات المكتب أعلاه لا تنعكس تلقائيًا إن كنت عدّلت النص يدويًا — اضغط "إعادة توليد" لتحديثه.</span>
        <button
          onClick={() => onChangeOverride("")}
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs font-bold hover:bg-white dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <RotateCcw size={14} />
          إعادة توليد النص تلقائيًا
        </button>
      </div>

      <textarea
        dir="rtl"
        value={displayText}
        onChange={(event) => onChangeOverride(event.target.value)}
        rows={24}
        className="no-print w-full rounded-md border border-slate-200 bg-white p-4 text-sm leading-relaxed text-slate-800 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      />
    </section>
  );
}
