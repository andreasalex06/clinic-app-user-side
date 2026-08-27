import type { Gender, VisitStatus } from "../types/clinic";

export const genderOptions: Array<{ value: Gender; label: string }> = [
  { value: "MALE", label: "Laki-laki" },
  { value: "FEMALE", label: "Perempuan" }
];

export const statusLabels: Record<VisitStatus, string> = {
  WAITING: "Menunggu",
  IN_CONSULTATION: "Dalam konsultasi",
  COMPLETED: "Konsultasi selesai",
  CANCELLED: "Dibatalkan"
};
