import { PaymentNotice } from "./components/PaymentNotice";
import { AppShell } from "./components/AppShell";
import { LayoutGroup } from "motion/react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { setAuthTokenGetter, setUnauthorizedHandler } from "./api/client";
import { AccountScreen } from "./screens/AccountScreen";
import { FaqScreen } from "./screens/FaqScreen";

import { HistoryScreen } from "./screens/HistoryScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { PatientSocketProvider } from "./components/PatientSocketProvider";
import { PatientAssistantWidget } from "./components/PatientAssistantWidget";

import { RegisterScreen } from "./screens/RegisterScreen";
import { usePatientAuthStore } from "./stores/patientAuthStore";

setAuthTokenGetter(() => usePatientAuthStore.getState().token);
setUnauthorizedHandler(() => {
  usePatientAuthStore.getState().logout();

  if (!["/login", "/register"].includes(window.location.pathname)) {
    window.location.assign("/login");
  }
});

export default function App() {
  const patientToken = usePatientAuthStore((state) => state.token);

  return (
    <BrowserRouter>
      <PatientSocketProvider>
      <PaymentNotice />
      <PatientAssistantWidget key={patientToken ?? "signed-out"} />
      <LayoutGroup id="patient-navigation">
        <AppShell>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomeScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/check-in" element={<Navigate to="/home" replace />} />
            <Route path="/queue" element={<Navigate to="/home" replace />} />
            <Route path="/queue/:visitId" element={<Navigate to="/home" replace />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="/account" element={<AccountScreen />} />
            <Route path="/faq" element={<FaqScreen />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AppShell>
      </LayoutGroup>
    </PatientSocketProvider>
    </BrowserRouter>
  );
}
