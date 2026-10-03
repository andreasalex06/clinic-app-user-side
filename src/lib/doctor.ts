export function formatSpecialization(value?: string) {
  return value?.replace(/^Spesialis\b\s*/i, "Sp. ") ?? "";
}
