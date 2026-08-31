export type Gender = "MALE" | "FEMALE";

export type VisitStatus = "WAITING" | "IN_CONSULTATION" | "COMPLETED" | "CANCELLED";

export type InvoiceStatus = "UNPAID" | "PAID";

export type PharmacyStatus = "WAITING_PAYMENT" | "PREPARING" | "READY_FOR_PICKUP" | "COMPLETED";

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
  isActive?: boolean;
  status?: "ACTIVE" | "INACTIVE";
  avatarUrl?: string | null;
};

export type Visit = {
  id: string;
  visitNumber: string;
  queueNumber: number;
  queueDate?: string;
  checkInTime?: string;
  status: VisitStatus;
  waitingAhead?: number;
  patient: Patient;
  doctor: Doctor;
  invoice?: {
    id: string;
    invoiceNo: string;
    status: InvoiceStatus;
    total: number;
    paidAt?: string | null;
  } | null;
  pharmacyOrder?: PharmacyOrder | null;
};

export type PharmacyOrder = {
  id: string;
  visitId: string;
  queueNumber?: number | null;
  queueDate?: string | null;
  status: PharmacyStatus;
  preparedAt?: string | null;
  readyAt?: string | null;
  pickedUpAt?: string | null;
  visit: Visit & {
    consultation?: {
      medicines: Array<{
        id: string;
        quantity: number;
        medicine: {
          id: string;
          name: string;
          price: number;
          stock: number;
        };
      }>;
    } | null;
  };
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
