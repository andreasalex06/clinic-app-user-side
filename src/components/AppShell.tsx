import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { usePatientAuthStore } from "../stores/patientAuthStore";
import { PatientNav } from "./PatientNav";
import { PatientFooter } from "./PatientFooter";
import { ContentMotion } from "./ui/Motion";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const token = usePatientAuthStore((state) => state.token);
  const patient = usePatientAuthStore((state) => state.patient);
  const showNav = Boolean(token) && !["/login", "/register"].includes(location.pathname);

  return (
    <div className="app-shell flex flex-col">
      {showNav && <PatientNav patientName={patient?.name} />}
      <div className="app-container flex flex-1 flex-col">
        <main className={showNav || location.pathname === "/faq" ? "min-w-0 flex-1" : "mx-auto grid w-full max-w-md flex-1 content-center py-8"}>
          <AnimatePresence mode="wait" initial={false}>
            <ContentMotion key={location.pathname} className="content-grid">
              {children}
            </ContentMotion>
          </AnimatePresence>
        </main>
      </div>
      <PatientFooter />
    </div>
  );
}
