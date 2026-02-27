import { useTemplateSettings } from "@/context/TemplateSettingsContext";
import { ArrowLeft, FileText, FileDown, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Templates = () => {
  const { settings, updateSettings } = useTemplateSettings();
  const { proposalTemplate, agreementTemplate } = settings;

  const [newWeeklyTask, setNewWeeklyTask] = useState("");
  const [newMonthlyTask, setNewMonthlyTask] = useState("");
  const [newContractorResp, setNewContractorResp] = useState("");
  const [newCustomerResp, setNewCustomerResp] = useState("");
  const [newExtraLabel, setNewExtraLabel] = useState("");
  const [newExtraPrice, setNewExtraPrice] = useState("");

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

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Calculator
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            PDF Templates
          </h1>
          <p className="mt-2 text-muted-foreground">
            Customize the text content of your generated PDF documents.
          </p>
        </div>

        {/* Proposal Template */}
        <section className="space-y-4 p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-foreground font-semibold text-lg">
            <FileDown className="w-5 h-5 text-primary" />
            Cleaning Proposal
          </div>

          <Field label="Document Title" value={proposalTemplate.title} onChange={(v) => updateProposal({ title: v })} />
          <Field label="Contractor Name" value={proposalTemplate.contractorName} onChange={(v) => updateProposal({ contractorName: v })} />

          <EditableList
            label="Weekly Tasks"
            items={proposalTemplate.weeklyTasks}
            onUpdate={(items) => updateProposal({ weeklyTasks: items })}
            onRemove={removeWeeklyTask}
            newValue={newWeeklyTask}
            onNewChange={setNewWeeklyTask}
            onAdd={addWeeklyTask}
            placeholder="Add a new weekly task…"
          />

          <EditableList
            label="Monthly Tasks"
            items={proposalTemplate.monthlyTasks}
            onUpdate={(items) => updateProposal({ monthlyTasks: items })}
            onRemove={removeMonthlyTask}
            newValue={newMonthlyTask}
            onNewChange={setNewMonthlyTask}
            onAdd={addMonthlyTask}
            placeholder="Add a new monthly task…"
          />

          <AreaField label="Footer Text" value={proposalTemplate.footerText} onChange={(v) => updateProposal({ footerText: v })} />
        </section>

        {/* Agreement Template */}
        <section className="space-y-4 p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-foreground font-semibold text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Service Agreement
          </div>

          <EditableList
            label="I. Contractor Responsibilities"
            items={agreementTemplate.contractorResponsibilities}
            onUpdate={(items) => updateAgreement({ contractorResponsibilities: items })}
            onRemove={removeContractorResp}
            newValue={newContractorResp}
            onNewChange={setNewContractorResp}
            onAdd={addContractorResp}
            placeholder="Add contractor responsibility…"
          />

          <EditableList
            label="II. Customer Responsibilities"
            items={agreementTemplate.customerResponsibilities}
            onUpdate={(items) => updateAgreement({ customerResponsibilities: items })}
            onRemove={removeCustomerResp}
            newValue={newCustomerResp}
            onNewChange={setNewCustomerResp}
            onAdd={addCustomerResp}
            placeholder="Add customer responsibility…"
          />

          <AreaField label="III. Insurance Coverage Text" value={agreementTemplate.insuranceText} onChange={(v) => updateAgreement({ insuranceText: v })} />
          <AreaField label="IV. Period of Agreement Text" value={agreementTemplate.periodText} onChange={(v) => updateAgreement({ periodText: v })} />
          <AreaField label="V. Changes in Specifications Text" value={agreementTemplate.changesText} onChange={(v) => updateAgreement({ changesText: v })} />

          {/* Extra Services */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">VI. Extra Services (separate from contract)</label>
            <div className="space-y-2">
              {agreementTemplate.extraServices.map((svc, i) => (
                <div key={i} className="flex items-start gap-2">
                  <input
                    value={svc.label}
                    onChange={(e) => {
                      const updated = [...agreementTemplate.extraServices];
                      updated[i] = { ...updated[i], label: e.target.value };
                      updateAgreement({ extraServices: updated });
                    }}
                    className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                    placeholder="Service name"
                  />
                  <input
                    value={svc.price}
                    onChange={(e) => {
                      const updated = [...agreementTemplate.extraServices];
                      updated[i] = { ...updated[i], price: e.target.value };
                      updateAgreement({ extraServices: updated });
                    }}
                    className="w-32 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                    placeholder="Price"
                  />
                  <button onClick={() => removeExtraService(i)} className="p-2 text-muted-foreground hover:text-destructive transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  placeholder="Service name…"
                  value={newExtraLabel}
                  onChange={(e) => setNewExtraLabel(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                <input
                  placeholder="Price…"
                  value={newExtraPrice}
                  onChange={(e) => setNewExtraPrice(e.target.value)}
                  className="w-32 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                <button onClick={addExtraService} className="p-2 text-primary hover:text-primary/80 transition">
                  <Plus className="w-5 h-5" />
                </button>
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
              onChange={(e) => {
                const updated = [...items];
                updated[i] = e.target.value;
                onUpdate(updated);
              }}
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
