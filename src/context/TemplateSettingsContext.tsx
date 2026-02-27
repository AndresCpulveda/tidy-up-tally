import { createContext, useContext, useState, ReactNode } from "react";

export interface ProposalTemplate {
  title: string;
  contractorName: string;
  weeklyTasks: string[];
  monthlyTasks: string[];
  footerText: string;
}

export interface AgreementTemplate {
  title: string;
  contractorResponsibilities: string[];
  customerResponsibilities: string[];
  insuranceText: string;
  periodText: string;
  changesText: string;
  extraServices: { label: string; price: string }[];
  invoiceNote: string;
  thirdPartyNote: string;
  signaturesNote: string;
  pricesValidDays: string;
  copyrightText: string;
  footerDisclaimer: string;
}

export interface TemplateSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  logoUrl: string;
  billingDate: string;
  hourlyRate: number;
  proposalTemplate: ProposalTemplate;
  agreementTemplate: AgreementTemplate;
}

const defaultProposalTemplate: ProposalTemplate = {
  title: "Cleaning Specifications",
  contractorName: "Office Pride Commercial Cleaning Services",
  weeklyTasks: [
    "Vacuum all carpet and floor mats.",
    "Dust, mop and damp mop all tile floors.",
    "Empty all trash and take to dumpster.",
    "Clean entry door glass.",
    "Spot clean glass and mirrors throughout office.",
    "Clean and sanitize restrooms.",
    "Refill toilet paper, soap and towel dispensers as needed from client's supply.",
    "Clean kitchenette, sink and surrounding countertop, and water fountain.",
    "Dust uncovered areas of all desks, file cabinets, bookcases, counters and other furniture.",
    "Dust windowsills, phones and computers.",
    "Remove cobwebs from corners of ceilings and baseboards.",
    "Spot clean new carpet spots (usually on request).",
  ],
  monthlyTasks: [
    "Dust baseboards (wash as needed).",
    "Spot clean doors and walls.",
    "Dust overhead vents and blinds.",
  ],
  footerText: "Each Office Pride location is independently owned and operated.",
};

const defaultAgreementTemplate: AgreementTemplate = {
  title: "Service Agreement",
  contractorResponsibilities: [
    "Contractor agrees to provide all services as described below.",
    "Contractor agrees to provide all labor, equipment and cleaning supplies.",
    "Contractor agrees to provide service as scheduled after regular business hours unless otherwise mutually agreed.",
  ],
  customerResponsibilities: [
    "Customer agrees to provide adequate and secure storage facilities for contractor's equipment and supplies.",
    "Customer agrees to provide adequate water and electrical facilities for use of contractor.",
    "Customer agrees to provide access cards/keys for contractor's use.",
    "Customer to furnish all trash bags, paper products and soap. If client requests, contractor can provide and deliver these items for a competitive price.",
    "Customer agrees to provide adequate trash disposal facilities.",
    "Customer agrees that contractor is not responsible for cleaning any blood or human fluid spills and that these spills will be cleaned upon occurrence by the customer.",
    "Customer agrees this contract may be serviced by the contractor's in-house janitorial service or by an assigned franchise location which meets all the requirements set forth in this contract.",
    "Customer agrees not to employ in a similar position any contractor employee or franchisee assigned to service customer's facilities during the life of this agreement and for a period of three months following termination of this agreement.",
    "Customer understands Contractor's performance and provision of requested services are subject to the availability of products, tools and labor.",
  ],
  insuranceText: "Contractor agrees to keep insurance coverage(s) in force during the term of the agreement.",
  periodText: "Service will continue (with the price protected) for one year or until canceled by thirty (30) days' written notice by either party.",
  changesText: "Customer and contractor agree that specifications, frequencies or work assignments may be altered at any time by written notice. Contractor and customer will negotiate the cost of service changes.",
  extraServices: [
    { label: "Refrigerator inside cleaning", price: "$35 each" },
    { label: "Microwave/Toaster Oven inside cleaning", price: "$35 each" },
    { label: "Extra tasks or special cleaning not on specifications", price: "$25 per hour" },
    { label: "Window washing", price: "Quote upon request" },
  ],
  invoiceNote: "Prices quoted do not include applicable sales tax and are subject to change. Customer understands pricing is subject to change if costs of products, tools or labor increase.",
  thirdPartyNote: "Office Pride does not assume costs relating to customer payment and invoice processing. Customer agrees to pay any third-party invoicing portal or payment disbursement company that is utilized by the customer and said services incur an expense or fee, said costs will be reverted to the customer and added to the quoted price.",
  signaturesNote: "THE UNDERSIGNED HAVE READ, UNDERSTAND and ACCEPT THIS AGREEMENT, and by signing this Agreement, all parties agree to all of the aforementioned terms, conditions and policies.",
  pricesValidDays: "Prices quoted are valid for thirty (30) days from date of presentation.",
  copyrightText: "",
  footerDisclaimer: "Each Office Pride location is independently owned and operated.",
};

const defaultSettings: TemplateSettings = {
  companyName: "CleanPro Services",
  companyAddress: "123 Main Street, City",
  companyPhone: "+1 234 567 890",
  companyEmail: "info@cleanpro.com",
  logoUrl: "",
  billingDate: "Due upon receipt",
  hourlyRate: 25,
  proposalTemplate: defaultProposalTemplate,
  agreementTemplate: defaultAgreementTemplate,
};

interface TemplateSettingsContextType {
  settings: TemplateSettings;
  updateSettings: (s: Partial<TemplateSettings>) => void;
  updateHourlyRate: (rate: number) => void;
}

const TemplateSettingsContext = createContext<TemplateSettingsContextType | null>(null);

const STORAGE_KEY = "cleaning-template-settings";

function loadSettings(): TemplateSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {}
  return defaultSettings;
}

export function TemplateSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<TemplateSettings>(loadSettings);

  const persist = (next: TemplateSettings) => {
    setSettings(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const updateSettings = (partial: Partial<TemplateSettings>) => {
    persist({ ...settings, ...partial });
  };

  const updateHourlyRate = (rate: number) => {
    persist({ ...settings, hourlyRate: rate });
  };

  return (
    <TemplateSettingsContext.Provider value={{ settings, updateSettings, updateHourlyRate }}>
      {children}
    </TemplateSettingsContext.Provider>
  );
}

export function useTemplateSettings() {
  const ctx = useContext(TemplateSettingsContext);
  if (!ctx) throw new Error("useTemplateSettings must be used within TemplateSettingsProvider");
  return ctx;
}
