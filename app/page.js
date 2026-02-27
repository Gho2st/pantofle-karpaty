import Baner from "./components/homepage/Baner";
import About from "./components/homepage/About";
import Testimonials from "./components/homepage/Testimonials";

export const metadata = {
  title: "Pantofle Karpaty - Kapcie Skórzane i Wełniane | Producent",
  description:
    "Sklep Pantofle Karpaty - producent tradycyjnych kapci domowych. Znajdź ciepłe i wygodne pantofle regionalne, bambosze i laczki z naturalnej skóry i wełny.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <>
      <Baner />
      <About />
      <Testimonials />
    </>
  );
}
