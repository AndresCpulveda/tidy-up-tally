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
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 60;
  let y = margin;

  const lineHeight = 18;
  const sectionSpacing = 25;

  const addPageIfNeeded = (requiredSpace = 20) => {
    if (y + requiredSpace > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const addText = (text, options = {}) => {
    addPageIfNeeded(lineHeight);
    doc.text(text, options.x || margin, y, options.align ? { align: options.align } : {});
    y += lineHeight;
  };

  const addWrappedText = (text) => {
    const splitText = doc.splitTextToSize(text, pageWidth - margin * 2);
    splitText.forEach(line => {
      addPageIfNeeded(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    });
  };

  const date = new Date().toLocaleDateString();

  /* -------------------------
     TITLE
  ------------------------- */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  addText("Cleaning Specifications", { align: "center", x: pageWidth / 2 });

  y += sectionSpacing;

  /* -------------------------
     HEADER INFO
  ------------------------- */

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  addText(`Customer: ${settings.companyName || ""}`);
  addText(`Location: ${settings.companyAddress || ""}`);
  addText(`Contractor: Office Pride Commercial Cleaning Services`);
  addText(`Date: ${date}`);

  y += sectionSpacing;

  /* -------------------------
     TIMES PER WEEK
  ------------------------- */

  doc.setFont("helvetica", "bold");
  addText(`Times Per Week (${times || ""})`);

  y += 10;

  doc.setFont("helvetica", "normal");

  /* -------------------------
     WEEKLY TASKS
  ------------------------- */

  const weeklyTasks = [
    "Vacuum all carpet and floor mats.",
    "Dust, mop and damp mop all tile floors.",
    "Empty all trash and take to dumpster.",
    "Clean entry door glass.",
    "Spot clean glass and mirrors throughout office.",
    "Clean and sanitize restrooms.",
    "Refill toilet paper, soap and towel dispensers as needed from client’s supply.",
    "Clean kitchenette, sink and surrounding countertop, and water fountain.",
    "Dust uncovered areas of all desks, file cabinets, bookcases, counters and other furniture.",
    "Dust windowsills, phones and computers.",
    "Remove cobwebs from corners of ceilings and baseboards.",
    "Spot clean new carpet spots (usually on request).",
  ];

  weeklyTasks.forEach(task => {
    const splitText = doc.splitTextToSize("• " + task, pageWidth - margin * 2);
    splitText.forEach(line => {
      addPageIfNeeded(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    });
  });

  y += sectionSpacing;

  /* -------------------------
     MONTHLY SECTION
  ------------------------- */

  doc.setFont("helvetica", "bold");
  addText("Monthly");

  y += 10;
  doc.setFont("helvetica", "normal");

  const monthlyTasks = [
    "Dust baseboards (wash as needed).",
    "Spot clean doors and walls.",
    "Dust overhead vents and blinds.",
  ];

  monthlyTasks.forEach(task => {
    const splitText = doc.splitTextToSize("• " + task, pageWidth - margin * 2);
    splitText.forEach(line => {
      addPageIfNeeded(lineHeight);
      doc.text(line, margin, y);
      y += lineHeight;
    });
  });

  /* -------------------------
     FOOTER
  ------------------------- */

  const totalPages = doc.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setFontSize(9);
    doc.setTextColor(120);

    doc.text(
      "Each Office Pride location is independently owned and operated.",
      pageWidth / 2,
      pageHeight - 30,
      { align: "center" }
    );

    doc.text(
      `Page ${i}`,
      pageWidth - margin,
      pageHeight - 30,
      { align: "right" }
    );
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
          Enter your details to get an instant estimate.
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
        <div className="p-6 space-y-4 rounded-xl bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium opacity-85">Total Hours / Week</div>
            <div className="text-2xl font-bold tracking-tight">{totalHoursPerWeek.toFixed(1)} hrs</div>
          </div>
          <div className="border-t border-primary-foreground/20" />
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium opacity-85">Monthly Estimate</div>
            <div className="text-3xl font-bold tracking-tight">€${totalBill.toFixed(2)}</div>
          </div>
          {!hasInput && (
            <div className="text-sm text-center opacity-75">Enter details above to see your quote</div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {hasInput && (
            <>
              <button
                onClick={generatePDF}
                className="flex items-center justify-center flex-1 gap-2 px-4 py-3 font-semibold transition-all border-2 rounded-xl border-primary bg-card text-primary hover:bg-accent"
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
            className="flex items-center justify-center gap-2 px-4 py-3 font-semibold transition-all border-2 rounded-xl border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
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
        className="w-full px-4 py-3 text-lg font-semibold transition border rounded-xl border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

export default CleaningCalculator;
