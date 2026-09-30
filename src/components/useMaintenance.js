export function useMaintenance() {
  const now = new Date();                     // Текущая дата
  const endDate = new Date('2025-10-01');   // Дата окончания работ
  return now < endDate;                      // true — если сейчас до этой даты
}
