// app/lib/revalidateCatalog.js
// Strony produktów, kategorii i listy kategorii są cache'owane (mniej zapytań
// do bazy = mniej godzin obliczeniowych w Neon). Po zmianie w panelu admina
// czyścimy cache, żeby sklep od razu pokazał nowe dane.
import { revalidatePath, revalidateTag } from "next/cache";

export const CATALOG_TAG = "catalog";

export function revalidateCatalog() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}
