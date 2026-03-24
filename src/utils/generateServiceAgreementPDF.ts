import jsPDF from "jspdf";

interface ServiceAgreementData {
  // Provider info
  providerName: string;
  providerDBA: string;
  logoUrl?: string;
  // Client info
  clientName: string;
  clientAddress: string;
  // Date
  date: string;
  // Service details
  numPeople: number;
  hoursPerPerson: number;
  timesPerWeek: number;
  hourlyRate: number;
  totalHoursPerWeek: number;
  monthlyHours: number;
  totalBill: number;
  billingDate: string;
  billingStartDate: string;
  // Template content
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

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

export async function generateServiceAgreementPDF(data: ServiceAgreementData, returnBase64 = false): Promise<string> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;
  const lineHeight = 16;
  const sectionGap = 20;

  const addPageIfNeeded = (space = 30) => {
    if (y + space > pageHeight - 60) {
      // addFooter();
      doc.addPage();
      y = margin;
    }
  };

  // const addFooter = () => {
  //   const page = doc.getNumberOfPages();
  //   doc.setFontSize(8);
  //   doc.setTextColor(130);
  //   doc.setFont("helvetica", "normal");
  //   doc.text(
  //     `${data.providerDBA || data.providerName} – Service Agreement – Page ${page}`,
  //     pageWidth / 2,
  //     pageHeight - 30,
  //     { align: "center" }
  //   );
  // };

  const addWrappedText = (text: string, x: number, maxWidth: number) => {
    const lines: string[] = doc.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      addPageIfNeeded(lineHeight);
      doc.text(line, x, y);
      y += lineHeight;
    });
  };

  const addBulletList = (items: string[]) => {
    items.forEach((item) => {
      addPageIfNeeded(lineHeight);
      doc.text("•", margin + 8, y);
      const lines: string[] = doc.splitTextToSize(item, contentWidth - 24);
      lines.forEach((line: string, li: number) => {
        if (li > 0) addPageIfNeeded(lineHeight);
        doc.text(line, margin + 22, y);
        y += lineHeight;
      });
    });
  };

  const addSectionHeader = (num: string, title: string) => {
    addPageIfNeeded(40);
    y += sectionGap;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(30);
    doc.text(`${num}. ${title}`, margin, y);
    y += lineHeight + 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(50);
  };

  // ============ PAGINATION ============
  const page = doc.getNumberOfPages();
  doc.setFontSize(16);
  doc.setTextColor(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Service Agreement – Page ${page}`, pageWidth - margin, y, { align: "right" });
  y += sectionGap;

  // ============ LOGO ============
  if (data.logoUrl) {
    try {
      const img = await loadImage(data.logoUrl);
      const maxLogoH = 50;
      const maxLogoW = 120;
      const ratio = Math.min(maxLogoW / img.width, maxLogoH / img.height);
      const logoW = img.width * ratio;
      const logoH = img.height * ratio;
      doc.addImage(img, "PNG", margin, margin - 20, logoW, logoH);
      y += logoH + 10;
    } catch {
      // If logo fails to load, skip it
    }
  }

  // Customer / Date / Location / Contractor
  doc.setFontSize(10);
  doc.setTextColor(50);
  const infoRows = [
    ["Customer:", data.clientName],
    ["Date:", data.date],
    ["Location:", data.clientAddress],
    ["Contractor:", data.providerName],
  ];
  if (data.providerDBA) {
    infoRows.push(["DBA:", data.providerDBA]);
  }
  infoRows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "", margin + 80, y);
    y += lineHeight;
  });

  // ============ I. Contractor Responsibility ============
  addSectionHeader("I", "Contractor Responsibility");
  addBulletList(data.contractorResponsibilities);
  addBulletList([`Contractor agrees to provide service ${data.timesPerWeek} times per week after regular business hours unless otherwise mutually agreed.`]);

  // ============ II. Customer Responsibility ============
  addSectionHeader("II", "Customer Responsibility");
  addBulletList(data.customerResponsibilities);

  // ============ III. Insurance Coverage ============
  addSectionHeader("III", "Insurance Coverage");
  addWrappedText(data.insuranceText, margin, contentWidth);
  addBulletList(data.insuranceBullets);

  // ============ IV. Period of Agreement ============
  addSectionHeader("IV", "Period of Agreement");
  // Render "Service will commence on " then bold date, then rest
  const periodPre = "Service will commence on ";
  const periodPost = ". Service will continue (with the price in Section VI protected) for one year or until canceled by thirty (30) days' written notice by either party.";
  
  addPageIfNeeded(lineHeight);
  doc.setFont("helvetica", "normal");
  const preWidth = doc.getTextWidth(periodPre);
  doc.text(periodPre, margin, y);
  doc.setFont("helvetica", "bold");
  const dateWidth = doc.getTextWidth(data.billingStartDate);
  doc.text(data.billingStartDate, margin + preWidth, y);
  doc.setFont("helvetica", "normal");
  
  // Check if the rest fits on the same line or needs wrapping
  const remainingX = margin + preWidth + dateWidth;
  const remainingWidth = contentWidth - preWidth - dateWidth;
  if (remainingWidth > 20) {
    const postLines: string[] = doc.splitTextToSize(periodPost, remainingWidth);
    doc.text(postLines[0], remainingX, y);
    y += lineHeight;
    // Wrap remaining lines at full width
    for (let i = 1; i < postLines.length; i++) {
      addPageIfNeeded(lineHeight);
      doc.text(postLines[i], margin, y);
      y += lineHeight;
    }
  } else {
    y += lineHeight;
    addWrappedText(periodPost, margin, contentWidth);
  }

  // ============ V. Changes in Specifications ============
  addSectionHeader("V", "Changes in Specifications or Frequencies");
  addWrappedText(data.changesText, margin, contentWidth);

  // ============ VI. Cost of Service and Invoicing ============
  addSectionHeader("VI", "Cost of Service and Invoicing");

  const costText = `a. Customer agrees to pay contractor the sum of $${data.totalBill.toFixed(2)} per month for service(s) ${data.timesPerWeek} time(s) per week on the last day of the same month in which work is performed.`;
  addWrappedText(costText, margin, contentWidth);
  y += 4;

  if (data.billingDate) {
    addWrappedText(`b. Customer will be invoiced on or by the day before service commencement of the same month`, margin, contentWidth);
    // addWrappedText(`b. Payment Terms: ${data.billingDate}`, margin, contentWidth);
    y += 4;
  }

  addWrappedText(`c. ${data.invoiceNote[0]}`, margin, contentWidth);
  y += 4;

  addWrappedText(`d. ${data.invoiceNote[1]}`, margin, contentWidth);
  y += 4;

  addWrappedText("e. Unless noted, customer agrees that the following services are separate from this contract and can be quoted upon request:", margin, contentWidth);
  y += 4;

  data.extraServices.forEach((svc) => {
    addPageIfNeeded(lineHeight);
    doc.text(`•  ${svc.label}`, margin + 8, y);
    const priceX = pageWidth - margin;
    doc.text(svc.price, priceX, y, { align: "right" });
    y += lineHeight;
  });
  y += 4;

  addWrappedText(`f. ${data.thirdPartyNote}`, margin, contentWidth);

  // ============ VII. Signatures ============
  addSectionHeader("VII", "Signatures");
  addWrappedText(data.signaturesNote, margin, contentWidth);
  y += 10;

  const sigRows = [
    ["Customer:", data.clientName],
    ["Contractor:", data.providerDBA || data.providerName],
  ];
  sigRows.forEach(([label, value]) => {
    addPageIfNeeded(50);
    doc.setFont("helvetica", "bold");
    doc.text(label, margin, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "", margin + 80, y);
    y += lineHeight;
    doc.text("Printed Name: ______________________________", margin + 20, y);
    y += lineHeight;
    doc.text("Signature:      ______________________________     Date: ______________", margin + 20, y);
    y += lineHeight + 10;
  });

  // Bottom notes
  y += 10;
  addPageIfNeeded(40);
  doc.setFontSize(8);
  doc.setTextColor(120);
  if (data.pricesValidDays) {
    doc.text(data.pricesValidDays, margin, y);
    y += 12;
  }
  if (data.copyrightText) {
    doc.text(data.copyrightText, margin, y);
    y += 12;
  }

  // Add footer to all pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(130);
    doc.setFont("helvetica", "normal");
    doc.text(data.footerDisclaimer, pageWidth / 2, pageHeight - 20, { align: "center" });
  }

  if (returnBase64) {
    return doc.output("datauristring").split(",")[1];
  }
  const safeName = (data.clientName || "Client").trim();
  doc.save(`${safeName} - Service Agreement - ${data.date}.pdf`);
  return "";
}

export function buildServiceAgreementHtml(data: ServiceAgreementData): string {
  const bulletHtml = (items: string[]) =>
    items.map((i) => `<li style="margin-bottom:4px;">${i}</li>`).join("");

  return `
    <div style="font-family:Arial,sans-serif;max-width:650px;margin:0 auto;padding:24px;">
      ${data.logoUrl ? `<div style="text-align:center;margin-bottom:12px;"><img src="${data.logoUrl}" style="max-height:60px;max-width:200px;" /></div>` : ""}
      <h1 style="text-align:center;color:#1a1a1a;font-size:20px;">${data.providerDBA || data.providerName}</h1>
      <p style="text-align:center;color:#666;font-size:12px;">Service Agreement</p>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0;" />

      <table style="width:100%;font-size:13px;color:#333;margin-bottom:16px;">
        <tr><td style="padding:4px 0;font-weight:600;width:100px;">Customer:</td><td>${data.clientName}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Date:</td><td>${data.date}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Location:</td><td>${data.clientAddress}</td></tr>
        <tr><td style="padding:4px 0;font-weight:600;">Contractor:</td><td>${data.providerName}</td></tr>
      </table>

      <h3 style="color:#1a1a1a;">I. Contractor Responsibility</h3>
      <ul style="font-size:13px;color:#333;">${bulletHtml(data.contractorResponsibilities)}</ul>

      <h3 style="color:#1a1a1a;">II. Customer Responsibility</h3>
      <ul style="font-size:13px;color:#333;">${bulletHtml(data.customerResponsibilities)}</ul>

      <h3 style="color:#1a1a1a;">III. Insurance Coverage</h3>
      <p style="font-size:13px;color:#333;">${data.insuranceText}</p>

      <h3 style="color:#1a1a1a;">IV. Period of Agreement</h3>
      <p style="font-size:13px;color:#333;">Service will commence on ${data.billingStartDate}. ${data.periodText}</p>

      <h3 style="color:#1a1a1a;">V. Changes in Specifications</h3>
      <p style="font-size:13px;color:#333;">${data.changesText}</p>

      <h3 style="color:#1a1a1a;">VI. Cost of Service</h3>
      <div style="background:#22785a;color:#fff;padding:12px;border-radius:8px;text-align:center;font-size:18px;font-weight:700;">
        Monthly Fee: $${data.totalBill.toFixed(2)}
      </div>

      <h3 style="color:#1a1a1a;">VII. Signatures</h3>
      <p style="font-size:12px;color:#666;">${data.signaturesNote}</p>

      <p style="margin-top:24px;color:#999;font-size:11px;">${data.footerDisclaimer}</p>
    </div>
  `;
}
