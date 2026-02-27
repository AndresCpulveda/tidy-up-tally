import { useTemplateSettings } from "@/context/TemplateSettingsContext";
import { ArrowLeft, FileText, FileDown, Plus, X, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { buildServiceAgreementHtml } from "@/utils/generateServiceAgreementPDF";

const Templates = () => {
  const { settings, updateSettings } = useTemplateSettings();
  const { proposalTemplate, agreementTemplate } = settings;

  const [newWeeklyTask, setNewWeeklyTask] = useState("");
  const [newMonthlyTask, setNewMonthlyTask] = useState("");
  const [newContractorResp, setNewContractorResp] = useState("");
  const [newCustomerResp, setNewCustomerResp] = useState("");
  const [newExtraLabel, setNewExtraLabel] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");
  const [previewTab, setPreviewTab] = useState<"proposal" | "agreement">("agreement");
  const [showPreview, setShowPreview] = useState(false);

  const updateProposal = (partial: Partial<typeof proposalTemplate>) => {
    updateSettings({ proposalTemplate: { ...proposalTemplate, ...partial } });
  };

  const updateAgreement = (partial: Partial<typeof agreementTemplate>) => {
    updateSettings({ agreementTemplate: { ...agreementTemplate, ...partial } });
  };

  const addWeeklyTask = () => {
    if (!newWeeklyTask.trim()) return;
    updateProposal({ weeklyTasks: [...proposalTemplate.weeklyTasks, newWeeklyTask.trim()] });
    setNewWeeklyTask("");
  };
  const removeWeeklyTask = (index: number) => {
    updateProposal({ weeklyTasks: proposalTemplate.weeklyTasks.filter((_, i) => i !== index) });
  };
  const addMonthlyTask = () => {
    if (!newMonthlyTask.trim()) return;
    updateProposal({ monthlyTasks: [...proposalTemplate.monthlyTasks, newMonthlyTask.trim()] });
    setNewMonthlyTask("");
  };
  const removeMonthlyTask = (index: number) => {
    updateProposal({ monthlyTasks: proposalTemplate.monthlyTasks.filter((_, i) => i !== index) });
  };
  const addContractorResp = () => {
    if (!newContractorResp.trim()) return;
    updateAgreement({ contractorResponsibilities: [...agreementTemplate.contractorResponsibilities, newContractorResp.trim()] });
    setNewContractorResp("");
  };
  const removeContractorResp = (index: number) => {
    updateAgreement({ contractorResponsibilities: agreementTemplate.contractorResponsibilities.filter((_, i) => i !== index) });
  };
  const addCustomerResp = () => {
    if (!newCustomerResp.trim()) return;
    updateAgreement({ customerResponsibilities: [...agreementTemplate.customerResponsibilities, newCustomerResp.trim()] });
    setNewCustomerResp("");
  };
  const removeCustomerResp = (index: number) => {
    updateAgreement({ customerResponsibilities: agreementTemplate.customerResponsibilities.filter((_, i) => i !== index) });
  };
  const addExtraService = () => {
    if (!newExtraLabel.trim()) return;
    updateAgreement({ extraServices: [...agreementTemplate.extraServices, { label: newExtraLabel.trim(), price: newExtraPrice.trim() }] });
    setNewExtraLabel("");
    setNewExtraPrice("");
  };
  const removeExtraService = (index: number) => {
    updateAgreement({ extraServices: agreementTemplate.extraServices.filter((_, i) => i !== index) });
  };

  const proposalPreviewHtml = useMemo(() => {
    const date = new Date().toLocaleDateString();
    const bulletHtml = (items: string[]) => items.map(t => `<li style="margin-bottom:4px;">${t}</li>`).join("");
    return `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="text-align:center;color:#1a1a1a;font-size:20px;">${proposalTemplate.title}</h1>
        <p style="color:#333;font-size:13px;">Customer: <em>Sample Customer</em></p>
        <p style="color:#333;font-size:13px;">Location: <em>123 Sample St</em></p>
        <p style="color:#333;font-size:13px;">Contractor: ${proposalTemplate.contractorName}</p>
        <p style="color:#666;font-size:12px;">Date: ${date}</p>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:12px 0;" />
        <h3 style="color:#1a1a1a;font-size:14px;">Weekly Tasks</h3>
        <ul style="font-size:12px;color:#333;padding-left:20px;">${bulletHtml(proposalTemplate.weeklyTasks)}</ul>
        <h3 style="color:#1a1a1a;font-size:14px;">Monthly Tasks</h3>
        <ul style="font-size:12px;color:#333;padding-left:20px;">${bulletHtml(proposalTemplate.monthlyTasks)}</ul>
        <p style="margin-top:16px;color:#999;font-size:10px;text-align:center;">${proposalTemplate.footerText}</p>
      </div>
    `;
  }, [proposalTemplate]);

  const agreementPreviewHtml = useMemo(() => {
    return buildServiceAgreementHtml({
      providerName: settings.companyName,
      providerDBA: proposalTemplate.contractorName,
      clientName: "Sample Customer",
      clientAddress: "123 Sample St",
      date: new Date().toLocaleDateString(),
      numPeople: 2,
      hoursPerPerson: 3,
      timesPerWeek: 2,
      hourlyRate: settings.hourlyRate,
      totalHoursPerWeek: 12,
      monthlyHours: 52,
      totalBill: 52 * settings.hourlyRate,
      billingDate: settings.billingDate,
      ...agreementTemplate,
    });
  }, [settings, proposalTemplate.contractorName, agreementTemplate]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-6xl flex gap-8">
        {/* Editor Column */}
        <div className="w-full max-w-2xl space-y-8 flex-shrink-0">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Calculator
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">
                  PDF Templates
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Customize the text content of your generated PDF documents.
                </p>
              </div>
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl border-2 transition-all ${
                  showPreview
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                }`}
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>

          {/* Proposal Template */}
          <section className="space-y-4 p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 text-foreground font-semibold text-lg">
              <FileDown className="w-5 h-5 text-primary" />
              Cleaning Proposal
            </div>
            <Field label="Document Title" value={proposalTemplate.title} onChange={(v) => updateProposal({ title: v })} />
            <Field label="Contractor Name" value={proposalTemplate.contractorName} onChange={(v) => updateProposal({ contractorName: v })} />
            <EditableList label="Weekly Tasks" items={proposalTemplate.weeklyTasks} onUpdate={(items) => updateProposal({ weeklyTasks: items })} onRemove={removeWeeklyTask} newValue={newWeeklyTask} onNewChange={setNewWeeklyTask} onAdd={addWeeklyTask} placeholder="Add a new weekly task…" />
            <EditableList label="Monthly Tasks" items={proposalTemplate.monthlyTasks} onUpdate={(items) => updateProposal({ monthlyTasks: items })} onRemove={removeMonthlyTask} newValue={newMonthlyTask} onNewChange={setNewMonthlyTask} onAdd={addMonthlyTask} placeholder="Add a new monthly task…" />
            <AreaField label="Footer Text" value={proposalTemplate.footerText} onChange={(v) => updateProposal({ footerText: v })} />
          </section>

          {/* Agreement Template */}
          <section className="space-y-4 p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 text-foreground font-semibold text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Service Agreement
            </div>
            <EditableList label="I. Contractor Responsibilities" items={agreementTemplate.contractorResponsibilities} onUpdate={(items) => updateAgreement({ contractorResponsibilities: items })} onRemove={removeContractorResp} newValue={newContractorResp} onNewChange={setNewContractorResp} onAdd={addContractorResp} placeholder="Add contractor responsibility…" />
            <EditableList label="II. Customer Responsibilities" items={agreementTemplate.customerResponsibilities} onUpdate={(items) => updateAgreement({ customerResponsibilities: items })} onRemove={removeCustomerResp} newValue={newCustomerResp} onNewChange={setNewCustomerResp} onAdd={addCustomerResp} placeholder="Add customer responsibility…" />
            <AreaField label="III. Insurance Coverage Text" value={agreementTemplate.insuranceText} onChange={(v) => updateAgreement({ insuranceText: v })} />
            <AreaField label="IV. Period of Agreement Text" value={agreementTemplate.periodText} onChange={(v) => updateAgreement({ periodText: v })} />
            <AreaField label="V. Changes in Specifications Text" value={agreementTemplate.changesText} onChange={(v) => updateAgreement({ changesText: v })} />

            {/* Extra Services */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">VI. Extra Services (separate from contract)</label>
              <div className="space-y-2">
                {agreementTemplate.extraServices.map((svc, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <input value={svc.label} onChange={(e) => { const updated = [...agreementTemplate.extraServices]; updated[i] = { ...updated[i], label: e.target.value }; updateAgreement({ extraServices: updated }); }} className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition" placeholder="Service name" />
                    <input value={svc.price} onChange={(e) => { const updated = [...agreementTemplate.extraServices]; updated[i] = { ...updated[i], price: e.target.value }; updateAgreement({ extraServices: updated }); }} className="w-32 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition" placeholder="Price" />
                    <button onClick={() => removeExtraService(i)} className="p-2 text-muted-foreground hover:text-destructive transition"><X className="w-4 h-4" /></button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input placeholder="Service name…" value={newExtraLabel} onChange={(e) => setNewExtraLabel(e.target.value)} className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition" />
                  <input placeholder="Price…" value={newExtraPrice} onChange={(e) => setNewExtraPrice(e.target.value)} className="w-32 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition" />
                  <button onClick={addExtraService} className="p-2 text-primary hover:text-primary/80 transition"><Plus className="w-5 h-5" /></button>
                </div>
              </div>
            </div>

            <AreaField label="Invoice Note" value={agreementTemplate.invoiceNote} onChange={(v) => updateAgreement({ invoiceNote: v })} />
            <AreaField label="Third-Party Processing Note" value={agreementTemplate.thirdPartyNote} onChange={(v) => updateAgreement({ thirdPartyNote: v })} />
            <AreaField label="VII. Signatures Note" value={agreementTemplate.signaturesNote} onChange={(v) => updateAgreement({ signaturesNote: v })} />
            <Field label="Prices Valid Days Text" value={agreementTemplate.pricesValidDays} onChange={(v) => updateAgreement({ pricesValidDays: v })} />
            <Field label="Copyright Text" value={agreementTemplate.copyrightText} onChange={(v) => updateAgreement({ copyrightText: v })} />
            <AreaField label="Footer Disclaimer" value={agreementTemplate.footerDisclaimer} onChange={(v) => updateAgreement({ footerDisclaimer: v })} />
          </section>

          <p className="text-xs text-muted-foreground text-center pt-4">
            Changes are saved automatically in your browser.
          </p>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="hidden lg:block flex-1 min-w-[360px]">
            <div className="sticky top-8 space-y-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewTab("proposal")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                    previewTab === "proposal"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileDown className="w-4 h-4" />
                  Proposal
                </button>
                <button
                  onClick={() => setPreviewTab("agreement")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                    previewTab === "agreement"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Agreement
                </button>
              </div>
              <div
                className="rounded-xl border border-border bg-white overflow-y-auto shadow-sm"
                style={{ maxHeight: "calc(100vh - 120px)" }}
              >
                <div
                  dangerouslySetInnerHTML={{
                    __html: previewTab === "proposal" ? proposalPreviewHtml : agreementPreviewHtml,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function EditableList({ label, items, onUpdate, onRemove, newValue, onNewChange, onAdd, placeholder }: {
  label: string; items: string[]; onUpdate: (items: string[]) => void; onRemove: (i: number) => void;
  newValue: string; onNewChange: (v: string) => void; onAdd: () => void; placeholder: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <input
              value={item}
              onChange={(e) => { const updated = [...items]; updated[i] = e.target.value; onUpdate(updated); }}
              className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            <button onClick={() => onRemove(i)} className="p-2 text-muted-foreground hover:text-destructive transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <input
            placeholder={placeholder}
            value={newValue}
            onChange={(e) => onNewChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
            className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
          <button onClick={onAdd} className="p-2 text-primary hover:text-primary/80 transition">
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 text-sm border rounded-xl border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
      />
    </div>
  );
}

function AreaField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="w-full px-3 py-2.5 text-sm border rounded-xl border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-y"
      />
    </div>
  );
}

export default Templates;
