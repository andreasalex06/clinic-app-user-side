import { useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { api, getApiErrorMessage } from "../api/client";
import { AppShell } from "../components/AppShell";
import { QueueStatusCard } from "../components/QueueStatusCard";
import { Alert } from "../components/ui/alert";
import { usePatientAuthStore } from "../stores/patientAuthStore";
import type { Visit } from "../types/clinic";

export function QueueStatusScreen() {
  const { visitId } = useParams();
  const token = usePatientAuthStore((state) => state.token);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visitId) {
      return;
    }

    api.get<{ data: Visit }>(`/public/queue/${visitId}`)
      .then((response) => setVisit(response.data.data))
      .catch((err) => setError(getApiErrorMessage(err, "Status antrean gagal dimuat.")));
  }, [visitId]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      {error && <Alert tone="error">{error}</Alert>}
      {visit ? (
        <QueueStatusCard visit={visit} />
      ) : (
        <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">Memuat status antrean...</p>
      )}
    </AppShell>
  );
}
