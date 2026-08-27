import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { api, getApiErrorMessage } from "../api/client";
import { AppShell } from "../components/AppShell";
import { statusLabels } from "../constants/clinic";
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
      {error && <p className="alert">{error}</p>}
      {visit ? (
        <div className="queue-status">
          <p className="eyebrow">Nomor Antrean</p>
          <div className="queue-number">#{visit.queueNumber}</div>
          <h2>{statusLabels[visit.status] ?? visit.status}</h2>
          <p>{visit.waitingAhead && visit.waitingAhead > 0 ? `${visit.waitingAhead} pasien menunggu sebelum Anda.` : "Silakan tunggu panggilan petugas."}</p>
          <div className="summary-list">
            <div>
              <span>Dokter</span>
              <strong>{visit.doctor.name}</strong>
            </div>
            <div>
              <span>Kode kunjungan</span>
              <strong>{visit.visitNumber}</strong>
            </div>
          </div>
          <Link className="secondary-button" to="/check-in">Daftar Konsultasi Lagi</Link>
        </div>
      ) : (
        <p className="loading-text">Memuat status antrean...</p>
      )}
    </AppShell>
  );
}
