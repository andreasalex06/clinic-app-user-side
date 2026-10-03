import { useEffect, useState } from "react";

const ESTIMATE_SECONDS = 10 * 60;

export function PreparationEstimate({ preparedAt }: { preparedAt?: string | null }) {
  const [now, setNow] = useState(Date.now);
  const startedAt = preparedAt ? Date.parse(preparedAt) : NaN;

  useEffect(() => {
    if (!Number.isFinite(startedAt)) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  if (!Number.isFinite(startedAt)) {
    return <p className="text-xs leading-5 text-slate-600">Petugas farmasi sedang menyiapkan obat Anda. Estimasi waktu belum tersedia.</p>;
  }

  const elapsed = Math.max(0, Math.floor((now - startedAt) / 1000));
  const remaining = ESTIMATE_SECONDS - (elapsed % ESTIMATE_SECONDS);
  const countdown = `${Math.floor(remaining / 60).toString().padStart(2, "0")}:${(remaining % 60).toString().padStart(2, "0")}`;

  return (
    <div className="text-xs leading-5 text-slate-600">
      <p>Petugas farmasi sedang menyiapkan obat Anda. Estimasi selesai <span role="timer" aria-label="Estimasi waktu tersisa" className="inline-block min-w-10 whitespace-nowrap font-semibold tabular-nums text-slate-950">{countdown}</span>.</p>
      {elapsed >= ESTIMATE_SECONDS && <p role="status" className="mt-2 font-medium text-amber-800">Maaf, ada kendala. Mohon ditunggu.</p>}
    </div>
  );
}
