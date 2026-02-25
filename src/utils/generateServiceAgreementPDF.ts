import jsPDF from "jspdf";

interface ServiceAgreementData {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  billingDate: string;
  numPeople: number;
  hoursPerPerson: number;
  timesPerWeek: number;
  hourlyRate: number;
  totalHoursPerWeek: number;
  monthlyHours: number;
  totalBill: number;
}

export function generateServiceAgreementPDF(data: ServiceAgreementData) {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();
  let y = 25;

  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Service Agreement", 105, y, { align: "center" });
  y += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Date: ${date}`, 105, y, { align: "center" });
  y += 12;

  doc.setDrawColor(200);
  doc.line(20, y, 190, y);
  y += 12;

  // Parties
  doc.setTextColor(40);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("1. Parties", 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const provider = data.companyName || "Service Provider";
  doc.text(`Service Provider: ${provider}`, 20, y);
  y += 6;
  if (data.companyAddress) { doc.text(`Address: ${data.companyAddress}`, 20, y); y += 6; }
  const contact = [data.companyPhone, data.companyEmail].filter(Boolean).join("  |  ");
  if (contact) { doc.text(`Contact: ${contact}`, 20, y); y += 6; }
  y += 4;
  doc.text("Client: ___________________________________________", 20, y);
  y += 6;
  doc.text("Address: ___________________________________________", 20, y);
  y += 12;

  // Scope of Services
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("2. Scope of Services", 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`The Provider agrees to supply ${data.numPeople} cleaning staff member(s),`, 20, y); y += 6;
  doc.text(`each working ${data.hoursPerPerson} hour(s) per visit, ${data.timesPerWeek} time(s) per week.`, 20, y); y += 10;

  const rows = [
    ["Staff Members", `${data.numPeople}`],
    ["Hours per Person per Visit", `${data.hoursPerPerson}`],
    ["Visits per Week", `${data.timesPerWeek}`],
    ["Total Hours per Week", `${data.totalHoursPerWeek.toFixed(1)}`],
    ["Estimated Monthly Hours", `${data.monthlyHours.toFixed(1)}`],
  ];

  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 24, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 90, y);
    y += 7;
  });
  y += 6;

  // Compensation
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("3. Compensation", 20, y);
  y += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Hourly Rate: €${data.hourlyRate.toFixed(2)}`, 24, y); y += 7;
  doc.setFont("helvetica", "bold");
  doc.text(`Monthly Fee: €${data.totalBill.toFixed(2)}`, 24, y); y += 7;
  doc.setFont("helvetica", "normal");
  if (data.billingDate) {
    doc.text(`Payment Terms: ${data.billingDate}`, 24, y); y += 7;
  }
  y += 6;

  // Terms
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("4. Term & Termination", 20, y);
  y += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("This agreement commences on the date signed below and continues on a", 20, y); y += 6;
  doc.text("month-to-month basis. Either party may terminate with 30 days written notice.", 20, y);
  y += 14;

  // Signatures
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("5. Signatures", 20, y);
  y += 12;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Provider: ______________________________    Date: ______________", 20, y);
  y += 12;
  doc.text("Client:     ______________________________    Date: ______________", 20, y);

  // Footer
  doc.setTextColor(150);
  doc.setFontSize(8);
  doc.text("This document is a template and may require legal review before use.", 20, 285);

  doc.save(`service-agreement-${date}.pdf`);
}

export function buildServiceAgreementHtml(data: ServiceAgreementData): string {
  const date = new Date().toLocaleDateString();
  const provider = data.companyName || "Service Provider";
  const contact = [data.companyAddress, data.companyPhone, data.companyEmail].filter(Boolean).join(" · ");

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;">
      <h1 style="text-align:center;color:#1a1a1a;font-size:22px;">Service Agreement</h1>
      <p style="text-align:center;color:#666;font-size:12px;">Date: ${date}</p>
      <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0;" />

      <h3 style="color:#1a1a1a;">1. Parties</h3>
      <p style="color:#333;font-size:13px;"><strong>Provider:</strong> ${provider}</p>
      ${contact ? `<p style="color:#666;font-size:12px;">${contact}</p>` : ""}
      <p style="color:#333;font-size:13px;"><strong>Client:</strong> (to be completed)</p>

      <h3 style="color:#1a1a1a;">2. Scope of Services</h3>
      <table style="width:100%;border-collapse:collapse;margin:8px 0;">
        <tr><td style="padding:6px 0;color:#666;font-size:13px;">Staff Members</td><td style="padding:6px 0;font-weight:600;font-size:13px;">${data.numPeople}</td></tr>
        <tr><td style="padding:6px 0;color:#666;font-size:13px;">Hours per Person</td><td style="padding:6px 0;font-size:13px;">${data.hoursPerPerson}</td></tr>
        <tr><td style="padding:6px 0;color:#666;font-size:13px;">Visits per Week</td><td style="padding:6px 0;font-size:13px;">${data.timesPerWeek}</td></tr>
        <tr><td style="padding:6px 0;color:#666;font-size:13px;">Total Hours/Week</td><td style="padding:6px 0;font-weight:600;font-size:13px;">${data.totalHoursPerWeek.toFixed(1)}</td></tr>
        <tr><td style="padding:6px 0;color:#666;font-size:13px;">Monthly Hours (Est.)</td><td style="padding:6px 0;font-size:13px;">${data.monthlyHours.toFixed(1)}</td></tr>
      </table>

      <h3 style="color:#1a1a1a;">3. Compensation</h3>
      <p style="font-size:13px;color:#333;">Hourly Rate: <strong>€${data.hourlyRate.toFixed(2)}</strong></p>
      <div style="background:#22785a;color:#fff;padding:12px;border-radius:8px;text-align:center;font-size:18px;font-weight:700;">
        Monthly Fee: €${data.totalBill.toFixed(2)}
      </div>
      ${data.billingDate ? `<p style="margin-top:8px;color:#666;font-size:12px;">Payment Terms: ${data.billingDate}</p>` : ""}

      <h3 style="color:#1a1a1a;">4. Term & Termination</h3>
      <p style="font-size:13px;color:#333;">This agreement continues month-to-month. Either party may terminate with 30 days written notice.</p>

      <p style="margin-top:24px;color:#999;font-size:11px;">This document is a template and may require legal review before use.</p>
    </div>
  `;
}
