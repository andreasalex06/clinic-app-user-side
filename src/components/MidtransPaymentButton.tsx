import { useRef, useState } from "react";
import { LuCreditCard, LuLoaderCircle } from "react-icons/lu";
import { getApiErrorMessage } from "../api/client";
import { watchPayment, reportPaymentResult } from "../stores/paymentNoticeStore";
import { payWithMidtrans } from "../api/midtrans";
import { Alert } from "./ui/alert";
import { Button } from "./ui/button";

type MidtransPaymentButtonProps = {
  invoiceId: string;
  onPaymentUpdate: () => void | Promise<void>;
  label?: string;
  onPaymentStart?: () => void;
  onPaymentFinish?: () => void;
};

export function MidtransPaymentButton({
  invoiceId,
  onPaymentUpdate,
  label = "Bayar",
  onPaymentStart,
  onPaymentFinish
}: MidtransPaymentButtonProps) {
  const paymentInProgress = useRef(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    if (paymentInProgress.current) return;
    paymentInProgress.current = true;
    setPaying(true);
    setError("");

    try {
      onPaymentStart?.();
      watchPayment(invoiceId);
      const result = await payWithMidtrans(invoiceId);
      reportPaymentResult(result);
    } catch (err) {
      setError(getApiErrorMessage(err, "Pembayaran Midtrans gagal dimulai."));
    } finally {
      try {
        await onPaymentUpdate();
      } catch (err) {
        setError(getApiErrorMessage(err, "Status pembayaran gagal diperbarui."));
      } finally {
        paymentInProgress.current = false;
        setPaying(false);
        onPaymentFinish?.();
      }
    }
  }

  return (
    <div className="grid min-w-0 gap-2">
      <Button
        className="h-auto min-h-11 w-full bg-teal-700 text-white hover:bg-teal-800 focus-visible:ring-teal-500"
        disabled={paying}
        aria-busy={paying}
        onClick={() => void handlePayment()}
      >
        {paying ? <LuLoaderCircle aria-hidden="true" className="size-4 shrink-0 animate-spin" /> : <LuCreditCard aria-hidden="true" className="size-4 shrink-0" />}
        <span>{paying ? "Memproses pembayaran..." : label}</span>
      </Button>
      {error && <Alert tone="error" className="break-words">{error}</Alert>}
    </div>
  );
}
