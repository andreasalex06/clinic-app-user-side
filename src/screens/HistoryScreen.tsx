import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, Navigate } from "react-router-dom";
import { CalendarDays, ReceiptText, Stethoscope, Ticket, X } from "lucide-react";
import { api, getApiErrorMessage } from "../api/client";
import { AppShell } from "../components/AppShell";
import { MidtransPaymentButton } from "../components/MidtransPaymentButton";
import { Alert } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { statusLabels } from "../constants/clinic";
import { formatQueueCode } from "../lib/queue";
import { usePatientAuthStore } from "../stores/patientAuthStore";
import type { Visit } from "../types/clinic";

function formatDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function formatCurrency(value?: number) {
  if (value === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

function formatInvoiceStatus(status?: string) {
  if (status === "PAID") return "Lunas";
  if (status === "UNPAID") return "Belum dibayar";
  return "-";
}

export function HistoryScreen() {
  const token = usePatientAuthStore((state) => state.token);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      const response = await api.get<{ data: Visit[] }>("/public/history");

      setVisits(response.data.data);
      setSelectedVisit((current) => {
        if (!current) {
          return null;
        }

        return response.data.data.find((visit) => visit.id === current.id) ?? current;
      });
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Riwayat kunjungan gagal dimuat."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <h2 className="text-xl font-semibold text-slate-950">Riwayat</h2>
          <p className="text-sm leading-6 text-slate-500">Daftar kunjungan dan status layanan Anda di klinik.</p>
        </CardHeader>
      </Card>
      {error && <Alert tone="error">{error}</Alert>}
      {loading ? (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Memuat riwayat kunjungan...</p>
          </CardContent>
        </Card>
      ) : visits.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {visits.map((visit) => (
            <button
              key={visit.id}
              type="button"
              className="min-w-0 rounded-lg text-left outline-none transition focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
              onClick={() => setSelectedVisit(visit)}
            >
              <Card className="h-full border-slate-200 bg-white shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
              <CardContent className="grid gap-3 p-4">
                <p className="text-xs font-medium text-slate-500">{formatDate(visit.checkInTime)}</p>
                <div>
                  <h3 className="break-words font-semibold text-slate-950">{visit.doctor.name}</h3>
                  <p className="mt-1 break-words text-sm text-slate-500">{visit.visitNumber}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone={visit.status === "COMPLETED" ? "green" : visit.status === "CANCELLED" ? "rose" : "default"}>
                    {statusLabels[visit.status] ?? visit.status}
                  </Badge>
                  {visit.invoice && (
                    <Badge tone={visit.invoice.status === "PAID" ? "green" : "amber"}>
                      Invoice {visit.invoice.status === "PAID" ? "Lunas" : "Belum dibayar"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            </button>
          ))}
        </div>
      ) : (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="grid justify-items-center gap-3 p-5 text-center">
            <h2 className="text-xl font-semibold text-slate-950">Belum ada riwayat</h2>
            <p className="text-sm leading-6 text-slate-500">Kunjungan yang sudah dibuat akan muncul di halaman ini.</p>
            <RouterLink to="/check-in" className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto">
              Daftar Konsultasi
            </RouterLink>
          </CardContent>
        </Card>
      )}

      {selectedVisit && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-slate-950/40 p-0 sm:place-items-center sm:p-4">
          <Card className="max-h-[90svh] w-full overflow-hidden rounded-b-none border-slate-200 bg-white shadow-xl sm:max-w-lg sm:rounded-lg">
            <CardHeader className="border-b border-slate-100">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase text-slate-500">Detail Riwayat</p>
                  <h2 className="mt-1 break-words text-lg font-semibold text-slate-950">{selectedVisit.doctor.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">{selectedVisit.visitNumber}</p>
                </div>
                <Button
                  aria-label="Tutup detail riwayat"
                  className="shrink-0"
                  size="icon"
                  variant="ghost"
                  onClick={() => setSelectedVisit(null)}
                >
                  <X className="size-5" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="max-h-[70svh] overflow-y-auto">
              <div className="grid gap-4">
                <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-md bg-white text-slate-700 ring-1 ring-slate-200">
                      <Ticket className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase text-slate-500">Nomor Antrean</p>
                      <p className="text-base font-semibold tabular-nums text-slate-950">{formatQueueCode(selectedVisit.queueNumber)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone={selectedVisit.status === "COMPLETED" ? "green" : selectedVisit.status === "CANCELLED" ? "rose" : "default"}>
                      {statusLabels[selectedVisit.status] ?? selectedVisit.status}
                    </Badge>
                    {selectedVisit.invoice && (
                      <Badge tone={selectedVisit.invoice.status === "PAID" ? "green" : "amber"}>
                        Invoice {formatInvoiceStatus(selectedVisit.invoice.status)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid gap-3">
                  {[
                    { icon: Stethoscope, label: "Dokter", value: selectedVisit.doctor.name },
                    { icon: CalendarDays, label: "Tanggal Kunjungan", value: formatDate(selectedVisit.checkInTime) },
                    { icon: ReceiptText, label: "Kode Kunjungan", value: selectedVisit.visitNumber }
                  ].map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="flex min-w-0 items-start gap-3">
                        <div className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-slate-100 text-slate-600">
                          <Icon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase text-slate-500">{item.label}</p>
                          <p className="mt-1 break-words text-sm font-semibold text-slate-950">{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedVisit.invoice ? (
                  <div className="grid gap-3 rounded-lg border border-slate-200 p-4">
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500">Invoice</p>
                      <h3 className="mt-1 text-base font-semibold text-slate-950">{selectedVisit.invoice.invoiceNo}</h3>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-medium text-slate-500">Status</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{formatInvoiceStatus(selectedVisit.invoice.status)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500">Total</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950">{formatCurrency(selectedVisit.invoice.total)}</p>
                      </div>
                    </div>
                    {selectedVisit.invoice.status === "UNPAID" && (
                      <MidtransPaymentButton
                        key={selectedVisit.invoice.id}
                        invoiceId={selectedVisit.invoice.id}
                        label="Bayar dengan Midtrans"
                        onPaymentUpdate={loadHistory}
                      />
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-950">Invoice belum tersedia</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">Tagihan akan muncul setelah konsultasi selesai dan invoice dibuat.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
