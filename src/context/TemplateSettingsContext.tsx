import { createContext, useContext, useState, ReactNode } from "react";

export interface TemplateSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  logoUrl: string;
  billingDate: string;
  hourlyRate: number;
}

const defaultSettings: TemplateSettings = {
  companyName: "CleanPro Services",
  companyAddress: "123 Main Street, City",
  companyPhone: "+1 234 567 890",
  companyEmail: "info@cleanpro.com",
  logoUrl: "",
  billingDate: "Due upon receipt",
  hourlyRate: 25,
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
