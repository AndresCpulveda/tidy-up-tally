import { useState } from "react";
import officePrideLogo from "@/assets/office-pride-logo.png";
import { Mail, Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTemplateSettings } from "@/context/TemplateSettingsContext";
import { generateServiceAgreementPDF } from "@/utils/generateServiceAgreementPDF";

interface EmailProposalDialogProps {
  totalHoursPerWeek: number;
  totalBill: number;
  numPeople: number;
  hoursPerPerson: number;
  timesPerWeek: number;
  hourlyRate: number;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  billingDate: string;
  billingStartDate: string;
  monthlyHours: number;
}

export default function EmailProposalDialog({
  totalHoursPerWeek,
  totalBill,
  numPeople,
  hoursPerPerson,
  timesPerWeek,
  hourlyRate,
  companyName,
  companyAddress,
  companyPhone,
  companyEmail,
  billingDate,
  billingStartDate,
  monthlyHours,
}: EmailProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [includeProposal, setIncludeProposal] = useState(true);
  const [includeAgreement, setIncludeAgreement] = useState(true);
  const { toast } = useToast();
  const { settings } = useTemplateSettings();

  const generateProposalPdfBase64 = (): string => {
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
    addText(`Customer: ${companyName}`);
    addText(`Location: ${companyAddress}`);
    addText(`Contractor: ${settings.proposalTemplate.contractorName}`);
    addText(`Date: ${date}`);
    y += sectionSpacing;

    doc.setFont("helvetica", "bold");
    addText(`Times Per Week (${timesPerWeek || ""})`);
    y += 10;
    doc.setFont("helvetica", "normal");

    settings.proposalTemplate.weeklyTasks.forEach(task => {
      const splitText: string[] = doc.splitTextToSize("• " + task, pageWidth - margin * 2);
      splitText.forEach(line => { addPageIfNeeded(lineHeight); doc.text(line, margin, y); y += lineHeight; });
    });
    y += sectionSpacing;

    doc.setFont("helvetica", "bold");
    addText("Monthly");
    y += 10;
    doc.setFont("helvetica", "normal");
    settings.proposalTemplate.monthlyTasks.forEach(task => {
      const splitText: string[] = doc.splitTextToSize("• " + task, pageWidth - margin * 2);
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

    return doc.output("datauristring").split(",")[1];
  };

  const handleSend = async () => {
    if (!email || (!includeProposal && !includeAgreement)) return;
    setSending(true);
    try {
      const attachments: { filename: string; content: string }[] = [];
      const date = new Date().toLocaleDateString();

      if (includeProposal) {
        const proposalBase64 = generateProposalPdfBase64();
        attachments.push({ filename: `cleaning-proposal-${date}.pdf`, content: proposalBase64 });
      }

      if (includeAgreement) {
        const agreementBase64 = await generateServiceAgreementPDF({
          providerName: settings.companyName,
          providerDBA: settings.proposalTemplate.contractorName,
          logoUrl: settings.logoUrl,
          clientName: companyName,
          clientAddress: companyAddress,
          date,
          numPeople, hoursPerPerson, timesPerWeek, hourlyRate,
          totalHoursPerWeek, monthlyHours, totalBill,
          billingDate,
          billingStartDate,
          ...settings.agreementTemplate,
        }, true);
        attachments.push({ filename: `service-agreement-${date}.pdf`, content: agreementBase64 });
      }

      const subjectParts: string[] = [];
      if (includeProposal) subjectParts.push("Proposal");
      if (includeAgreement) subjectParts.push("Service Agreement");

      const { data, error } = await supabase.functions.invoke("send-proposal-email", {
        body: {
          recipientEmail: email,
          subject: `Cleaning ${subjectParts.join(" & ")} — $${totalBill.toFixed(2)}/month`,
          bodyText: `Hi,\n\n
          I'd like to thank you for allowing me to visit your treatment center to provide you with an estimate for janitorial services.  Per our discussion, we would be cleaning your apartments once a month for a total of 20 apartments.  Attached, you will find a detailed estimate that outlines the scope of work, the services included, and the associated costs. Our proposal is designed to ensure your facilities are maintained to the highest standards of cleanliness and hygiene. Here are some of the key benefits you can expect from our services:\n\n
          We bring our own cleaning supplies and equipment, which are commercial grade.  We do not ask clients to buy our supplies or equipment.  We make sure our clients get properly serviced in a professional manner\n\n
          Besides cleaning, our cleaning products, also, sanitize and disinfect.  When a product disinfects, it kills germs, bacteria, and viruses, which is important nowadays.  We do not use household cleaning products that could make your floors sticky, and not disinfected.  Moreover, our products will not damage your flooring\n\n
          Color coding for cleaning rags.  Red for toilets, yellow for the rest of the bathroom, green for other surfaces in the office, and blue for glass and mirror.  We do not cross-contaminate.  In other words, there is no chance we use the same rags in the bathroom and the kitchen\n\n
          A consistent and professional system to clean.  We come to the site with a designed plan to clean your office (please see cleaning specs in the attachment).  We are not a mom-and pop shop.  Office Pride has been in service for over 30 years\n\n
          An assigned supervisor to make sure we provide the service we have agreed.  Many companies promise what we promise, but few make sure of the execution.  Our supervisors are trained to execute on our promises\n\n
          We are insured and bonded\n\n
          We offer a 2% discount on your total monthly invoice if you pay electronically and within 10 days after invoice was sent out.
          ${subjectParts.join(" and ").toLowerCase()} for your review.\n\n
          The quote is for $${totalBill.toFixed(2)} We know we provide the best value in the market and we will be honored to prove that to you.  Our team is equipped with the expertise, equipment, and dedication to deliver these benefits consistently. We take pride in our attention to detail and our commitment to meeting your specific cleaning needs.

          If you have any questions or need further clarification on the estimate, please do not hesitate to reach out. I am available to discuss any aspect of the proposal at your convenience.

          Thank you for considering Office Pride Commercial Cleaning Services as your trusted partner in maintaining a clean and healthy work environment. We look forward to the opportunity to work with you. Have a wonderful day!\n\n
          Best regards,\n${settings.companyName}`,
          attachments,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Email sent!", description: `${subjectParts.join(" & ")} sent as PDF attachment(s) to ${email}` });
      setOpen(false);
      setEmail("");
    } catch (err: any) {
      toast({
        title: "Failed to send",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card px-4 py-3 font-semibold text-primary hover:bg-accent transition-all">
          <Mail className="w-5 h-5" />
          Email
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send by Email</DialogTitle>
          <DialogDescription>Send PDF documents as email attachments.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label htmlFor="recipient-email" className="block text-sm font-medium text-foreground mb-1">
              Recipient Email
            </label>
            <input
              id="recipient-email"
              type="email"
              placeholder="client@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Attach PDFs:</p>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={includeProposal}
                onChange={(e) => setIncludeProposal(e.target.checked)}
                className="rounded border-input"
              />
              Cleaning Proposal
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={includeAgreement}
                onChange={(e) => setIncludeAgreement(e.target.checked)}
                className="rounded border-input"
              />
              Service Agreement
            </label>
          </div>
          <Button
            onClick={handleSend}
            disabled={!email || sending || (!includeProposal && !includeAgreement)}
            className="w-full"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? "Generating & Sending…" : "Send Email with PDFs"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
