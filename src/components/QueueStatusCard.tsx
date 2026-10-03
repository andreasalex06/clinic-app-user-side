import type { ReactNode } from "react";
import { formatSpecialization } from "../lib/doctor";
import { LuCalendarDays, LuTimer } from "react-icons/lu";
import { Card, CardContent } from "./ui/card";
import { statusLabels } from "../constants/clinic";
import { formatQueueCode } from "../lib/queue";
import type { Doctor, Visit } from "../types/clinic";

type QueueStatusCardProps = {
  visit: Visit;
  children?: ReactNode;
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
      month: "short",
      year: "numeric"
    }),
    time: visitDate.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    })
  };
}

export function QueueStatusCard({ visit, children }: QueueStatusCardProps) {
  const isConsultationCompleted = visit.status === "COMPLETED";
  const isCancelled = visit.status === "CANCELLED";
  const isTerminalStatus = isConsultationCompleted || isCancelled;
  const visitDateTime = getVisitDateTime(visit);
  const waitingAhead = visit.waitingAhead ?? 0;
  const estimatedTime = visit.estimatedConsultationAt
    ? new Date(visit.estimatedConsultationAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : visitDateTime.time;
  const waitingMessage = isCancelled
    ? "Antrean dibatalkan oleh petugas. Silakan daftar kembali jika masih membutuhkan konsultasi."
    : isConsultationCompleted
      ? "Konsultasi selesai."
      : waitingAhead > 0
      ? `Perkiraan konsultasi dimulai pada pukul ${estimatedTime.replace(":", ".")}. Dimohon hadir 15 menit sebelum waktu perkiraan atau saat sisa antrean 2.`
      : visit.status === "IN_CONSULTATION"
        ? "Giliran Anda sedang berlangsung."
        : "Anda adalah antrean berikutnya.";

  return (
    <Card className="visit-panel min-w-0 overflow-hidden border-slate-800 text-white">
      <CardContent className="grid gap-4 p-4 sm:p-5">
        <div>
          <div className="flex min-w-0 items-center justify-between gap-3">
            <p className="min-w-0 text-xs font-medium uppercase text-white/65">Antrean Konsultasi</p>
            {!isTerminalStatus && (
              <p className="shrink-0 text-right text-sm font-medium text-white/80">
                Sisa antrean <span className="font-semibold tabular-nums text-white">{waitingAhead}</span>
              </p>
            )}
          </div>
          {isCancelled && (
            <h2 className="mt-1 text-lg font-semibold">Antrean Dibatalkan</h2>
          )}
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
            <p className="mt-0.5 break-words text-sm text-white/75">{formatSpecialization(visit.doctor.specialization)}</p>
          </div>
        </div>

        <div className="grid min-w-0 gap-3 rounded-lg border border-white/15 bg-white/10 p-3">
          <div className="flex min-w-0 items-start gap-2.5">
            <LuCalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-teal-200" />
            <div className="min-w-0">
              <p className="text-xs leading-4 text-white/65">Tanggal antrean</p>
              <p className="break-words text-sm font-medium">{visitDateTime.date}</p>
            </div>
          </div>
          <div className="flex min-w-0 items-start gap-2.5 border-t border-white/15 pt-3">
            <LuTimer aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-teal-200" />
            <div className="min-w-0">
              <p className="break-words text-xs leading-4 text-white/65">
                {visit.status === "IN_CONSULTATION" ? "Status konsultasi" : "Waktu konsultasi"}
              </p>
              <p className="mt-0.5 whitespace-nowrap text-sm font-medium tabular-nums">
                {visit.status === "IN_CONSULTATION" ? "Sedang berlangsung" : estimatedTime}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 rounded-lg border border-white/10 bg-white p-4 text-center text-slate-950 shadow-sm sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:items-center sm:text-left">
          <div className="min-w-0 sm:text-center">
            <p className="text-xs font-medium text-slate-500">Nomor Antrean</p>
            <p className="mt-1 whitespace-nowrap text-4xl font-semibold leading-none text-teal-700 sm:text-5xl">
              {formatQueueCode(visit.queueNumber, visit.doctor.queueIndex)}
            </p>
          </div>
          <div className="min-w-0 border-t border-slate-200 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
            <p className="text-sm font-semibold text-slate-950">{statusLabels[visit.status] ?? visit.status}</p>
            {!isConsultationCompleted && (
              <p className="mt-1 text-sm leading-6 text-slate-500">{waitingMessage}</p>
            )}
            <p className="mt-2 break-all text-xs font-medium text-slate-400">{visit.visitNumber}</p>
          </div>
        </div>

        {children}
      </CardContent>
    </Card>
  );
}
