import { useTemplateSettings, defaultTemplateSettings } from "@/context/TemplateSettingsContext";
import { ArrowLeft, CreditCard, Mail, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { settings, updateSettings, updateHourlyRate } = useTemplateSettings();
  const { toast } = useToast();

  const handleResetEmailBody = () => {
    updateSettings({ emailBodyTemplate: defaultTemplateSettings.emailBodyTemplate });
    toast({ title: "Email body reset to default" });
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
            Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Configure pricing and email templates.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <CreditCard className="w-5 h-5 text-primary" />
            Pricing
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Hourly Rate ($)</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={settings.hourlyRate}
              onChange={(e) => updateHourlyRate(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Mail className="w-5 h-5 text-primary" />
              Email Body Template
            </div>
            <Button variant="ghost" size="sm" onClick={handleResetEmailBody} className="text-muted-foreground">
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            HTML content sent in the email body. Use placeholders: <code className="bg-muted px-1 rounded">{"{{companyName}}"}</code>, <code className="bg-muted px-1 rounded">{"{{totalBill}}"}</code>, <code className="bg-muted px-1 rounded">{"{{documentList}}"}</code>
          </p>
          <textarea
            value={settings.emailBodyTemplate}
            onChange={(e) => updateSettings({ emailBodyTemplate: e.target.value })}
            rows={16}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition resize-y"
            placeholder="Enter email body HTML..."
          />
        </section>

        <p className="text-xs text-muted-foreground text-center pt-4">
          Settings are saved automatically in your browser.
        </p>
      </div>
    </div>
  );
};

export default Settings;
