import { Fragment } from "react";
import { accountDetailCategoryLabels, buildAuditOpinionReport, computeFinancialAnalysis, formatAuditOpinionText, money, normalizeDetailCategory } from "../utils/accounting.js";

function amount(value) {
  return Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

function ReportTable({ title, rows, footerLabel, footerValue }) {
  return (
    <section className="pdf-section">
      <h2>{title}</h2>
      <table className="pdf-table">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{money(value)}</td>
            </tr>
          ))}
        </tbody>
        {footerLabel ? (
          <tfoot>
            <tr>
              <td>{footerLabel}</td>
              <td>{money(footerValue)}</td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </section>
  );
}

function DetailedReportTable({ title, sections }) {
  return (
    <section className="pdf-section">
      <h2>{title}</h2>
      {sections.map((section) => (
        <table className="pdf-table pdf-detail-table" key={section.title}>
          <thead>
            <tr>
              <th colSpan="2">{section.title}</th>
            </tr>
          </thead>
          <tbody>
            {section.rows.length ? (
              section.rows.map((row) => (
                <tr key={row.id || row.label}>
                  <td>{row.label}</td>
                  <td>{money(row.value)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2">لا توجد بنود</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td>{section.totalLabel}</td>
              <td>{money(section.totalValue)}</td>
            </tr>
          </tfoot>
        </table>
      ))}
    </section>
  );
}

function AccountsTable({ title, groups, totals }) {
  return (
    <section className="pdf-section pdf-trial-section">
      <h2>{title}</h2>
      <table className="pdf-table pdf-trial-table">
        <colgroup>
          <col className="pdf-code-col" />
          <col className="pdf-name-col" />
          <col className="pdf-category-col" />
          <col span="8" className="pdf-money-col" />
        </colgroup>
        <thead>
          <tr>
            <th>رقم</th>
            <th>الحساب</th>
            <th>التصنيف</th>
            <th>بداية مدين</th>
            <th>بداية دائن</th>
            <th>حركة مدين</th>
            <th>حركة دائن</th>
            <th>رصيد فترة مدين</th>
            <th>رصيد فترة دائن</th>
            <th>نهاية مدين</th>
            <th>نهاية دائن</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <Fragment key={group.id}>
              <tr className={group.isGroup ? "pdf-group-row" : ""}>
                <td>{group.accountCode}</td>
                <td>{group.name}</td>
                <td>{accountDetailCategoryLabels[normalizeDetailCategory(group.type, group.detailCategory)]}</td>
                <td>{amount(group.openingDebit)}</td>
                <td>{amount(group.openingCredit)}</td>
                <td>{amount(group.debit)}</td>
                <td>{amount(group.credit)}</td>
                <td>{amount(group.periodBalanceDebit)}</td>
                <td>{amount(group.periodBalanceCredit)}</td>
                <td>{amount(group.endingDebit)}</td>
                <td>{amount(group.endingCredit)}</td>
              </tr>
              {group.children.map((child) => (
                <tr key={child.id} className="pdf-child-row">
                  <td>{child.accountCode}</td>
                  <td>{child.name}</td>
                  <td>{accountDetailCategoryLabels[normalizeDetailCategory(child.type, child.detailCategory)]}</td>
                  <td>{amount(child.openingDebit)}</td>
                  <td>{amount(child.openingCredit)}</td>
                  <td>{amount(child.debit)}</td>
                  <td>{amount(child.credit)}</td>
                  <td>{amount(child.periodBalanceDebit)}</td>
                  <td>{amount(child.periodBalanceCredit)}</td>
                  <td>{amount(child.endingDebit)}</td>
                  <td>{amount(child.endingCredit)}</td>
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3">الإجمالي</td>
            <td>{amount(totals.openingDebit)}</td>
            <td>{amount(totals.openingCredit)}</td>
            <td>{amount(totals.debit)}</td>
            <td>{amount(totals.credit)}</td>
            <td>{amount(totals.periodBalanceDebit)}</td>
            <td>{amount(totals.periodBalanceCredit)}</td>
            <td>{amount(totals.endingDebit)}</td>
            <td>{amount(totals.endingCredit)}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}

function formatAnalysisValue(item) {
  if (item.value === null || !Number.isFinite(item.value)) return "—";
  if (item.format === "money") return money(item.value);
  if (item.format === "percent") return `${item.value.toFixed(1)}%`;
  if (item.format === "times") return `${item.value.toFixed(2)}×`;
  return item.value.toFixed(2);
}

function FinancialAnalysisPdfSection({ statements }) {
  const analysis = computeFinancialAnalysis(statements);
  return (
    <section className="pdf-section">
      <h2>التحليل المالي</h2>
      {analysis.groups.map((group) => (
        <table className="pdf-table pdf-detail-table pdf-analysis-table" key={group.title}>
          <thead>
            <tr>
              <th colSpan="3">{group.title}</th>
            </tr>
          </thead>
          <tbody>
            {group.items.map((item) => (
              <tr key={item.label}>
                <td>{item.label}</td>
                <td>{formatAnalysisValue(item)}</td>
                <td className="pdf-note-cell">{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ))}
    </section>
  );
}

function AuditOpinionPdfSection({ profile, statements, overrideText }) {
  const report = buildAuditOpinionReport(profile, statements);
  const text = overrideText || formatAuditOpinionText(report);
  return (
    <section className="pdf-section pdf-opinion-section">
      <h2>تقرير رأي مراجع الحسابات المستقل</h2>
      <pre className="pdf-opinion-text">{text}</pre>
    </section>
  );
}

export default function PrintableReport({ profile, statements, opinionOverride }) {
  const period = `${profile.periodStart} إلى ${profile.periodEnd}`;
  const generatedAt = new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date());

  return (
    <article className="pdf-report" dir="rtl">
      <header className="pdf-cover">
        <div>
          <p className="pdf-kicker">تقرير القوائم المالية</p>
          <h1>{profile.companyName}</h1>
          <p>الفترة المالية: {period}</p>
        </div>
        <div className="pdf-stamp">
          <strong>ميزان</strong>
          <span>تقرير آلي</span>
        </div>
      </header>

      <section className="pdf-summary">
        <div>
          <span>إجمالي المدين</span>
          <strong>{money(statements.totalDebit)}</strong>
        </div>
        <div>
          <span>إجمالي الدائن</span>
          <strong>{money(statements.totalCredit)}</strong>
        </div>
        <div>
          <span>صافي الربح</span>
          <strong>{money(statements.netIncome)}</strong>
        </div>
        <div>
          <span>الأصول</span>
          <strong>{money(statements.totals.Assets)}</strong>
        </div>
      </section>

      <AccountsTable
        title="ميزان المراجعة بالحسابات الفرعية والتجميع"
        groups={statements.trialBalanceGroups}
        totals={{
          openingDebit: statements.totalOpeningDebit,
          openingCredit: statements.totalOpeningCredit,
          debit: statements.totalDebit,
          credit: statements.totalCredit,
          periodBalanceDebit: statements.totalPeriodBalanceDebit,
          periodBalanceCredit: statements.totalPeriodBalanceCredit,
          endingDebit: statements.totalEndingDebit,
          endingCredit: statements.totalEndingCredit
        }}
      />

      <DetailedReportTable title="قائمة الدخل التفصيلية" sections={statements.detailedSections.income} />

      <DetailedReportTable title="قائمة المركز المالي التفصيلية" sections={statements.detailedSections.financialPosition} />

      <DetailedReportTable
        title="قائمة التدفقات النقدية التفصيلية - الطريقة غير المباشرة"
        sections={[
          { title: "بداية التدفق التشغيلي", rows: [{ id: "net-income", label: "صافي الربح", value: statements.netIncome }], totalLabel: "صافي الربح", totalValue: statements.netIncome },
          { title: "تفصيل تعديلات الإهلاك", rows: statements.detailedRows.cashDepreciation, totalLabel: "إجمالي الإهلاك المضاف", totalValue: statements.cashFlow.depreciation },
          { title: "تفصيل تغير الذمم المدينة", rows: statements.detailedRows.cashReceivables, totalLabel: "إجمالي أثر الذمم المدينة", totalValue: statements.cashFlow.receivablesChange },
          { title: "تفصيل تغير الذمم الدائنة", rows: statements.detailedRows.cashPayables, totalLabel: "إجمالي أثر الذمم الدائنة", totalValue: statements.cashFlow.payablesChange },
          { title: "التدفقات الاستثمارية حسب الحساب", rows: statements.detailedRows.cashInvesting, totalLabel: "صافي التدفق الاستثماري", totalValue: statements.cashFlow.investingCashFlow },
          { title: "التدفقات التمويلية حسب الحساب", rows: statements.detailedRows.cashFinancing, totalLabel: "صافي التدفق التمويلي", totalValue: statements.cashFlow.financingCashFlow },
          { title: "نتيجة التدفقات النقدية", rows: [{ id: "net-cash", label: "صافي التدفق النقدي", value: statements.cashFlow.netCashFlow }], totalLabel: "صافي التدفق النقدي", totalValue: statements.cashFlow.netCashFlow }
        ]}
      />

      <DetailedReportTable
        title="قائمة التغير في حقوق الملكية التفصيلية"
        sections={[
          { title: "حسابات رأس المال أول المدة", rows: statements.detailedRows.equityOpening, totalLabel: "إجمالي رأس المال أول المدة", totalValue: statements.beginningCapital },
          { title: "إضافة صافي الربح", rows: [{ id: "net-income", label: "صافي ربح الفترة", value: statements.netIncome }], totalLabel: "صافي الربح", totalValue: statements.netIncome },
          { title: "تفصيل المسحوبات", rows: statements.detailedRows.equityDrawings, totalLabel: "إجمالي المسحوبات", totalValue: -statements.drawings },
          { title: "رأس المال آخر المدة", rows: [{ id: "ending-equity", label: "رأس المال آخر المدة", value: statements.endingEquity }], totalLabel: "رأس المال آخر المدة", totalValue: statements.endingEquity }
        ]}
      />

      <FinancialAnalysisPdfSection statements={statements} />

      <AuditOpinionPdfSection profile={profile} statements={statements} overrideText={opinionOverride} />

      <footer className="pdf-footer">
        <span>تم إنشاء التقرير في {generatedAt}</span>
        <span>{statements.balancedTrial ? "ميزان المراجعة متوازن" : "ميزان المراجعة غير متوازن"}</span>
      </footer>
    </article>
  );
}
