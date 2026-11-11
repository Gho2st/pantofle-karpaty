/** @type {import('next').NextConfig} */

// Produkty, którym zmiana nazwy w panelu zmieniła adres. Stare adresy są
// w Google, reklamach i zakładkach klientów — stałe przekierowanie (308)
// przenosi na nowy adres razem z pozycją w wynikach wyszukiwania.
const RENAMED_PRODUCTS = {
  "kapcie-zdobione-skora-owcza": "kapcie-zdobione-skora-owcza-karmel",
  "kapcie-meskie-skorzane-welna": "kapcie-meskie-skorzane-welna-karmel",
  "klapki-mule-ciemny-braz-damskie": "klapki-mule-ciemny-braz-damskie-skorzane",
  "szare-klapki-mule-damskie": "szare-klapki-mule-damskie-skorzane",
  "szare-klapki-mule-zamsz": "szare-klapki-mule-damskie-skorzane",
  "kapcie-damskie-skorzane-luna-braz": "kapcie-damskie-skorzane-wyciete-braz",
  "drewniaki-biale": "drewniaki-biale-damskie-zakryte-skorzane",
  "kapcie-damskie-skorzane-100-skora-owcza":
    "kapcie-damskie-100-skora-owcza-premium",
};

const nextConfig = {
  images: {
    domains: ["pantofle-karpaty.s3.eu-central-1.amazonaws.com"],
    unoptimized: true,
  },
  reactStrictMode: false,
  async redirects() {
    return Object.entries(RENAMED_PRODUCTS).map(([from, to]) => ({
      source: `/produkty/${from}`,
      destination: `/produkty/${to}`,
      permanent: true,
    }));
  },
};
export default nextConfig;
