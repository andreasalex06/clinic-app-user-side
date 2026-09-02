import { useEffect, useState } from "react";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, LogOut, Search, Timer } from "lucide-react";
import { api } from "../api/client";
import { AppShell } from "../components/AppShell";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { formatQueueCode } from "../lib/queue";
import { usePatientAuthStore } from "../stores/patientAuthStore";
import type { Doctor, Visit } from "../types/clinic";

const DOCTORS_PER_PAGE = 4;

function getInitial(name?: string) {
  return name?.charAt(0).toUpperCase() ?? "P";
}

function getDoctorAvatarUrl(doctor?: Doctor) {
  return doctor?.avatarUrl || "";
}

function isDoctorActive(doctor: Doctor) {
  if (typeof doctor.isActive === "boolean") {
    return doctor.isActive;
  }

  if (doctor.status) {
    return doctor.status === "ACTIVE";
  }

  return true;
}

function formatVisitDate(visit: Visit) {
  const value = visit.checkInTime ?? visit.queueDate;

  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function formatVisitTime(visit: Visit) {
  const value = visit.checkInTime ?? visit.queueDate;

  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function HomeScreen() {
  const navigate = useNavigate();
  const token = usePatientAuthStore((state) => state.token);
  const patient = usePatientAuthStore((state) => state.patient);
  const logout = usePatientAuthStore((state) => state.logout);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeVisit, setActiveVisit] = useState<Visit | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [doctorPage, setDoctorPage] = useState(1);

  useEffect(() => {
    if (!token) {
      return;
    }

    void api.get<{ data: Doctor[] }>("/public/doctors")
      .then((response) => setDoctors(response.data.data))
      .catch(() => setDoctors([]));
    void api.get<{ data: Visit | null }>("/public/queue/active")
      .then((response) => setActiveVisit(response.data.data))
      .catch(() => setActiveVisit(null));
  }, [token]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setDoctorPage(1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [searchInput]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const activeDoctors = doctors.filter(isDoctorActive);
  const shownDoctors = activeDoctors.filter((doctor) =>
    `${doctor.name} ${doctor.specialization}`.toLowerCase().includes(debouncedSearch.toLowerCase())
  );
  const doctorTotalPages = Math.max(Math.ceil(shownDoctors.length / DOCTORS_PER_PAGE), 1);
  const currentDoctorPage = Math.min(doctorPage, doctorTotalPages);
  const paginatedDoctors = shownDoctors.slice(
    (currentDoctorPage - 1) * DOCTORS_PER_PAGE,
    currentDoctorPage * DOCTORS_PER_PAGE
  );
  const isSearching = searchInput.trim() !== debouncedSearch;

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <AppShell>
      <section className="grid w-full max-w-full gap-4 overflow-hidden md:pt-1 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,0.72fr)] lg:items-start lg:gap-5 lg:overflow-visible lg:pt-2 xl:grid-cols-[minmax(0,1fr)_minmax(23rem,0.68fr)]">
        <div className="grid min-w-0 max-w-full gap-4 lg:pt-1">
          <Card className="min-w-0 max-w-full border-slate-200 bg-white shadow-sm">
            <CardContent className="flex min-w-0 items-center justify-between gap-3 p-4 sm:p-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-slate-950 text-base font-semibold text-white">
                  {getInitial(patient?.name)}
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-lg font-semibold text-slate-950">Halo, {patient?.name ?? "Pasien"}</h1>
                  <p className="text-sm text-slate-500">Selamat datang kembali</p>
                </div>
              </div>
              <Button size="icon" variant="outline" aria-label="Keluar akun" onClick={handleLogout}>
                <LogOut className="size-5" />
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="visit-panel min-w-0 max-w-full overflow-hidden border-slate-800 text-white lg:row-span-2 lg:self-start">
          <CardContent className="grid gap-4 p-4 sm:p-5">
            <h2 className="text-base font-semibold">Kunjungan Aktif</h2>
            {activeVisit ? (
              <>
                <div className="flex min-w-0 items-center gap-3">
                  {getDoctorAvatarUrl(activeVisit.doctor) ? (
                    <img
                      className="size-12 shrink-0 rounded-lg bg-white object-cover"
                      src={getDoctorAvatarUrl(activeVisit.doctor)}
                      alt=""
                    />
                  ) : (
                    <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-white text-base font-semibold text-slate-950">
                      {getInitial(activeVisit.doctor.name)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold">{activeVisit.doctor.name}</h3>
                    <p className="truncate text-sm text-white/75">{activeVisit.doctor.specialization}</p>
                  </div>
                </div>
                <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] gap-2">
                  <div className="flex min-w-0 gap-2 rounded-lg border border-white/15 bg-white/10 p-3">
                    <CalendarDays className="size-5 shrink-0 text-teal-200" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white/65">Tanggal</p>
                      <p className="break-words text-sm font-semibold">{formatVisitDate(activeVisit)}</p>
                    </div>
                  </div>
                  <div className="flex min-w-0 gap-2 rounded-lg border border-white/15 bg-white/10 p-3">
                    <Timer className="size-5 shrink-0 text-teal-200" />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white/65">Jam</p>
                      <p className="break-words text-sm font-semibold">{formatVisitTime(activeVisit)}</p>
                    </div>
                  </div>
                </div>
                <div className="grid justify-items-center rounded-lg border border-white/10 bg-white p-4 text-center shadow-sm">
                  <p className="text-xs font-medium text-slate-500">Nomor Antrean</p>
                  <p className="mt-1 text-5xl font-semibold leading-none text-teal-700">{formatQueueCode(activeVisit.queueNumber)}</p>
                </div>
              </>
            ) : (
              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Belum ada antrean aktif</h3>
                  <p className="mt-1 text-sm leading-6 text-white/75">Daftar konsultasi untuk mengambil nomor antrean hari ini.</p>
                </div>
                <RouterLink to="/check-in" className="inline-flex h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-slate-100">
                  Daftar Konsultasi
                </RouterLink>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full max-w-full overflow-hidden border-slate-200 bg-white shadow-sm lg:col-start-1 lg:row-start-2 lg:mt-0">
          <CardContent className="grid gap-3 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-950">Dokter Tersedia</h2>
              <Badge>{shownDoctors.length} dokter</Badge>
            </div>
            <div className="relative min-w-0 max-w-full">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-teal-700" />
              <Input
                className="pl-10"
                placeholder="Cari dokter atau layanan..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            {isSearching && (
              <p className="text-xs font-medium text-slate-500">Mencari setelah 1 detik...</p>
            )}
            <div className="grid min-w-0 max-w-full gap-3 md:grid-cols-2">
              {paginatedDoctors.map((doctor) => (
                <Card key={doctor.id} className="min-h-[5rem] min-w-0 max-w-full border-slate-200 bg-white shadow-sm">
                  <CardContent className="flex min-h-[5rem] min-w-0 items-center gap-3 p-3 sm:p-4">
                    {getDoctorAvatarUrl(doctor) ? (
                      <img
                        className="size-11 shrink-0 rounded-lg bg-teal-50 object-cover"
                        src={getDoctorAvatarUrl(doctor)}
                        alt=""
                      />
                    ) : (
                      <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-slate-100 font-semibold text-slate-700">
                        {getInitial(doctor.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-950">{doctor.name}</p>
                      <p className="truncate text-xs text-slate-500">{doctor.specialization}</p>
                    </div>
                    <Badge tone="green">
                      <CheckCircle2 className="size-3.5" />
                      Aktif
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
            {shownDoctors.length > DOCTORS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 border-t border-slate-200 pt-3">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  aria-label="Halaman sebelumnya"
                  disabled={currentDoctorPage <= 1}
                  onClick={() => setDoctorPage((page) => Math.max(page - 1, 1))}
                >
                  <ChevronLeft className="size-4" />
                </Button>
                {Array.from({ length: doctorTotalPages }, (_, index) => {
                  const page = index + 1;

                  return (
                    <button
                      key={page}
                      type="button"
                      className={`grid size-9 place-items-center rounded-md border text-sm font-semibold transition ${
                        page === currentDoctorPage
                          ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                      aria-current={page === currentDoctorPage ? "page" : undefined}
                      onClick={() => setDoctorPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9"
                  aria-label="Halaman berikutnya"
                  disabled={currentDoctorPage >= doctorTotalPages}
                  onClick={() => setDoctorPage((page) => Math.min(page + 1, doctorTotalPages))}
                >
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            )}
            {shownDoctors.length === 0 && (
              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-4">
                  <p className="text-sm text-slate-500">
                    {activeDoctors.length === 0 ? "Data dokter aktif belum tersedia." : "Dokter tidak ditemukan."}
                  </p>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
