import { Link as RouterLink } from "react-router-dom";
import { Stethoscope, Ticket } from "lucide-react";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { statusLabels } from "../constants/clinic";
import { formatQueueCode } from "../lib/queue";
import type { Visit } from "../types/clinic";

type QueueStatusCardProps = {
  visit: Visit;
};

export function QueueStatusCard({ visit }: QueueStatusCardProps) {
  const isConsultationCompleted = visit.status === "COMPLETED";

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="grid justify-items-center gap-4 p-5 text-center">
        <p className="text-xs font-medium uppercase text-slate-500">Nomor Antrean</p>
        <div className="queue-number border border-slate-200 shadow-sm">{formatQueueCode(visit.queueNumber)}</div>
        <div>
          <h2 className="text-xl font-semibold text-slate-950">{statusLabels[visit.status] ?? visit.status}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {visit.waitingAhead && visit.waitingAhead > 0 ? `${visit.waitingAhead} pasien menunggu sebelum Anda.` : "Silakan tunggu panggilan petugas."}
          </p>
        </div>
        <div className="grid w-full gap-2 sm:grid-cols-2">
          <Badge className="justify-center py-2">
            <Stethoscope className="size-4" />
            Dokter: {visit.doctor.name}
          </Badge>
          <Badge className="justify-center py-2" tone="slate">
            <Ticket className="size-4" />
            Kode: {visit.visitNumber}
          </Badge>
        </div>
        {isConsultationCompleted ? (
          <div className="grid w-full gap-2 sm:grid-cols-2">
            <RouterLink to="/queue" className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
              Lihat Tracking Obat
            </RouterLink>
            <RouterLink to="/check-in" className="inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
              Daftar Konsultasi Lagi
            </RouterLink>
          </div>
        ) : (
          <RouterLink to="/check-in" className="inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100">
            Daftar Konsultasi Lagi
          </RouterLink>
        )}
      </CardContent>
    </Card>
  );
}
