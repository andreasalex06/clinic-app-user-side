import assert from "node:assert/strict";
import { createVisitPdf } from "../src/lib/visitPdf.ts";

const visit = {
  id: "test-visit", visitNumber: "VIS-TEST-001", checkInTime: "2026-09-08T08:00:00+07:00",
  patient: { name: "Pasien Uji" }, doctor: { name: "Dokter Uji" },
  consultation: {
    complaint: "Keluhan untuk pengujian.", notes: "Catatan panjang untuk memeriksa pemisahan halaman. ".repeat(150),
    diagnosis: { name: "Diagnosis Uji", code: "TEST" },
    treatments: [{ treatment: { name: "Konsultasi" } }],
    medicines: Array.from({ length: 40 }, (_, i) => ({ id: String(i), medicine: { name: "Obat Uji " + i }, quantity: 2, instructions: "Sesuai petunjuk dokter." }))
  },
  invoice: {
    invoiceNo: "INV-TEST-001", status: "UNPAID", total: 800000, paidAt: null,
    items: Array.from({ length: 40 }, (_, i) => ({ id: String(i), item: "Obat Uji " + i, quantity: 2, price: 10000, amount: 20000 }))
  }
};

for (const kind of ["summary", "invoice"]) {
  const pdf = createVisitPdf(visit, kind);
  assert.ok(pdf.getNumberOfPages() > 1, kind + " must paginate");
  const output = pdf.output();
  assert.ok(output.startsWith("%PDF-"));
  assert.ok(output.includes("Pasien Uji"));
  assert.ok(output.includes(kind === "invoice" ? "BELUM LUNAS" : "Diagnosis Uji"));
  if (kind === "invoice") {
    assert.ok(output.includes("800.000"));
    assert.ok(!output.includes("Diagnosis Uji"), "Invoice must not contain clinical details");
  }
  console.log(kind + ": generated " + pdf.getNumberOfPages() + " pages");
}
assert.throws(() => createVisitPdf({ ...visit, consultation: null }, "summary"));
assert.throws(() => createVisitPdf({ ...visit, invoice: null }, "invoice"));
console.log("PDF tests passed");
