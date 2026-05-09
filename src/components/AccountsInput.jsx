import { ClipboardPaste, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { accountDetailCategories, accountDetailCategoryLabels, accountTypeLabels, accountTypes, cashFlowTags, defaultDetailCategory, normalizeDetailCategory, parseExcelPaste } from "../utils/accounting.js";

export default function AccountsInput({ accounts, setAccounts }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const visibleAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesQuery = account.name.toLowerCase().includes(query.trim().toLowerCase());
      const matchesType = typeFilter === "All" || account.type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [accounts, query, typeFilter]);

  function updateAccount(id, key, value) {
    setAccounts((current) =>
      current.map((account) => {
        if (account.id !== id) return account;
        if (key === "type") {
          return { ...account, type: value, detailCategory: defaultDetailCategory(value) };
        }
        return { ...account, [key]: ["openingDebit", "openingCredit", "debit", "credit"].includes(key) ? Number(value) : value };
      })
    );
  }

  function addRow() {
    setAccounts((current) => [...current, { id: crypto.randomUUID(), accountCode: "", name: "", type: "Assets", detailCategory: defaultDetailCategory("Assets"), openingDebit: 0, openingCredit: 0, debit: 0, credit: 0, cashFlowTag: "operating" }]);
  }

  function removeRow(id) {
    setAccounts((current) => current.filter((account) => account.id !== id));
  }

  function handlePaste(event) {
    const text = event.clipboardData.getData("text");
    const parsed = parseExcelPaste(text);
    if (parsed.length > 1) {
      event.preventDefault();
      setAccounts((current) => [...current, ...parsed]);
    }
  }

  return (
    <section className="print-card rounded-lg border border-slate-200 bg-white p-5 shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">إدخال ميزان المراجعة</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">يمكن لصق أعمدة Excel: رقم الحساب، الحساب، النوع، التصنيف، رصيد بداية مدين/دائن، حركة مدين/دائن.</p>
        </div>
        <button onClick={addRow} className="no-print inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
          <Plus size={18} />
          إضافة حساب
        </button>
      </div>
      <div className="no-print mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="بحث باسم الحساب" />
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          <option value="All">كل التصنيفات</option>
          {accountTypes.map((type) => <option key={type} value={type}>{accountTypeLabels[type]}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1500px] text-right text-sm">
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            <tr>
              <th className="px-3 py-3">رقم</th>
              <th className="px-3 py-3">اسم الحساب</th>
              <th className="px-3 py-3">النوع</th>
              <th className="px-3 py-3">التصنيف التفصيلي</th>
              <th className="px-3 py-3">بداية مدين</th>
              <th className="px-3 py-3">بداية دائن</th>
              <th className="px-3 py-3">حركة مدين</th>
              <th className="px-3 py-3">حركة دائن</th>
              <th className="px-3 py-3">تصنيف التدفق</th>
              <th className="px-3 py-3 no-print"><ClipboardPaste size={16} /></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {visibleAccounts.map((account) => (
              <tr key={account.id}>
                <td className="px-3 py-2">
                  <input value={account.accountCode || ""} onChange={(event) => updateAccount(account.id, "accountCode", event.target.value)} className="w-24 rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="101" />
                </td>
                <td className="px-3 py-2">
                  <input value={account.name} onPaste={handlePaste} onChange={(event) => updateAccount(account.id, "name", event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="مثال: النقدية" />
                </td>
                <td className="px-3 py-2">
                  <select value={account.type} onChange={(event) => updateAccount(account.id, "type", event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                    {accountTypes.map((type) => <option key={type} value={type}>{accountTypeLabels[type]}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select value={normalizeDetailCategory(account.type, account.detailCategory)} onChange={(event) => updateAccount(account.id, "detailCategory", event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                    {(accountDetailCategories[account.type] || []).map((category) => <option key={category.value} value={category.value}>{accountDetailCategoryLabels[category.value]}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input type="number" value={account.openingDebit || 0} onChange={(event) => updateAccount(account.id, "openingDebit", event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </td>
                <td className="px-3 py-2">
                  <input type="number" value={account.openingCredit || 0} onChange={(event) => updateAccount(account.id, "openingCredit", event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </td>
                <td className="px-3 py-2">
                  <input type="number" value={account.debit} onChange={(event) => updateAccount(account.id, "debit", event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </td>
                <td className="px-3 py-2">
                  <input type="number" value={account.credit} onChange={(event) => updateAccount(account.id, "credit", event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                </td>
                <td className="px-3 py-2">
                  <select value={account.cashFlowTag} onChange={(event) => updateAccount(account.id, "cashFlowTag", event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                    {cashFlowTags.map((tag) => <option key={tag.value} value={tag.value}>{tag.label}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 no-print">
                  <button onClick={() => removeRow(account.id)} className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950" title="حذف">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
