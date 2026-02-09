import { useState } from "react";
import { Sparkles, Home, Truck, FileDown, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import { useTemplateSettings } from "@/context/TemplateSettingsContext";

type CleaningType = "basic" | "deep" | "moveout";

const cleaningOptionsMeta: {
  id: CleaningType;
  label: string;
  description: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "basic",
    label: "Basic Cleaning",
    description: "Regular maintenance clean — dusting, vacuuming, mopping",
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: "deep",
    label: "Deep Cleaning",
    description: "Thorough scrub — appliances, grout, baseboards included",
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "moveout",
    label: "Move-in / Move-out",
    description: "Full restoration clean — every corner, cabinet & fixture",
    icon: <Truck className="w-5 h-5" />,
  },
];

const CleaningCalculator = () => {
  const { settings } = useTemplateSettings();
  const [sqm, setSqm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<CleaningType>("basic");

  const cleaningOptions = cleaningOptionsMeta.map((o) => ({
    ...o,
    pricePerSqm: settings.pricing[o.id],
  }));

  const area = parseFloat(sqm) || 0;
  const selected = cleaningOptions.find((o) => o.id === selectedType)!;
  const totalPrice = area * selected.pricePerSqm;

  const generatePDF = () => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Company header
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

    // Divider
    doc.setDrawColor(200);
    doc.line(20, 45, 190, 45);

    // Title
    doc.setTextColor(40);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Cleaning Service Proposal", 20, 58);

    // Service details
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const details = [
      ["Service Type", selected.label],
      ["Description", selected.description],
      ["Area", `${area} m²`],
      ["Rate", `€${selected.pricePerSqm.toFixed(2)} per m²`],
    ];

    let y = 70;
    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 70, y);
      y += 9;
    });

    // Total box
    y += 8;
    doc.setFillColor(34, 120, 90);
    doc.roundedRect(20, y, 170, 22, 3, 3, "F");
    doc.setTextColor(255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: €${totalPrice.toFixed(2)}`, 105, y + 14, { align: "center" });

    // Footer
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
          Enter your space size and choose a service to get an instant estimate.
        </p>
      </div>

      <div className="w-full max-w-lg space-y-6">
        {/* Square meter input */}
        <div>
          <label htmlFor="sqm" className="block text-sm font-medium text-foreground mb-2">
            Area (m²)
          </label>
          <input
            id="sqm"
            type="number"
            min="0"
            placeholder="e.g. 75"
            value={sqm}
            onChange={(e) => setSqm(e.target.value)}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-lg font-semibold text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
          />
        </div>

        {/* Cleaning type selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Type of Cleaning
          </label>
          <div className="grid gap-3">
            {cleaningOptions.map((option) => {
              const isActive = selectedType === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedType(option.id)}
                  className={`flex items-start gap-4 rounded-xl border-2 px-4 py-4 text-left transition-all ${
                    isActive
                      ? "border-primary bg-accent shadow-sm"
                      : "border-border bg-card hover:border-primary/40"
                  }`}
                >
                  <div
                    className={`mt-0.5 rounded-lg p-2 ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{option.label}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{option.description}</div>
                  </div>
                  <div className="text-sm font-semibold text-foreground whitespace-nowrap mt-1">
                    €{option.pricePerSqm.toFixed(2)}/m²
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Result */}
        <div className="rounded-xl bg-primary text-primary-foreground p-6 text-center space-y-1">
          <div className="text-sm font-medium opacity-85">Estimated Total</div>
          <div className="text-4xl font-bold tracking-tight">€{totalPrice.toFixed(2)}</div>
          <div className="text-sm opacity-75">
            {area > 0
              ? `${area} m² × €${selected.pricePerSqm.toFixed(2)} — ${selected.label}`
              : "Enter an area to see your quote"}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {area > 0 && (
            <button
              onClick={generatePDF}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card px-4 py-3 font-semibold text-primary hover:bg-accent transition-all"
            >
              <FileDown className="w-5 h-5" />
              Download Proposal PDF
            </button>
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

export default CleaningCalculator;
