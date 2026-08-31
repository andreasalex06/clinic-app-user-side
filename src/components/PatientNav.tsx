import { Clock3, Home, ListPlus, UserRound } from "lucide-react";
import type { ElementType } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

const navItems = [
  { to: "/home", label: "Beranda", icon: Home },
  { to: "/queue", label: "Antrean", icon: ListPlus },
  { to: "/history", label: "Riwayat", icon: Clock3 },
  { to: "/account", label: "Akun", icon: UserRound }
];

export function PatientNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname.startsWith("/queue") ? "/queue" : location.pathname;

  return (
    <>
      <nav className="hidden rounded-lg border border-slate-200 bg-white p-2 shadow-sm md:block" aria-label="Navigasi pasien desktop" >
        <div className="flex min-w-0 items-center justify-between gap-4">
          <button
            type="button"
            className="flex min-w-0 items-center gap-3 rounded-md px-2 py-1.5 text-left"
            onClick={() => navigate("/home")}
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-slate-950 text-white">
              <Home className="size-5" strokeWidth={2.3} />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-slate-950">Sarana Medika</p>
            </div>
          </button>
          <div className="flex min-w-0 items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon as ElementType;
              const isActive = item.to === activePath;

              return (
                <button
                  key={item.to}
                  type="button"
                  className={cn(
                    "inline-flex h-10 min-w-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-950",
                    isActive && "bg-slate-100 text-slate-950"
                  )}
                  onClick={() => navigate(item.to)}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={2.3} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <nav className="bottom-nav rounded-lg border border-slate-200 bg-white p-1 shadow-sm md:hidden" aria-label="Navigasi pasien mobile">
        <div className="grid grid-cols-4 gap-1 text-xs font-medium">
        {navItems.map((item) => {
          const Icon = item.icon as ElementType;
          const isActive = item.to === activePath;

          return (
            <button
              key={item.to}
              type="button"
              className={cn(
                "grid min-h-14 min-w-0 place-items-center gap-1 rounded-md px-2 py-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950",
                isActive && "bg-slate-100 text-slate-950"
              )}
              onClick={() => navigate(item.to)}
            >
              <Icon className="size-5" strokeWidth={2.3} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
        </div>
      </nav>
    </>
  );
}
