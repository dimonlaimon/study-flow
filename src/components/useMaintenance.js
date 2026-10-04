export function useMaintenance() {
  const now = new Date();                     // Текущая дата
  const endDate = new Date('2026-10-10');   // Дата окончания работ
  return now < endDate;                      // true — если сейчас до этой даты
}
