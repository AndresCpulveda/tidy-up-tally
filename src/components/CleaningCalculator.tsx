import { useState } from "react";
import { Sparkles, Home, Building, Truck, FileDown } from "lucide-react";
import jsPDF from "jspdf";

type CleaningType = "basic" | "deep" | "moveout";

const cleaningOptions: {
  id: CleaningType;
  label: string;
  description: string;
  pricePerSqm: number;
  icon: React.ReactNode;
}[] = [
  {
    id: "basic",
    label: "Basic Cleaning",
    description: "Regular maintenance clean — dusting, vacuuming, mopping",
    pricePerSqm: 3.5,
    icon: <Home className="w-5 h-5" />,
  },
  {
    id: "deep",
    label: "Deep Cleaning",
    description: "Thorough scrub — appliances, grout, baseboards included",
    pricePerSqm: 6.0,
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    id: "moveout",
    label: "Move-in / Move-out",
    description: "Full restoration clean — every corner, cabinet & fixture",
    pricePerSqm: 8.5,
    icon: <Truck className="w-5 h-5" />,
  },
];

const CleaningCalculator = () => {
  const generatePDF = (area: number, service: typeof cleaningOptions[number], total: number) => {
    const doc = new jsPDF();
    const date = new Date().toLocaleDateString();

    // Header
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("Cleaning Service Proposal", 20, 30);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(`Date: ${date}`, 20, 40);

    // Divider
    doc.setDrawColor(200);
    doc.line(20, 46, 190, 46);

    // Service details
    doc.setTextColor(40);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Service Details", 20, 58);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    const details = [
      ["Service Type", service.label],
      ["Description", service.description],
      ["Area", `${area} m²`],
      ["Rate", `€${service.pricePerSqm.toFixed(2)} per m²`],
    ];

    let y = 68;
    details.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, 20, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 70, y);
      y += 9;
    });

    // Total box
    y += 6;
    doc.setFillColor(34, 120, 90);
    doc.roundedRect(20, y, 170, 22, 3, 3, "F");
    doc.setTextColor(255);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Total: €${total.toFixed(2)}`, 105, y + 14, { align: "center" });

    // Footer
    doc.setTextColor(150);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("This is an estimate. Final pricing may vary based on on-site assessment.", 20, 280);

    doc.save(`cleaning-proposal-${date}.pdf`);
  };

  const [sqm, setSqm] = useState<string>("");
  const [selectedType, setSelectedType] = useState<CleaningType>("basic");

  const area = parseFloat(sqm) || 0;
  const selected = cleaningOptions.find((o) => o.id === selectedType)!;
  const totalPrice = area * selected.pricePerSqm;

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
          <label
            htmlFor="sqm"
            className="block text-sm font-medium text-foreground mb-2"
          >
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
                    <div className="font-semibold text-foreground">
                      {option.label}
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      {option.description}
                    </div>
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
          <div className="text-4xl font-bold tracking-tight">
            €{totalPrice.toFixed(2)}
          </div>
          <div className="text-sm opacity-75">
            {area > 0
              ? `${area} m² × €${selected.pricePerSqm.toFixed(2)} — ${selected.label}`
              : "Enter an area to see your quote"}
          </div>
        </div>

        {/* Generate PDF */}
        {area > 0 && (
          <button
            onClick={() => generatePDF(area, selected, totalPrice)}
            className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card px-4 py-3 font-semibold text-primary hover:bg-accent transition-all"
          >
            <FileDown className="w-5 h-5" />
            Download Proposal PDF
          </button>
        )}
      </div>
    </div>
  );
};

export default CleaningCalculator;
