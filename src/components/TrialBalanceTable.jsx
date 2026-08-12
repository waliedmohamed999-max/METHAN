import { Fragment } from "react";
import { accountDetailCategoryLabels, accountTypeLabels, money, normalizeDetailCategory } from "../utils/accounting.js";

function amount(value) {
  return Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function categoryLabel(row) {
  return accountDetailCategoryLabels[normalizeDetailCategory(row.type, row.detailCategory)] || accountTypeLabels[row.type];
}

export default function TrialBalanceTable({ statements }) {
  return (
    <section className="print-card accounting-panel">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">ميزان المراجعة</h2>
        <span className={`rounded-md px-3 py-1 text-sm font-semibold ${statements.balancedTrial ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200" : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-200"}`}>
          {statements.balancedTrial ? "متوازن" : `فرق ${money(Math.abs(statements.totalDebit - statements.totalCredit))}`}
        </span>
      </div>
      <div className="trial-balance-wrap">
        <table className="trial-balance-table">
          <thead>
            <tr>
              <th rowSpan="2">رقم</th>
              <th rowSpan="2">الحساب</th>
              <th rowSpan="2">التصنيف</th>
              <th colSpan="2">رصيد بداية</th>
              <th colSpan="2">فترة</th>
              <th colSpan="2">رصيد الفترة</th>
              <th colSpan="2">رصيد نهاية</th>
            </tr>
            <tr>
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
            {statements.trialBalanceGroups.map((group) => (
              <Fragment key={group.id}>
                <tr className={group.isGroup ? "trial-balance-group-row" : "text-slate-700 dark:text-slate-200"}>
                  <td className="code-cell">{group.accountCode}</td>
                  <td className="name-cell">{group.name}</td>
                  <td>{categoryLabel(group)}</td>
                  <td className="money-cell">{amount(group.openingDebit)}</td>
                  <td className="money-cell">{amount(group.openingCredit)}</td>
                  <td className="money-cell">{amount(group.debit)}</td>
                  <td className="money-cell">{amount(group.credit)}</td>
                  <td className="money-cell balance-cell">{amount(group.periodBalanceDebit)}</td>
                  <td className="money-cell balance-cell">{amount(group.periodBalanceCredit)}</td>
                  <td className="money-cell">{amount(group.endingDebit)}</td>
                  <td className="money-cell">{amount(group.endingCredit)}</td>
                </tr>
                {group.children.map((child) => (
                  <tr key={child.id} className="trial-balance-child-row text-slate-600 dark:text-slate-300">
                    <td className="code-cell">{child.accountCode}</td>
                    <td className="name-cell child-name-cell">{child.name}</td>
                    <td>{categoryLabel(child)}</td>
                    <td className="money-cell">{amount(child.openingDebit)}</td>
                    <td className="money-cell">{amount(child.openingCredit)}</td>
                    <td className="money-cell">{amount(child.debit)}</td>
                    <td className="money-cell">{amount(child.credit)}</td>
                    <td className="money-cell balance-cell">{amount(child.periodBalanceDebit)}</td>
                    <td className="money-cell balance-cell">{amount(child.periodBalanceCredit)}</td>
                    <td className="money-cell">{amount(child.endingDebit)}</td>
                    <td className="money-cell">{amount(child.endingCredit)}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-slate-200 bg-slate-50 text-slate-950 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
              <td colSpan="3">الإجمالي</td>
              <td className="money-cell">{amount(statements.totalOpeningDebit)}</td>
              <td className="money-cell">{amount(statements.totalOpeningCredit)}</td>
              <td className="money-cell">{amount(statements.totalDebit)}</td>
              <td className="money-cell">{amount(statements.totalCredit)}</td>
              <td className="money-cell balance-cell">{amount(statements.totalPeriodBalanceDebit)}</td>
              <td className="money-cell balance-cell">{amount(statements.totalPeriodBalanceCredit)}</td>
              <td className="money-cell">{amount(statements.totalEndingDebit)}</td>
              <td className="money-cell">{amount(statements.totalEndingCredit)}</td>
            </tr>
            <tr className="bg-white text-slate-950 dark:bg-slate-900 dark:text-white">
              <td colSpan="3">الصافي</td>
              <td className="money-cell" colSpan="2">{amount(Math.abs(statements.totalOpeningDebit - statements.totalOpeningCredit))}</td>
              <td className="money-cell" colSpan="2">{amount(Math.abs(statements.totalDebit - statements.totalCredit))}</td>
              <td className="money-cell" colSpan="2">{amount(Math.abs(statements.totalPeriodBalanceDebit - statements.totalPeriodBalanceCredit))}</td>
              <td className="money-cell" colSpan="2">{amount(Math.abs(statements.totalEndingDebit - statements.totalEndingCredit))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}
