import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { usePatientAuthStore } from "../stores/patientAuthStore";
import { PatientNav } from "./PatientNav";
import { ContentMotion } from "./ui/Motion";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const token = usePatientAuthStore((state) => state.token);
  const showNav = Boolean(token) && !["/login", "/register"].includes(location.pathname);

  return (
    <main className="app-shell">
      <div className="app-container">
        <div className={showNav ? "grid gap-5 md:gap-6" : "mx-auto grid min-h-[calc(100svh-2rem)] w-full max-w-md content-center gap-4"}>
          {showNav && <PatientNav />}
          <section className="min-w-0">
            <ContentMotion key={location.pathname} className="content-grid">
              {children}
            </ContentMotion>
          </section>
        </div>
      </div>
    </main>
  );
}
