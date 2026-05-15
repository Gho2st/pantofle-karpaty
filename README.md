# Pantofle Karpaty – Profesjonalny Sklep Internetowy

**Live:** [sklep-pantofle-karpaty.pl](https://sklep-pantofle-karpaty.pl)

Nowoczesna, w pełni funkcjonalna platforma e-commerce dla polskiego producenta tradycyjnych pantofli i kapci skórzanych/wełnianych z Karpat.

## 🎯 O projekcie

Pantofle Karpaty to nie tylko sklep – to kompletne rozwiązanie e-commerce stworzone od zera dla realnego biznesu rodzinnego. Platforma obsługuje cały proces zakupowy: od przeglądania produktów, przez koszyk, wybór paczkomatu, płatności online, aż po panel klienta i zarządzanie zamówieniami.

Projekt powstał z myślą o **wysokiej wydajności**, **doskonałym UX** oraz **łatwości utrzymania i rozwoju**.

### Kluczowe osiągnięcia
- W pełni działający e-commerce zintegrowany z polskimi systemami płatności i dostaw
- Responsywny design mobile-first z naciskiem na konwersję
- Optymalizacja Core Web Vitals i SEO (SSG + SSR)
- Bezpieczna autoryzacja i zarządzanie danymi klientów
- Gotowość do skalowania (admin panel w trakcie rozwoju)

## ✨ Główne funkcjonalności

### Frontend & UX
- Zaawansowany koszyk z zapisem w `localStorage` + synchronizacją z serwerem
- Responsywny, nowoczesny design (Tailwind CSS + Headless UI)
- Strony produktowe zoptymalizowane pod SEO
- Blog oraz statyczne strony

### Płatności i Dostawa
- **Stripe Checkout** – pełne wsparcie dla kart, Przelewy24, BLIK, Apple Pay, Google Pay
- Integracja z **InPost Geowidget**

### Autoryzacja
- Logowanie przez Google (**NextAuth.js**)
- Panel klienta + **zaawansowany Panel Administracyjny**

### Panel Administracyjny (Admin Dashboard)

**Pełny, produkcyjny panel administracyjny** zbudowany od zera:

- **Dashboard** – podsumowanie sprzedaży, zamówień i statystyk
- **Zarządzanie produktami** – dodawanie, edycja, usuwanie produktów z obsługą wielu zdjęć
- **Zarządzanie kategoriami** – pełna kontrola nad kategoriami i podkategoriami
- **Zamówienia** – przegląd, zmiana statusów, filtrowanie i eksport
- **Kody rabatowe** – tworzenie i zarządzanie promocjami
- **Blog** – publikacja i edycja wpisów blogowych
- **Przetwarzanie zdjęć** – automatyczna optymalizacja i upload obrazów
- **Modularna budowa** z użyciem React Server Components i Server Actions

Panel jest chroniony autoryzacją i gotowy do dalszego rozwoju (np. analityka, raporty, integracja z magazynem).

---

## 🛠 Technologie

| Warstwa              | Technologia                          |
|----------------------|--------------------------------------|
| **Framework**        | Next.js 14+ (App Router)            |
| **Język**            | JavaScript (TypeScript-ready)       |
| **Stylizacja**       | Tailwind CSS + Headless UI          |
| **Autoryzacja**      | NextAuth.js                         |
| **Płatności**        | Stripe                              |
| **Baza danych**      | NeonDB (PostgreSQL) + Prisma ORM    |
| **Panel admin**      | Custom React components + Server Actions |
| **Hosting**          | Vercel                              |

---