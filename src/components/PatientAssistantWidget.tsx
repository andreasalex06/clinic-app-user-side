import { useEffect, useRef, useState, type FormEvent } from "react";
import { LuTriangleAlert, LuLoaderCircle, LuMessageCircle, LuSend, LuStethoscope, LuX } from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { getApiErrorMessage } from "../api/client";
import { sendAssistantMessage, type AssistantMessage, type AssistantReply } from "../api/assistant";
import { usePatientAuthStore } from "../stores/patientAuthStore";
import { formatSpecialization } from "../lib/doctor";
import { Button } from "./ui/button";

type ChatEntry = AssistantMessage & {
  id: string;
  doctors?: AssistantReply["doctors"];
  urgent?: boolean;
};

type StoredChat = {
  messages: ChatEntry[];
  lastActivityAt: number;
};

const CHAT_TTL_MS = 60 * 60 * 1000;
const CHAT_STORAGE_PREFIX = "clinic_patient_assistant_chat:";

const GREETING: ChatEntry = {
  id: "greeting",
  role: "model",
  text: "Tanyakan layanan klinik, status kunjungan, atau dokter yang tersedia. Anda juga bisa menceritakan keluhan untuk mencari dokter. Saya tidak dapat memberi diagnosis atau resep."
};

function formatFee(price?: number | null) {
  if (price == null) return "Tarif belum tersedia";
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(price);
}

export function PatientAssistantWidget() {
  const token = usePatientAuthStore((state) => state.token);
  const patientId = usePatientAuthStore((state) => state.patient?.id);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatEntry[]>([GREETING]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const hydratedPatientIdRef = useRef<string | null>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!patientId) return;

    const storageKey = `${CHAT_STORAGE_PREFIX}${patientId}`;
    let restoredMessages: ChatEntry[] = [GREETING];

    try {
      const storedValue = localStorage.getItem(storageKey);
      if (storedValue) {
        const storedChat = JSON.parse(storedValue) as StoredChat;
        const isFresh = Number.isFinite(storedChat.lastActivityAt)
          && Date.now() - storedChat.lastActivityAt < CHAT_TTL_MS;

        if (isFresh && Array.isArray(storedChat.messages) && storedChat.messages.length > 0) {
          restoredMessages = storedChat.messages;
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch {
      localStorage.removeItem(storageKey);
    }

    hydratedPatientIdRef.current = patientId;
    setMessages(restoredMessages);
  }, [patientId]);

  useEffect(() => {
    if (!patientId || hydratedPatientIdRef.current !== patientId) return;

    try {
      localStorage.setItem(`${CHAT_STORAGE_PREFIX}${patientId}`, JSON.stringify({
        messages,
        lastActivityAt: Date.now()
      } satisfies StoredChat));
    } catch {
      // Chat tetap berjalan meski storage browser tidak tersedia.
    }
  }, [messages, patientId]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !sending) setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, sending]);

  if (!token) return null;

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = message.trim();
    if (!text || !acknowledged || sending) return;

    const history = messages.filter((entry) => entry.id !== "greeting").map(({ role, text: priorText, doctors }) => ({
      role,
      text: priorText,
      ...(role === "model" && doctors?.length ? { doctorIds: doctors.map((doctor) => doctor.id) } : {})
    }));
    const userEntryId = crypto.randomUUID();
    setMessages((current) => [...current, { id: userEntryId, role: "user", text }]);
    setMessage("");
    setSending(true);
    setError("");
    try {
      const result = await sendAssistantMessage(text, history);
      setMessages((current) => [...current, {
        id: crypto.randomUUID(),
        role: "model",
        text: result.reply,
        doctors: result.doctors,
        urgent: result.urgent
      }]);
    } catch (requestError) {
      setMessages((current) => current.filter((entry) => entry.id !== userEntryId));
      setMessage(text);
      setError(getApiErrorMessage(requestError, "Pesan belum terkirim. Periksa koneksi lalu coba lagi."));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function chooseDoctor(doctorId: string) {
    setOpen(false);
    navigate("/home", { state: { assistantDoctorId: doctorId } });
  }

  return (
    <div className="fixed bottom-[5.7rem] right-3 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <section
          id="assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="assistant-title"
          className="flex h-[min(72dvh,38rem)] max-h-[calc(100dvh-7.25rem)] w-[calc(100vw-1.5rem)] max-w-[25rem] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:max-h-[calc(100dvh-6rem)]"
        >
          <header className="flex min-h-14 items-center justify-between gap-3 bg-teal-700 px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white/15">
                <LuMessageCircle aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0">
                <h2 id="assistant-title" className="truncate text-sm font-semibold">Asisten Sarana Medika</h2>
                <p className="text-xs text-teal-100">Layanan dan status kunjungan</p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 text-white hover:bg-white/15 hover:text-white focus-visible:ring-white"
              aria-label="Tutup chat"
              disabled={sending}
              onClick={() => setOpen(false)}
            >
              <LuX aria-hidden="true" className="size-5" />
            </Button>
          </header>

          <div ref={transcriptRef} aria-live="polite" aria-relevant="additions text" className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-slate-50 px-3 py-4 sm:px-4">
            <div className="flex items-start gap-2">
              <div className="max-w-[90%] rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm leading-5 text-slate-700">
                <p className="mb-2 flex items-center gap-1.5 font-semibold text-teal-800">
                  <LuTriangleAlert aria-hidden="true" className="size-4 shrink-0" />
                  Asisten informasi klinik
                </p>
                <p>Asisten memproses percakapan dan data kunjungan akun Anda untuk menjawab pertanyaan. Hindari mengirim data pribadi tambahan. Chat ini membantu informasi layanan dan bukan pengganti dokter. Percakapan hilang saat halaman dimuat ulang atau Anda logout.</p>
                <label className="mt-3 flex cursor-pointer items-start gap-2 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-700">
                  <input
                    type="checkbox"
                    checked={acknowledged}
                    onChange={(event) => setAcknowledged(event.target.checked)}
                    className="mt-1 size-4 shrink-0 accent-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  />
                  <span>Saya paham dan setuju menggunakan chat asisten.</span>
                </label>
              </div>
            </div>

            {messages.map((entry) => (
              <div key={entry.id} className={`flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] rounded-lg px-3 py-2.5 text-sm leading-5 ${entry.role === "user" ? "bg-teal-700 text-white" : entry.urgent ? "border border-amber-300 bg-amber-50 text-slate-800" : "border border-slate-200 bg-white text-slate-700"}`}>
                  <p className="whitespace-pre-wrap break-words">{entry.text}</p>
                  {entry.doctors && entry.doctors.length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-slate-200 pt-3">
                      <p className="text-xs font-semibold text-slate-700">Dokter tersedia</p>
                      {entry.doctors.map((doctor) => (
                        <article key={doctor.id} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2 rounded-md border border-teal-100 bg-teal-50 p-2.5">
                          {doctor.avatarUrl ? (
                            <img src={doctor.avatarUrl} alt="" className="size-10 rounded-md object-cover object-top" />
                          ) : (
                            <span aria-hidden="true" className="grid size-10 place-items-center rounded-md bg-white text-sm font-semibold text-teal-800">{doctor.name.charAt(0)}</span>
                          )}
                          <div className="min-w-0">
                            <p className="break-words text-xs font-semibold text-slate-900">{doctor.name}</p>
                            <p className="mt-0.5 break-words text-xs text-slate-600">{formatSpecialization(doctor.specialization)}</p>
                            <p className="mt-0.5 text-xs font-medium text-teal-800">{formatFee(doctor.consultationFee)}</p>
                            <button
                              type="button"
                              className="mt-2 inline-flex min-h-11 items-center gap-1.5 rounded-md border border-teal-700 bg-white px-3 text-xs font-medium text-teal-800 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                              onClick={() => chooseDoctor(doctor.id)}
                            >
                              <LuStethoscope aria-hidden="true" className="size-4" />
                              Pilih dokter
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <p role="status" className="flex items-center gap-2 text-xs text-slate-600">
                <LuLoaderCircle aria-hidden="true" className="size-4 animate-spin" /> Asisten sedang menyiapkan jawaban...
              </p>
            )}
            {error && (
              <div role="alert" className="space-y-2 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                <p>{error}</p>
                <button type="button" className="min-h-11 underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700" onClick={() => inputRef.current?.focus()}>
                  Kembali ke kolom pesan
                </button>
              </div>
            )}
          </div>

          <form onSubmit={(event) => void submitMessage(event)} className="border-t border-slate-200 bg-white p-3 sm:p-4">
            <label htmlFor="assistant-message" className="sr-only">Tulis pertanyaan atau keluhan</label>
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                id="assistant-message"
                rows={2}
                maxLength={800}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={acknowledged ? "Tanya layanan atau ceritakan keluhan..." : "Setujui pemberitahuan untuk mulai"}
                disabled={!acknowledged || sending}
                className="min-h-11 min-w-0 flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-sm leading-5 text-slate-900 placeholder:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700 disabled:bg-slate-100 disabled:text-slate-500"
              />
              <Button type="submit" size="icon" aria-label="Kirim pesan" disabled={!acknowledged || !message.trim() || sending} className="size-11 shrink-0 bg-teal-700 hover:bg-teal-800 focus-visible:ring-teal-700">
                <LuSend aria-hidden="true" className="size-4" />
              </Button>
            </div>
            <p className="mt-1.5 text-right text-[0.68rem] text-slate-500">{message.length}/800</p>
          </form>
        </section>
      )}

      <Button
        type="button"
        size="icon"
        aria-label={open ? "Tutup chat asisten" : "Buka chat asisten"}
        aria-expanded={open}
        aria-controls="assistant-panel"
        className="size-12 rounded-full bg-teal-700 text-white shadow-lg hover:bg-teal-800 focus-visible:ring-teal-700"
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <LuX aria-hidden="true" className="size-5" /> : <LuMessageCircle aria-hidden="true" className="size-5" />}
      </Button>
    </div>
  );
}
