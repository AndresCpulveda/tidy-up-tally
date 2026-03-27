import { useState, useCallback } from "react";
import officePrideLogo from "@/assets/office-pride-logo.png";
import { Mail, Send, Loader2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [previewUrls, setPreviewUrls] = useState<{ proposal?: string; agreement?: string }>({});
  const [previewing, setPreviewing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
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

  const generateProposalBlobUrl = (): string => {
    const base64 = generateProposalPdfBase64();
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "application/pdf" });
    return URL.createObjectURL(blob);
  };

  const getAgreementData = () => {
    const date = new Date().toLocaleDateString();
    return {
      providerName: settings.companyName,
      providerDBA: settings.proposalTemplate.contractorName,
      logoUrl: officePrideLogo,
      clientName: companyName,
      clientAddress: companyAddress,
      date,
      numPeople, hoursPerPerson, timesPerWeek, hourlyRate,
      totalHoursPerWeek, monthlyHours, totalBill,
      billingDate,
      billingStartDate,
      ...settings.agreementTemplate,
    };
  };

  const handlePreview = useCallback(async () => {
    setPreviewing(true);
    try {
      // Revoke old URLs
      if (previewUrls.proposal) URL.revokeObjectURL(previewUrls.proposal);
      if (previewUrls.agreement) URL.revokeObjectURL(previewUrls.agreement);

      const urls: { proposal?: string; agreement?: string } = {};

      if (includeProposal) {
        urls.proposal = generateProposalBlobUrl();
      }

      if (includeAgreement) {
        const base64 = await generateServiceAgreementPDF(getAgreementData(), true);
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const blob = new Blob([bytes], { type: "application/pdf" });
        urls.agreement = URL.createObjectURL(blob);
      }

      setPreviewUrls(urls);
      setShowPreview(true);
    } catch (err: any) {
      toast({ title: "Preview failed", description: err.message, variant: "destructive" });
    } finally {
      setPreviewing(false);
    }
  }, [includeProposal, includeAgreement, settings, companyName, companyAddress, timesPerWeek]);

  const handleSend = async () => {
    if (!email || (!includeProposal && !includeAgreement)) return;
    setSending(true);
    try {
      const attachments: { filename: string; content: string }[] = [];
      const date = new Date().toLocaleDateString();
      const safeName = companyName.trim() || "Client";

      if (includeProposal) {
        const proposalBase64 = generateProposalPdfBase64();
        attachments.push({ filename: `${safeName} - Cleaning Specifications - ${date}.pdf`, content: proposalBase64 });
      }

      if (includeAgreement) {
        const agreementBase64 = await generateServiceAgreementPDF(getAgreementData(), true);
        attachments.push({ filename: `${safeName} - Service Agreement - ${date}.pdf`, content: agreementBase64 });
      }

      const subjectParts: string[] = [];
      if (includeProposal) subjectParts.push("Proposal");
      if (includeAgreement) subjectParts.push("Service Agreement");

      const bodyContent = (settings.emailBodyTemplate || '')
        .replace(/\{\{companyName\}\}/g, settings.companyName)
        .replace(/\{\{totalBill\}\}/g, totalBill.toFixed(2))
        .replace(/\{\{documentList\}\}/g, subjectParts.join(" and ").toLowerCase());

      const { data, error } = await supabase.functions.invoke("send-proposal-email", {
        body: {
          recipientEmail: email,
          subject: `Cleaning ${subjectParts.join(" & ")} for ${companyName}`,
          bodyHtml: '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;">' +
            bodyContent +
            '</body></html>',
          attachments,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Email sent!", description: `${subjectParts.join(" & ")} sent as PDF attachment(s) to ${email}` });
      setOpen(false);
      setEmail("");
      setShowPreview(false);
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
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setShowPreview(false); } }}>
      <DialogTrigger asChild>
        <button className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-primary bg-card px-4 py-3 font-semibold text-primary hover:bg-accent transition-all">
          <Mail className="w-5 h-5" />
          Email
        </button>
      </DialogTrigger>
      <DialogContent className={showPreview ? "sm:max-w-3xl max-h-[90vh] overflow-y-auto" : "sm:max-w-md"}>
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
                onChange={(e) => { setIncludeProposal(e.target.checked); setShowPreview(false); }}
                className="rounded border-input"
              />
              Cleaning Proposal
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={includeAgreement}
                onChange={(e) => { setIncludeAgreement(e.target.checked); setShowPreview(false); }}
                className="rounded border-input"
              />
              Service Agreement
            </label>
          </div>

          {/* Preview Section */}
          {showPreview && (previewUrls.proposal || previewUrls.agreement) && (
            <div className="border border-border rounded-lg overflow-hidden">
              {previewUrls.proposal && previewUrls.agreement ? (
                <Tabs defaultValue="proposal" className="w-full">
                  <TabsList className="w-full grid grid-cols-2">
                    <TabsTrigger value="proposal">Cleaning Proposal</TabsTrigger>
                    <TabsTrigger value="agreement">Service Agreement</TabsTrigger>
                  </TabsList>
                  <TabsContent value="proposal" className="mt-0">
                    <iframe src={previewUrls.proposal} className="w-full h-[400px]" title="Proposal Preview" />
                  </TabsContent>
                  <TabsContent value="agreement" className="mt-0">
                    <iframe src={previewUrls.agreement} className="w-full h-[400px]" title="Agreement Preview" />
                  </TabsContent>
                </Tabs>
              ) : (
                <iframe
                  src={previewUrls.proposal || previewUrls.agreement}
                  className="w-full h-[400px]"
                  title="PDF Preview"
                />
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePreview}
              disabled={previewing || (!includeProposal && !includeAgreement)}
              className="flex-1 hidden sm:flex"
            >
              {previewing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              {previewing ? "Generating…" : "Preview PDFs"}
            </Button>
            <Button
              onClick={handleSend}
              disabled={!email || sending || (!includeProposal && !includeAgreement)}
              className="flex-1"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? "Sending…" : "Send Email"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}