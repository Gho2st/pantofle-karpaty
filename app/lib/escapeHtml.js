// app/lib/escapeHtml.js
// Escapuje tekst od użytkownika przed wstawieniem do HTML maila.
export function escapeHtml(value) {
  if (value == null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Usuwa znaki nowej linii — do tematów maili (nagłówki).
export function singleLine(value) {
  return String(value ?? "").replace(/[\r\n]+/g, " ");
}
