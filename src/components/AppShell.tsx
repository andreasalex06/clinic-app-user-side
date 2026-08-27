import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <main className="app-shell">
      <section className="phone-frame">
        <header className="app-header">
          <p className="eyebrow">ClinicApp Patient</p>
          <h1>Sarana Medika</h1>
        </header>
        {children}
      </section>
    </main>
  );
}
