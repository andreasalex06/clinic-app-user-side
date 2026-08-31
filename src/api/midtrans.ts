import { api } from "./client";

type PaymentResult = "success" | "pending" | "closed";
type Snap = {
  pay: (token: string, callbacks: {
    onSuccess: () => void;
    onPending: () => void;
    onError: () => void;
    onClose: () => void;
  }) => void;
};

let scriptLoading: Promise<Snap> | undefined;

function loadMidtransSnap(clientKey: string): Promise<Snap> {
  const snapWindow = window as Window & { snap?: Snap };

  if (snapWindow.snap) return Promise.resolve(snapWindow.snap);
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise<Snap>((resolve, reject) => {
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => fail(), 15000);

    function fail() {
      window.clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
      script.remove();
      reject(new Error("Midtrans gagal dimuat. Periksa koneksi lalu coba lagi."));
    }

    script.id = "midtrans-snap-script";
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey);
    script.onload = () => {
      if (!snapWindow.snap) {
        fail();
        return;
      }
      window.clearTimeout(timeout);
      resolve(snapWindow.snap);
    };
    script.onerror = fail;
    document.body.appendChild(script);
  }).catch((error: unknown) => {
    scriptLoading = undefined;
    throw error;
  });

  return scriptLoading;
}

export async function payWithMidtrans(invoiceId: string): Promise<PaymentResult> {
  const response = await api.post<{ data: { token: string; clientKey: string } }>(
    `/public/invoices/${invoiceId}/midtrans`
  );
  const snap = await loadMidtransSnap(response.data.data.clientKey);

  return new Promise((resolve, reject) => {
    snap.pay(response.data.data.token, {
      onSuccess: () => resolve("success"),
      onPending: () => resolve("pending"),
      onClose: () => resolve("closed"),
      onError: () => reject(new Error("Pembayaran Midtrans gagal diproses."))
    });
  });
}
