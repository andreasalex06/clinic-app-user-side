import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../api/client";
import { AppShell } from "../components/AppShell";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
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
      navigate("/home");
    } catch (err) {
      setError(getApiErrorMessage(err, "Login gagal."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="grid gap-4 text-center">
        <div>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Masuk Pasien</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Gunakan nomor WhatsApp dan password yang sudah didaftarkan.</p>
        </div>
      </div>
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="pt-4 sm:pt-5">
          <form className="grid gap-4" onSubmit={handleSubmit}>
            {error && <Alert tone="error">{error}</Alert>}
            <div className="grid gap-2">
              <Label htmlFor="phone">Nomor WhatsApp</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <p className="text-center text-sm text-slate-500">
        Belum punya akun? <RouterLink className="font-semibold text-slate-950 underline-offset-4 hover:underline" to="/register">Registrasi</RouterLink>
      </p>
    </AppShell>
  );
}
