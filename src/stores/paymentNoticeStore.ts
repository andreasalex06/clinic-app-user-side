import { create } from "zustand";

type NoticeState = {
  invoiceIds: string[];
  message: string;
  success: boolean;
};

export const usePaymentNoticeStore = create<NoticeState>(() => ({
  invoiceIds: [],
  message: "",
  success: false
}));

export function watchPayment(invoiceId: string) {
  usePaymentNoticeStore.setState((state) => ({
    invoiceIds: [...new Set([...state.invoiceIds, invoiceId])],
    message: "",
    success: false
  }));
}

export function reportPaymentResult(result: "success" | "pending" | "closed") {
  if (usePaymentNoticeStore.getState().success) return;
  usePaymentNoticeStore.setState({
    message: result === "success" ? "Memverifikasi pembayaran..." : result === "pending" ? "Menunggu pembayaran." : ""
  });
}
