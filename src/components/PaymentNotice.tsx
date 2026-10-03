import { useEffect } from "react";
import { LuCircleCheck, LuX } from "react-icons/lu";
import { api } from "../api/client";
import { usePatientAuthStore } from "../stores/patientAuthStore";
import { usePaymentNoticeStore } from "../stores/paymentNoticeStore";
import type { Visit } from "../types/clinic";

export function PaymentNotice() {
  const token = usePatientAuthStore((state) => state.token);
  const { invoiceIds, message, success } = usePaymentNoticeStore();

  useEffect(() => {
    if (!token) {
      const state = usePaymentNoticeStore.getState();
      if (state.invoiceIds.length || state.message || state.success) {
        usePaymentNoticeStore.setState({ invoiceIds: [], message: "", success: false });
      }
      return;
    }
    if (!invoiceIds.length) return;
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    async function verify() {
      try {
        const response = await api.get<{ data: Visit[] }>("/public/history");
        if (disposed) return;
        const paidIds = response.data.data.flatMap((visit) =>
          visit.invoice?.status === "PAID" && invoiceIds.includes(visit.invoice.id) ? [visit.invoice.id] : []
        );
        if (paidIds.length) {
          usePaymentNoticeStore.setState((state) => ({
            invoiceIds: state.invoiceIds.filter((id) => !paidIds.includes(id)),
            message: "Pembayaran berhasil. Tagihan Anda sudah lunas.",
            success: true
          }));
        }
      } catch {
        // Never infer a successful payment from a failed status request.
      } finally {
        if (!disposed) timer = setTimeout(verify, 5000);
      }
    }
    void verify();
    return () => { disposed = true; clearTimeout(timer); };
  }, [token, invoiceIds]);

  if (!message) return null;
  return (
    <div role="status" aria-live="polite" className={`fixed inset-x-4 top-4 z-[100] mx-auto flex max-w-md items-start gap-3 rounded-lg border p-4 shadow-lg ${success ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-800"}`}>
      {success && <LuCircleCheck className="size-5 shrink-0" />}
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button type="button" aria-label="Tutup notifikasi" onClick={() => usePaymentNoticeStore.setState({ message: "" })}><LuX className="size-5" /></button>
    </div>
  );
}
