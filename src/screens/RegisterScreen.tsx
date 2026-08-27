import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../api/client";
import { AppShell } from "../components/AppShell";
import { Field } from "../components/Field";
import { FormCard } from "../components/FormCard";
import { genderOptions } from "../constants/clinic";
import { usePatientAuthStore } from "../stores/patientAuthStore";
import type { Gender, PatientRegisterPayload, SessionResponse } from "../types/clinic";

export function RegisterScreen() {
  const navigate = useNavigate();
  const setSession = usePatientAuthStore((state) => state.setSession);
  const [form, setForm] = useState<PatientRegisterPayload>({
    name: "",
    phone: "",
    password: "",
    gender: "FEMALE" as Gender,
    birthDate: "",
    address: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field: keyof PatientRegisterPayload, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post<{ data: SessionResponse }>("/public/patients/register", form);
      setSession(response.data.data);
      navigate("/check-in");
    } catch (err) {
      setError(getApiErrorMessage(err, "Registrasi gagal."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="page-title">
        <h2>Registrasi Pasien</h2>
        <p>Isi data pasien untuk membuat akun dan melanjutkan check-in.</p>
      </div>
      <FormCard>
        <form className="stack" onSubmit={handleSubmit}>
          {error && <p className="alert">{error}</p>}
          <Field label="Nama lengkap">
            <input value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
          </Field>
          <Field label="Nomor WhatsApp">
            <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required />
          </Field>
          <Field label="Password">
            <input type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} minLength={6} required />
          </Field>
          <div className="two-columns">
            <Field label="Jenis kelamin">
              <select value={form.gender} onChange={(event) => updateField("gender", event.target.value)}>
                {genderOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Tanggal lahir">
              <input type="date" value={form.birthDate} onChange={(event) => updateField("birthDate", event.target.value)} required />
            </Field>
          </div>
          <Field label="Alamat">
            <textarea value={form.address} onChange={(event) => updateField("address", event.target.value)} rows={3} required />
          </Field>
          <button className="primary-button" disabled={loading}>{loading ? "Mendaftarkan..." : "Daftar & Lanjut Check-in"}</button>
        </form>
      </FormCard>
      <p className="footer-link">Sudah punya akun? <Link to="/login">Masuk</Link></p>
    </AppShell>
  );
}
