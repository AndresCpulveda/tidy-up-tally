import { useState } from "react";
import {
  Sparkles, FileDown, FileText, Settings, Users, Clock, CalendarDays,
  ArrowRight, ArrowLeft, Building2, Phone, Mail as MailIcon, Globe, Palette,
} from "lucide-react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import { useTemplateSettings } from "@/context/TemplateSettingsContext";
import EmailProposalDialog from "@/components/EmailProposalDialog";
import { generateServiceAgreementPDF } from "@/utils/generateServiceAgreementPDF";

const CleaningCalculator = () => {
  const { settings } = useTemplateSettings();
  const [step, setStep] = useState(1);

  // Step 1 — Client info
  const [clientName, setClientName] = useState("");
  const [clientAddress, setClientAddress] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");

  // Step 2 — Estimate details
  const [numPeople, setNumPeople] = useState<string>("");
  const [hoursPerPerson, setHoursPerPerson] = useState<string>("");
  const [timesPerWeek, setTimesPerWeek] = useState<string>("");
  const [billingTerms, setBillingTerms] = useState("Due upon receipt");

  const people = parseFloat(numPeople) || 0;
  const hours = parseFloat(hoursPerPerson) || 0;
  const times = parseFloat(timesPerWeek) || 0;

  const totalHoursPerWeek = people * hours * times;
  const monthlyHours = (totalHoursPerWeek * 52) / 12;
  const totalBill = monthlyHours * settings.hourlyRate;
  const hasInput = people > 0 && hours > 0 && times > 0;

  const clientFilled = clientName.trim().length > 0;

  const generatePDF = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 60;
    let y = margin;
    const lineHeight = 18;
    const sectionSpacing = 25;

    const addPageIfNeeded = (requiredSpace = 20) => {
      if (y + requiredSpace > pageHeight - margin) { doc.addPage(); y = margin; }
    };
    const addText = (text: string, options: { x?: number; align?: "center" | "left" | "right" | "justify" } = {}) => {
      addPageIfNeeded(lineHeight);
      doc.text(text, options.x || margin, y, options.align ? { align: options.align } : {});
      y += lineHeight;
    };

    const date = new Date().toLocaleDateString();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    addText(settings.proposalTemplate.title, { align: "center", x: pageWidth / 2 });
    y += sectionSpacing;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    addText(`Customer: ${clientName}`);
    addText(`Location: ${clientAddress}`);
    addText(`Contractor: ${settings.proposalTemplate.contractorName}`);
    addText(`Date: ${date}`);
    y += sectionSpacing;

    doc.setFont("helvetica", "bold");
    addText(`Times Per Week (${times || ""})`);
    y += 10;
    doc.setFont("helvetica", "normal");

    const weeklyTasks = settings.proposalTemplate.weeklyTasks;
    weeklyTasks.forEach(task => {
      const splitText = doc.splitTextToSize("• " + task, pageWidth - margin * 2);
      splitText.forEach(line => { addPageIfNeeded(lineHeight); doc.text(line, margin, y); y += lineHeight; });
    });
    y += sectionSpacing;

    doc.setFont("helvetica", "bold");
    addText("Monthly");
    y += 10;
    doc.setFont("helvetica", "normal");
    settings.proposalTemplate.monthlyTasks.forEach(task => {
      const splitText = doc.splitTextToSize("• " + task, pageWidth - margin * 2);
      splitText.forEach(line => { addPageIfNeeded(lineHeight); doc.text(line, margin, y); y += lineHeight; });
    });
    y += sectionSpacing;

    doc.setFont("helvetica", "bold");
    addText("Monthly");
    y += 10;
    doc.setFont("helvetica", "normal");
    ["Dust baseboards (wash as needed).", "Spot clean doors and walls.", "Dust overhead vents and blinds."].forEach(task => {
      const splitText = doc.splitTextToSize("• " + task, pageWidth - margin * 2);
      splitText.forEach(line => { addPageIfNeeded(lineHeight); doc.text(line, margin, y); y += lineHeight; });
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(120);
      doc.text(settings.proposalTemplate.footerText, pageWidth / 2, pageHeight - 30, { align: "center" });
      doc.text(`Page ${i}`, pageWidth - margin, pageHeight - 30, { align: "right" });
    }
    doc.save(`cleaning-specifications-${date}.pdf`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-12">
      {/* Header */}
      <div className="max-w-md mb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
          <Sparkles className="w-4 h-4" />
          Instant Quote
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
          Cleaning Price Calculator
        </h1>
        <p className="mt-3 text-muted-foreground">
          {step === 1
            ? "Start by entering your client's information."
            : "Now configure the estimate details and payment terms."}
        </p>
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <StepDot active={step === 1} label="1" />
          <div className="w-8 h-0.5 bg-border" />
          <StepDot active={step === 2} label="2" />
        </div>
      </div>

      <div className="w-full max-w-lg space-y-6">
        {step === 1 && (
          <>
            <div className="grid gap-4">
              <TextField id="clientName" label="Client / Company Name" icon={<Building2 className="w-4 h-4" />} placeholder="Acme Corp" value={clientName} onChange={setClientName} />
              <TextField id="clientAddress" label="Address" icon={<Globe className="w-4 h-4" />} placeholder="123 Main St, City" value={clientAddress} onChange={setClientAddress} />
              <div className="grid grid-cols-2 gap-3">
                <TextField id="clientPhone" label="Phone" icon={<Phone className="w-4 h-4" />} placeholder="+1 234 567 890" value={clientPhone} onChange={setClientPhone} />
                <TextField id="clientEmail" label="Email" icon={<MailIcon className="w-4 h-4" />} placeholder="client@example.com" value={clientEmail} onChange={setClientEmail} />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                disabled={!clientFilled}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                Continue
                <ArrowRight className="w-5 h-5" />
              </button>
              <Link
                to="/settings"
                className="flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all border-2 rounded-xl border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
              <Link
                to="/templates"
                className="flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all border-2 rounded-xl border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
              >
                <Palette className="w-5 h-5" />
                Templates
              </Link>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Inputs */}
            <div className="grid gap-4">
              <InputField id="numPeople" label="Number of People" icon={<Users className="w-4 h-4" />} placeholder="e.g. 3" value={numPeople} onChange={setNumPeople} />
              <InputField id="hoursPerPerson" label="Hours per Person" icon={<Clock className="w-4 h-4" />} placeholder="e.g. 4" value={hoursPerPerson} onChange={setHoursPerPerson} />
              <InputField id="timesPerWeek" label="Times per Week" icon={<CalendarDays className="w-4 h-4" />} placeholder="e.g. 2" value={timesPerWeek} onChange={setTimesPerWeek} />
              <TextField id="billingTerms" label="Payment Terms" icon={<CalendarDays className="w-4 h-4" />} placeholder="e.g. Due upon receipt, Net 30" value={billingTerms} onChange={setBillingTerms} />
            </div>

            {/* Result */}
            <div className="p-6 space-y-4 rounded-xl bg-primary text-primary-foreground">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium opacity-85">Total Hours / Week</div>
                <div className="text-2xl font-bold tracking-tight">{totalHoursPerWeek.toFixed(1)} hrs</div>
              </div>
              <div className="border-t border-primary-foreground/20" />
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium opacity-85">Monthly Estimate</div>
                <div className="text-3xl font-bold tracking-tight">€{totalBill.toFixed(2)}</div>
              </div>
              {!hasInput && (
                <div className="text-sm text-center opacity-75">Enter details above to see your quote</div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all border-2 rounded-xl border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              {hasInput && (
                <>
                  <button
                    onClick={generatePDF}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-semibold transition-all border-2 rounded-xl border-primary bg-card text-primary hover:bg-accent"
                  >
                    <FileDown className="w-5 h-5" />
                    Proposal PDF
                  </button>
                  <button
                    onClick={() => generateServiceAgreementPDF({
                      companyName: clientName,
                      companyAddress: clientAddress,
                      companyPhone: clientPhone,
                      companyEmail: clientEmail,
                      billingDate: billingTerms,
                      numPeople: people,
                      hoursPerPerson: hours,
                      timesPerWeek: times,
                      hourlyRate: settings.hourlyRate,
                      totalHoursPerWeek,
                      monthlyHours,
                      totalBill,
                      agreementTitle: settings.agreementTemplate.title,
                      termText: settings.agreementTemplate.termText,
                      footerDisclaimer: settings.agreementTemplate.footerDisclaimer,
                    })}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-semibold transition-all border-2 rounded-xl border-primary bg-card text-primary hover:bg-accent"
                  >
                    <FileText className="w-5 h-5" />
                    Agreement PDF
                  </button>
                  <EmailProposalDialog
                    totalHoursPerWeek={totalHoursPerWeek}
                    totalBill={totalBill}
                    numPeople={people}
                    hoursPerPerson={hours}
                    timesPerWeek={times}
                    hourlyRate={settings.hourlyRate}
                    companyName={clientName}
                    companyAddress={clientAddress}
                    companyPhone={clientPhone}
                    companyEmail={clientEmail}
                    billingDate={billingTerms}
                    monthlyHours={monthlyHours}
                  />
                </>
              )}
              <Link
                to="/settings"
                className="flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all border-2 rounded-xl border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
              <Link
                to="/templates"
                className="flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all border-2 rounded-xl border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
              >
                <Palette className="w-5 h-5" />
                Templates
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

function TextField({ id, label, icon, placeholder, value, onChange }: {
  id: string; label: string; icon: React.ReactNode; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-1.5 text-sm font-medium text-foreground mb-2">
        {icon} {label}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 text-sm font-medium transition border rounded-xl border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function InputField({ id, label, icon, placeholder, value, onChange }: {
  id: string; label: string; icon: React.ReactNode; placeholder: string; value: string; onChange: (v: string) => void;
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
        className="w-full px-4 py-3 text-lg font-semibold transition border rounded-xl border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
      active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
    }`}>
      {label}
    </div>
  );
}

export default CleaningCalculator;
