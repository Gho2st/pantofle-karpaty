import Baner from "./components/homepage/Baner";
import About from "./components/homepage/About";
import Testimonials from "./components/homepage/Testimonials";
import SeoSection from "./components/homepage/SeoSection";
import ShoeViewerServer from "./components/homepage/ShoeViewerServer";
import FeaturedServerSlider from "./components/FeaturedServerSlider";
import { SITE_URL } from "./lib/site";

export const metadata = {
  title: "Pantofle Karpaty - Kapcie Skórzane i Wełniane | Producent",
  description:
    "Sklep Pantofle Karpaty - producent tradycyjnych kapci domowych. Znajdź ciepłe i wygodne pantofle regionalne, bambosze i laczki z naturalnej skóry i wełny.",
  alternates: {
    canonical: "/",
  },
};

// Dane firmy dla Google (nazwa, logo, kontakt) — wcześniej strona główna
// nie miała żadnych danych strukturalnych
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Pantofle Karpaty",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  email: "mwidel@pantofle-karpaty.pl",
  sameAs: ["https://www.tiktok.com/@pantofle_karpaty"],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Pantofle Karpaty",
  url: SITE_URL,
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([organizationSchema, websiteSchema]),
        }}
      />
      <Baner />
      <ShoeViewerServer colorGroup="klapki-zamszowe" />
      <FeaturedServerSlider />
      <About />
      <Testimonials />
      <SeoSection />
    </>
  );
}
