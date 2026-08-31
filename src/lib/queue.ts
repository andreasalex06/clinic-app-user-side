export function formatQueueCode(queueNumber?: number | null) {
  if (queueNumber === null || queueNumber === undefined) {
    return "-";
  }

  return `A-${String(queueNumber).padStart(3, "0")}`;
}
