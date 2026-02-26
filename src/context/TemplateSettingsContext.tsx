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
  termText: string;
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
  termText: "This agreement commences on the date signed below and continues on a month-to-month basis. Either party may terminate with 30 days written notice.",
  footerDisclaimer: "This document is a template and may require legal review before use.",
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
