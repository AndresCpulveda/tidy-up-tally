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
  insuranceBullets: string[];
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
  emailBodyTemplate: string;
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
  ],
  customerResponsibilities: [
    "Customer agrees to provide adequate and secure storage facilities for contractor's equipment and supplies.",
    "Customer agrees to provide adequate water and electrical facilities for use of contractor.",
    "Customer agrees to provide two sets of key access cards per time range indicated above for contractor’s use",
    "Customer to furnish all trash bags, paper products and soap. If client requests, contractor can provide and deliver these items for a competitive price.",
    "Customer agrees to provide adequate trash disposal facilities.",
    "Customer agrees that contractor is not responsible for cleaning any blood or human fluid spills and that these spills will be cleaned upon occurrence by the customer.",
    "Customer agrees this contract may be serviced by the contractor's in-house janitorial service or by an assigned franchise location which meets all the requirements set forth in this contract.",
    "Customer agrees not to employ in a similar position any contractor employee or franchisee assigned to service customer's facilities during the life of this agreement and for a period of three months following termination of this agreement.",
    "Customer understands Contractor's performance and provision of requested services are subject to the availability of products, tools and labor.",
  ],
  insuranceText: "Contractor agrees to keep the following insurance coverage(s) in force during the term of the agreement:",
  insuranceBullets: [
    "Workers Compensation (Policy limits per state statue)",
    "Comprehensive General Liability ($1,000,000 per occurrence)",
    "$10,000 Fidelity Bond for all employees",
  ],
  periodText: "Service will continue (with the price in Section VI protected) for one year or until canceled by thirty (30) days' written notice by either party.",
  changesText: "Customer and contractor agree that specifications, frequencies or work assignments may be altered at any time by written notice. Contractor and customer will negotiate the cost of service changes.",
  extraServices: [
    { label: "Refrigerator inside cleaning", price: "$35 each" },
    { label: "Microwave/Toaster Oven inside cleaning", price: "$35 each" },
    { label: "Extra tasks or special cleaning not on specifications", price: "$25 per hour" },
    { label: "Window washing", price: "Quote upon request" },
  ],
  invoiceNote: "Prices quoted do not include applicable sales tax and are subject to change. Customer understands pricing is subject to change if costs of products, tools or labor increase.",
  thirdPartyNote: "Office Pride does not assume costs relating to customer payment and invoice processing. Customer agrees to pay any third-party invoicing portal or payment disbursement company that is utilized by the customer and said services incur an expense or fee to Office Pride, said costs will be reverted to the customer and added to the quoted price",
  signaturesNote: "THE UNDERSIGNED HAVE READ, UNDERSTAND and ACCEPT THIS AGREEMENT, and by signing this Agreement, all parties agree to all of the aforementioned terms, conditions and policies.",
  pricesValidDays: "Prices quoted are valid for thirty (30) days from date of presentation.",
  copyrightText: "",
  footerDisclaimer: "Each Office Pride location is independently owned and operated.",
};

const defaultEmailBodyTemplate = `<p>Hi,</p>
<p>I'd like to thank you for allowing me to visit your facility to provide you with an estimate for janitorial services. Per our discussion, we would be cleaning your facility five times a week. Attached, you will find a detailed estimate that outlines the scope of work, the services included, and the associated costs. Our proposal is designed to ensure your facilities are maintained to the highest standards of cleanliness and hygiene.</p>
<p>Here are some of the key benefits you can expect from our services:</p>
<ul>
<li>We bring our own cleaning supplies and equipment, which are commercial grade. We do not ask clients to buy our supplies or equipment. We make sure our clients get properly serviced in a professional manner</li>
<li>Besides cleaning, our cleaning products, also, sanitize and disinfect. When a product disinfects, it kills germs, bacteria, and viruses, which is important nowadays. We do not use household cleaning products that could make your floors sticky, and not disinfected. Moreover, our products will not damage your flooring</li>
<li>Color coding for cleaning rags. Red for toilets, yellow for the rest of the bathroom, green for other surfaces in the office, and blue for glass and mirror. We do not cross-contaminate. In other words, there is no chance we use the same rags in the bathroom and the kitchen</li>
<li>A consistent and professional system to clean. We come to the site with a designed plan to clean your office (please see cleaning specs in the attachment). We are not a mom-and-pop shop. Office Pride has been in service for over 30 years</li>
<li>An assigned supervisor to make sure we provide the service we have agreed. Many companies promise what we promise, but few make sure of the execution. Our supervisors are trained to execute on our promises</li>
<li>We are insured and bonded</li>
<li>We offer a 2% discount on your total monthly invoice if you pay electronically and within 10 days after invoice was sent out.</li>
</ul>
<p>Please find the {{documentList}} for your review.</p>
<p>The quote is for <u><strong>\${{totalBill}}/month</strong></u>. We know we provide the best value in the market and we will be honored to prove that to you. Our team is equipped with the expertise, equipment, and dedication to deliver these benefits consistently. We take pride in our attention to detail and our commitment to meeting your specific cleaning needs.</p>
<p>If you have any questions or need further clarification on the estimate, please do not hesitate to reach out. I am available to discuss any aspect of the proposal at your convenience.</p>
<p>Thank you for considering Office Pride Commercial Cleaning Services as your trusted partner in maintaining a clean and healthy work environment. We look forward to the opportunity to work with you. Have a wonderful day!</p>
<p>Best regards,<br><strong>{{companyName}}</strong></p>`;

export const defaultTemplateSettings: TemplateSettings = {
  companyName: "Egusquiza Offices Solutions",
  companyAddress: "Fort Lauderdale - Hollywood",
  companyPhone: "(954) 998-3518",
  companyEmail: "CarlosEgusquiza@officepride.com",
  logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRW5IPUIyqinvCTRmkBi6zcv0ppV8nO-v-ZUA&s",
  billingDate: "Due upon receipt",
  hourlyRate: 24,
  proposalTemplate: defaultProposalTemplate,
  agreementTemplate: defaultAgreementTemplate,
  emailBodyTemplate: defaultEmailBodyTemplate,
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
    if (stored) return { ...defaultTemplateSettings, ...JSON.parse(stored) };
  } catch {}
  return defaultTemplateSettings;
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
