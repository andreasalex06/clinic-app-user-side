import { Navigate, useNavigate } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { usePatientAuthStore } from "../stores/patientAuthStore";

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

  return (
    <AppShell>
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <h2 className="text-xl font-semibold text-slate-950">Akun</h2>
          <p className="text-sm leading-6 text-slate-500">Data akun pasien yang sedang digunakan.</p>
        </CardHeader>
      </Card>
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="grid gap-4">
            {[
              ["Nama", patient?.name ?? "-"],
              ["Nomor WhatsApp", patient?.phone ?? "-"],
              ["Alamat", patient?.address ?? "-"]
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="break-words font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Button variant="destructive" type="button" onClick={handleLogout}>Keluar Akun</Button>
    </AppShell>
  );
}
