import { LuCircleHelp, LuClock3, LuHouse, LuUserRound } from "react-icons/lu";
import { motion, useReducedMotion } from "motion/react";
import type { ElementType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { LogoutButton } from "./LogoutButton";

type PatientNavProps = {
  patientName?: string;
};

function getInitial(name?: string) {
  return name?.charAt(0).toUpperCase() ?? "P";
}

const navItems = [
  { to: "/home", label: "Beranda", icon: LuHouse },
  { to: "/history", label: "Riwayat", icon: LuClock3 },
  { to: "/faq", label: "FAQ", icon: LuCircleHelp },
  { to: "/account", label: "Akun", icon: LuUserRound }
];

export function PatientNav({ patientName }: PatientNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const activePath = location.pathname.startsWith("/queue") ? "/queue" : location.pathname;

  return (
    <>
      <nav className="sticky top-0 z-30 hidden w-full border-b border-teal-800 bg-teal-700 shadow-sm md:block" aria-label="Navigasi pasien desktop">
        <div className="mx-auto flex min-h-16 w-full max-w-6xl min-w-0 items-center justify-between gap-3 px-5 sm:px-7">
          <button
            type="button"
            className="flex min-w-0 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left"
            onClick={() => navigate("/home")}
          >
            <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-white p-1">
              <img src="/logo.png" alt="" className="size-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold leading-5 text-white">Sarana Medika</p>
              <p className="hidden text-[0.65rem] font-medium uppercase tracking-[0.12em] text-teal-100 lg:block">Layanan kesehatan</p>
            </div>
          </button>
          <div className="flex min-w-0 items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon as ElementType;
              const isActive = item.to === activePath;

              return (
                <button
                  key={item.to}
                  type="button"
                  className={cn(
                    "relative isolate inline-flex h-9 min-w-0 items-center gap-1.5 rounded-lg px-2.5 text-[0.8rem] font-medium transition-colors",
                    isActive ? "text-teal-800 hover:bg-white hover:text-teal-800" : "text-teal-50 hover:bg-white/15 hover:text-white"
                  )}
                  onClick={() => navigate(item.to)}
                >
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 -z-10 rounded-md bg-white"
                      layoutId="desktop-active-tab"
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                  <span>
                    <Icon className="size-[0.95rem] shrink-0" strokeWidth={2.3} />
                  </span>
                  <span className="relative z-10 truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex min-w-0 items-center gap-2 border-l border-teal-500 px-2">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-white text-xs font-semibold text-teal-800">
              {getInitial(patientName)}
            </div>
            <p className="hidden max-w-36 truncate text-xs font-semibold text-white md:block">
              {patientName ?? "Pasien"}
            </p>
            <LogoutButton iconOnly />
          </div>
        </div>
      </nav>

      <nav className="bottom-nav rounded-lg border border-teal-700 bg-teal-700 p-1 shadow-md md:hidden" aria-label="Navigasi pasien mobile">
        <div className="grid grid-cols-4 gap-1 text-[0.7rem] font-medium">
        {navItems.map((item) => {
          const Icon = item.icon as ElementType;
          const isActive = item.to === activePath;

          return (
            <button
              key={item.to}
              type="button"
              className={cn(
                "relative isolate grid min-h-13 min-w-0 place-items-center gap-1 rounded-lg px-2 py-1.5 transition-colors",
                isActive ? "text-teal-800 hover:bg-white hover:text-teal-800" : "text-teal-50 hover:bg-white/15 hover:text-white"
              )}
              onClick={() => navigate(item.to)}
            >
              {isActive && (
                <motion.span
                  className="absolute inset-0 -z-10 rounded-md bg-white"
                  layoutId="mobile-active-tab"
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <span>
                <Icon className="size-[1.15rem]" strokeWidth={2.3} />
              </span>
              <span className="relative z-10 truncate">{item.label}</span>
            </button>
          );
        })}
        </div>
      </nav>
    </>
  );
}
