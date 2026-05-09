import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { money } from "../utils/accounting.js";

export default function ValidationPanel({ statements }) {
  const checks = [
    {
      label: "ميزان المراجعة",
      ok: statements.balancedTrial,
      detail: statements.balancedTrial
        ? "إجمالي المدين يساوي إجمالي الدائن."
        : `يوجد فرق قدره ${money(Math.abs(statements.totalDebit - statements.totalCredit))}.`
    },
    {
      label: "معادلة المركز المالي",
      ok: statements.financialPositionBalanced,
      detail: statements.financialPositionBalanced
        ? "الأصول تساوي الخصوم مضافًا إليها حقوق الملكية."
        : `يوجد فرق قدره ${money(Math.abs(statements.totals.Assets - statements.liabilitiesAndEquity))}.`
    },
    {
      label: "تصنيف الحسابات",
      ok: statements.rows.every((account) => account.type && account.name.trim()),
      detail: "كل حساب يحتاج اسمًا ونوعًا محاسبيًا واضحًا."
    }
  ];

  return (
    <section className="print-card rounded-lg border border-slate-200 bg-white p-5 text-sm shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold">فحص القوائم</h2>
      <div className="mt-4 space-y-3">
        {checks.map((check) => (
          <div key={check.label} className="flex gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
            {check.ok ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} /> : <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />}
            <div>
              <p className="font-semibold text-slate-950 dark:text-white">{check.label}</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">{check.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
