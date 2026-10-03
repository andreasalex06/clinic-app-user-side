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
  queueIndex: number;
  name: string;
  specialization: string;
  consultationFee?: number | null;
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
  estimatedConsultationAt?: string | null;
  estimatedWaitingMinutes?: number;
  averageConsultationMinutes?: number;
  patient: Patient;
  doctor: Doctor;
  consultation?: {
    complaint: string;
    notes?: string | null;
    diagnosis: { name: string; code: string };
    treatments: Array<{ id: string; treatment: { name: string } }>;
    medicines: Array<{
      id: string;
      quantity: number;
      instructions?: string | null;
      medicine: { name: string };
    }>;
  } | null;
  invoice?: {
    id: string;
    invoiceNo: string;
    status: InvoiceStatus;
    total: number;
    paidAt?: string | null;
    midtransPaymentType?: string | null;
    items?: Array<{ id: string; item: string; quantity: number; price: number; amount: number }>;
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
        instructions?: string | null;
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
