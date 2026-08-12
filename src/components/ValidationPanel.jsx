import { AlertTriangle, CheckCircle2, MapPin } from "lucide-react";
import { accountTypeLabels, money } from "../utils/accounting.js";

function findIssues(statements, accounts) {
  const codeCounts = {};
  statements.rows.forEach((account) => {
    const code = account.accountCode?.trim();
    if (code) codeCounts[code] = (codeCounts[code] || 0) + 1;
  });
  const duplicateCodeSet = new Set(
    Object.entries(codeCounts)
      .filter(([, count]) => count > 1)
      .map(([code]) => code)
  );
  const duplicateAccounts = statements.rows.filter((account) => account.accountCode?.trim() && duplicateCodeSet.has(account.accountCode.trim()));

  const idSet = new Set(statements.rows.map((account) => account.id));
  const orphanSubs = statements.rows.filter((account) => account.parentId && !idSet.has(account.parentId));

  const byId = Object.fromEntries(statements.rows.map((account) => [account.id, account]));
  const typeMismatches = statements.rows.filter((account) => {
    const parent = account.parentId && byId[account.parentId];
    return parent && parent.type !== account.type;
  });

  // Blank-name rows are dropped before they ever reach statements.rows (they don't affect any
  // totals yet), so this has to scan the raw account list to actually catch them.
  const incompleteAccounts = accounts.filter((account) => !account.type || !account.name.trim());

  return { duplicateCodeSet, duplicateAccounts, orphanSubs, typeMismatches, incompleteAccounts };
}

function accountLabel(account) {
  const name = account.name?.trim() || "بدون اسم";
  return account.accountCode ? `${account.accountCode} - ${name}` : name;
}

function IssueLocators({ accounts, onLocate }) {
  if (!accounts.length || !onLocate) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {accounts.map((account) => (
        <button
          key={account.id}
          onClick={() => onLocate(account.id)}
          className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200 dark:hover:bg-amber-900"
          title="الانتقال إلى هذا الحساب في جدول الإدخال"
        >
          <MapPin size={12} />
          {accountLabel(account)}
        </button>
      ))}
    </div>
  );
}

export default function ValidationPanel({ statements, accounts, onLocate }) {
  const { duplicateAccounts, orphanSubs, typeMismatches, incompleteAccounts } = findIssues(statements, accounts);

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
      ok: incompleteAccounts.length === 0,
      detail: incompleteAccounts.length === 0 ? "كل حساب له اسم ونوع محاسبي واضح." : `${incompleteAccounts.length} حساب ناقص الاسم أو النوع.`,
      accounts: incompleteAccounts
    },
    {
      label: "أرقام الحسابات",
      ok: duplicateAccounts.length === 0,
      detail: duplicateAccounts.length === 0 ? "لا يوجد رقم حساب مكرر." : "أرقام حسابات مكررة.",
      accounts: duplicateAccounts
    },
    {
      label: "ارتباط الحسابات الفرعية",
      ok: orphanSubs.length === 0,
      detail: orphanSubs.length === 0 ? "كل حساب فرعي مرتبط بحساب رئيسي موجود." : `${orphanSubs.length} حساب فرعي مرتبط بحساب رئيسي غير موجود.`,
      accounts: orphanSubs
    },
    {
      label: "اتساق نوع الحسابات الفرعية",
      ok: typeMismatches.length === 0,
      detail: typeMismatches.length === 0 ? "كل حساب فرعي بنفس نوع حسابه الرئيسي." : `${typeMismatches.length} حساب فرعي بنوع مختلف عن رئيسيه.`,
      accounts: typeMismatches.map((account) => ({ ...account, name: `${account.name} (${accountTypeLabels[account.type]})` }))
    }
  ];

  return (
    <section className="print-card rounded-lg border border-slate-200 bg-white p-5 text-sm shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold">فحص القوائم</h2>
      <div className="mt-4 space-y-3">
        {checks.map((check) => (
          <div key={check.label} className="flex gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
            {check.ok ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} /> : <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-slate-950 dark:text-white">{check.label}</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">{check.detail}</p>
              {!check.ok && check.accounts ? <IssueLocators accounts={check.accounts} onLocate={onLocate} /> : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
