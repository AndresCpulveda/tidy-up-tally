import { createContext, useContext, useState, ReactNode } from "react";

export interface CalculatorFormState {
  step: number;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  billingStartDate: string;
  numPeople: string;
  hoursPerPerson: string;
  timesPerWeek: string;
  billingTerms: string;
}

const defaultState: CalculatorFormState = {
  step: 1,
  clientName: "",
  clientAddress: "",
  clientPhone: "",
  clientEmail: "",
  billingStartDate: "",
  numPeople: "",
  hoursPerPerson: "",
  timesPerWeek: "",
  billingTerms: "Due upon receipt",
};

interface CalculatorFormContextType {
  form: CalculatorFormState;
  updateForm: (partial: Partial<CalculatorFormState>) => void;
}

const CalculatorFormContext = createContext<CalculatorFormContextType | null>(null);

export function CalculatorFormProvider({ children }: { children: ReactNode }) {
  const [form, setForm] = useState<CalculatorFormState>(defaultState);

  const updateForm = (partial: Partial<CalculatorFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  return (
    <CalculatorFormContext.Provider value={{ form, updateForm }}>
      {children}
    </CalculatorFormContext.Provider>
  );
}

export function useCalculatorForm() {
  const ctx = useContext(CalculatorFormContext);
  if (!ctx) throw new Error("useCalculatorForm must be used within CalculatorFormProvider");
  return ctx;
}
