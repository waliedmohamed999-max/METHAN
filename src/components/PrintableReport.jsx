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

function parseOpinionText(text) {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter(Boolean);

  const [titleLine = "تقرير مراجع الحسابات المستقل", referenceLine = ""] = (paragraphs[0] || "").split("\n");
  let bodyParagraphs = paragraphs.slice(1);

  let signatureLines = [];
  const last = bodyParagraphs[bodyParagraphs.length - 1];
  if (last && /مكتب المراجعة|المراجع القانوني|رقم الترخيص|التوقيع/.test(last)) {
    signatureLines = last.split("\n");
    bodyParagraphs = bodyParagraphs.slice(0, -1);
  }

  return { title: titleLine, referenceLine, bodyParagraphs, signatureLines };
}

function OpinionParagraph({ block }) {
  const lines = block.split("\n");
  const [first, ...restLines] = lines;
  const remainder = restLines.join(" ").trim();
  const looksLikeHeading = remainder && first.length < 60 && !/[.:]$/.test(first);

  if (looksLikeHeading) {
    return (
      <div className="pdf-opinion-block">
        <h3>{first}</h3>
        <p className="pdf-opinion-paragraph">{remainder}</p>
      </div>
    );
  }
  return <p className="pdf-opinion-paragraph">{lines.join(" ")}</p>;
}

function AuditOpinionPdfSection({ profile, statements, overrideText }) {
  const report = buildAuditOpinionReport(profile, statements);
  const text = overrideText || formatAuditOpinionText(report);
  const { title, referenceLine, bodyParagraphs, signatureLines } = parseOpinionText(text);
  const reportDate = report.period.split(" إلى ")[1] || "";
  const findSignatureValue = (label) => signatureLines.find((line) => line.startsWith(label))?.slice(label.length).trim();

  return (
    <section className="pdf-section pdf-opinion-section">
      <div className="pdf-opinion-letterhead">
        <div className="pdf-opinion-heading">
          <h2>{title}</h2>
          {referenceLine ? <p className="pdf-opinion-reference">{referenceLine}</p> : null}
        </div>

        <div className="pdf-opinion-body">
          {bodyParagraphs.map((block, index) => (
            <OpinionParagraph key={index} block={block} />
          ))}
        </div>

        <div className="pdf-opinion-signature-grid">
          <div className="pdf-stamp-box">ختم واعتماد المكتب</div>
          <div className="pdf-opinion-signature-details">
            <p>{report.reportCity}، {reportDate}</p>
            <p><strong>مكتب المراجعة:</strong> {findSignatureValue("مكتب المراجعة:") || report.auditFirmName}</p>
            <p><strong>المراجع القانوني:</strong> {findSignatureValue("المراجع القانوني:") || report.auditorName}</p>
            <p><strong>رقم الترخيص:</strong> {findSignatureValue("رقم الترخيص:") || report.licenseNumber}</p>
            <p className="pdf-opinion-signature-line">التوقيع: ....................................</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrialBalancePdfSection({ statements }) {
  return (
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
  );
}

function cashFlowSections(statements) {
  return [
    { title: "بداية التدفق التشغيلي", rows: [{ id: "net-income", label: "صافي الربح", value: statements.netIncome }], totalLabel: "صافي الربح", totalValue: statements.netIncome },
    { title: "تفصيل تعديلات الإهلاك", rows: statements.detailedRows.cashDepreciation, totalLabel: "إجمالي الإهلاك المضاف", totalValue: statements.cashFlow.depreciation },
    { title: "تفصيل تغير الذمم المدينة", rows: statements.detailedRows.cashReceivables, totalLabel: "إجمالي أثر الذمم المدينة", totalValue: statements.cashFlow.receivablesChange },
    { title: "تفصيل تغير الذمم الدائنة", rows: statements.detailedRows.cashPayables, totalLabel: "إجمالي أثر الذمم الدائنة", totalValue: statements.cashFlow.payablesChange },
    { title: "التدفقات الاستثمارية حسب الحساب", rows: statements.detailedRows.cashInvesting, totalLabel: "صافي التدفق الاستثماري", totalValue: statements.cashFlow.investingCashFlow },
    { title: "التدفقات التمويلية حسب الحساب", rows: statements.detailedRows.cashFinancing, totalLabel: "صافي التدفق التمويلي", totalValue: statements.cashFlow.financingCashFlow },
    { title: "نتيجة التدفقات النقدية", rows: [{ id: "net-cash", label: "صافي التدفق النقدي", value: statements.cashFlow.netCashFlow }], totalLabel: "صافي التدفق النقدي", totalValue: statements.cashFlow.netCashFlow }
  ];
}

function equitySections(statements) {
  return [
    { title: "حسابات رأس المال أول المدة", rows: statements.detailedRows.equityOpening, totalLabel: "إجمالي رأس المال أول المدة", totalValue: statements.beginningCapital },
    { title: "إضافة صافي الربح", rows: [{ id: "net-income", label: "صافي ربح الفترة", value: statements.netIncome }], totalLabel: "صافي الربح", totalValue: statements.netIncome },
    { title: "تفصيل المسحوبات", rows: statements.detailedRows.equityDrawings, totalLabel: "إجمالي المسحوبات", totalValue: -statements.drawings },
    { title: "رأس المال آخر المدة", rows: [{ id: "ending-equity", label: "رأس المال آخر المدة", value: statements.endingEquity }], totalLabel: "رأس المال آخر المدة", totalValue: statements.endingEquity }
  ];
}

const sectionTitles = {
  trial: "تقرير ميزان المراجعة",
  income: "تقرير قائمة الدخل",
  position: "تقرير قائمة المركز المالي",
  cash: "تقرير قائمة التدفقات النقدية",
  equity: "تقرير قائمة التغير في حقوق الملكية",
  balance: "تقرير الميزانية العمومية",
  analysis: "تقرير التحليل المالي",
  opinion: "تقرير رأي مراجع الحسابات",
  report: "تقرير القوائم المالية الشامل"
};

function SectionBody({ section, profile, statements, opinionOverride }) {
  if (section === "trial") return <TrialBalancePdfSection statements={statements} />;
  if (section === "income") return <DetailedReportTable title="قائمة الدخل التفصيلية" sections={statements.detailedSections.income} />;
  if (section === "position" || section === "balance") return <DetailedReportTable title="قائمة المركز المالي التفصيلية" sections={statements.detailedSections.financialPosition} />;
  if (section === "cash") return <DetailedReportTable title="قائمة التدفقات النقدية التفصيلية - الطريقة غير المباشرة" sections={cashFlowSections(statements)} />;
  if (section === "equity") return <DetailedReportTable title="قائمة التغير في حقوق الملكية التفصيلية" sections={equitySections(statements)} />;
  if (section === "analysis") return <FinancialAnalysisPdfSection statements={statements} />;
  if (section === "opinion") return <AuditOpinionPdfSection profile={profile} statements={statements} overrideText={opinionOverride} />;

  return (
    <>
      <TrialBalancePdfSection statements={statements} />
      <DetailedReportTable title="قائمة الدخل التفصيلية" sections={statements.detailedSections.income} />
      <DetailedReportTable title="قائمة المركز المالي التفصيلية" sections={statements.detailedSections.financialPosition} />
      <DetailedReportTable title="قائمة التدفقات النقدية التفصيلية - الطريقة غير المباشرة" sections={cashFlowSections(statements)} />
      <DetailedReportTable title="قائمة التغير في حقوق الملكية التفصيلية" sections={equitySections(statements)} />
      <FinancialAnalysisPdfSection statements={statements} />
      <AuditOpinionPdfSection profile={profile} statements={statements} overrideText={opinionOverride} />
    </>
  );
}

export default function PrintableReport({ profile, statements, opinionOverride, section = "report" }) {
  const period = `${profile.periodStart} إلى ${profile.periodEnd}`;
  const generatedAt = new Intl.DateTimeFormat("ar-SA", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date());
  // A formal audit opinion letter stands on its own — no dashboard-style cover/summary cards,
  // straight into the letterhead the way an audit office would issue it.
  const isOpinionOnly = section === "opinion";

  return (
    <article className="pdf-report" dir="rtl">
      {!isOpinionOnly ? (
        <>
          <header className="pdf-cover">
            <div className="pdf-cover-title">
              {profile.logoDataUrl ? <img src={profile.logoDataUrl} alt="" className="pdf-logo" /> : null}
              <div>
                <p className="pdf-kicker">{sectionTitles[section] || sectionTitles.report}</p>
                <h1>{profile.companyName}</h1>
                <p>الفترة المالية: {period}</p>
              </div>
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
        </>
      ) : null}

      <SectionBody section={section} profile={profile} statements={statements} opinionOverride={opinionOverride} />

      <footer className="pdf-footer">
        <span>تم إنشاء التقرير في {generatedAt}</span>
        {!isOpinionOnly ? <span>{statements.balancedTrial ? "ميزان المراجعة متوازن" : "ميزان المراجعة غير متوازن"}</span> : null}
      </footer>
    </article>
  );
}
