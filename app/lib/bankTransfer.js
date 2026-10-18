// app/lib/bankTransfer.js
// Dane do przelewu tradycyjnego — wspólne dla strony zamówienia i maila z potwierdzeniem
export const BANK_TRANSFER = {
  recipient: "Firma KARPATY Maciej Wideł",
  bank: "PKO BP",
  account: "PL 06 1020 3453 0000 8602 0009 7758",
  deadline: "7 dni roboczych",
};

export const transferTitle = (orderId) => `Zamówienie #${orderId}`;
