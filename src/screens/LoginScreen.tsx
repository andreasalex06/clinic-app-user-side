import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../api/client";
import { AppShell } from "../components/AppShell";
import { Field } from "../components/Field";
import { FormCard } from "../components/FormCard";
import { usePatientAuthStore } from "../stores/patientAuthStore";
import type { PatientLoginPayload, SessionResponse } from "../types/clinic";

export function LoginScreen() {
  const navigate = useNavigate();
  const setSession = usePatientAuthStore((state) => state.setSession);
  const [form, setForm] = useState<PatientLoginPayload>({ phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post<{ data: SessionResponse }>("/public/patients/login", form);
      setSession(response.data.data);
      navigate("/check-in");
    } catch (err) {
      setError(getApiErrorMessage(err, "Login gagal."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="page-title">
        <h2>Masuk Pasien</h2>
        <p>Gunakan nomor WhatsApp dan password yang sudah didaftarkan.</p>
      </div>
      <FormCard>
        <form className="stack" onSubmit={handleSubmit}>
          {error && <p className="alert">{error}</p>}
          <Field label="Nomor WhatsApp">
            <input value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} required />
          </Field>
          <Field label="Password">
            <input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required />
          </Field>
          <button className="primary-button" disabled={loading}>{loading ? "Memproses..." : "Masuk"}</button>
        </form>
      </FormCard>
      <p className="footer-link">Belum punya akun? <Link to="/register">Registrasi</Link></p>
    </AppShell>
  );
}
