"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "react-toastify";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cart", { method: "GET" });
      const data = await response.json();
      if (response.ok) {
        const items = data.cart || [];
        setCartItems(items);
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        setCartCount(totalItems);
      } else {
        toast.error(data.error || "Błąd podczas pobierania koszyka");
      }
    } catch (error) {
      console.error("Błąd podczas pobierania koszyka:", error);
      toast.error("Błąd serwera");
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = useCallback(
    async (cartItemId, quantity) => {
      if (quantity < 1) return;
      try {
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId, quantity }),
        });
        const data = await response.json();
        if (response.ok) {
          await fetchCart();
          toast.success("Ilość zaktualizowana");
        } else {
          toast.error(data.error || "Błąd podczas aktualizacji koszyka");
        }
      } catch (error) {
        console.error("Błąd podczas aktualizacji ilości:", error);
        toast.error("Błąd serwera");
      }
    },
    [fetchCart]
  );

  const removeFromCart = useCallback(
    async (cartItemId) => {
      try {
        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId }),
        });
        const data = await response.json();
        if (response.ok) {
          await fetchCart();
          toast.success("Produkt usunięty z koszyka");
        } else {
          toast.error(data.error || "Błąd podczas usuwania produktu");
        }
      } catch (error) {
        console.error("Błąd podczas usuwania produktu:", error);
        toast.error("Błąd serwera");
      }
    },
    [fetchCart]
  );

  useEffect(() => {
    fetchCart(); // Pobierz koszyk przy montowaniu
  }, [fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cartCount,
        cartItems,
        setCartItems,
        loading,
        setLoading,
        fetchCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
