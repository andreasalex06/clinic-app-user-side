import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CheckCircle2, ChevronLeft, ChevronRight, Search } from "lucide-react";

import { api, getApiErrorMessage } from "../api/client";
import { AppShell } from "../components/AppShell";
import { Alert } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { usePatientAuthStore } from "../stores/patientAuthStore";

import type { Doctor, Visit } from "../types/clinic";

const DOCTORS_PER_PAGE = 4;

export function CheckInScreen() {
  const navigate = useNavigate();

  const token = usePatientAuthStore((state) => state.token);
  const patient = usePatientAuthStore((state) => state.patient);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [doctorPage, setDoctorPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDoctors() {
      try {
        setLoadingDoctors(true);
        setError("");

        const response = await api.get<{ data: Doctor[] }>(
          "/public/doctors"
        );

        const doctorData = response.data.data;

        setDoctors(doctorData);
        setDoctorId("");
      } catch (err) {
        setError(
          getApiErrorMessage(err, "Data dokter gagal dimuat.")
        );
      } finally {
        setLoadingDoctors(false);
      }
    }

    loadDoctors();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!doctorId) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.post<{ data: Visit }>(
        "/public/check-in",
        {
          doctorId,
        }
      );

      navigate(`/queue/${response.data.data.id}`);
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Check-in gagal.")
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const patientInitial =
    patient?.name?.trim().charAt(0).toUpperCase() ?? "P";

  const selectedDoctor = doctors.find(
    (doctor) => doctor.id === doctorId
  );
  const filteredDoctors = doctors.filter((doctor) =>
    `${doctor.name} ${doctor.specialization}`
      .toLowerCase()
      .includes(doctorSearch.trim().toLowerCase())
  );
  const doctorTotalPages = Math.max(
    Math.ceil(filteredDoctors.length / DOCTORS_PER_PAGE),
    1
  );
  const currentDoctorPage = Math.min(doctorPage, doctorTotalPages);
  const paginatedDoctors = filteredDoctors.slice(
    (currentDoctorPage - 1) * DOCTORS_PER_PAGE,
    currentDoctorPage * DOCTORS_PER_PAGE
  );

  function handleDoctorSearch(value: string) {
    setDoctorSearch(value);
    setDoctorPage(1);
  }

  return (
    <AppShell>
      <div className="mx-auto grid w-full max-w-2xl gap-5">
        {/* Patient identity */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex min-h-[104px] items-center gap-4 px-5 py-5 sm:px-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-base font-semibold text-slate-700 ring-1 ring-inset ring-slate-200">
              {patientInitial}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="truncate text-base font-semibold text-slate-950 sm:text-lg">
                {patient?.name ?? "Pasien Klinik"}
              </h2>

              {patient?.phone && (
                <p className="mt-1 truncate text-sm text-slate-500">
                  {patient.phone}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Consultation */}
        <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <CardHeader className="space-y-2 border-b border-slate-100 px-5 py-5 sm:px-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                Daftar Konsultasi
              </h1>
            </div>

            <p className="max-w-lg text-sm leading-6 text-slate-500">
              Pilih dokter yang tersedia untuk mendapatkan nomor antrean
              konsultasi hari ini.
            </p>
          </CardHeader>

          <CardContent className="px-5 py-6 sm:px-6">
            <form
              className="flex flex-col gap-6"
              onSubmit={handleSubmit}
            >
              {error && (
                <Alert tone="error">
                  {error}
                </Alert>
              )}

              {/* Doctor selector */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label
                    htmlFor="doctor-search"
                    className="text-sm font-semibold text-slate-800"
                  >
                    Pilih Dokter
                  </Label>

                  <p className="text-xs leading-5 text-slate-500">
                    Pilih dokter sesuai kebutuhan konsultasi kamu.
                  </p>
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="doctor-search"
                    className="pl-9"
                    value={doctorSearch}
                    onChange={(event) => handleDoctorSearch(event.target.value)}
                    placeholder="Cari nama dokter atau spesialisasi..."
                    disabled={loadingDoctors || doctors.length === 0}
                  />
                </div>

                {loadingDoctors ? (
                  <Card className="border-dashed border-slate-200 bg-slate-50 shadow-none">
                    <CardContent className="p-4">
                      <p className="text-sm text-slate-500">Memuat dokter...</p>
                    </CardContent>
                  </Card>
                ) : paginatedDoctors.length > 0 ? (
                  <div className="grid gap-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {paginatedDoctors.map((doctor) => {
                        const isSelected = doctor.id === doctorId;

                        return (
                          <button
                            key={doctor.id}
                            type="button"
                            className={`flex min-h-[5rem] min-w-0 items-center gap-3 rounded-lg border bg-white p-3 text-left shadow-sm transition sm:p-4 ${
                              isSelected
                                ? "border-slate-950 ring-2 ring-slate-950/10"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                            onClick={() => setDoctorId(doctor.id)}
                          >
                            <div className={`grid size-11 shrink-0 place-items-center rounded-lg font-semibold ${
                              isSelected
                                ? "bg-slate-950 text-white"
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {doctor.name.trim().charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-slate-950">{doctor.name}</p>
                              <p className="truncate text-xs text-slate-500">{doctor.specialization}</p>
                            </div>
                            <Badge className="shrink-0" tone={isSelected ? "slate" : "green"}>
                              {isSelected ? (
                                <>
                                  <CheckCircle2 className="size-3.5" />
                                  Dipilih
                                </>
                              ) : (
                                "Aktif"
                              )}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>

                    {filteredDoctors.length > DOCTORS_PER_PAGE && (
                      <div className="flex items-center justify-center gap-2 border-t border-slate-200 pt-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-9"
                          aria-label="Halaman dokter sebelumnya"
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
                          aria-label="Halaman dokter berikutnya"
                          disabled={currentDoctorPage >= doctorTotalPages}
                          onClick={() => setDoctorPage((page) => Math.min(page + 1, doctorTotalPages))}
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Card className="border-dashed border-slate-200 bg-slate-50 shadow-none">
                    <CardContent className="p-4">
                      <p className="text-sm text-slate-500">Dokter tidak ditemukan.</p>
                    </CardContent>
                  </Card>
                )}

                {selectedDoctor && (
                  <p className="text-xs leading-5 text-slate-500">
                    Dipilih: <span className="font-semibold text-slate-950">{selectedDoctor.name}</span>
                  </p>
                )}
              </div>

              {!loadingDoctors &&
                doctors.length === 0 &&
                !error && (
                  <Alert>
                    Data dokter aktif belum tersedia saat ini.
                  </Alert>
                )}

              <Button
                type="submit"
                disabled={
                  loading ||
                  loadingDoctors ||
                  !doctorId
                }
                className="
                  h-12
                  w-full
                  rounded-md
                  bg-slate-950
                  text-sm
                  font-semibold
                  text-white
                  shadow-sm
                  transition
                  hover:bg-slate-800
                  active:bg-slate-900
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {loading
                  ? "Mengambil nomor..."
                  : "Ambil Nomor Antrean"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
