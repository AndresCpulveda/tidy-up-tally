import { useTemplateSettings } from "@/context/TemplateSettingsContext";
import { ArrowLeft, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
  const { settings, updateHourlyRate } = useTemplateSettings();

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Calculator
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Pricing Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Configure your hourly rate used across all estimates.
          </p>
        </div>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <CreditCard className="w-5 h-5 text-primary" />
            Pricing
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Hourly Rate (€)</label>
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

        <p className="text-xs text-muted-foreground text-center pt-4">
          Settings are saved automatically in your browser.
        </p>
      </div>
    </div>
  );
};

export default Settings;
