import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { api, getApiErrorMessage } from "../api/client";
import { Alert } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
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
      navigate("/home");
    } catch (err) {
      setError(getApiErrorMessage(err, "Registrasi gagal."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="grid gap-5">
        <header className="text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
            <img src="/logo.png" alt="" width={48} height={48} className="size-full object-contain" />
          </div>
          <p className="mt-3 text-sm font-semibold text-teal-800">Sarana Medika</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-950">Buat Akun Pasien</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Lengkapi data berikut untuk mendaftar dan lanjut check-in.</p>
        </header>
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-0">
            <h2 className="text-base font-semibold text-slate-950">Data pasien</h2>
            <p className="text-sm leading-5 text-slate-600">Isi sesuai identitas dan kontak yang bisa dihubungi.</p>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={handleSubmit}>
            {error && <Alert tone="error">{error}</Alert>}
            <div className="grid gap-2">
              <Label htmlFor="name">Nama lengkap</Label>
              <Input id="name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Nomor WhatsApp</Label>
              <Input id="phone" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} minLength={6} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="gender">Jenis kelamin</Label>
                <Select id="gender" value={form.gender} onChange={(event) => updateField("gender", event.target.value)}>
                  {genderOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="birthDate">Tanggal lahir</Label>
                <Input id="birthDate" type="date" value={form.birthDate} onChange={(event) => updateField("birthDate", event.target.value)} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Alamat</Label>
              <Textarea id="address" value={form.address} onChange={(event) => updateField("address", event.target.value)} required />
            </div>
            <Button className="mt-1 w-full bg-teal-700 hover:bg-teal-800 focus-visible:ring-teal-600" type="submit" disabled={loading}>
              {loading ? "Mendaftarkan..." : "Daftar & Lanjut Check-in"}
            </Button>
            </form>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-slate-600">
          Sudah punya akun? <RouterLink className="font-semibold text-teal-800 underline-offset-4 hover:underline" to="/login">Masuk</RouterLink>
        </p>
      </div>
    </>
  );
}
