import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Socket } from "socket.io-client";
import { createPatientSocket } from "../api/socket";
import { usePatientAuthStore } from "../stores/patientAuthStore";

const PatientSocketContext = createContext<Socket | null>(null);

export function PatientSocketProvider({ children }: { children: ReactNode }) {
  const token = usePatientAuthStore((state) => state.token);
  const [socket, setSocket] = useState<Socket | null>(null);
  useEffect(() => {
    if (!token) { setSocket(null); return; }
    const connection = createPatientSocket(token);
    setSocket(connection);
    return () => { connection.disconnect(); };
  }, [token]);
  return <PatientSocketContext.Provider value={socket}>{children}</PatientSocketContext.Provider>;
}

export function usePatientSocket() {
  return useContext(PatientSocketContext);
}
