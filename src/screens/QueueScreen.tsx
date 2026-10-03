import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../api/client";
import { createPatientSocket } from "../api/socket";
import { MedicineTrackingStepper } from "../components/MedicineTrackingStepper";
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

    socket.on("queue:changed", (payload: { visitId: string; status?: Visit["status"] }) => {
      if (payload.status === "CANCELLED" && visit?.id === payload.visitId) {
        setVisit((currentVisit) => (
          currentVisit?.id === payload.visitId
            ? { ...currentVisit, status: "CANCELLED", waitingAhead: 0 }
            : currentVisit
        ));
        return;
      }

      void loadActiveQueue();
    });

    return () => {
      socket.disconnect();
    };
  }, [loadActiveQueue, token, visit?.id]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {error && <Alert tone="error">{error}</Alert>}
      {loading ? (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Memuat antrean aktif...</p>
          </CardContent>
        </Card>
      ) : (
        <MedicineTrackingStepper visit={visit} />
      )}
    </>
  );
}
