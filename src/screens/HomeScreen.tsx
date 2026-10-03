import { useCallback, useEffect, useRef, useState } from "react";
import { formatSpecialization } from "../lib/doctor";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { LuChevronLeft, LuChevronRight, LuSearch, LuStethoscope } from "react-icons/lu";
import { usePatientSocket } from "../components/PatientSocketProvider";
import { Alert } from "../components/ui/alert";
import { api, getApiErrorMessage } from "../api/client";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { MedicineTrackingStepper } from "../components/MedicineTrackingStepper";
import { PatientHero } from "../components/PatientHero";
import { usePatientAuthStore } from "../stores/patientAuthStore";
import type { Doctor, Visit } from "../types/clinic";

const DOCTORS_PER_PAGE = 4;

function getInitial(name?: string) {
  return name?.charAt(0).toUpperCase() ?? "P";
}

function getDisplayDoctorName(name: string) {
  return name.replace(/\s+Sp\..*$/i, "").trim();
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

export function HomeScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const socket = usePatientSocket();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const submissionRef = useRef(false);
  const handledAssistantState = useRef<string | null>(null);
  const requestVersion = useRef(0);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [consultError, setConsultError] = useState("");
  const [queueError, setQueueError] = useState("");
  const [queueLoading, setQueueLoading] = useState(true);
  const token = usePatientAuthStore((state) => state.token);
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

  }, [token]);

  const refreshQueue = useCallback(async () => {
    const version = ++requestVersion.current;
    try {
      const response = await api.get<{ data: Visit | null }>("/public/queue/active");
      if (version !== requestVersion.current) return;
      setActiveVisit((current) => response.data.data ?? (current?.status === "CANCELLED" ? current : null));
      setQueueError("");
    } catch (error) {
      if (version === requestVersion.current) setQueueError(getApiErrorMessage(error, "Antrean gagal dimuat."));
    } finally {
      if (version === requestVersion.current) setQueueLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    void refreshQueue();
    return () => { requestVersion.current++; };
  }, [token, refreshQueue]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => { void refreshQueue(); };
    function changed(payload: { visitId: string; status?: Visit["status"] }) {
      if (payload.status === "CANCELLED" && activeVisit?.id === payload.visitId) {
        requestVersion.current++;
        setQueueLoading(false);
        setActiveVisit((current) => current?.id === payload.visitId ? { ...current, status: "CANCELLED", waitingAhead: 0 } : current);
      } else refresh();
    }
    socket.on("queue:changed", changed);
    socket.on("connect", refresh);
    return () => {
      socket.off("queue:changed", changed);
      socket.off("connect", refresh);
    };
  }, [socket, refreshQueue, activeVisit?.id]);

  function openConsultation(doctor: Doctor) {
    setSelectedDoctor(doctor);
    setConsultError("");
    dialogRef.current?.showModal();
  }

  useEffect(() => {
    const state = location.state as { assistantDoctorId?: unknown } | null;
    if (typeof state?.assistantDoctorId !== "string" || doctors.length === 0) return;
    if (handledAssistantState.current === location.key) return;
    const doctor = doctors.find((item) => item.id === state.assistantDoctorId && isDoctorActive(item));
    if (!doctor) return;
    handledAssistantState.current = location.key;
    window.setTimeout(() => openConsultation(doctor), 0);
    navigate(location.pathname, { replace: true, state: null });
  }, [doctors, location.key, location.pathname, location.state, navigate]);

  async function confirmConsultation() {
    if (!selectedDoctor || submissionRef.current) return;
    submissionRef.current = true;
    setSubmitting(true);
    setConsultError("");
    try {
      const response = await api.post<{ data: Visit }>("/public/check-in", { doctorId: selectedDoctor.id });
      requestVersion.current++;
      setActiveVisit(response.data.data);
      setQueueLoading(false);
      setQueueError("");
      dialogRef.current?.close();
      document.getElementById("patient-queue")?.scrollIntoView({ block: "nearest" });
    } catch (error) {
      setConsultError(getApiErrorMessage(error, "Antrean gagal dibuat. Silakan coba lagi."));
    } finally {
      submissionRef.current = false;
      setSubmitting(false);
    }
  }

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


  return (
    <>
      <div className="grid w-full min-w-0 gap-3">
        <div className="hero-bleed">
          <PatientHero />
        </div>
        <section className="grid min-w-0 gap-3 overflow-hidden md:grid-cols-[minmax(0,1fr)_minmax(19rem,0.72fr)] md:items-start md:overflow-visible xl:grid-cols-[minmax(0,1fr)_minmax(23rem,0.68fr)]">
        <div id="patient-queue" className="order-1 grid min-w-0 gap-3 md:col-start-2 md:row-start-1">
          {queueError && <Alert tone="error">{queueError}<button className="ml-2 underline" onClick={() => void refreshQueue()}>Coba lagi</button></Alert>}
          {queueLoading ? <p role="status" className="p-4 text-sm text-slate-500">Memuat antrean...</p> : <MedicineTrackingStepper visit={activeVisit} />}
        </div>

        <section id="available-doctors" className="order-2 min-w-0 scroll-mt-6 md:col-start-1 md:row-start-1">
          <Card className="min-w-0 border-slate-200 bg-white shadow-sm">
            <CardContent className="grid min-w-0 gap-3 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-slate-950">Dokter Tersedia</h2>
              <Badge>{shownDoctors.length} dokter</Badge>
            </div>
            <div className="relative min-w-0 max-w-full">
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-teal-700" />
              <Input
                id="doctor-search"
                aria-label="Cari dokter atau layanan"
                className="pl-10"
                placeholder="Cari dokter atau layanan..."
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
              />
            </div>
            {isSearching && (
              <p className="text-xs font-medium text-slate-500">Mencari dokter...</p>
            )}
            <div className="grid min-w-0 max-w-full gap-3">
              {paginatedDoctors.map((doctor) => (
                <Card key={doctor.id} className="min-w-0 overflow-hidden border-teal-100 bg-teal-50 shadow-sm">
                  <CardContent className="grid min-w-0 grid-cols-[3.75rem_minmax(0,1fr)_auto] items-center gap-2.5 p-2.5 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-3 sm:p-3">
                    {getDoctorAvatarUrl(doctor) ? (
                      <img
                        className="aspect-square w-full rounded-lg bg-teal-50 object-cover object-top"
                        src={getDoctorAvatarUrl(doctor)}
                        alt=""
                      />
                    ) : (
                      <div className="grid aspect-square w-full place-items-center rounded-lg bg-slate-100 text-lg font-semibold text-slate-700">
                        {getInitial(doctor.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="break-words text-[0.78rem] font-semibold leading-4 text-slate-950">{getDisplayDoctorName(doctor.name)}</p>
                      <p className="mt-0.5 break-words text-[0.68rem] leading-3.5 text-slate-500">{formatSpecialization(doctor.specialization)}</p>
                      <p className="mt-0.5 break-words text-[0.68rem] font-medium leading-3.5 text-teal-800">
                        {doctor.consultationFee != null
                          ? `Konsultasi ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(doctor.consultationFee)}`
                          : "Tarif belum tersedia"}
                      </p>
                    </div>
                    <Button className="h-8 shrink-0 gap-1 border border-teal-200 bg-white px-2.5 text-xs text-teal-800 hover:bg-teal-100" onClick={() => openConsultation(doctor)}>
                      <LuStethoscope aria-hidden="true" className="size-3.5" />
                      Konsul
                    </Button>
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
                  <LuChevronLeft className="size-4" />
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
                  <LuChevronRight className="size-4" />
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
        </section>
      </div>
      <dialog ref={dialogRef} aria-labelledby="consult-title" onCancel={(event) => { if (submitting) event.preventDefault(); }} className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-md rounded-lg border border-slate-200 bg-white p-5 text-slate-950 shadow-xl backdrop:bg-black/40">
        <h2 id="consult-title" className="text-lg font-semibold">Konfirmasi Konsultasi</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">Apakah Anda ingin konsul dengan <strong className="font-semibold text-slate-950">{selectedDoctor?.name}</strong> ({formatSpecialization(selectedDoctor?.specialization)}) dan mengambil antrean hari ini?</p>
        {consultError && <Alert tone="error" className="mt-3">{consultError}</Alert>}
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button autoFocus variant="outline" disabled={submitting} onClick={() => dialogRef.current?.close()}>Batal</Button>
          <Button className="bg-teal-700 hover:bg-teal-800" disabled={submitting} onClick={() => void confirmConsultation()}>{submitting ? "Mengambil antrean..." : "Ya, Ambil Antrean"}</Button>
        </div>
      </dialog>
    </>
  );
}
