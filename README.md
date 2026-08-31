# ClinicApp User-Side Frontend

Web pasien berorientasi mobile untuk registrasi/login dengan nomor WhatsApp dan password, daftar konsultasi, antrean, tracking obat, riwayat/invoice, pembayaran Midtrans Sandbox, dan profil. Menggunakan React, TypeScript, Vite, Tailwind CSS, Zustand, Axios, serta Socket.IO Client.

Aplikasi ini bukan dashboard petugas dan tidak memiliki database/backend sendiri. Gunakan [backend bersama](../dashboard/backend/README.md) dan [dashboard petugas](../dashboard/frontend/README.md) untuk memproses konsultasi serta farmasi.

## Prasyarat

- Node.js 22.12+ dalam major 22 atau Node.js 24, serta npm, sesuai toolchain pada lockfile project.
- PostgreSQL dan backend telah disiapkan, termasuk migrasi dan Prisma Client.
- Backend berjalan di `http://localhost:5050`.
- Data dokter/master tersedia. Untuk data demo, ikuti bagian seed backend hanya pada database yang boleh dikosongkan.

## Instalasi pertama

Dari folder induk `clinic-app-mobileuserfirst` (contoh menggunakan PowerShell):

```powershell
cd user-side-frontend
npm ci
```

`npm ci` memasang versi sesuai lockfile; gunakan npm secara konsisten. Di folder ini belum tersedia `.env.example`. Buat file `.env` berisi:

```dotenv
VITE_API_URL="http://localhost:5050/api"
```

`VITE_API_URL` harus menyertakan `/api`, bukan `/api/public`: masing-masing fungsi API menambahkan path `/public/...` sendiri. Jika env tidak diisi, kode menggunakan protokol/hostname halaman saat ini dengan port `5050` dan path `/api`.

Client Socket.IO mengambil URL yang sama lalu menghapus akhiran `/api`, sehingga terhubung ke backend, bukan port Vite. Tidak perlu menjalankan server socket terpisah.

Tidak perlu memasukkan key Midtrans ke `.env` frontend. Backend mengembalikan Client Key bersama Snap token saat tombol bayar ditekan. **Server Key, JWT secret, dan kredensial database hanya berada di backend**, tidak boleh masuk variabel `VITE_*`.

Di `.env` backend pastikan konfigurasi berikut sesuai:

```dotenv
PORT=5050
FRONTEND_URL="http://localhost:5173"
USER_FRONTEND_URL="http://localhost:5174"
```

Restart backend/Vite setelah mengubah environment masing-masing. Jangan menimpa env backend yang sudah berisi konfigurasi database dan secret; contoh di atas hanya variabel terkait origin/port.

## Menjalankan aplikasi

Urutan startup: PostgreSQL -> backend -> dashboard -> user-side. Gunakan terminal terpisah untuk setiap dev server. Pada terminal user-side:

```powershell
npm run dev -- --port 5174 --strictPort
```

Buka [http://localhost:5174](http://localhost:5174). Root diarahkan ke `/home`. Flag `--strictPort` mencegah bentrok dengan dashboard pada `5173` atau perpindahan otomatis ke port yang belum diizinkan CORS.

| Aplikasi | Alamat lokal |
| --- | --- |
| Backend API | `http://localhost:5050/api` |
| Dashboard petugas | `http://localhost:5173` |
| User-side | `http://localhost:5174` |

Untuk menjalankan kembali, cukup pastikan PostgreSQL/backend aktif lalu jalankan dev server. Tidak perlu seed ulang. Jika memakai port berbeda, sesuaikan `USER_FRONTEND_URL` backend dan `VITE_PATIENT_FRONTEND_URL` dashboard agar CORS dan QR tetap benar. `localhost` dan `127.0.0.1` adalah origin berbeda. Hentikan server dengan `Ctrl+C`.

## Registrasi, login, dan halaman

1. Buka [registrasi](http://localhost:5174/register), isi identitas pasien, nomor WhatsApp, password, dan field wajib lainnya.
2. Gunakan nomor WhatsApp dan password pasien untuk login, bukan email akun Admin/Staff/Doctor dashboard. Project ini tidak menggunakan OTP.
3. Jika sesi tidak valid atau kadaluarsa, login kembali. Reset/seed backend dapat menghapus akun pasien yang pernah dibuat.

| Route | Fungsi |
| --- | --- |
| `/home` | Beranda pasien. |
| `/register` dan `/login` | Registrasi dan autentikasi pasien. |
| `/check-in` | Memilih dokter dan mendaftar konsultasi. |
| `/queue` | Antrean dan tracking farmasi. |
| `/queue/:visitId` | Status kunjungan tertentu. |
| `/history` | Riwayat kunjungan; klik kartu untuk melihat detail/invoice. |
| `/account` | Profil pasien. |

## Uji alur klinik

1. Dari user-side, login lalu daftar konsultasi dengan dokter yang tersedia.
2. Periksa nomor/status antrean di `/queue`.
3. Dari dashboard petugas, proses antrean dan simpan konsultasi. Tambahkan tindakan dan obat untuk menguji invoice sekaligus farmasi.
4. Buka Riwayat pasien untuk melihat invoice. Konsultasi selesai tidak berarti invoice sudah lunas.
5. Jika konsultasi memiliki resep obat, tracking farmasi menampilkan tahap menunggu pembayaran. Tanpa resep obat, invoice tetap dapat dibayar dari Riwayat, tetapi tidak ada order farmasi.
6. Setelah invoice dibayar dan webhook valid diproses, farmasi berpindah ke tahap peracikan dan memperoleh nomor antrean obat. Petugas melanjutkan status siap diambil dan selesai dari dashboard farmasi.

## Simulasi Midtrans Sandbox

Siapkan key sandbox, ngrok menuju port backend, dan Payment Notification URL mengikuti [panduan backend](../dashboard/backend/README.md#midtrans-sandbox-dan-ngrok). Ketiga aplikasi serta ngrok perlu tetap berjalan untuk demo penuh. Tidak ada uang asli yang perlu ditransfer.

1. Siapkan invoice `UNPAID` dari konsultasi pasien tersebut.
2. Di Riwayat, buka kartu kunjungan dan tekan **Bayar dengan Midtrans**. Alternatif: pada Antrean > Farmasi > Live Tracking, tekan tombol hijau **Bayar via Midtrans** ketika status masih menunggu pembayaran.
3. Popup Snap muncul di halaman yang sama. Pilih metode yang tersedia, misalnya BCA Virtual Account, dan catat nomor VA.
4. Buka [simulator BCA VA](https://simulator.sandbox.midtrans.com/bca/va/index) untuk menyelesaikan simulasi. Metode lain mengikuti [panduan sandbox Midtrans](https://docs.midtrans.com/docs/testing-payment-on-sandbox).
5. Periksa invoice dan tracking setelah webhook diterima backend. Tombol bayar menghilang ketika data backend sudah menunjukkan lunas.

Tombol memiliki loading, penguncian klik ganda, dan pesan error. Menutup popup tidak otomatis membatalkan atau melunasi invoice. Backend saat ini belum memakai kembali token transaksi lama saat mencoba membayar ulang; jika order ID ditolak sebagai duplikat, selesaikan transaksi sandbox yang sudah ada melalui simulator atau gunakan invoice baru untuk demo.

### Alur kode payment dan live tracking

```text
HistoryScreen / MedicineTrackingStepper
  -> MidtransPaymentButton.handlePayment()
  -> payWithMidtrans(invoiceId)
  -> POST /api/public/invoices/:invoiceId/midtrans + JWT pasien
  -> backend validasi kepemilikan, mengambil total invoice, meminta Snap token
  -> frontend memuat script Snap sandbox dan memanggil snap.pay(token)
  -> pembayaran melalui simulator
  -> Midtrans POST /api/public/midtrans/notification
  -> backend verifikasi signature, update invoice dan farmasi
  -> event pharmacy:changed ke room pasien
  -> GET /api/public/pharmacy/active dan render data terbaru
```

Callback Snap `onSuccess`, `onPending`, `onClose`, maupun error memicu refresh melalui komponen tombol. Callback bukan bukti lunas; sumber status adalah database setelah webhook diproses. Tracking farmasi juga mengambil data tiap 5 detik sebagai cadangan event socket. Polling ini tidak menggantikan webhook yang gagal. Riwayat memuat ulang setelah callback, tetapi belum memiliki polling/socket pembayaran sendiri; refresh halaman bila notifikasi datang belakangan.

Script Snap saat ini khusus sandbox. Jangan mengganti hanya flag production backend lalu menganggap seluruh integrasi siap menerima pembayaran sungguhan; baca batasan pada README backend.

## Build, lint, dan pengujian

Dari folder user-side:

```powershell
npm run lint
npm run build
node --test tests/midtrans.test.cjs
```

- `lint`: menjalankan Oxlint. Warning harus dibaca; exit sukses bukan berarti tidak ada warning.
- `build`: menjalankan TypeScript (`tsc -b`) lalu Vite; hasil berada di `dist/`.
- Tes Midtrans memakai mock API/Snap untuk memeriksa callback, error, pemuatan script, dan retry script. Bukan transaksi sandbox end-to-end.

Untuk preview hasil build:

```powershell
npm run preview -- --port 4174 --strictPort
```

Buka [http://localhost:4174](http://localhost:4174). Ubah sementara `USER_FRONTEND_URL` backend ke origin tersebut dan restart backend agar API/Socket.IO dapat diakses. Jika memakai QR dashboard, sesuaikan URL pasien di dashboard juga. Pulihkan konfigurasi port `5174` setelah kembali ke development.

Preview bukan server production. Hosting statis perlu SPA fallback ke `index.html` agar refresh route `/queue` atau `/history` tidak 404. URL API di env Vite ditanam saat build: perubahan alamat API memerlukan build ulang, dan origin deployment harus diizinkan backend.

## Akses dari ponsel (opsional)

Gunakan jaringan lokal tepercaya. Jalankan Vite dengan:

```powershell
npm run dev -- --host 0.0.0.0 --port 5174 --strictPort
```

Ganti host pada `VITE_API_URL` dengan IP LAN komputer backend, misalnya `http://192.168.1.10:5050/api` (contoh, bukan IP tetap project). Tetapkan `USER_FRONTEND_URL` backend dan `VITE_PATIENT_FRONTEND_URL` dashboard ke `http://192.168.1.10:5174`, lalu restart proses terkait. Pastikan backend dapat dijangkau dan firewall mengizinkan koneksi dari LAN. `localhost` di ponsel tidak menunjuk ke komputer. Kembalikan env lokal saat selesai.

## Troubleshooting

| Gejala | Pemeriksaan |
| --- | --- |
| Data/API gagal dimuat | Periksa backend pada `/api/test`, PostgreSQL, serta `VITE_API_URL` yang berakhiran `/api`. |
| CORS / socket gagal | Samakan origin browser dengan `USER_FRONTEND_URL` backend; cek host, protokol, port, dan JWT pasien. |
| Daftar dokter kosong | Pastikan master dokter tersedia dan aktif. Seed hanya boleh dijalankan pada database demo yang dapat dikosongkan. |
| Invoice/tombol bayar belum muncul | Pastikan konsultasi sudah disimpan, invoice belum lunas, serta login menggunakan pasien pemilik invoice. Tombol tracking membutuhkan order farmasi menunggu pembayaran. |
| Script Midtrans gagal dimuat | Periksa internet, pemblokir script, Client Key sandbox, lalu coba ulang. Server Key tetap di backend. |
| Popup sukses, invoice belum lunas | Periksa webhook/ngrok dan log backend, bukan hanya callback Snap. Riwayat dapat memerlukan refresh. |
| Port 5174 dipakai | Gunakan server project yang sudah berjalan atau pilih port lain beserta perubahan CORS/QR. |
| Sesi tidak valid setelah reseed | Data pasien mungkin sudah dihapus; daftar/login ulang dengan data yang benar. |
| Error browser pada halaman deployment | Periksa URL API hasil build, CORS, HTTPS/mixed content, dan SPA fallback. |

## Lokasi kode penting

- [Routing](src/App.tsx), [API client](src/api/client.ts), dan [store autentikasi](src/stores/patientAuthStore.ts).
- [Helper Midtrans](src/api/midtrans.ts) dan [tombol pembayaran bersama](src/components/MidtransPaymentButton.tsx).
- [Tracking farmasi](src/components/MedicineTrackingStepper.tsx), [Socket.IO client](src/api/socket.ts), dan [Riwayat](src/screens/HistoryScreen.tsx).
