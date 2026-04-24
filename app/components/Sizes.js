"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const SizeChart = () => {
  const [isOpen, setIsOpen] = useState(false);

  const sizes = [
    { eu: 26, insole: 16.5 },
    { eu: 27, insole: 17.0 },
    { eu: 28, insole: 18 },
    { eu: 29, insole: 18.5 },
    { eu: 30, insole: 19.5 },
    { eu: 31, insole: 20 },
    { eu: 32, insole: 20.5 },
    { eu: 33, insole: 21 },
    { eu: 34, insole: 22 },
    { eu: 35, insole: 22.5 },
    { eu: 36, insole: 23 },
    { eu: 37, insole: 23.5 },
    { eu: 38, insole: 24.5 },
    { eu: 39, insole: 25.0 },
    { eu: 40, insole: 26 },
    { eu: 41, insole: 26.5 },
    { eu: 42, insole: 27 },
    { eu: 43, insole: 28 },
    { eu: 44, insole: 28.5 },
    { eu: 45, insole: 29.0 },
    { eu: 46, insole: 30 },
  ];

  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center justify-between w-full py-4 hover:opacity-70 transition-opacity"
      >
        <span className="uppercase tracking-widest text-xs font-semibold text-gray-500">
          Tabela rozmiarów
        </span>
        {isOpen ? (
          <ChevronUp size={15} className="text-gray-400" />
        ) : (
          <ChevronDown size={15} className="text-gray-400" />
        )}
      </button>

      {isOpen && (
        <div className="pb-6">
          <dl className="grid grid-cols-1 divide-y divide-gray-100">
            <div className="flex justify-between items-baseline py-2 gap-4">
              <dt className="text-xs text-gray-400">Rozmiar EU</dt>
              <dd className="text-xs text-gray-400">Długość wkładki (cm)</dd>
            </div>
            {sizes.map((size) => (
              <div
                key={size.eu}
                className="flex justify-between items-baseline py-2 gap-4"
              >
                <dt className="text-xs text-gray-400">{size.eu}</dt>
                <dd className="text-sm text-gray-700">
                  {size.insole.toFixed(1)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};

export default SizeChart;
