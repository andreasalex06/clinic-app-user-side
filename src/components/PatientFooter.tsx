import { LuClock3, LuMail, LuMapPin, LuPhone } from "react-icons/lu";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { usePatientAuthStore } from "../stores/patientAuthStore";

const contactDetails = [
  { icon: LuPhone, label: "Telepon", value: "(021) 5550 1234", href: "tel:+622155501234" },
  { icon: LuPhone, label: "WhatsApp", value: "+62 812-3456-7890", href: "https://wa.me/6281234567890" },
  { icon: LuMail, label: "Email", value: "halo@saranamedika.example", href: "mailto:halo@saranamedika.example" }
];

const socialLinks = [
  { label: "Instagram", icon: FaInstagram, href: "https://instagram.com/saranamedika.demo" },
  { label: "Facebook", icon: FaFacebookF, href: "https://facebook.com/saranamedika.demo" },
  { label: "YouTube", icon: FaYoutube, href: "https://youtube.com/@saranamedika.demo" }
];

const contactLinkClass = "inline-flex min-h-10 items-center gap-2.5 text-sm text-teal-50 underline-offset-4 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-white";

export function PatientFooter() {
  const token = usePatientAuthStore((state) => state.token);

  return (
    <footer className="mt-auto w-full bg-teal-800 text-white">
      <div className="mx-auto w-full max-w-6xl px-5 py-8 pb-24 sm:px-7 sm:py-9 md:pb-8">
      <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_0.75fr_1fr]">
        <section aria-labelledby="footer-brand">
          <div className="flex items-center gap-3">
            <div className="grid size-11 shrink-0 place-items-center rounded-lg bg-white p-1.5">
              <img src="/logo.png" alt="" width={36} height={36} className="size-full object-contain" />
            </div>
            <div>
              <h2 id="footer-brand" className="text-base font-semibold">Sarana Medika</h2>
              <p className="mt-0.5 text-xs font-medium uppercase text-teal-100">Layanan Kesehatan</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-teal-50">Informasi layanan dan konsultasi klinik, dalam satu tempat.</p>
        </section>

        <section aria-labelledby="footer-contact">
          <h2 id="footer-contact" className="text-sm font-semibold">Kontak</h2>
          <address className="mt-2 not-italic">
            <ul className="grid gap-1">
              {contactDetails.map(({ icon: Icon, label, value, href }) => (
                <li key={label}>
                  <a className={contactLinkClass} href={href}>
                    <Icon aria-hidden="true" className="size-4 shrink-0 text-teal-200" />
                    <span><span className="sr-only">{label}: </span>{value}</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-3 flex items-start gap-2.5 text-sm leading-6 text-teal-50">
              <LuMapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-teal-200" />
              <span>Jl. Kesehatan No. 10, Jakarta Pusat</span>
            </p>
          </address>
        </section>

        <section aria-labelledby="footer-hours">
          <h2 id="footer-hours" className="text-sm font-semibold">Jam Operasional</h2>
          <p className="mt-3 flex items-start gap-2.5 text-sm leading-6 text-teal-50">
            <LuClock3 aria-hidden="true" className="mt-1 size-4 shrink-0 text-teal-200" />
            <span>Senin–Sabtu<br />08.00–20.00 WIB<br />Minggu dan hari libur: tutup</span>
          </p>
        </section>

        <section aria-labelledby="footer-links">
          <h2 id="footer-links" className="text-sm font-semibold">Tautan</h2>
          <nav aria-label="Navigasi footer" className="mt-2 grid justify-start">
            <Link className={contactLinkClass} to={token ? "/home" : "/login"}>{token ? "Beranda" : "Masuk"}</Link>
            {token && <Link className={contactLinkClass} to="/history">Riwayat</Link>}
            <Link className={contactLinkClass} to={token ? "/account" : "/register"}>{token ? "Akun" : "Daftar pasien"}</Link>
            <Link className={contactLinkClass} to="/faq">Pertanyaan umum</Link>
          </nav>
          <h3 className="mt-5 text-sm font-semibold">Ikuti kami</h3>
          <nav aria-label="Media sosial" className="mt-2 flex flex-wrap gap-2">
            {socialLinks.map(({ label, icon: Icon, href }) => (
              <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label} className="grid size-10 place-items-center rounded-lg border border-teal-500 text-teal-50 transition-colors hover:bg-teal-700 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
                <Icon aria-hidden="true" className="size-4" />
              </a>
            ))}
          </nav>
        </section>
      </div>

      <div className="mt-7 flex flex-col gap-2 border-t border-teal-600 pt-4 text-xs leading-5 text-teal-100 sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; {new Date().getFullYear()} Sarana Medika. Semua hak dilindungi.</p>
      </div>
      </div>
    </footer>
  );
}
