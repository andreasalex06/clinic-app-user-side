import { jsPDF } from "jspdf";
import { autoTable, type UserOptions } from "jspdf-autotable";
import type { Visit } from "../types/clinic";

const money = (value: number) => "Rp " + value.toLocaleString("id-ID");
const date = (value?: string | null) => value ? new Date(value).toLocaleString("id-ID") : "-";

export function createVisitPdf(visit: Visit, kind: "summary" | "invoice") {
  if (kind === "summary" && !visit.consultation) throw new Error("Ringkasan belum tersedia.");
  if (kind === "invoice" && !visit.invoice) throw new Error("Invoice belum tersedia.");
  const doc = new jsPDF();
  const title = kind === "summary" ? "Ringkasan Konsultasi" : "Invoice";
  let y = 42;
  function table(options: UserOptions) {
    autoTable(doc, {
      startY: y, margin: { top: 42, bottom: 20, left: 16, right: 16 },
      styles: { font: "helvetica", fontSize: 10, cellPadding: 3, overflow: "linebreak", textColor: [30, 41, 59] },
      headStyles: { fillColor: [15, 118, 110], textColor: [255, 255, 255] },
      theme: "striped",
      rowPageBreak: "avoid",
      ...options
    });
    y = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 7;
  }
  table({
    theme: "plain",
    columnStyles: { 0: { cellWidth: 40, textColor: [100, 116, 139] } },
    body: [
      ["Pasien", visit.patient.name],
      ["Dokter", visit.doctor.name],
      ["Kunjungan", visit.visitNumber],
      ["Tanggal", date(visit.checkInTime)]
    ]
  });
  if (kind === "summary" && visit.consultation) {
    const c = visit.consultation;
    table({
      head: [["Pemeriksaan", "Ringkasan"]],
      columnStyles: { 0: { cellWidth: 40 } },
      body: [
        ["Keluhan", c.complaint || "-"],
        ["Diagnosis", c.diagnosis.name + " (" + c.diagnosis.code + ")"],
        ["Tindakan", c.treatments.map((item) => item.treatment.name).join("\n") || "-"],
        ["Catatan Dokter", c.notes || "-"]
      ]
    });
    table({
      head: [["Obat", "Jumlah", "Aturan Pakai"]],
      columnStyles: { 0: { cellWidth: 65 }, 1: { cellWidth: 20, halign: "center" } },
      body: c.medicines.length ? c.medicines.map((item) => [item.medicine.name, item.quantity, item.instructions || "-"]) : [["Tidak ada obat yang diresepkan.", "-", "-"]]
    });
  }
  if (kind === "invoice" && visit.invoice) {
    const invoice = visit.invoice;
    table({
      theme: "plain",
      columnStyles: { 0: { cellWidth: 40 } },
      body: [["Nomor Invoice", invoice.invoiceNo], ["Status", invoice.status === "PAID" ? "LUNAS" : "BELUM LUNAS"]]
    });
    table({
      head: [["Rincian", "Jumlah", "Harga", "Subtotal"]],
      columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 18, halign: "center" }, 2: { cellWidth: 45, halign: "right" }, 3: { halign: "right" } },
      body: invoice.items?.length ? invoice.items.map((item) => [item.item, item.quantity, money(item.price), money(item.amount)]) : [["Rincian belum tersedia", "-", "-", "-"]],
      foot: [[{ content: "Total", colSpan: 3 }, money(invoice.total)]],
      footStyles: { fillColor: [240, 253, 250], textColor: [15, 118, 110], halign: "right" },
      showFoot: "lastPage"
    });
    table({
      theme: "plain", columnStyles: { 0: { cellWidth: 45 } },
      body: [["Metode Pembayaran", invoice.midtransPaymentType?.replaceAll("_", " ") || "Belum tercatat"], ["Waktu Pembayaran", date(invoice.paidAt)]]
    });
  }
  const pages = doc.getNumberOfPages();
  for (let page = 1; page <= pages; page++) {
    doc.setPage(page);
    doc.setTextColor(15, 118, 110).setFont("helvetica", "bold").setFontSize(16).text("Sarana Medika", 16, 19);
    doc.setTextColor(30, 41, 59).setFontSize(12).text(title, 16, 28);
    doc.setDrawColor(203, 213, 225).line(16, 34, 194, 34);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(100, 116, 139);
    doc.text("Dokumen pribadi pasien", 16, 286);
    doc.text("Halaman " + page + " / " + pages, 194, 286, { align: "right" });
  }
  return doc;
}

export function downloadVisitPdf(visit: Visit, kind: "summary" | "invoice") {
  const identifier = (kind === "invoice" ? visit.invoice?.invoiceNo : visit.visitNumber) ?? visit.id;
  createVisitPdf(visit, kind).save(`${kind === "invoice" ? "Invoice" : "Ringkasan"}-${identifier.replace(/[^a-zA-Z0-9_-]/g, "-")}.pdf`);
}
