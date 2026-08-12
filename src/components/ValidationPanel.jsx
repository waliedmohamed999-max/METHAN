import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { accountTypeLabels, money } from "../utils/accounting.js";

function findIssues(statements) {
  const codeCounts = {};
  statements.rows.forEach((account) => {
    const code = account.accountCode?.trim();
    if (code) codeCounts[code] = (codeCounts[code] || 0) + 1;
  });
  const duplicateCodes = Object.entries(codeCounts)
    .filter(([, count]) => count > 1)
    .map(([code]) => code);

  const idSet = new Set(statements.rows.map((account) => account.id));
  const orphanSubs = statements.rows.filter((account) => account.parentId && !idSet.has(account.parentId));

  const byId = Object.fromEntries(statements.rows.map((account) => [account.id, account]));
  const typeMismatches = statements.rows.filter((account) => {
    const parent = account.parentId && byId[account.parentId];
    return parent && parent.type !== account.type;
  });

  return { duplicateCodes, orphanSubs, typeMismatches };
}

export default function ValidationPanel({ statements }) {
  const { duplicateCodes, orphanSubs, typeMismatches } = findIssues(statements);

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
    },
    {
      label: "أرقام الحسابات",
      ok: duplicateCodes.length === 0,
      detail: duplicateCodes.length === 0 ? "لا يوجد رقم حساب مكرر." : `أرقام مكررة: ${duplicateCodes.join("، ")}.`
    },
    {
      label: "ارتباط الحسابات الفرعية",
      ok: orphanSubs.length === 0,
      detail: orphanSubs.length === 0 ? "كل حساب فرعي مرتبط بحساب رئيسي موجود." : `${orphanSubs.length} حساب فرعي مرتبط بحساب رئيسي غير موجود: ${orphanSubs.map((account) => account.name || account.accountCode).join("، ")}.`
    },
    {
      label: "اتساق نوع الحسابات الفرعية",
      ok: typeMismatches.length === 0,
      detail:
        typeMismatches.length === 0
          ? "كل حساب فرعي بنفس نوع حسابه الرئيسي."
          : `${typeMismatches.length} حساب فرعي بنوع مختلف عن رئيسيه: ${typeMismatches.map((account) => `${account.name} (${accountTypeLabels[account.type]})`).join("، ")}.`
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
