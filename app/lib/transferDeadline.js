// app/lib/transferDeadline.js
// Termin na przelew tradycyjny — wspólny dla crona (expire-transfers)
// i etykiety w panelu admina.

// Klient ma "7 dni roboczych" na przelew (TraditionalPaymentInstructions.js).
// +1 dzień roboczy zapasu na zaksięgowanie przelewu i święta.
export const TRANSFER_EXPIRY_BUSINESS_DAYS = 7 + 1;

const isBusinessDay = (date) => date.getDay() !== 0 && date.getDay() !== 6;

export function subtractBusinessDays(date, days) {
  const result = new Date(date);
  while (days > 0) {
    result.setDate(result.getDate() - 1);
    if (isBusinessDay(result)) days--;
  }
  return result;
}

// Ile pełnych dni roboczych minęło od daty (dzień złożenia się nie liczy)
export function businessDaysSince(date, now = new Date()) {
  const cursor = new Date(date);
  let days = 0;
  while (true) {
    cursor.setDate(cursor.getDate() + 1);
    if (cursor > now) return days;
    if (isBusinessDay(cursor)) days++;
  }
}
