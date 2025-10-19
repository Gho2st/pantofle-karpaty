"use client";
import Image from "next/image";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCart } from "@/app/context/cartContext";

export default function ProductDetails({ product }) {
  const { data: session } = useSession();
  const { fetchCart } = useCart();
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false); // Nowy stan dla feedbacku

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!session) {
      toast.error("Musisz być zalogowany, aby dodać produkt do koszyka");
      redirect("/login");
      return;
    }

    if (!selectedSize) {
      toast.error("Wybierz rozmiar");
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          size: selectedSize,
          quantity,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Produkt dodany do koszyka");
        setIsAdded(true); // Ustaw stan na "dodano"
        await fetchCart(); // Odśwież koszyk

        // Resetuj stan po 2 sekundach
        setTimeout(() => {
          setIsAdded(false);
        }, 2000);
      } else {
        toast.error(data.error || "Błąd podczas dodawania do koszyka");
      }
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

        {/* Formularz wyboru rozmiaru i ilości */}
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
            disabled={isAdded} // Wyłącz przycisk na czas animacji
          >
            {isAdded ? "Dodano!" : "Dodaj do koszyka"}
          </button>
        </form>

        <p className="mt-10">{product.description2}</p>
        <p className="mt-10">{product.additionalInfo}</p>
      </div>
    </div>
  );
}
