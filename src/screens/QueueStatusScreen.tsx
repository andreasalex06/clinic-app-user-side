import { useCallback, useEffect, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { api, getApiErrorMessage } from "../api/client";
import { createPatientSocket } from "../api/socket";
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

  const loadQueueStatus = useCallback(async () => {
    if (!visitId) {
      return;
    }

    try {
      const response = await api.get<{ data: Visit }>(`/public/queue/${visitId}`);

      setVisit(response.data.data);
      setError("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Status antrean gagal dimuat."));
    }
  }, [visitId]);

  useEffect(() => {
    void loadQueueStatus();
  }, [loadQueueStatus]);

  useEffect(() => {
    if (!token) return;

    const socket = createPatientSocket(token);

    socket.on("queue:changed", () => {
      void loadQueueStatus();
    });

    return () => {
      socket.disconnect();
    };
  }, [loadQueueStatus, token, visitId]);

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
