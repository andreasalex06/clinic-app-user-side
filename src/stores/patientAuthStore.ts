import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Patient, SessionResponse } from "../types/clinic";

type PatientAuthState = {
  token: string | null;
  patient: Patient | null;
  setSession: (session: SessionResponse) => void;
  logout: () => void;
};

export const usePatientAuthStore = create<PatientAuthState>()(
  persist(
    (set) => ({
      token: null,
      patient: null,
      setSession: (session) => {
        set({
          token: session.token,
          patient: session.patient
        });
      },
      logout: () => {
        set({ token: null, patient: null });
      }
    }),
    {
      name: "clinic_patient_session"
    }
  )
);
