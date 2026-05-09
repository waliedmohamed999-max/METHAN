export default function AccountingNotes() {
  return (
    <section className="print-card rounded-lg border border-slate-200 bg-white p-5 text-sm shadow-panel dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-lg font-bold text-slate-950 dark:text-white">ملاحظات محاسبية</h2>
      <div className="mt-4 space-y-3 text-slate-600 dark:text-slate-300">
        <p>قائمة التدفقات النقدية تعتمد على تصنيف التدفق لكل حساب داخل جدول الإدخال.</p>
        <p>الإهلاك، الذمم المدينة، والذمم الدائنة تُعامل كتعديلات تشغيلية ضمن الطريقة غير المباشرة.</p>
        <p>لنتائج أدق لاحقًا، يمكن إضافة أرصدة أول المدة وربطها بدليل حسابات ثابت.</p>
      </div>
    </section>
  );
}
