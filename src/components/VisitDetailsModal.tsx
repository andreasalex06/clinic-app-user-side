import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LuDownload, LuLoaderCircle, LuX } from "react-icons/lu";
import { api, getApiErrorMessage } from "../api/client";
import { usePatientSocket } from "./PatientSocketProvider";
import { MidtransPaymentButton } from "./MidtransPaymentButton";
import { Alert } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import type { Visit } from "../types/clinic";

const money = (value: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value);
const date = (value?: string | null) => value ? new Date(value).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" }) : "-";

export function VisitDetailsModal({ visitId, onClose }: { visitId: string; onClose: () => void }) {
  const [visit, setVisit] = useState<Visit | null>(null);
  const [tab, setTab] = useState<"summary" | "invoice">("summary");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const downloadLock = useRef(false);
  async function download() {
    if (!visit || downloadLock.current) return;
    downloadLock.current = true;
    setDownloading(true);
    setDownloadError("");
    try {
      const { downloadVisitPdf } = await import("../lib/visitPdf");
      downloadVisitPdf(visit, tab);
    } catch {
      setDownloadError("PDF gagal dibuat. Silakan coba lagi.");
    } finally {
      downloadLock.current = false;
      setDownloading(false);
    }
  }
  const dialog = useRef<HTMLDialogElement>(null);
  const socket = usePatientSocket();
  const version = useRef(0);
  const refresh = useCallback(async () => {
    const request = ++version.current;
    try {
      const response = await api.get<{ data: Visit[] }>("/public/history");
      if (request !== version.current) return;
      const match = response.data.data.find((item) => item.id === visitId);
      setVisit(match ?? null);
      setError(match ? "" : "Kunjungan tidak ditemukan.");
    } catch (err) {
      if (request === version.current) setError(getApiErrorMessage(err, "Detail gagal dimuat."));
    } finally {
      if (request === version.current) setLoading(false);
    }
  }, [visitId]);

  useEffect(() => {
    dialog.current?.showModal();
    void refresh();
    return () => { version.current++; };
  }, [refresh]);

  useEffect(() => {
    if (!socket) return;
    const reload = () => { void refresh(); };
    socket.on("pharmacy:changed", reload);
    socket.on("queue:changed", reload);
    socket.on("connect", reload);
    return () => {
      socket.off("pharmacy:changed", reload);
      socket.off("queue:changed", reload);
      socket.off("connect", reload);
    };
  }, [socket, refresh]);

  const consultation = visit?.consultation;
  const invoice = visit?.invoice;
  return createPortal(
    <dialog ref={dialog} aria-labelledby="visit-detail-title" onCancel={onClose} className="fixed inset-0 m-auto max-h-[90svh] w-[calc(100%_-_2rem)] max-w-2xl overflow-hidden rounded-lg border border-slate-200 bg-white p-0 text-slate-950 shadow-xl backdrop:bg-black/40 open:flex open:flex-col">
      <header className="flex shrink-0 items-start justify-between gap-3 border-b border-slate-100 bg-teal-50 p-5">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-medium uppercase text-teal-700">Sarana Medika</p>
          <h2 id="visit-detail-title" className="text-lg font-semibold">Detail Kunjungan</h2>
          <p className="break-words text-xs text-slate-500">{visit?.visitNumber}</p>
        </div>
        <Button autoFocus size="icon" variant="ghost" aria-label="Tutup detail kunjungan" onClick={onClose}><LuX className="size-5" /></Button>
      </header>
      <div className="grid shrink-0 grid-cols-2 border-b border-slate-200" role="tablist" aria-label="Detail kunjungan">
        {(["summary", "invoice"] as const).map((value) => (
          <button key={value} id={`visit-tab-${value}`} role="tab" aria-controls="visit-panel" aria-selected={tab === value} tabIndex={tab === value ? 0 : -1}
            onClick={() => setTab(value)}
            onKeyDown={(event) => {
              if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
                event.preventDefault();
                const next = event.key === "Home" ? "summary" : event.key === "End" ? "invoice" : value === "summary" ? "invoice" : "summary";
                setTab(next);
                document.getElementById(`visit-tab-${next}`)?.focus();
              }
            }}
            className={`min-h-11 border-b-2 px-2 py-3 text-sm font-medium ${tab === value ? "border-teal-700 text-teal-800" : "border-transparent text-slate-500"}`}>
            {value === "summary" ? "Ringkasan Konsultasi" : "Invoice"}
          </button>
        ))}
      </div>
      <div id="visit-panel" role="tabpanel" aria-labelledby={`visit-tab-${tab}`} tabIndex={0} className="grid min-h-0 gap-5 overflow-y-auto overscroll-contain p-5">
        {loading && <p role="status" className="text-sm text-slate-500">Memuat detail...</p>}
        {error && <Alert tone="error">{error}<button onClick={() => void refresh()} className="ml-2 underline">Coba lagi</button></Alert>}
        {visit && <>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-xs text-slate-500">Pasien</dt><dd className="mt-1 break-words font-medium">{visit.patient.name}</dd></div>
            <div><dt className="text-xs text-slate-500">Dokter</dt><dd>{visit.doctor.name}</dd></div>
            <div><dt className="text-xs text-slate-500">Tanggal Kunjungan</dt><dd>{date(visit.checkInTime)}</dd></div>
          </dl>
          {tab === "summary" ? consultation ? (
            <div className="grid gap-5 border-t border-slate-200 pt-4">
              {[
                ["Keluhan", consultation.complaint],
                ["Diagnosis", `${consultation.diagnosis.name} (${consultation.diagnosis.code})`],
                ["Tindakan", consultation.treatments.map((item) => item.treatment.name).join(", ")],
                ["Catatan Dokter", consultation.notes]
              ].map(([label, value]) => <div key={label}><h3 className="text-sm font-semibold">{label}</h3><p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">{value || "-"}</p></div>)}
              <section><h3 className="text-sm font-semibold">Resep Obat</h3>
                {consultation.medicines.length ? <ul className="divide-y divide-slate-100">{consultation.medicines.map((item) => <li key={item.id} className="py-3 text-sm"><p className="break-words font-medium">{item.medicine.name} x{item.quantity}</p><p className="mt-1 whitespace-pre-wrap break-words text-slate-600">{item.instructions || "Aturan pakai belum tercatat."}</p></li>)}</ul> : <p className="mt-1 text-sm text-slate-500">Tidak ada obat yang diresepkan.</p>}
              </section>
            </div>
          ) : <p className="text-sm text-slate-500">Ringkasan konsultasi belum tersedia.</p> : invoice ? (
            <section className="grid gap-4 border-t border-slate-100 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><h3 className="text-base font-semibold">Sarana Medika</h3><p className="break-all text-xs text-slate-500">{invoice.invoiceNo}</p></div><Badge tone={invoice.status === "PAID" ? "green" : "amber"}>{invoice.status === "PAID" ? "Lunas" : "Belum Lunas"}</Badge></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <caption className="sr-only">Rincian biaya kunjungan</caption>
                  <thead className="border-y border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><th scope="col" className="p-2 font-medium">Rincian</th><th scope="col" className="p-2 text-center font-medium">Qty</th><th scope="col" className="p-2 text-right font-medium">Harga</th><th scope="col" className="p-2 text-right font-medium">Subtotal</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">{invoice.items?.map((item) => <tr key={item.id}><td className="min-w-24 break-words p-2">{item.item}</td><td className="p-2 text-center tabular-nums">{item.quantity}</td><td className="whitespace-nowrap p-2 text-right tabular-nums">{money(item.price)}</td><td className="whitespace-nowrap p-2 text-right font-medium tabular-nums">{money(item.amount)}</td></tr>)}</tbody>
                </table>
              </div>
              {!invoice.items?.length && <p className="text-sm text-slate-500">Rincian biaya belum tersedia.</p>}
              <div className="flex flex-wrap justify-between gap-3 border-y border-teal-100 bg-teal-50 p-3 text-lg font-semibold text-teal-900"><span>Total</span><span>{money(invoice.total)}</span></div>
              <dl className="grid gap-2 text-sm"><div><dt className="text-xs text-slate-500">Metode Pembayaran</dt><dd>{invoice.midtransPaymentType?.replaceAll("_", " ") || "Belum tercatat"}</dd></div><div><dt className="text-xs text-slate-500">Waktu Pembayaran</dt><dd>{date(invoice.paidAt)}</dd></div></dl>
              {invoice.status === "UNPAID" && <MidtransPaymentButton invoiceId={invoice.id} onPaymentStart={() => dialog.current?.close()} onPaymentFinish={() => dialog.current?.showModal()} onPaymentUpdate={refresh} />}
            </section>
          ) : <p className="text-sm text-slate-500">Invoice belum tersedia.</p>}
        </>}
      </div>
      <footer className="grid shrink-0 gap-2 border-t border-slate-200 bg-white p-4">
        {downloadError && <Alert tone="error">{downloadError}</Alert>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Tutup</Button>
          <Button className="bg-teal-700 hover:bg-teal-800" disabled={loading || !!error || downloading || !(tab === "summary" ? consultation : invoice)} aria-busy={downloading} onClick={() => void download()}>
            {downloading ? <LuLoaderCircle className="size-4 animate-spin" /> : <LuDownload className="size-4" />}
            {downloading ? "Membuat PDF..." : tab === "summary" ? "Unduh Ringkasan PDF" : "Unduh Invoice PDF"}
          </Button>
        </div>
      </footer>
    </dialog>, document.body
  );
}
