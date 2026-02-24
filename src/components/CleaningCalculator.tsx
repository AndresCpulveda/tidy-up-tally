import { useState } from "react";
import { Sparkles, FileDown, Settings, Users, Clock, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import { useTemplateSettings } from "@/context/TemplateSettingsContext";
import EmailProposalDialog from "@/components/EmailProposalDialog";

const CleaningCalculator = () => {
  const { settings } = useTemplateSettings();
  const [numPeople, setNumPeople] = useState<string>("");
  const [hoursPerPerson, setHoursPerPerson] = useState<string>("");
  const [timesPerWeek, setTimesPerWeek] = useState<string>("");

  const people = parseFloat(numPeople) || 0;
  const hours = parseFloat(hoursPerPerson) || 0;
  const times = parseFloat(timesPerWeek) || 0;

  const totalHoursPerWeek = people * hours * times;
  const monthlyHours = (totalHoursPerWeek * 52) / 12;
  const totalBill = monthlyHours * settings.hourlyRate;
  const hasInput = people > 0 && hours > 0 && times > 0;

  const generatePDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(settings.companyName || "Cleaning Service Proposal", 20, 25);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    if (settings.companyAddress) doc.text(settings.companyAddress, 20, 33);
    const contactLine = [settings.companyPhone, settings.companyEmail].filter(Boolean).join("  |  ");
    if (contactLine) doc.text(contactLine, 20, 39);

    doc.text(`Date: ${date}`, 190, 25, { align: "right" });
    if (settings.billingDate) doc.text(`Terms: ${settings.billingDate}`, 190, 31, { align: "right" });

    doc.setDrawColor(200);
    doc.line(20, 45, 190, 45);

    doc.setTextColor(40);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Cleaning Service Proposal", 20, 58);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const details = [
      ["Number of People", `${people}`],
      ["Hours per Person", `${hours}`],
      ["Times per Week", `${times}`],
      ["Hourly Rate", `€${settings.hourlyRate.toFixed(2)}`],
      ["Total Hours/Week", `${totalHoursPerWeek.toFixed(1)}`],
      ["Monthly Hours (Est.)", `${monthlyHours.toFixed(1)}`],
    ];

    let y = 70;
    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 80, y);
      y += 9;
    });

    y += 8;
    doc.setFillColor(34, 120, 90);
    doc.roundedRect(20, y, 170, 22, 3, 3, "F");
    doc.setTextColor(255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`To Bill (Monthly): €${totalBill.toFixed(2)}`, 105, y + 14, { align: "center" });

    doc.setTextColor(150);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("This is an estimate. Final pricing may vary based on on-site assessment.", 20, 280);

    doc.save(`cleaning-proposal-${date}.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Header */}
      <div className="text-center mb-10 max-w-md">
        <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Instant Quote
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Cleaning Price Calculator
        </h1>
        <p className="mt-3 text-muted-foreground">
          Enter your staffing details to get an instant estimate.
        </p>
      </div>

      <div className="w-full max-w-lg space-y-6">
        {/* Inputs */}
        <div className="grid gap-4">
          <InputField
            id="numPeople"
            label="Number of People"
            icon={<Users className="w-4 h-4" />}
            placeholder="e.g. 3"
            value={numPeople}
            onChange={setNumPeople}
          />
          <InputField
            id="hoursPerPerson"
            label="Hours per Person"
            icon={<Clock className="w-4 h-4" />}
            placeholder="e.g. 4"
            value={hoursPerPerson}
            onChange={setHoursPerPerson}
          />
          <InputField
            id="timesPerWeek"
            label="Times per Week"
            icon={<CalendarDays className="w-4 h-4" />}
            placeholder="e.g. 2"
            value={timesPerWeek}
            onChange={setTimesPerWeek}
          />
        </div>

        {/* Result */}
        <div className="rounded-xl bg-primary text-primary-foreground p-6 space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium opacity-85">Total Hours / Week</div>
            <div className="text-2xl font-bold tracking-tight">{totalHoursPerWeek.toFixed(1)} hrs</div>
          </div>
          <div className="border-t border-primary-foreground/20" />
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium opacity-85">Monthly Estimate</div>
            <div className="text-3xl font-bold tracking-tight">€${totalBill.toFixed(2)}</div>
          </div>
          {!hasInput && (
            <div className="text-sm opacity-75 text-center">Enter details above to see your quote</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          {hasInput && (
            <>
              <button
                onClick={generatePDF}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card px-4 py-3 font-semibold text-primary hover:bg-accent transition-all"
              >
                <FileDown className="w-5 h-5" />
                Download PDF
              </button>
              <EmailProposalDialog
                totalHoursPerWeek={totalHoursPerWeek}
                totalBill={totalBill}
                numPeople={people}
                hoursPerPerson={hours}
                timesPerWeek={times}
                hourlyRate={settings.hourlyRate}
                companyName={settings.companyName}
                companyAddress={settings.companyAddress}
                companyPhone={settings.companyPhone}
                companyEmail={settings.companyEmail}
                billingDate={settings.billingDate}
              />
            </>
          )}
          <Link
            to="/settings"
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-4 py-3 font-semibold text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            <Settings className="w-5 h-5" />
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

function InputField({
  id,
  label,
  icon,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
        {icon} {label}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        step="1"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-input bg-card px-4 py-3 text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
      />
    </div>
  );
}

export default CleaningCalculator;
