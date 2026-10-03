import { LuArrowRight } from "react-icons/lu";

export function PatientHero() {
  return (
    <section className="relative isolate flex w-full overflow-hidden bg-white text-slate-950">
      <div aria-hidden="true" className="pointer-events-none absolute left-[5%] top-5 size-10 rounded-full border-8 border-teal-100/35 sm:size-14" />
      <div className="relative z-10 flex w-[55%] min-w-0 flex-col justify-center px-4 py-6 sm:px-8 sm:py-8 md:px-10 md:py-9 lg:px-16 lg:py-10">
        <div className="max-w-[32rem]">
          <h1 className="max-w-[29rem] text-lg font-bold leading-[1.02] tracking-tight text-slate-950 sm:text-2xl md:text-3xl lg:text-4xl">
            Perawatan kesehatan lebih <span className="text-teal-700">dekat dengan Anda.</span>
          </h1>
          <p className="mt-2 max-w-[25rem] text-[0.68rem] leading-4 text-slate-600 sm:mt-3 sm:text-xs sm:leading-5 md:text-sm">
            Dapatkan layanan konsultasi yang nyaman, terpercaya, dan sesuai kebutuhan Anda.
          </p>
          <div className="mt-4 hidden flex-wrap items-center gap-2 sm:flex sm:gap-3">
            <a href="#available-doctors" className="inline-flex min-h-8 items-center gap-1.5 rounded-md bg-teal-700 px-3 text-[0.65rem] font-semibold text-white transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 sm:min-h-9 sm:px-3.5 sm:text-xs">
              Lihat Dokter
              <LuArrowRight aria-hidden="true" className="size-3.5" />
            </a>
            <a href="#available-doctors" className="inline-flex min-h-8 items-center rounded-md px-2 text-[0.65rem] font-semibold text-teal-700 transition hover:text-teal-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-teal-700 sm:min-h-9 sm:px-2.5 sm:text-xs">
              Cara Konsultasi
            </a>
          </div>
        </div>
      </div>
      <div className="absolute inset-y-0 right-0 z-0 w-[45%] overflow-hidden bg-teal-300 [clip-path:polygon(12%_0,100%_0,100%_100%,0_100%)]">
        <picture className="block size-full">
          <source media="(max-width: 767px)" srcSet="/hero/clinic-hero-mobile.png" />
          <source media="(max-width: 1199px)" srcSet="/hero/clinic-hero-tablet.png" />
          <img src="/hero/clinic-hero-desktop.png" alt="Dokter sedang melayani pasien" className="size-full object-cover object-top" />
        </picture>
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/4 bg-gradient-to-r from-white/75 via-white/25 to-transparent" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute right-[46%] top-3 z-10 size-9 rounded-full border-4 border-teal-100/35 sm:top-5 sm:size-14 sm:border-8" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-3 left-[38%] z-10 size-7 rounded-full border-4 border-teal-100/30 sm:bottom-5 sm:size-11 sm:border-[0.65rem]" />
    </section>
  );
}
