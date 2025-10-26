"use client";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCart } from "@/app/context/cartContext";

export default function ProductDetails({ product }) {
  const { data: session } = useSession();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showCartLink, setShowCartLink] = useState(false); // Nowy stan dla linku

  const handleAddToCart = async (e) => {
    e.preventDefault();

    if (!selectedSize) {
      toast.error("Wybierz rozmiar");
      return;
    }

    try {
      await addToCart(product.id, selectedSize, quantity, product);
      setIsAdded(true);
      setShowCartLink(true); // Pokazujemy link po dodaniu
      setTimeout(() => setIsAdded(false), 2000); // Komunikat „Dodano!” znika po 2 sekundach
      // Opcjonalnie: setTimeout(() => setShowCartLink(false), 5000); // Link znika po 5 sekundach
    } catch (error) {
      console.error("Błąd podczas dodawania do koszyka:", error);
      toast.error("Błąd serwera");
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-24 flex gap-16">
      <div className="w-1/3">
        <Image
          src={product.images?.[0] || "/placeholder.png"}
          width={300}
          height={300}
          layout="responsive"
          alt={product.name}
        />
      </div>

      <div className="w-2/3">
        <h1 className="text-4xl uppercase mb-6">{product.name}</h1>
        <span className="font-light text-2xl">{product.price} PLN</span>
        <p className="mt-10">{product.description}</p>

        <form onSubmit={handleAddToCart} className="mt-6">
          <div className="mb-4">
            <label htmlFor="size" className="block text-lg font-medium mb-2">
              Wybierz rozmiar:
            </label>
            <select
              id="size"
              name="size"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
              required
            >
              <option value="" disabled>
                Wybierz rozmiar
              </option>
              {product.sizes.map((sizeOption) => (
                <option
                  key={sizeOption.size}
                  value={sizeOption.size}
                  disabled={sizeOption.stock === 0}
                >
                  Rozmiar {sizeOption.size}{" "}
                  {sizeOption.stock === 0
                    ? "(Brak w magazynie)"
                    : `(Na stanie: ${sizeOption.stock})`}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label
              htmlFor="quantity"
              className="block text-lg font-medium mb-2"
            >
              Ilość:
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              max={
                product.sizes.find((s) => s.size === selectedSize)?.stock || 1
              }
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md p-2 w-full max-w-xs"
              required
            />
          </div>

          <button
            type="submit"
            className={`mt-4 px-6 py-2 rounded-md text-white transition duration-300 ${
              isAdded ? "bg-green-600" : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={isAdded}
          >
            {isAdded ? "Dodano!" : "Dodaj do koszyka"}
          </button>

          {/* Link do koszyka jako przycisk */}
          {showCartLink && (
            <Link
              href="/koszyk"
              className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 ml-4"
            >
              Przejdź do koszyka
            </Link>
          )}
        </form>

        <p className="mt-10">{product.description2}</p>
        <p className="mt-10">{product.additionalInfo}</p>
      </div>
    </div>
  );
}
