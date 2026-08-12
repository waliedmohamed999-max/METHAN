import { ChevronDown, ChevronRight, ClipboardPaste, CornerDownLeft, FileSpreadsheet, FileUp, ListTree, Plus, Trash2 } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  accountDetailCategories,
  accountDetailCategoryLabels,
  accountParentOptions,
  accountTypeLabels,
  accountTypes,
  cashFlowTags,
  defaultDetailCategory,
  downloadTrialBalanceTemplate,
  normalizeDetailCategory,
  normalizeNumber,
  parseExcelPaste,
  readTrialBalanceExcelFile,
  splitDebitCredit
} from "../utils/accounting.js";

const MONEY_FIELDS = ["openingDebit", "openingCredit", "debit", "credit", "periodBalanceDebit", "periodBalanceCredit", "endingDebit", "endingCredit"];

function amount(value) {
  return Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function withMoney(account) {
  const openingNet = normalizeNumber(account.openingDebit) - normalizeNumber(account.openingCredit);
  const periodNet = normalizeNumber(account.debit) - normalizeNumber(account.credit);
  const periodBalance = splitDebitCredit(periodNet);
  const endingBalance = splitDebitCredit(openingNet + periodNet);

  return {
    ...account,
    periodBalanceDebit: periodBalance.debit,
    periodBalanceCredit: periodBalance.credit,
    endingDebit: endingBalance.debit,
    endingCredit: endingBalance.credit
  };
}

function sumMoney(rows) {
  return rows.reduce((totals, row) => {
    MONEY_FIELDS.forEach((field) => {
      totals[field] += row[field] || 0;
    });
    return totals;
  }, Object.fromEntries(MONEY_FIELDS.map((field) => [field, 0])));
}

export default function AccountsInput({ accounts, setAccounts, locateRequest }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [collapsedIds, setCollapsedIds] = useState(() => new Set());
  const [highlightId, setHighlightId] = useState(null);
  const rowRefs = useRef(new Map());
  const isBrowsingAll = !query.trim() && typeFilter === "All";

  const visibleAccounts = useMemo(() => {
    return accounts.filter((account) => {
      const matchesQuery = account.name.toLowerCase().includes(query.trim().toLowerCase());
      const matchesType = typeFilter === "All" || account.type === typeFilter;
      return matchesQuery && matchesType;
    });
  }, [accounts, query, typeFilter]);
  const visibleRows = useMemo(() => visibleAccounts.map(withMoney), [visibleAccounts]);
  const visibleTotals = useMemo(() => sumMoney(visibleRows), [visibleRows]);

  const accountGroups = useMemo(() => {
    const accountIds = new Set(accounts.map((account) => account.id));
    // Accounts whose parentId points at nothing (e.g. an edited backup file) are treated as top-level
    // so they still show up instead of silently disappearing from the grouped view.
    const mains = accounts.filter((account) => !account.parentId || !accountIds.has(account.parentId));
    return mains.map((main) => {
      const children = accounts.filter((account) => account.parentId === main.id).map(withMoney);
      return { main: withMoney(main), children, subtotal: sumMoney(children) };
    });
  }, [accounts]);

  function toggleCollapsed(id) {
    setCollapsedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  useEffect(() => {
    if (!locateRequest) return;
    const target = accounts.find((account) => account.id === locateRequest.id);
    if (!target) return;
    setQuery("");
    setTypeFilter("All");
    if (target.parentId) {
      setCollapsedIds((current) => {
        if (!current.has(target.parentId)) return current;
        const next = new Set(current);
        next.delete(target.parentId);
        return next;
      });
    }
    setHighlightId(locateRequest.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locateRequest]);

  useEffect(() => {
    if (!highlightId) return;
    const node = rowRefs.current.get(highlightId);
    node?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timer = setTimeout(() => setHighlightId(null), 2600);
    return () => clearTimeout(timer);
  }, [highlightId]);

  function updateAccount(id, key, value) {
    setAccounts((current) =>
      current.map((account) => {
        if (account.id !== id) return account;
        if (key === "type") {
          return { ...account, type: value, detailCategory: defaultDetailCategory(value) };
        }
        if (key === "parentId") {
          return { ...account, parentId: value || null };
        }
        return { ...account, [key]: ["openingDebit", "openingCredit", "debit", "credit"].includes(key) ? Number(value) : value };
      })
    );
  }

  function addMainRow() {
    setAccounts((current) => [...current, { id: crypto.randomUUID(), accountCode: "", name: "", type: "Assets", detailCategory: defaultDetailCategory("Assets"), parentId: null, openingDebit: 0, openingCredit: 0, debit: 0, credit: 0, cashFlowTag: "operating" }]);
  }

  function addChildRow(main, existingChildCount) {
    const suggestedCode = main.accountCode?.trim() ? `${main.accountCode.trim()}-${existingChildCount + 1}` : "";
    setAccounts((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        accountCode: suggestedCode,
        name: "",
        type: main.type,
        detailCategory: main.detailCategory,
        parentId: main.id,
        openingDebit: 0,
        openingCredit: 0,
        debit: 0,
        credit: 0,
        cashFlowTag: main.cashFlowTag || "operating"
      }
    ]);
    setCollapsedIds((current) => {
      if (!current.has(main.id)) return current;
      const next = new Set(current);
      next.delete(main.id);
      return next;
    });
  }

  function removeRow(id) {
    if (accounts.some((account) => account.parentId === id)) {
      window.alert("لا يمكن حذف حساب رئيسي له حسابات فرعية. احذف الحسابات الفرعية أولًا أو انقلها إلى حساب رئيسي آخر.");
      return;
    }
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

  async function handleExcelFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const parsed = await readTrialBalanceExcelFile(file);
      if (!parsed.length) {
        window.alert("لم يتم العثور على حسابات صالحة في الملف.");
        return;
      }
      const replace = window.confirm(`تم العثور على ${parsed.length} حساب في الملف.\nاضغط "موافق" لاعتماد الملف واستبدال ميزان المراجعة الحالي بالكامل، أو "إلغاء" لإضافته إلى الحسابات الحالية.`);
      setAccounts((current) => (replace ? parsed : [...current, ...parsed]));
    } catch {
      window.alert("تعذر قراءة ملف الإكسل. تأكد أن الملف بصيغة xlsx أو xls وبنفس أعمدة النموذج.");
    }
  }

  function renderAccountRow(account, isChild, mainMeta) {
    const rowClasses = [isChild ? "account-row-child" : "account-row-main"];
    if (account.id === highlightId) rowClasses.push("account-row-highlight");
    return (
      <tr
        key={account.id}
        ref={(node) => {
          if (node) rowRefs.current.set(account.id, node);
          else rowRefs.current.delete(account.id);
        }}
        className={rowClasses.join(" ")}
      >
        <td>
          <input value={account.accountCode || ""} onChange={(event) => updateAccount(account.id, "accountCode", event.target.value)} className="accounting-input w-24 text-center" placeholder="101" />
        </td>
        <td>
          <div className="flex items-center gap-1.5">
            {isChild ? <CornerDownLeft size={14} className="shrink-0 text-slate-400" /> : null}
            {!isChild && mainMeta?.hasChildren ? (
              <button
                type="button"
                onClick={mainMeta.onToggleCollapse}
                className="no-print shrink-0 rounded p-0.5 text-slate-500 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700"
                title={mainMeta.collapsed ? "إظهار الحسابات الفرعية" : "إخفاء الحسابات الفرعية"}
              >
                {mainMeta.collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
              </button>
            ) : null}
            <input
              value={account.name}
              onPaste={handlePaste}
              onChange={(event) => updateAccount(account.id, "name", event.target.value)}
              className={`accounting-input min-w-[190px] ${isChild ? "child-name-input" : "font-bold"}`}
              placeholder={isChild ? "اسم الحساب الفرعي" : "مثال: النقدية"}
            />
          </div>
        </td>
        <td>
          <select value={account.type} onChange={(event) => updateAccount(account.id, "type", event.target.value)} className="accounting-input min-w-[130px]">
            {accountTypes.map((type) => <option key={type} value={type}>{accountTypeLabels[type]}</option>)}
          </select>
        </td>
        <td>
          <select value={normalizeDetailCategory(account.type, account.detailCategory)} onChange={(event) => updateAccount(account.id, "detailCategory", event.target.value)} className="accounting-input min-w-[160px]">
            {(accountDetailCategories[account.type] || []).map((category) => <option key={category.value} value={category.value}>{accountDetailCategoryLabels[category.value]}</option>)}
          </select>
        </td>
        <td>
          <select value={account.parentId || ""} onChange={(event) => updateAccount(account.id, "parentId", event.target.value)} className="accounting-input min-w-[170px]">
            <option value="">— حساب رئيسي —</option>
            {accountParentOptions(accounts, account.id).map((option) => (
              <option key={option.id} value={option.id}>{option.accountCode ? `${option.accountCode} - ${option.name}` : option.name}</option>
            ))}
          </select>
        </td>
        <td>
          <select value={account.cashFlowTag} onChange={(event) => updateAccount(account.id, "cashFlowTag", event.target.value)} className="accounting-input min-w-[145px]">
            {cashFlowTags.map((tag) => <option key={tag.value} value={tag.value}>{tag.label}</option>)}
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
        <td className="readonly-money">{amount(account.periodBalanceDebit)}</td>
        <td className="readonly-money">{amount(account.periodBalanceCredit)}</td>
        <td className="readonly-money ending-money">{amount(account.endingDebit)}</td>
        <td className="readonly-money ending-money">{amount(account.endingCredit)}</td>
        <td className="no-print text-center">
          <button onClick={() => removeRow(account.id)} className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950" title="حذف">
            <Trash2 size={18} />
          </button>
        </td>
      </tr>
    );
  }

  function renderSubtotalRow(group) {
    const { subtotal } = group;
    return (
      <tr key={`${group.main.id}-subtotal`} className="account-subtotal-row">
        <td colSpan="6">إجمالي الفروع لحساب «{group.main.name.trim() || "هذا الحساب"}» ({group.children.length})</td>
        <td className="readonly-money">{amount(subtotal.openingDebit)}</td>
        <td className="readonly-money">{amount(subtotal.openingCredit)}</td>
        <td className="readonly-money">{amount(subtotal.debit)}</td>
        <td className="readonly-money">{amount(subtotal.credit)}</td>
        <td className="readonly-money">{amount(subtotal.periodBalanceDebit)}</td>
        <td className="readonly-money">{amount(subtotal.periodBalanceCredit)}</td>
        <td className="readonly-money ending-money">{amount(subtotal.endingDebit)}</td>
        <td className="readonly-money ending-money">{amount(subtotal.endingCredit)}</td>
        <td className="no-print"></td>
      </tr>
    );
  }

  return (
    <section className="print-card accounting-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-start gap-2">
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-200">
            <ListTree size={18} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">إدخال ميزان المراجعة</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">كل حساب رئيسي له صندوق خاص به في الجدول، وتقدر تطويه بالسهم بجانب اسمه. اضغط "إضافة حساب فرعي" أسفله لإضافة خانة أرقام جديدة تتبعه مباشرة برقم حساب مقترح تلقائيًا، وسطر "إجمالي الفروع" بيتحدث لحظيًا مع كل رقم تدخله.</p>
          </div>
        </div>
        <div className="no-print flex flex-wrap items-center gap-2">
          <button onClick={downloadTrialBalanceTemplate} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            <FileSpreadsheet size={18} />
            نموذج إكسل
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">
            <FileUp size={18} />
            اعتماد ملف إكسل
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleExcelFile} />
          </label>
          <button onClick={addMainRow} className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700">
            <Plus size={18} />
            حساب رئيسي جديد
          </button>
        </div>
      </div>
      <div className="no-print mb-4 grid gap-3 md:grid-cols-[1fr_220px]">
        <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" placeholder="بحث باسم الحساب" />
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
          <option value="All">كل التصنيفات</option>
          {accountTypes.map((type) => <option key={type} value={type}>{accountTypeLabels[type]}</option>)}
        </select>
      </div>
      {!isBrowsingAll ? (
        <p className="no-print mb-3 text-xs font-semibold text-amber-700 dark:text-amber-300">وضع البحث/الفلترة نشط: يظهر جدول مسطح للنتائج المطابقة فقط. امسح البحث وأعد "كل التصنيفات" لرؤية الحسابات الرئيسية والفرعية مجمّعة.</p>
      ) : null}
      <div className="accounting-table-wrap">
        <table className="accounting-entry-table detailed-entry-table">
          <thead>
            <tr>
              <th colSpan="6">بيانات الحساب</th>
              <th colSpan="2">رصيد بداية</th>
              <th colSpan="2">حركة الفترة</th>
              <th colSpan="2">رصيد الفترة</th>
              <th colSpan="2">رصيد نهاية</th>
              <th className="no-print" rowSpan="2"><ClipboardPaste size={16} /></th>
            </tr>
            <tr>
              <th>رقم</th>
              <th>اسم الحساب</th>
              <th>النوع</th>
              <th>التصنيف التفصيلي</th>
              <th>الحساب الرئيسي</th>
              <th>تصنيف التدفق</th>
              <th>مدين</th>
              <th>دائن</th>
              <th>مدين</th>
              <th>دائن</th>
              <th>مدين</th>
              <th>دائن</th>
              <th>مدين</th>
              <th>دائن</th>
            </tr>
          </thead>
          <tbody>
            {isBrowsingAll
              ? accountGroups.map((group) => {
                  const hasChildren = group.children.length > 0;
                  const collapsed = collapsedIds.has(group.main.id);
                  return (
                    <Fragment key={group.main.id}>
                      {renderAccountRow(group.main, false, { hasChildren, collapsed, onToggleCollapse: () => toggleCollapsed(group.main.id) })}
                      {hasChildren ? renderSubtotalRow(group) : null}
                      {hasChildren && !collapsed ? group.children.map((child) => renderAccountRow(child, true)) : null}
                      <tr className="account-add-child-row no-print">
                        <td colSpan="15">
                          <button onClick={() => addChildRow(group.main, group.children.length)} className="add-sub-account-button">
                            <Plus size={14} />
                            إضافة حساب فرعي لـ «{group.main.name.trim() || "هذا الحساب"}»
                          </button>
                        </td>
                      </tr>
                    </Fragment>
                  );
                })
              : visibleRows.map((account) => renderAccountRow(account, Boolean(account.parentId)))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="6">الإجمالي</td>
              <td className="readonly-money">{amount(visibleTotals.openingDebit)}</td>
              <td className="readonly-money">{amount(visibleTotals.openingCredit)}</td>
              <td className="readonly-money">{amount(visibleTotals.debit)}</td>
              <td className="readonly-money">{amount(visibleTotals.credit)}</td>
              <td className="readonly-money">{amount(visibleTotals.periodBalanceDebit)}</td>
              <td className="readonly-money">{amount(visibleTotals.periodBalanceCredit)}</td>
              <td className="readonly-money ending-money">{amount(visibleTotals.endingDebit)}</td>
              <td className="readonly-money ending-money">{amount(visibleTotals.endingCredit)}</td>
              <td className="no-print"></td>
            </tr>
            <tr>
              <td colSpan="6">الصافي</td>
              <td className="readonly-money" colSpan="2">{amount(Math.abs(visibleTotals.openingDebit - visibleTotals.openingCredit))}</td>
              <td className="readonly-money" colSpan="2">{amount(Math.abs(visibleTotals.debit - visibleTotals.credit))}</td>
              <td className="readonly-money" colSpan="2">{amount(Math.abs(visibleTotals.periodBalanceDebit - visibleTotals.periodBalanceCredit))}</td>
              <td className="readonly-money ending-money" colSpan="2">{amount(Math.abs(visibleTotals.endingDebit - visibleTotals.endingCredit))}</td>
              <td className="no-print"></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
