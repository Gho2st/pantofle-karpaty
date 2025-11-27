# Pantofle Karpaty – sklep internetowy

**[Live → sklep-pantofle-karpaty.pl](https://sklep-pantofle-karpaty.pl)**  
Nowoczesny, szybki sklep online polskiego producenta tradycyjnych pantofli skórzanych i wełnianych.  
W pełni działający e-commerce z płatnościami Stripe, paczkomatami InPost i zarządzaniem zamówieniami.

![preview](https://raw.githubusercontent.com/Gho2st/pantofle-karpaty/main/public/preview.jpg)

## Główne funkcje

- Koszyk zakupowy z lokalnym zapisem (localStorage)
- Płatności online przez **Stripe** (karty, Przelewy24, BLIK, Apple/Google Pay)
- Wybór paczkomatu przez **InPost Geowidget**
- Logowanie i rejestracja użytkowników – **NextAuth.js** (Google + credentials)
- Panel użytkownika (historia zamówień, dane adresowe)
- Responsywny design (mobile-first)
- Optymalizacja SEO i szybkość (Next.js Image, SSG/SSR gdzie potrzeba)

## Technologie

- **Next.js** (App Router)
- **JavaScript** (bez TypeScript – celowo, dla szybszego developmentu)
- **NextAuth.js** – autoryzacja
- **Stripe** – płatności
- **InPost Geowidget** – wybór paczkomatu
- **Tailwind CSS** + Headless UI
- **Zustand** – zarządzanie stanem koszyka
- Hosting & deployment: **Vercel**
