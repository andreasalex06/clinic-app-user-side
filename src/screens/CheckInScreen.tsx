import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../api/client";
import { AppShell } from "../components/AppShell";
import { Field } from "../components/Field";
import { FormCard } from "../components/FormCard";
import { usePatientAuthStore } from "../stores/patientAuthStore";
import type { Doctor, Visit } from "../types/clinic";

export function CheckInScreen() {
  const navigate = useNavigate();
  const token = usePatientAuthStore((state) => state.token);
  const patient = usePatientAuthStore((state) => state.patient);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<{ data: Doctor[] }>("/public/doctors")
      .then((response) => {
        setDoctors(response.data.data);
        setDoctorId(response.data.data[0]?.id ?? "");
      })
      .catch((err) => setError(getApiErrorMessage(err, "Data dokter gagal dimuat.")));
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post<{ data: Visit }>("/public/check-in", { doctorId });
      navigate(`/queue/${response.data.data.id}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Check-in gagal."));
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppShell>
      <div className="patient-card">
        <span>Pasien</span>
        <strong>{patient?.name ?? "Pasien Klinik"}</strong>
        <small>{patient?.phone}</small>
      </div>
      <div className="page-title">
        <h2>Daftar Konsultasi</h2>
        <p>Pilih dokter yang tersedia untuk masuk antrean hari ini.</p>
      </div>
      <FormCard>
        <form className="stack" onSubmit={handleSubmit}>
          {error && <p className="alert">{error}</p>}
          <Field label="Dokter">
            <select value={doctorId} onChange={(event) => setDoctorId(event.target.value)} required>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.name} - {doctor.specialization}
                </option>
              ))}
            </select>
          </Field>
          <button className="primary-button" disabled={loading || !doctorId}>{loading ? "Mengambil nomor..." : "Ambil Nomor Antrean"}</button>
        </form>
      </FormCard>
    </AppShell>
  );
}
