import { formatHourLabel, type Booking } from "./types";

function escapePdfText(input: string): string {
  return input
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/**
 * Generates and downloads a valid PDF 1.4 receipt for a Confirmed StudioSpace booking.
 * Optional Requirement: PDF Booking Invoice Generator.
 */
export function downloadBookingInvoicePdf(booking: Booking) {
  const issuedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  const timeRange = `${formatHourLabel(booking.startHour)} - ${formatHourLabel(booking.endHour)} (${booking.hours} hr${
    booking.hours > 1 ? "s" : ""
  })`;

  const commands: string[] = [
    // Dark header bar
    "0.07 0.06 0.10 rg",
    "0 710 612 82 re f",
    // Brand accent stripe
    "1 0.69 0.18 rg",
    "0 706 612 4 re f",
    // Brand title
    "BT /F2 22 Tf 1 0.69 0.18 rg 48 752 Td (STUDIOSPACE) Tj ET",
    "BT /F1 10 Tf 0.85 0.84 0.88 rg 48 734 Td (Peer-to-Peer Creative Workspace & Production Studio Marketplace) Tj ET",
    `BT /F2 14 Tf 1 1 1 rg 420 752 Td (INVOICE #${escapePdfText(booking.invoiceNumber)}) Tj ET`,
    `BT /F1 10 Tf 0.85 0.84 0.88 rg 420 734 Td (Status: ${escapePdfText(booking.status.toUpperCase())}) Tj ET`,

    // Body text color
    "0.12 0.10 0.15 rg",
    `BT /F2 12 Tf 48 670 Td (Booked By \\(Creator\\)) Tj ET`,
    `BT /F1 10 Tf 48 653 Td (Name: ${escapePdfText(booking.userName)}) Tj ET`,
    `BT /F1 10 Tf 48 638 Td (Email: ${escapePdfText(booking.userEmail)}) Tj ET`,
    `BT /F1 10 Tf 48 623 Td (Project Type: ${escapePdfText(booking.projectType || "Creative Production")}) Tj ET`,
    `BT /F1 10 Tf 48 608 Td (Crew Size: ${booking.guestCount} people) Tj ET`,

    `BT /F2 12 Tf 330 670 Td (Studio Host & Issued Info) Tj ET`,
    `BT /F1 10 Tf 330 653 Td (Host: ${escapePdfText(booking.hostName)}) Tj ET`,
    `BT /F1 10 Tf 330 638 Td (Host Email: ${escapePdfText(booking.hostEmail)}) Tj ET`,
    `BT /F1 10 Tf 330 623 Td (Shoot Date: ${escapePdfText(booking.date)}) Tj ET`,
    `BT /F1 10 Tf 330 608 Td (Issued On: ${escapePdfText(issuedDate)}) Tj ET`,

    // Studio summary box
    "0.96 0.94 0.90 rg",
    "48 518 516 70 re f",
    "0.12 0.10 0.15 rg",
    `BT /F2 13 Tf 62 564 Td (${escapePdfText(booking.studioTitle)}) Tj ET`,
    `BT /F1 10 Tf 62 547 Td (Category: ${escapePdfText(booking.studioCategory)}   |   Location: ${escapePdfText(
      booking.studioLocation
    )}) Tj ET`,
    `BT /F1 10 Tf 62 531 Td (Reserved Slot: ${escapePdfText(booking.date)} @ ${escapePdfText(timeRange)}) Tj ET`,

    // Table Header
    "0.14 0.12 0.19 rg",
    "48 472 516 28 re f",
    "1 1 1 rg",
    "BT /F2 10 Tf 62 482 Td (DESCRIPTION) Tj ET",
    "BT /F2 10 Tf 350 482 Td (RATE / QTY) Tj ET",
    "BT /F2 10 Tf 485 482 Td (AMOUNT) Tj ET",

    // Line items
    "0.12 0.10 0.15 rg",
    `BT /F1 10 Tf 62 446 Td (Studio Rental \\(${escapePdfText(booking.studioCategory)}\\)) Tj ET`,
    `BT /F1 10 Tf 350 446 Td ($${booking.hourlyRate}/hr x ${booking.hours} hr${booking.hours > 1 ? "s" : ""}) Tj ET`,
    `BT /F2 10 Tf 485 446 Td ($${booking.subtotal.toFixed(2)}) Tj ET`,

    "0.88 0.86 0.82 RG 0.7 w 48 434 m 564 434 l S",

    "BT /F1 10 Tf 62 414 Td (Platform Production & Insurance Fee \\(8%\\)) Tj ET",
    "BT /F1 10 Tf 350 414 Td (Standard Coverage) Tj ET",
    `BT /F2 10 Tf 485 414 Td ($${booking.serviceFee.toFixed(2)}) Tj ET`,

    "0.88 0.86 0.82 RG 0.7 w 48 402 m 564 402 l S",

    "BT /F1 10 Tf 62 382 Td (Refundable Studio Security & Gear Deposit) Tj ET",
    "BT /F1 10 Tf 350 382 Td (Held in Escrow) Tj ET",
    `BT /F2 10 Tf 485 382 Td ($${booking.securityDeposit.toFixed(2)}) Tj ET`,

    "0.88 0.86 0.82 RG 1.2 w 48 366 m 564 366 l S",

    // Total highlight bar
    "1 0.69 0.18 rg",
    "330 320 234 34 re f",
    "0.11 0.07 0.01 rg",
    "BT /F2 12 Tf 346 332 Td (TOTAL CONFIRMED) Tj ET",
    `BT /F2 14 Tf 475 332 Td ($${booking.totalAmount.toFixed(2)}) Tj ET`,

    // Footer & Guarantee note
    "0.35 0.33 0.40 rg",
    "BT /F2 10 Tf 48 265 Td (StudioSpace Host Guarantee & Production Pass) Tj ET",
    "BT /F1 9 Tf 48 248 Td (Present this invoice at studio check-in. Includes $1M liability coverage and verified slot protection.) Tj ET",
    `BT /F1 9 Tf 48 233 Td (Booking Reference ID: ${escapePdfText(booking._id)}) Tj ET`,
  ];

  const streamContent = commands.join("\n");
  const objects: string[] = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj",
    `6 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + "\n";
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const blob = new Blob([pdf], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `StudioSpace-Invoice-${booking.invoiceNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

