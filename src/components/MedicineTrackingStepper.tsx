import { useCallback, useEffect, useRef, useState } from "react";
import { LuCircleCheck, LuCreditCard, LuPackageCheck, LuPill } from "react-icons/lu";
import { api, getApiErrorMessage } from "../api/client";
import { usePatientSocket } from "./PatientSocketProvider";
import { MidtransPaymentButton } from "./MidtransPaymentButton";
import { PreparationEstimate } from "./PreparationEstimate";
import { VisitDetailsModal } from "./VisitDetailsModal";
import { Alert } from "./ui/alert";
import { QueueStatusCard } from "./QueueStatusCard";
import { Card, CardContent } from "./ui/card";
import { formatQueueCode } from "../lib/queue";
import type { PharmacyOrder, PharmacyStatus, Visit } from "../types/clinic";

const trackingSteps: Array<{
  status: PharmacyStatus;
  label: string;
  description: string;
}> = [
  {
    status: "WAITING_PAYMENT",
    label: "Menunggu pembayaran",
    description: "Selesaikan tagihan agar obat masuk antrean farmasi."
  },
  {
    status: "PREPARING",
    label: "Obat sedang diracik",
    description: "Petugas farmasi sedang menyiapkan obat Anda."
  },
  {
    status: "READY_FOR_PICKUP",
    label: "Obat bisa diambil",
    description: "Silakan ambil obat di loket farmasi."
  },
  {
    status: "COMPLETED",
    label: "Selesai",
    description: "Obat sudah diterima dan layanan selesai."
  }
];

const statusIndex: Record<PharmacyStatus, number> = {
  WAITING_PAYMENT: 0,
  PREPARING: 1,
  READY_FOR_PICKUP: 2,
  COMPLETED: 3
};

function getStepIcon(status: PharmacyStatus) {
  if (status === "WAITING_PAYMENT") return LuCreditCard;
  if (status === "PREPARING") return LuPill;
  return LuPackageCheck;
}

function isBeforeToday(value?: string | null) {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  return date.getFullYear() < today.getFullYear()
    || (date.getFullYear() === today.getFullYear() && date.getMonth() < today.getMonth())
    || (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() < today.getDate());
}

export function MedicineTrackingStepper({ visit }: { visit?: Visit | null }) {
  const socket = usePatientSocket();
  const [showDetails, setShowDetails] = useState(false);
  const [order, setOrder] = useState<PharmacyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestVersion = useRef(0);
  const completedOrderIdRef = useRef<string | null>(null);
  const dismissedExpiredOrderIdRef = useRef<string | null>(null);
  const hasLoadedTrackingRef = useRef(false);

  const loadTracking = useCallback(async () => {
    const version = ++requestVersion.current;
    try {
      const response = await api.get<{ data: PharmacyOrder | null }>("/public/pharmacy/active");
      if (version !== requestVersion.current) return;
      const nextOrder = response.data.data;

      if (nextOrder && nextOrder.id === dismissedExpiredOrderIdRef.current) {
        dismissedExpiredOrderIdRef.current = nextOrder.id;
        setOrder(null);
        setError("");
        return;
      }

      if (nextOrder?.id !== dismissedExpiredOrderIdRef.current) {
        dismissedExpiredOrderIdRef.current = null;
      }

      const nextOrderDate = nextOrder?.visit.queueDate ?? nextOrder?.queueDate ?? nextOrder?.visit.checkInTime;
      if (nextOrder && !hasLoadedTrackingRef.current && isBeforeToday(nextOrderDate)) {
        dismissedExpiredOrderIdRef.current = nextOrder.id;
        setOrder(null);
        setError("");
        hasLoadedTrackingRef.current = true;
        return;
      }

      hasLoadedTrackingRef.current = true;

      if (
        !completedOrderIdRef.current ||
        (nextOrder && nextOrder.id !== completedOrderIdRef.current)
      ) {
        completedOrderIdRef.current = null;
        setOrder(nextOrder);
      }
      setError("");
    } catch (err) {
      if (version !== requestVersion.current) return;
      setError(getApiErrorMessage(err, "Tracking obat gagal dimuat."));
    } finally {
      if (version === requestVersion.current) setLoading(false);
    }
  }, []);

  useEffect(() => { void loadTracking(); return () => { requestVersion.current++; }; }, [loadTracking]);

  useEffect(() => {
    let currentDay = new Date().toDateString();
    const timerId = window.setInterval(() => {
      const nextDay = new Date().toDateString();
      if (nextDay === currentDay) return;

      currentDay = nextDay;
      dismissedExpiredOrderIdRef.current = null;
      void loadTracking();
    }, 60_000);

    return () => window.clearInterval(timerId);
  }, [loadTracking]);

  useEffect(() => {
    if (!socket) return;
    function onChange(payload: { orderId: string; status: PharmacyStatus }) {
      if (payload.status === "COMPLETED") {
        requestVersion.current++;
        setLoading(false);
        completedOrderIdRef.current = payload.orderId;
        setOrder((current) => current?.id === payload.orderId ? { ...current, status: "COMPLETED" } : current);
      } else {
        void loadTracking();
      }
    }
    const refresh = () => { void loadTracking(); };
    socket.on("pharmacy:changed", onChange);
    socket.on("connect", refresh);
    return () => {
      socket.off("pharmacy:changed", onChange);
      socket.off("connect", refresh);
    };
  }, [socket, loadTracking]);

  if (loading) {
    return (
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm text-slate-500">Memuat tracking obat...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <>{visit && <QueueStatusCard visit={visit} />}<Alert tone="error">{error}</Alert></>;
  }

  if (!order) {
    if (visit) return <QueueStatusCard visit={visit} />;

    return (
      <Card className="min-w-0 border-slate-200 bg-white shadow-sm">
        <CardContent className="grid gap-3 p-4 sm:p-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">Antrean Konsultasi</p>
            <h2 className="mt-1 text-base font-semibold text-slate-950">Belum ada antrean aktif</h2>
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-md border border-teal-200 bg-teal-50 px-4 text-sm font-medium text-teal-800 transition hover:bg-teal-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700"
            onClick={() => {
              document.getElementById("available-doctors")?.scrollIntoView({ block: "start" });
              document.getElementById("doctor-search")?.focus({ preventScroll: true });
            }}
          >
            Pilih Dokter
          </button>
        </CardContent>
      </Card>
    );
  }

  const activeStep = statusIndex[order.status];
  const orderDate = order.visit.queueDate ?? order.queueDate ?? order.visit.checkInTime;
  const isOrderExpired = isBeforeToday(orderDate);
  const medicines = order.visit.consultation?.medicines ?? [];

  if (isOrderExpired) {
    const expiredCard = (
      <Card className="visit-panel min-w-0 overflow-hidden border-slate-800 text-white">
        <CardContent className="grid gap-4 p-5 sm:p-6">
          <div>
            <p className="text-xs font-medium uppercase text-white/65">Antrean Konsultasi</p>
            <h2 className="mt-2 text-lg font-semibold">Proses kedaluwarsa</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              Proses konsultasi dan pembayaran dari hari sebelumnya sudah kedaluwarsa.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-white px-4 text-sm font-medium text-teal-800 transition hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:justify-self-start"
            onClick={() => {
              dismissedExpiredOrderIdRef.current = order.id;
              setOrder(null);
            }}
          >
            Oke
          </button>
        </CardContent>
      </Card>
    );

    return visit ? <>{<QueueStatusCard visit={visit} />}{expiredCard}</> : expiredCard;
  }

  const pharmacyContent = (
    <section className="min-w-0 border-t border-white/20 pt-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Antrean Obat</h2>
        <span className="whitespace-nowrap text-lg font-semibold">{order.queueNumber ? formatQueueCode(order.queueNumber) : "-"}</span>
      </div>
      <ul className="mt-3 divide-y divide-white/15">
        {medicines.map((item) => (
          <li key={item.id} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="break-words text-sm font-medium">{item.medicine.name}</p>
              {item.instructions && <p className="mt-1 break-words text-xs text-white/75">{item.instructions}</p>}
            </div>
            <span className="shrink-0 text-sm">x{item.quantity}</span>
          </li>
        ))}
      </ul>
      {medicines.length === 0 && <p className="py-3 text-sm text-white/75">Resep obat sedang diproses.</p>}
      <div className="mt-4 rounded-lg bg-white px-3 py-4 text-slate-950">
      <ol aria-label="Status obat" className="grid grid-cols-4">
        {trackingSteps.map((step, index) => {
          const isComplete = order.status === "COMPLETED" || index < activeStep;
          const isCurrent = !isComplete && index === activeStep;
          const Icon = isComplete ? LuCircleCheck : getStepIcon(step.status);
          const iconClass = isComplete
            ? "bg-emerald-100 text-emerald-800"
            : isCurrent
              ? "bg-yellow-300 text-yellow-950"
              : "bg-slate-100 text-slate-500";
          return (
            <li key={step.status} aria-current={isCurrent ? "step" : undefined} className="relative min-w-0 text-center">
              {index < trackingSteps.length - 1 && <span aria-hidden="true" className={`absolute left-1/2 top-4 h-px w-full ${isComplete ? "bg-emerald-300" : "bg-slate-200"}`} />}
              <span className={`relative mx-auto grid size-8 place-items-center rounded-full ${iconClass}`}><Icon aria-hidden="true" className="size-4" /></span>
              <span className={`mt-2 block px-1 text-xs ${isCurrent ? "font-semibold text-yellow-900" : isComplete ? "text-emerald-800" : "text-slate-500"}`}>
                {["Bayar", "Disiapkan", "Siap Diambil", "Selesai"][index]}
                <span className="sr-only">: {isComplete ? "sudah selesai" : isCurrent ? "sedang berlangsung" : "belum dimulai"}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 border-t border-slate-100 pt-3 text-center">
        {order.status === "PREPARING" ? (
          <PreparationEstimate key={order.id} preparedAt={order.preparedAt} />
        ) : (
          <p className="text-xs leading-5 text-slate-600" role="status">{trackingSteps[activeStep].description}</p>
        )}
      </div>
      </div>
      {order.status === "COMPLETED" && (
        <button type="button" className="mt-3 min-h-11 w-full rounded-md bg-white px-4 text-sm font-medium text-teal-800 hover:bg-teal-50" onClick={() => setShowDetails(true)}>
          Lihat Detail Kunjungan
        </button>
      )}
      {showDetails && <VisitDetailsModal key={order.visitId} visitId={order.visitId} onClose={() => setShowDetails(false)} />}
      {order.status === "WAITING_PAYMENT" && order.visit.invoice?.status === "UNPAID" && (
        <div className="mt-4">
          <MidtransPaymentButton key={order.visit.invoice.id} invoiceId={order.visit.invoice.id} onPaymentUpdate={loadTracking} />
        </div>
      )}
    </section>
  );

  // Keep unrelated consultation and pharmacy visits separate.
  if (visit && visit.id !== order.visitId) {
    return <><QueueStatusCard visit={visit} /><QueueStatusCard visit={order.visit}>{pharmacyContent}</QueueStatusCard></>;
  }
  return <QueueStatusCard visit={visit ?? order.visit}>{pharmacyContent}</QueueStatusCard>;
}
