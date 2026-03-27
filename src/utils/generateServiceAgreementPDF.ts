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
  let currentTextColor = 50;

  const addPageIfNeeded = (space = 30) => {
    if (y + space > pageHeight - 60) {
      // Save current font state
      const prevFontSize = doc.getFontSize();
      const prevFont = doc.getFont();
      const prevTextColor = currentTextColor;

      doc.addPage();
      y = margin;
      addPagination();

      // Restore font state after pagination header
      doc.setFontSize(prevFontSize);
      doc.setFont(prevFont.fontName, prevFont.fontStyle);
      doc.setTextColor(prevTextColor);
      currentTextColor = prevTextColor;
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
  const addPagination = () => {
    const page = doc.getNumberOfPages();
    doc.setFontSize(16);
    doc.setTextColor(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Service Agreement – Page ${page}`, pageWidth - margin, y, { align: "right" });
    y += sectionGap;
  }
  addPagination()

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

  // Render cost text with bold amount and times per week using inline segments
  const addInlineBoldText = (parts: { text: string; bold: boolean }[]) => {
    // Render segments inline, wrapping when exceeding content width
    let xPos = margin;
    for (const part of parts) {
      doc.setFont("helvetica", part.bold ? "bold" : "normal");
      const words = part.text.split(" ");
      words.forEach((word, wi) => {
        const spacedWord = (xPos > margin || wi > 0) && wi < words.length ? " " + word : word;
        const testWord = xPos === margin ? word : spacedWord;
        const wordWidth = doc.getTextWidth(testWord);
        if (xPos + wordWidth > pageWidth - margin && xPos > margin) {
          y += lineHeight;
          addPageIfNeeded(lineHeight);
          xPos = margin;
          doc.text(word, xPos, y);
          xPos += doc.getTextWidth(word);
        } else {
          doc.text(testWord, xPos, y);
          xPos += wordWidth;
        }
      });
    }
    y += lineHeight;
    doc.setFont("helvetica", "normal");
  };

  addInlineBoldText([
    { text: "a. Customer agrees to pay contractor the sum of", bold: false },
    { text: `$${data.totalBill.toFixed(2)} per month`, bold: true },
    { text: "for service(s)", bold: false },
    { text: `${data.timesPerWeek} time(s) per week`, bold: true },
    { text: "on the last day of the same month in which work is performed.", bold: false },
  ]);
  y += 4;

  if (data.billingDate) {
    addWrappedText(`b. Customer will be invoiced on or by the day before service commencement of the same month`, margin, contentWidth);
    // addWrappedText(`b. Payment Terms: ${data.billingDate}`, margin, contentWidth);
    y += 4;
  }

  addWrappedText(`c. ${data.invoiceNote}`, margin, contentWidth);
  y += 4;

  addWrappedText("d. Unless noted, customer agrees that the following services are separate from this contract and can be quoted upon request:", margin, contentWidth);
  y += 4;

  data.extraServices.forEach((svc) => {
    addPageIfNeeded(lineHeight);
    doc.text(`•  ${svc.label}`, margin + 8, y);
    const priceX = pageWidth - margin;
    doc.text(svc.price, priceX, y, { align: "right" });
    y += lineHeight;
  });
  y += 4;

  addWrappedText(`e. ${data.thirdPartyNote}`, margin, contentWidth);

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
    items.map((i) => `<li style="margin-bottom:2px;">${i}</li>`).join("");

  const extraServicesHtml = data.extraServices
    .map(
      (svc) =>
        `<div style="display:flex;justify-content:space-between;padding:0 8px;"><span>•  ${svc.label}</span><span>${svc.price}</span></div>`
    )
    .join("");

  const dbaRow = data.providerDBA
    ? `<tr><td style="padding:2px 0;font-weight:700;width:80px;vertical-align:top;">DBA:</td><td style="padding:2px 0;">${data.providerDBA}</td></tr>`
    : "";

  return `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:595px;margin:0 auto;padding:50px;font-size:10px;color:#323232;line-height:1.5;">
      <div style="text-align:right;font-size:16px;color:#0a0a0a;margin-bottom:20px;">Service Agreement – Page 1</div>

      ${data.logoUrl ? `<div style="margin-bottom:10px;"><img src="${data.logoUrl}" style="max-height:50px;max-width:120px;" /></div>` : ""}

      <table style="font-size:10px;color:#323232;margin-bottom:16px;border-collapse:collapse;">
        <tr><td style="padding:2px 0;font-weight:700;width:80px;vertical-align:top;">Customer:</td><td style="padding:2px 0;">${data.clientName}</td></tr>
        <tr><td style="padding:2px 0;font-weight:700;vertical-align:top;">Date:</td><td style="padding:2px 0;">${data.date}</td></tr>
        <tr><td style="padding:2px 0;font-weight:700;vertical-align:top;">Location:</td><td style="padding:2px 0;">${data.clientAddress}</td></tr>
        <tr><td style="padding:2px 0;font-weight:700;vertical-align:top;">Contractor:</td><td style="padding:2px 0;">${data.providerName}</td></tr>
        ${dbaRow}
      </table>

      <div style="margin-top:20px;">
        <div style="font-weight:700;font-size:12px;color:#1e1e1e;margin-bottom:6px;">I. Contractor Responsibility</div>
        <ul style="margin:0;padding-left:22px;list-style:disc;">${bulletHtml([...data.contractorResponsibilities, `Contractor agrees to provide service ${data.timesPerWeek} times per week after regular business hours unless otherwise mutually agreed.`])}</ul>
      </div>

      <div style="margin-top:20px;">
        <div style="font-weight:700;font-size:12px;color:#1e1e1e;margin-bottom:6px;">II. Customer Responsibility</div>
        <ul style="margin:0;padding-left:22px;list-style:disc;">${bulletHtml(data.customerResponsibilities)}</ul>
      </div>

      <div style="margin-top:20px;">
        <div style="font-weight:700;font-size:12px;color:#1e1e1e;margin-bottom:6px;">III. Insurance Coverage</div>
        <p style="margin:0 0 4px 0;">${data.insuranceText}</p>
        <ul style="margin:0;padding-left:22px;list-style:disc;">${bulletHtml(data.insuranceBullets)}</ul>
      </div>

      <div style="margin-top:20px;">
        <div style="font-weight:700;font-size:12px;color:#1e1e1e;margin-bottom:6px;">IV. Period of Agreement</div>
        <p style="margin:0;">Service will commence on <strong>${data.billingStartDate}</strong>. Service will continue (with the price in Section VI protected) for one year or until canceled by thirty (30) days' written notice by either party.</p>
      </div>

      <div style="margin-top:20px;">
        <div style="font-weight:700;font-size:12px;color:#1e1e1e;margin-bottom:6px;">V. Changes in Specifications or Frequencies</div>
        <p style="margin:0;">${data.changesText}</p>
      </div>

      <div style="margin-top:20px;">
        <div style="font-weight:700;font-size:12px;color:#1e1e1e;margin-bottom:6px;">VI. Cost of Service and Invoicing</div>
        <p style="margin:0 0 4px 0;">a. Customer agrees to pay contractor the sum of <strong>$${data.totalBill.toFixed(2)} per month</strong> for service(s) <strong>${data.timesPerWeek} time(s) per week</strong> on the last day of the same month in which work is performed.</p>
        ${data.billingDate ? `<p style="margin:0 0 4px 0;">b. Customer will be invoiced on or by the day before service commencement of the same month</p>` : ""}
        <p style="margin:0 0 4px 0;">c. ${data.invoiceNote}</p>
        <p style="margin:0 0 4px 0;">d. Unless noted, customer agrees that the following services are separate from this contract and can be quoted upon request:</p>
        <div style="padding-left:8px;margin-bottom:4px;">${extraServicesHtml}</div>
        <p style="margin:0;">e. ${data.thirdPartyNote}</p>
      </div>

      <div style="margin-top:20px;">
        <div style="font-weight:700;font-size:12px;color:#1e1e1e;margin-bottom:6px;">VII. Signatures</div>
        <p style="margin:0 0 10px 0;">${data.signaturesNote}</p>
        <div style="margin-bottom:12px;">
          <span style="font-weight:700;">Customer:</span> ${data.clientName}<br/>
          <span style="padding-left:20px;">Printed Name: ______________________________</span><br/>
          <span style="padding-left:20px;">Signature: ______________________________&nbsp;&nbsp;&nbsp;&nbsp;Date: ______________</span>
        </div>
        <div style="margin-bottom:12px;">
          <span style="font-weight:700;">Contractor:</span> ${data.providerDBA || data.providerName}<br/>
          <span style="padding-left:20px;">Printed Name: ______________________________</span><br/>
          <span style="padding-left:20px;">Signature: ______________________________&nbsp;&nbsp;&nbsp;&nbsp;Date: ______________</span>
        </div>
      </div>

      ${data.pricesValidDays ? `<p style="margin-top:10px;font-size:8px;color:#787878;">${data.pricesValidDays}</p>` : ""}
      ${data.copyrightText ? `<p style="font-size:8px;color:#787878;">${data.copyrightText}</p>` : ""}
      <p style="text-align:center;font-size:8px;color:#828282;margin-top:20px;">${data.footerDisclaimer}</p>
    </div>
  `;
}
