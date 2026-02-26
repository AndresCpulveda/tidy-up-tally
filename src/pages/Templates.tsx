import { useTemplateSettings } from "@/context/TemplateSettingsContext";
import { ArrowLeft, FileText, FileDown, Plus, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const Templates = () => {
  const { settings, updateSettings } = useTemplateSettings();
  const { proposalTemplate, agreementTemplate } = settings;

  const [newWeeklyTask, setNewWeeklyTask] = useState("");
  const [newMonthlyTask, setNewMonthlyTask] = useState("");

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

          {/* Weekly Tasks */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Weekly Tasks</label>
            <div className="space-y-2">
              {proposalTemplate.weeklyTasks.map((task, i) => (
                <div key={i} className="flex items-start gap-2">
                  <input
                    value={task}
                    onChange={(e) => {
                      const updated = [...proposalTemplate.weeklyTasks];
                      updated[i] = e.target.value;
                      updateProposal({ weeklyTasks: updated });
                    }}
                    className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                  />
                  <button onClick={() => removeWeeklyTask(i)} className="p-2 text-muted-foreground hover:text-destructive transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  placeholder="Add a new weekly task…"
                  value={newWeeklyTask}
                  onChange={(e) => setNewWeeklyTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addWeeklyTask()}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                <button onClick={addWeeklyTask} className="p-2 text-primary hover:text-primary/80 transition">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Monthly Tasks */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Monthly Tasks</label>
            <div className="space-y-2">
              {proposalTemplate.monthlyTasks.map((task, i) => (
                <div key={i} className="flex items-start gap-2">
                  <input
                    value={task}
                    onChange={(e) => {
                      const updated = [...proposalTemplate.monthlyTasks];
                      updated[i] = e.target.value;
                      updateProposal({ monthlyTasks: updated });
                    }}
                    className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                  />
                  <button onClick={() => removeMonthlyTask(i)} className="p-2 text-muted-foreground hover:text-destructive transition">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input
                  placeholder="Add a new monthly task…"
                  value={newMonthlyTask}
                  onChange={(e) => setNewMonthlyTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addMonthlyTask()}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
                />
                <button onClick={addMonthlyTask} className="p-2 text-primary hover:text-primary/80 transition">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          <AreaField label="Footer Text" value={proposalTemplate.footerText} onChange={(v) => updateProposal({ footerText: v })} />
        </section>

        {/* Agreement Template */}
        <section className="space-y-4 p-6 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-2 text-foreground font-semibold text-lg">
            <FileText className="w-5 h-5 text-primary" />
            Service Agreement
          </div>

          <Field label="Document Title" value={agreementTemplate.title} onChange={(v) => updateAgreement({ title: v })} />
          <AreaField label="Term & Termination Text" value={agreementTemplate.termText} onChange={(v) => updateAgreement({ termText: v })} />
          <AreaField label="Footer Disclaimer" value={agreementTemplate.footerDisclaimer} onChange={(v) => updateAgreement({ footerDisclaimer: v })} />
        </section>

        <p className="text-xs text-muted-foreground text-center pt-4">
          Changes are saved automatically in your browser.
        </p>
      </div>
    </div>
  );
};

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
