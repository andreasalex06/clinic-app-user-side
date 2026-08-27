export type Gender = "MALE" | "FEMALE";

export type VisitStatus = "WAITING" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED";

export type Patient = {
  id: string;
  name: string;
  phone: string;
  gender: Gender;
  birthDate: string;
  address: string;
};

export type Doctor = {
  id: string;
  name: string;
  specialization: string;
  phone: string;
};

export type Visit = {
  id: string;
  visitNumber: string;
  queueNumber: number;
  status: VisitStatus;
  waitingAhead?: number;
  patient: Patient;
  doctor: Doctor;
};

export type PatientRegisterPayload = {
  name: string;
  phone: string;
  password: string;
  gender: Gender;
  birthDate: string;
  address: string;
};

export type PatientLoginPayload = {
  phone: string;
  password: string;
};

export type SessionResponse = {
  token: string;
  patient: Patient;
};
