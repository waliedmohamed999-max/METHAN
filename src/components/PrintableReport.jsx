import { accountTypeLabels, money } from "../utils/accounting.js";

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

function AccountsTable({ title, rows, totalLabel, totalValue }) {
  return (
    <section className="pdf-section">
      <h2>{title}</h2>
      <table className="pdf-table">
        <thead>
          <tr>
            <th>الحساب</th>
            <th>النوع</th>
            <th>مدين</th>
            <th>دائن</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((account) => (
            <tr key={account.id}>
              <td>{account.name}</td>
              <td>{accountTypeLabels[account.type]}</td>
              <td>{money(account.debit)}</td>
              <td>{money(account.credit)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="2">{totalLabel}</td>
            <td colSpan="2">{money(totalValue)}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  );
}

export default function PrintableReport({ profile, statements }) {
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

      <AccountsTable title="ميزان المراجعة" rows={statements.rows} totalLabel="إجمالي الميزان" totalValue={statements.totalDebit} />

      <section className="pdf-two-columns">
        <AccountsTable title="تفصيل الإيرادات" rows={statements.byType.Revenue} totalLabel="إجمالي الإيرادات" totalValue={statements.revenueTotal} />
        <AccountsTable title="تفصيل المصروفات" rows={statements.byType.Expenses} totalLabel="إجمالي المصروفات" totalValue={statements.expensesTotal} />
      </section>

      <ReportTable
        title="ملخص قائمة الدخل"
        rows={[
          ["إجمالي الإيرادات", statements.revenueTotal],
          ["إجمالي المصروفات", -statements.expensesTotal]
        ]}
        footerLabel="صافي الربح"
        footerValue={statements.netIncome}
      />

      <section className="pdf-three-columns">
        <AccountsTable title="الأصول" rows={statements.byType.Assets} totalLabel="إجمالي الأصول" totalValue={statements.totals.Assets} />
        <AccountsTable title="الخصوم" rows={statements.byType.Liabilities} totalLabel="إجمالي الخصوم" totalValue={statements.totals.Liabilities} />
        <AccountsTable title="حقوق الملكية" rows={statements.byType.Equity} totalLabel="إجمالي حسابات حقوق الملكية" totalValue={statements.totals.Equity} />
      </section>

      <ReportTable
        title="ملخص المركز المالي"
        rows={[
          ["إجمالي الأصول", statements.totals.Assets],
          ["إجمالي الخصوم", statements.totals.Liabilities],
          ["حقوق الملكية بعد صافي الربح والمسحوبات", statements.endingEquity]
        ]}
        footerLabel="إجمالي الخصوم وحقوق الملكية"
        footerValue={statements.liabilitiesAndEquity}
      />

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

      <footer className="pdf-footer">
        <span>تم إنشاء التقرير في {generatedAt}</span>
        <span>{statements.balancedTrial ? "ميزان المراجعة متوازن" : "ميزان المراجعة غير متوازن"}</span>
      </footer>
    </article>
  );
}
