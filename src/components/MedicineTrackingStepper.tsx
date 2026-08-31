import { useEffect, useState } from "react";
import { CheckCircle2, Circle, CreditCard, PackageCheck, Pill, ReceiptText, Ticket } from "lucide-react";
import { api, getApiErrorMessage } from "../api/client";
import { Alert } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { formatQueueCode } from "../lib/queue";
import type { PharmacyOrder, PharmacyStatus } from "../types/clinic";

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
  if (status === "WAITING_PAYMENT") return CreditCard;
  if (status === "PREPARING") return Pill;
  return PackageCheck;
}

function getMedicineSummary(order: PharmacyOrder) {
  const medicines = order.visit.consultation?.medicines ?? [];

  if (medicines.length === 0) {
    return "Resep obat sedang diproses.";
  }

  return medicines.map((item) => `${item.medicine.name} x${item.quantity}`).join(", ");
}

function getStatusTone(status: PharmacyStatus) {
  if (status === "WAITING_PAYMENT") return "amber";
  if (status === "READY_FOR_PICKUP" || status === "COMPLETED") return "green";
  return "default";
}

function getStatusLabel(status: PharmacyStatus) {
  return trackingSteps[statusIndex[status]]?.label ?? status;
}

export function MedicineTrackingStepper() {
  const [order, setOrder] = useState<PharmacyOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadTracking() {
      try {
        const response = await api.get<{ data: PharmacyOrder | null }>("/public/pharmacy/active");

        if (isMounted) {
          setOrder(response.data.data);
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, "Tracking obat gagal dimuat."));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    void loadTracking();
    const intervalId = window.setInterval(loadTracking, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

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
    return <Alert tone="error">{error}</Alert>;
  }

  if (!order) {
    return null;
  }

  const activeStep = statusIndex[order.status];
  const medicines = order.visit.consultation?.medicines ?? [];

  return (
    <Card className="border-slate-200 bg-white shadow-sm">
      <CardContent className="grid gap-5 p-4 sm:p-5">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-950">Farmasi</h2>
          <p className="shrink-0 text-right text-xs font-medium uppercase text-teal-700">Live Tracking</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,0.55fr)]">
          <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <div className="grid size-9 shrink-0 place-items-center rounded-md bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                  <ReceiptText className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase text-slate-500">Daftar Obat</p>
                  <p className="truncate text-sm font-semibold text-slate-950">{medicines.length} item resep</p>
                </div>
              </div>
              <Badge tone={getStatusTone(order.status)}>{getStatusLabel(order.status)}</Badge>
            </div>

            <div className="mt-4 grid gap-2">
              {medicines.length > 0 ? (
                medicines.map((item) => (
                  <div key={item.id} className="flex min-w-0 items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50/70 px-3 py-2">
                    <p className="min-w-0 truncate text-sm font-semibold text-slate-800">{item.medicine.name}</p>
                    <span className="shrink-0 rounded bg-white px-2 py-1 text-xs font-semibold text-teal-700 ring-1 ring-teal-100">
                      x{item.quantity}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm leading-6 text-slate-500">
                  {getMedicineSummary(order)}
                </p>
              )}
            </div>
          </div>

          <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-950 p-4 text-white shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase text-white/70">Antrean Obat</p>
                <p className="mt-1 text-3xl font-semibold leading-none">
                  {order.queueNumber ? formatQueueCode(order.queueNumber) : "-"}
                </p>
              </div>
              <div className="grid size-10 shrink-0 place-items-center rounded-md border border-white/20 bg-white/15">
                <Ticket className="size-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-md border border-white/15 bg-white/10 px-3 py-2 text-sm font-semibold">
              <CheckCircle2 className="size-4 shrink-0" />
              <span className="min-w-0 truncate">{getStatusLabel(order.status)}</span>
            </div>
          </div>
        </div>

        <div className="relative grid gap-0">
          {trackingSteps.map((step, index) => (
            <div key={step.status} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <div className="relative grid justify-items-center">
                <div className={index <= activeStep ? "grid size-9 place-items-center rounded-md bg-slate-950 text-white" : "grid size-9 place-items-center rounded-md bg-slate-100 text-slate-400"}>
                  {(() => {
                    const Icon = index <= activeStep ? getStepIcon(step.status) : Circle;
                    return <Icon className="size-4" />;
                  })()}
                </div>
                {index < trackingSteps.length - 1 && (
                  <div className={index < activeStep ? "h-full min-h-10 w-px bg-teal-200" : "h-full min-h-10 w-px bg-slate-200"} />
                )}
              </div>
              <div className="min-w-0 pb-4">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{step.label}</p>
                </div>
                <p className="mt-1 text-sm leading-6 text-slate-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
