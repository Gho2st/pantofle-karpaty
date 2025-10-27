// /utils/slugify.js
// Używamy "pełniejszej" wersji funkcji z pliku Products.js
export const generateSlug = (name) => {
  if (!name) return "";
  const polishToAscii = {
    ą: "a",
    ć: "c",
    ę: "e",
    ł: "l",
    ń: "n",
    ó: "o",
    ś: "s",
    ź: "z",
    ż: "z",
    Ą: "A",
    Ć: "C",
    Ę: "E",
    Ł: "L",
    Ń: "N",
    Ó: "O",
    Ś: "S",
    Ź: "Z",
    Ż: "Z",
  };

  return name
    .toLowerCase()
    .trim()
    .replace(/[ąćęłńóśźż]/g, (match) => polishToAscii[match] || match)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};
