import { Navigate, useNavigate } from "react-router-dom";
import { CalendarDays, LogOut, MapPin, Phone, UserRound } from "lucide-react";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { genderOptions } from "../constants/clinic";
import { usePatientAuthStore } from "../stores/patientAuthStore";

function formatBirthDate(value?: string) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

export function AccountScreen() {
  const navigate = useNavigate();
  const token = usePatientAuthStore((state) => state.token);
  const patient = usePatientAuthStore((state) => state.patient);
  const logout = usePatientAuthStore((state) => state.logout);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  const patientInitial = patient?.name?.trim().charAt(0).toUpperCase() ?? "P";
  const genderLabel =
    genderOptions.find((option) => option.value === patient?.gender)?.label ?? "-";
  const profileItems = [
    { label: "Nomor WhatsApp", value: patient?.phone ?? "-", icon: Phone },
    { label: "Jenis Kelamin", value: genderLabel, icon: UserRound },
    { label: "Tanggal Lahir", value: formatBirthDate(patient?.birthDate), icon: CalendarDays },
    { label: "Alamat", value: patient?.address ?? "-", icon: MapPin }
  ];

  return (
    <AppShell>
      <Card className="overflow-hidden border-slate-200 bg-white shadow-sm">
        <CardContent className="p-0">
          <div className="bg-slate-950 px-5 py-6 text-white">
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-white/10 text-xl font-semibold ring-1 ring-white/15">
                {patientInitial}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase text-white/60">Profil Pasien</p>
                <h1 className="mt-1 break-words text-xl font-semibold leading-tight">{patient?.name ?? "Pasien Klinik"}</h1>
                <p className="mt-1 break-words text-sm text-white/70">{patient?.phone ?? "Nomor belum tersedia"}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-5">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Informasi Akun</h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">Data identitas yang dipakai untuk layanan pasien.</p>
            </div>

            <div className="grid gap-3">
              {profileItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div key={item.label} className="flex min-w-0 items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <div className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md bg-white text-slate-600 ring-1 ring-slate-200">
                      <Icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase text-slate-500">{item.label}</p>
                      <p className="mt-1 break-words text-sm font-semibold text-slate-950">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-100 pt-4">
              <Button className="w-full justify-center sm:w-auto" variant="destructive" type="button" onClick={handleLogout}>
                <LogOut className="size-4" />
                Keluar Akun
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
