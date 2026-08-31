import { useEffect, useState } from "react";
import { Link as RouterLink, Navigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../api/client";
import { AppShell } from "../components/AppShell";
import { Alert } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { statusLabels } from "../constants/clinic";
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

export function HistoryScreen() {
  const token = usePatientAuthStore((state) => state.token);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ data: Visit[] }>("/public/history")
      .then((response) => setVisits(response.data.data))
      .catch((err) => setError(getApiErrorMessage(err, "Riwayat kunjungan gagal dimuat.")))
      .finally(() => setLoading(false));
  }, []);

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
            <Card key={visit.id} className="border-slate-200 bg-white shadow-sm">
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
    </AppShell>
  );
}
