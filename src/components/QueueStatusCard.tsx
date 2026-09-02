import { Link as RouterLink } from "react-router-dom";
import { CalendarDays, Timer } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { statusLabels } from "../constants/clinic";
import { formatQueueCode } from "../lib/queue";
import type { Doctor, Visit } from "../types/clinic";

type QueueStatusCardProps = {
  visit: Visit;
};

function getInitial(name?: string) {
  return name?.charAt(0).toUpperCase() ?? "D";
}

function getDoctorAvatarUrl(doctor?: Doctor) {
  return doctor?.avatarUrl || "";
}

function getVisitDateTime(visit: Visit) {
  const value = visit.checkInTime ?? visit.queueDate;

  if (!value) {
    return { date: "-", time: "-" };
  }

  const visitDate = new Date(value);

  return {
    date: visitDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }),
    time: visitDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    })
  };
}

export function QueueStatusCard({ visit }: QueueStatusCardProps) {
  const isConsultationCompleted = visit.status === "COMPLETED";
  const visitDateTime = getVisitDateTime(visit);
  const waitingMessage = visit.waitingAhead && visit.waitingAhead > 0
    ? `${visit.waitingAhead} pasien menunggu sebelum Anda.`
    : "Silakan tunggu panggilan petugas.";

  return (
    <Card className="visit-panel min-w-0 overflow-hidden border-slate-800 text-white">
      <CardContent className="grid gap-4 p-4 sm:p-5">
        <div>
          <p className="text-xs font-medium uppercase text-white/65">Antrean Konsultasi</p>
          <h2 className="mt-1 text-lg font-semibold">Kunjungan Aktif</h2>
        </div>

        <div className="flex min-w-0 items-center gap-3">
          {getDoctorAvatarUrl(visit.doctor) ? (
            <img
              className="size-12 shrink-0 rounded-lg bg-white object-cover"
              src={getDoctorAvatarUrl(visit.doctor)}
              alt=""
            />
          ) : (
            <div className="grid size-12 shrink-0 place-items-center rounded-lg bg-white text-base font-semibold text-slate-950">
              {getInitial(visit.doctor.name)}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="break-words text-base font-semibold sm:text-lg">{visit.doctor.name}</h3>
            <p className="mt-0.5 break-words text-sm text-white/75">{visit.doctor.specialization}</p>
          </div>
        </div>

        <div className="grid gap-2 min-[400px]:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
          <div className="flex min-w-0 gap-2 rounded-lg border border-white/15 bg-white/10 p-3">
            <CalendarDays className="size-5 shrink-0 text-teal-200" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/65">Tanggal</p>
              <p className="break-words text-sm font-semibold">{visitDateTime.date}</p>
            </div>
          </div>
          <div className="flex min-w-0 gap-2 rounded-lg border border-white/15 bg-white/10 p-3">
            <Timer className="size-5 shrink-0 text-teal-200" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-white/65">Jam</p>
              <p className="break-words text-sm font-semibold">{visitDateTime.time}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border border-white/10 bg-white p-4 text-center text-slate-950 shadow-sm sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:items-center sm:text-left">
          <div className="min-w-0 sm:text-center">
            <p className="text-xs font-medium text-slate-500">Nomor Antrean</p>
            <p className="mt-1 text-5xl font-semibold leading-none text-teal-700 sm:text-6xl">
              {formatQueueCode(visit.queueNumber)}
            </p>
          </div>
          <div className="min-w-0 border-t border-slate-200 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <p className="text-sm font-semibold text-slate-950">{statusLabels[visit.status] ?? visit.status}</p>
            <p className="mt-1 text-sm leading-6 text-slate-500">{waitingMessage}</p>
            <p className="mt-2 break-all text-xs font-medium text-slate-400">{visit.visitNumber}</p>
          </div>
        </div>

        {isConsultationCompleted ? (
          <div className="grid w-full gap-2 sm:grid-cols-2">
            <RouterLink to="/queue" className="inline-flex min-h-11 w-full items-center justify-center rounded-md bg-white px-4 py-2 text-center text-sm font-medium text-slate-950 shadow-sm transition hover:bg-slate-100">
              Lihat Tracking Obat
            </RouterLink>
            <RouterLink to="/check-in" className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-white/20 bg-white/10 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-white/15">
              Daftar Konsultasi Lagi
            </RouterLink>
          </div>
        ) : (
          <RouterLink to="/check-in" className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-white/20 bg-white/10 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-white/15">
            Daftar Konsultasi Lagi
          </RouterLink>
        )}
      </CardContent>
    </Card>
  );
}
