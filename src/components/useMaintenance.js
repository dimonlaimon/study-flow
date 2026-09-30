export function useMaintenance() {
  const now = new Date();
  const endDate = new Date('2026-10-02T00:00:00'); // Дата окончания работ
  return now < endDate;
}
