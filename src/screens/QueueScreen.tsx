import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink, Navigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../api/client";
import { createPatientSocket } from "../api/socket";
import { AppShell } from "../components/AppShell";
import { MedicineTrackingStepper } from "../components/MedicineTrackingStepper";
import { QueueStatusCard } from "../components/QueueStatusCard";
import { Alert } from "../components/ui/alert";
import { Card, CardContent } from "../components/ui/card";
import { usePatientAuthStore } from "../stores/patientAuthStore";
import type { Visit } from "../types/clinic";

export function QueueScreen() {
  const token = usePatientAuthStore((state) => state.token);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadActiveQueue = useCallback(async () => {
    try {
      const response = await api.get<{ data: Visit | null }>("/public/queue/active");

      setVisit(response.data.data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Antrean aktif gagal dimuat."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadActiveQueue();
  }, [loadActiveQueue]);

  useEffect(() => {
    if (!token) return;

    const socket = createPatientSocket(token);

    socket.on("queue:changed", () => {
      void loadActiveQueue();
    });

    socket.on("pharmacy:changed", () => {
      void loadActiveQueue();
    });

    return () => {
      socket.disconnect();
    };
  }, [loadActiveQueue, token]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      {error && <Alert tone="error">{error}</Alert>}
      {loading ? (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Memuat antrean aktif...</p>
          </CardContent>
        </Card>
      ) : visit ? (
        <>
          <QueueStatusCard visit={visit} />
          <MedicineTrackingStepper />
        </>
      ) : (
        <>
          <MedicineTrackingStepper />
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="grid justify-items-center gap-3 p-5 text-center">
              <h2 className="text-xl font-semibold text-slate-950">Belum ada antrean aktif</h2>
              <p className="text-sm leading-6 text-slate-500">Ambil nomor antrean konsultasi saat Anda sudah siap bertemu dokter.</p>
              <RouterLink to="/check-in" className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800 sm:w-auto">
                Daftar Konsultasi
              </RouterLink>
            </CardContent>
          </Card>
        </>
      )}
    </AppShell>
  );
}
