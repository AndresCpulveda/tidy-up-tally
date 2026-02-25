import { useState } from "react";
import { Mail, Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { buildServiceAgreementHtml } from "@/utils/generateServiceAgreementPDF";

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
  monthlyHours,
}: EmailProposalDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [includeProposal, setIncludeProposal] = useState(true);
  const [includeAgreement, setIncludeAgreement] = useState(true);
  const { toast } = useToast();

  const buildProposalHtml = () => `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h1 style="color:#1a1a1a;font-size:22px;">${companyName || "Cleaning Service Proposal"}</h1>
      <p style="color:#666;font-size:13px;">${[companyAddress, companyPhone, companyEmail].filter(Boolean).join(" · ")}</p>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0;" />
      <h2 style="font-size:18px;color:#1a1a1a;">Cleaning Service Proposal</h2>
      <table style="width:100%;border-collapse:collapse;margin:16px 0;">
        <tr><td style="padding:8px 0;color:#666;">Number of People</td><td style="padding:8px 0;font-weight:600;">${numPeople}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Hours per Person</td><td style="padding:8px 0;">${hoursPerPerson}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Times per Week</td><td style="padding:8px 0;">${timesPerWeek}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Hourly Rate</td><td style="padding:8px 0;">€${hourlyRate.toFixed(2)}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Total Hours/Week</td><td style="padding:8px 0;font-weight:600;">${totalHoursPerWeek.toFixed(1)}</td></tr>
        <tr><td style="padding:8px 0;color:#666;">Monthly Hours (Est.)</td><td style="padding:8px 0;">${monthlyHours.toFixed(1)}</td></tr>
      </table>
      <div style="background:#22785a;color:#fff;padding:16px;border-radius:8px;text-align:center;font-size:20px;font-weight:700;">
        Monthly Estimate: €${totalBill.toFixed(2)}
      </div>
      ${billingDate ? `<p style="margin-top:12px;color:#666;font-size:13px;">Terms: ${billingDate}</p>` : ""}
      <p style="margin-top:24px;color:#999;font-size:12px;">This is an estimate. Final pricing may vary based on on-site assessment.</p>
    </div>
  `;

  const agreementData = {
    companyName, companyAddress, companyPhone, companyEmail, billingDate,
    numPeople, hoursPerPerson, timesPerWeek, hourlyRate,
    totalHoursPerWeek, monthlyHours, totalBill,
  };

  const handleSend = async () => {
    if (!email || (!includeProposal && !includeAgreement)) return;
    setSending(true);
    try {
      const sections: string[] = [];
      if (includeProposal) sections.push(buildProposalHtml());
      if (includeAgreement) sections.push(buildServiceAgreementHtml(agreementData));

      const combinedHtml = sections.join('<hr style="border:none;border-top:2px solid #e5e5e5;margin:40px 0;" />');

      const subjectParts: string[] = [];
      if (includeProposal) subjectParts.push("Proposal");
      if (includeAgreement) subjectParts.push("Service Agreement");

      const { data, error } = await supabase.functions.invoke("send-proposal-email", {
        body: {
          recipientEmail: email,
          subject: `Cleaning ${subjectParts.join(" & ")} — €${totalBill.toFixed(2)}/month`,
          proposalHtml: combinedHtml,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Email sent!", description: `${subjectParts.join(" & ")} sent to ${email}` });
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
            <p className="text-sm font-medium text-foreground">Include in email:</p>
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
            {sending ? "Sending…" : "Send Email"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
