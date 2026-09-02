import { LayoutGroup } from "motion/react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { setAuthTokenGetter, setUnauthorizedHandler } from "./api/client";
import { AccountScreen } from "./screens/AccountScreen";
import { CheckInScreen } from "./screens/CheckInScreen";
import { HistoryScreen } from "./screens/HistoryScreen";
import { HomeScreen } from "./screens/HomeScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { QueueScreen } from "./screens/QueueScreen";
import { QueueStatusScreen } from "./screens/QueueStatusScreen";
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
  return (
    <BrowserRouter>
      <LayoutGroup id="patient-navigation">
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/check-in" element={<CheckInScreen />} />
          <Route path="/queue" element={<QueueScreen />} />
          <Route path="/queue/:visitId" element={<QueueStatusScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/account" element={<AccountScreen />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </LayoutGroup>
    </BrowserRouter>
  );
}
