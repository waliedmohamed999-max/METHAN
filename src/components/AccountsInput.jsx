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
    <section className="print-card accounting-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">إدخال ميزان المراجعة</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">يمكن لصق أعمدة Excel: رقم الحساب، الحساب، النوع، التصنيف، رصيد بداية مدين/دائن، حركة مدين/دائن.</p>
        </div>
        <button onClick={addRow} className="no-print inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700">
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
      <div className="accounting-table-wrap">
        <table className="accounting-entry-table">
          <thead>
            <tr>
              <th>رقم</th>
              <th>اسم الحساب</th>
              <th>النوع</th>
              <th>التصنيف التفصيلي</th>
              <th>بداية مدين</th>
              <th>بداية دائن</th>
              <th>حركة مدين</th>
              <th>حركة دائن</th>
              <th>تصنيف التدفق</th>
              <th className="no-print"><ClipboardPaste size={16} /></th>
            </tr>
          </thead>
          <tbody>
            {visibleAccounts.map((account) => (
              <tr key={account.id}>
                <td>
                  <input value={account.accountCode || ""} onChange={(event) => updateAccount(account.id, "accountCode", event.target.value)} className="accounting-input w-24 text-center" placeholder="101" />
                </td>
                <td>
                  <input value={account.name} onPaste={handlePaste} onChange={(event) => updateAccount(account.id, "name", event.target.value)} className="accounting-input min-w-[190px]" placeholder="مثال: النقدية" />
                </td>
                <td>
                  <select value={account.type} onChange={(event) => updateAccount(account.id, "type", event.target.value)} className="accounting-input min-w-[130px]">
                    {accountTypes.map((type) => <option key={type} value={type}>{accountTypeLabels[type]}</option>)}
                  </select>
                </td>
                <td>
                  <select value={normalizeDetailCategory(account.type, account.detailCategory)} onChange={(event) => updateAccount(account.id, "detailCategory", event.target.value)} className="accounting-input min-w-[150px]">
                    {(accountDetailCategories[account.type] || []).map((category) => <option key={category.value} value={category.value}>{accountDetailCategoryLabels[category.value]}</option>)}
                  </select>
                </td>
                <td>
                  <input type="number" value={account.openingDebit || 0} onChange={(event) => updateAccount(account.id, "openingDebit", event.target.value)} className="accounting-input number-cell" />
                </td>
                <td>
                  <input type="number" value={account.openingCredit || 0} onChange={(event) => updateAccount(account.id, "openingCredit", event.target.value)} className="accounting-input number-cell" />
                </td>
                <td>
                  <input type="number" value={account.debit} onChange={(event) => updateAccount(account.id, "debit", event.target.value)} className="accounting-input number-cell" />
                </td>
                <td>
                  <input type="number" value={account.credit} onChange={(event) => updateAccount(account.id, "credit", event.target.value)} className="accounting-input number-cell" />
                </td>
                <td>
                  <select value={account.cashFlowTag} onChange={(event) => updateAccount(account.id, "cashFlowTag", event.target.value)} className="accounting-input min-w-[145px]">
                    {cashFlowTags.map((tag) => <option key={tag.value} value={tag.value}>{tag.label}</option>)}
                  </select>
                </td>
                <td className="no-print text-center">
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
