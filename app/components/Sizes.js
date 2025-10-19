'use client'
import { useState } from "react";

const SizeChart = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChart = () => {
    setIsOpen(!isOpen);
  };

  // Dane rozmiarów
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
    <div className="mt-4">
      <button
        onClick={toggleChart}
        className="w-full text-left bg-gray-200 p-3 rounded-lg font-semibold text-lg focus:outline-none flex justify-between items-center"
      >
        <span>Tabela rozmiarów</span>
        <span>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && (
        <div className="mt-2 border border-gray-300 rounded-lg overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3">Rozmiar EU</th>
                <th className="p-3">Długość wkładki (cm)</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((size) => (
                <tr key={size.eu} className="border-t">
                  <td className="p-3">{size.eu}</td>
                  <td className="p-3">{size.insole}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SizeChart;
