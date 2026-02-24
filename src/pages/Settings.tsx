import { useTemplateSettings } from "@/context/TemplateSettingsContext";
import { ArrowLeft, Building2, CreditCard, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
  const { settings, updateSettings, updateHourlyRate } = useTemplateSettings();

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Calculator
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Proposal Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Configure your company info, pricing, and billing details for PDF proposals.
          </p>
        </div>

        {/* Company Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Building2 className="w-5 h-5 text-primary" />
            Company Information
          </div>
          <div className="grid gap-3">
            <Field label="Company Name" value={settings.companyName} onChange={(v) => updateSettings({ companyName: v })} />
            <Field label="Address" value={settings.companyAddress} onChange={(v) => updateSettings({ companyAddress: v })} />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Phone" value={settings.companyPhone} onChange={(v) => updateSettings({ companyPhone: v })} />
              <Field label="Email" value={settings.companyEmail} onChange={(v) => updateSettings({ companyEmail: v })} />
            </div>
            <Field label="Logo URL (optional)" value={settings.logoUrl} onChange={(v) => updateSettings({ logoUrl: v })} placeholder="https://..." />
          </div>
        </section>

        {/* Pricing */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <CreditCard className="w-5 h-5 text-primary" />
            Pricing
          </div>
          <PriceField label="Hourly Rate (€)" value={settings.hourlyRate} onChange={updateHourlyRate} />
        </section>

        {/* Billing */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <CalendarDays className="w-5 h-5 text-primary" />
            Billing
          </div>
          <Field label="Billing / Payment Terms" value={settings.billingDate} onChange={(v) => updateSettings({ billingDate: v })} placeholder="e.g. Due upon receipt, Net 30" />
        </section>

        <p className="text-xs text-muted-foreground text-center pt-4">
          Settings are saved automatically in your browser.
        </p>
      </div>
    </div>
  );
};

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
      />
    </div>
  );
}

function PriceField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1">{label}</label>
      <input
        type="number"
        min="0"
        step="0.5"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
      />
    </div>
  );
}

export default Settings;
