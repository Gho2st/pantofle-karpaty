import Collection from "./Collection";
import Link from "next/link";

export default function About() {
  return (
    <section className="max-w-5xl 2xl:max-w-7xl mx-auto px-6 py-16 lg:py-24">
      <div className="grid lg:grid-cols-12 gap-12 xl:gap-20 items-center">
        {/* Treść tekstowa */}
        <div className="lg:col-span-7 order-2 lg:order-1">
          <div className="space-y-6">
            <div className="space-y-4">
              <span className="inline-flex items-center gap-2 bg-red-50 border border-red-100 text-red-700 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase">
                <span className="text-base">🇵🇱</span> Polski producent z Karpat
              </span>

              <h2 className="text-3xl md:text-5xl font-serif font-medium leading-[1.1] text-gray-900">
                Tradycja i jakość <br className="hidden sm:block" />
                <span className="text-red-700">prosto z polskiego serca.</span>
              </h2>
            </div>

            <div className="space-y-5 text-base md:text-lg leading-relaxed text-gray-600 max-w-2xl">
              <p>
                Jesteśmy rodzinnym producentem pantofli, łączącym góralskie
                rzemiosło z nowoczesnym podejściem do wygody i designu. W naszej
                ofercie znajdują się zarówno modele wykonane ze skóry naturalnej
                i owczej wełny, jak i produkty z wykorzystaniem wysokiej jakości
                materiałów syntetycznych. Od lat dbamy o to, aby każdy model był
                komfortowy, trwały i dopasowany do codziennego użytkowania.
                Każda para przechodzi przez ręce naszych rzemieślników.
              </p>

              <p>
                Zwracamy uwagę na każdy detal — od starannego doboru materiałów,
                przez precyzyjne wykonanie, aż po końcową kontrolę jakości.
              </p>

              <div className="pl-4 border-l-2 border-red-200 italic text-gray-500 py-1">
                Zaufanie tysięcy klientów z Niemiec, Francji i Wielkiej Brytanii
                to nasz najlepszy dowód jakości.
              </div>
            </div>

            {/* CTA */}
            <div className="pt-4">
              <Link
                href="/kontakt"
                className="group inline-flex items-center gap-3 bg-gray-900 hover:bg-red-700 
                transition-all duration-300 text-white 
                font-medium px-8 py-4 rounded-xl shadow-lg hover:shadow-red-200"
              >
                Skontaktuj się z nami
                <span className="group-hover:translate-x-1 transition-transform text-xl">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Sekcja Video / TikTok */}
        <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center">
          <div className="relative w-full max-w-[300px] md:max-w-[320px] group">
            {/* Ozdobny element w tle */}
            <div className="absolute -inset-4 bg-red-50 rounded-[2.5rem] -rotate-2 group-hover:rotate-0 transition-transform duration-500" />

            <div className="relative aspect-[9/16] rounded-[2rem] overflow-hidden shadow-2xl bg-black border-[6px] border-white">
              <iframe
                src="https://www.tiktok.com/player/v1/7542430067901664535"
                className="absolute top-0 left-0 w-full h-full object-cover"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                title="Proces produkcji pantofli Karpaty"
              />
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-gray-400">
              <span className="w-8 h-[1px] bg-gray-200"></span>
              Obejrzyj proces produkcji
              <span className="w-8 h-[1px] bg-gray-200"></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
