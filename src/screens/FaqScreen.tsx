import { useState } from "react";
import { LuChevronDown, LuSearch, LuX } from "react-icons/lu";
import { Card, CardContent } from "../components/ui/card";

const questions = [
  { category: "Pendaftaran", question: "Bagaimana cara mendaftar sebagai pasien?", answer: "Buka halaman Masuk, pilih Registrasi, lalu lengkapi nama, nomor WhatsApp, password, jenis kelamin, tanggal lahir, dan alamat. Tekan Daftar & Lanjut Check-in. Setelah berhasil, Anda akan masuk ke Beranda." },
  { category: "Pendaftaran", question: "Bagaimana cara masuk kembali?", answer: "Gunakan nomor WhatsApp dan password yang didaftarkan pada halaman Masuk Pasien. Jika mengalami kendala akun, minta bantuan petugas klinik." },
  { category: "Antrean dan konsultasi", question: "Bagaimana cara mengambil antrean konsultasi?", answer: "Di Beranda, cari dokter pada bagian Dokter Tersedia. Tekan Konsul, periksa pilihan dokter pada dialog Konfirmasi Konsultasi, lalu tekan Ya, Ambil Antrean. Antrean dibuat untuk hari ini. Memilih dokter dari chat juga tetap memerlukan konfirmasi Anda." },
  { category: "Antrean dan konsultasi", question: "Di mana saya bisa melihat nomor dan status antrean?", answer: "Lihat kartu Antrean Konsultasi di Beranda. Kartu tersebut menampilkan nomor antrean, sisa antrean sebelum Anda, dan perkiraan waktu konsultasi. Anda juga dapat menanyakan status kunjungan akun Anda melalui chat asisten." },
  { category: "Antrean dan konsultasi", question: "Bagaimana perkiraan waktu konsultasi dihitung?", answer: "Perkiraan memakai rata-rata lama konsultasi yang sudah selesai untuk dokter yang sama, maksimal 30 konsultasi dalam 60 hari. Jika belum ada data yang valid, sistem menggunakan 15 menit. Waktu tunggu memperhitungkan pasien di depan Anda dan sisa perkiraan konsultasi yang sedang berlangsung. Ini bukan jadwal pasti. Anda boleh menunggu di rumah sambil memantau antrean. Segera berangkat ke klinik saat sisa antrean mencapai 3 atau kurang; jangan menunggu sampai dipanggil." },
  { category: "Antrean dan konsultasi", question: "Apakah konsultasi dilakukan lewat chat?", answer: "Konsultasi dengan dokter dilakukan di klinik. Chat asisten membantu informasi layanan, alur aplikasi, status kunjungan, dan pilihan dokter. Asisten AI bukan pengganti dokter dan tidak memberikan diagnosis atau resep baru." },
  { category: "Pembayaran dan dokumen", question: "Bagaimana cara membayar tagihan?", answer: "Setelah tagihan tersedia, buka Riwayat, pilih kunjungan, lalu buka tab Invoice dan tekan Bayar. Selesaikan pembayaran melalui Midtrans. Tombol Bayar juga dapat tampil di Beranda. Status lunas mengikuti konfirmasi pembayaran dari sistem, bukan hanya penutupan jendela pembayaran." },
  { category: "Pembayaran dan dokumen", question: "Bagaimana mengunduh invoice dan ringkasan konsultasi?", answer: "Buka Riwayat dan pilih kunjungan. Pada tab Invoice, tekan Unduh Invoice PDF. Pada tab Ringkasan Konsultasi, tekan Unduh Ringkasan PDF. Dokumen tersedia setelah data kunjungan terkait dibuat." },
  { category: "Obat dan akun", question: "Bagaimana mengetahui obat sudah siap diambil?", answer: "Pantau proses obat di Beranda: menunggu pembayaran, disiapkan, siap diambil, lalu sudah diambil. Ketika status siap diambil, ambil obat di farmasi klinik. Resep yang dicatat dokter dapat dilihat pada Ringkasan Konsultasi." },
  { category: "Obat dan akun", question: "Bisakah saya mengubah profil atau membatalkan antrean?", answer: "Halaman Akun menampilkan data profil dan tombol logout. Pengubahan profil, pembatalan antrean, reset password mandiri, dan pemesanan untuk tanggal lain belum tersedia di halaman pasien. Hubungi petugas klinik untuk kebutuhan tersebut." }
];

export function FaqScreen() {
  const [query, setQuery] = useState("");
  const filtered = questions.filter((item) => `${item.category} ${item.question} ${item.answer}`.toLocaleLowerCase("id").includes(query.trim().toLocaleLowerCase("id")));
  const categories = [...new Set(filtered.map((item) => item.category))];

  return (
    <>
      <div className="mx-auto w-full max-w-3xl py-4 sm:py-6">
        <Card className="mt-6 border-slate-200 bg-white shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <header className="mb-5">
              <h1 className="text-2xl font-semibold text-slate-950">Pertanyaan Umum</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Pendaftaran, antrean, pembayaran, dan layanan pasien.</p>
            </header>
            <div className="relative">
              <LuSearch aria-hidden="true" className="pointer-events-none absolute left-3 top-3 size-5 text-teal-700" />
              <label htmlFor="faq-search" className="sr-only">Cari pertanyaan</label>
              <input id="faq-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari pertanyaan..." className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-12 text-sm outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20" />
              {query && <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian" title="Hapus pencarian" className="absolute right-1 top-1 grid size-10 place-items-center rounded-md text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700"><LuX className="size-4" /></button>}
            </div>
            <p role="status" className="mt-3 text-xs text-slate-500">{filtered.length} pertanyaan</p>
            {categories.map((category) => (
          <section key={category} className="mt-7">
            <h2 className="mb-2 text-sm font-semibold text-teal-800">{category}</h2>
            <div className="divide-y divide-slate-200 border-y border-slate-200">
              {filtered.filter((item) => item.category === category).map((item) => (
                <details key={item.question} className="group">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4 text-sm font-medium leading-6 text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-700 [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span><LuChevronDown aria-hidden="true" className="mt-1 size-4 shrink-0 text-teal-700 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="pb-5 pr-6 text-sm leading-7 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
            ))}
            {filtered.length === 0 && <p className="py-8 text-sm leading-6 text-slate-600">Tidak ada pertanyaan yang cocok. Coba kata lain, seperti antrean, pembayaran, atau obat.</p>}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
