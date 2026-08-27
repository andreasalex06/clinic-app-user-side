import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { setAuthTokenGetter } from "./api/client";
import { CheckInScreen } from "./screens/CheckInScreen";
import { LoginScreen } from "./screens/LoginScreen";
import { QueueStatusScreen } from "./screens/QueueStatusScreen";
import { RegisterScreen } from "./screens/RegisterScreen";
import { usePatientAuthStore } from "./stores/patientAuthStore";

setAuthTokenGetter(() => usePatientAuthStore.getState().token);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/register" replace />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/check-in" element={<CheckInScreen />} />
        <Route path="/queue/:visitId" element={<QueueStatusScreen />} />
        <Route path="*" element={<Navigate to="/register" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
