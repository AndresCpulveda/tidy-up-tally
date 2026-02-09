import { createContext, useContext, useState, ReactNode } from "react";

export interface TemplateSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  logoUrl: string;
  billingDate: string;
  pricing: {
    basic: number;
    deep: number;
    moveout: number;
  };
}

const defaultSettings: TemplateSettings = {
  companyName: "CleanPro Services",
  companyAddress: "123 Main Street, City",
  companyPhone: "+1 234 567 890",
  companyEmail: "info@cleanpro.com",
  logoUrl: "",
  billingDate: "Due upon receipt",
  pricing: {
    basic: 3.5,
    deep: 6.0,
    moveout: 8.5,
  },
};

interface TemplateSettingsContextType {
  settings: TemplateSettings;
  updateSettings: (s: Partial<TemplateSettings>) => void;
  updatePricing: (p: Partial<TemplateSettings["pricing"]>) => void;
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

  const updatePricing = (partial: Partial<TemplateSettings["pricing"]>) => {
    persist({ ...settings, pricing: { ...settings.pricing, ...partial } });
  };

  return (
    <TemplateSettingsContext.Provider value={{ settings, updateSettings, updatePricing }}>
      {children}
    </TemplateSettingsContext.Provider>
  );
}

export function useTemplateSettings() {
  const ctx = useContext(TemplateSettingsContext);
  if (!ctx) throw new Error("useTemplateSettings must be used within TemplateSettingsProvider");
  return ctx;
}
