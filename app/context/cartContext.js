"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();
      if (response.ok && data.cart && data.cart.length > 0) {
        setCartItems(data.cart);
      } else {
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const enrichedCart = localCart.map((item) => ({
          ...item,
          id: item.id || Date.now(),
        }));
        setCartItems(enrichedCart);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania koszyka:", error);
      toast.error("Błąd podczas pobierania koszyka");
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (productId, size, quantity, product) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, size, quantity }),
      });
      const data = await response.json();
      if (response.ok) {
        const newItem = {
          id: data.cartItem.id || Date.now(),
          productId,
          size,
          quantity,
          product: {
            id: productId,
            name: product.name || "Produkt",
            price: product.price || 0,
            images: product.images || ["/placeholder.png"],
          },
        };
        const updatedCart = [...cartItems, newItem];
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        toast.success("Produkt dodany do koszyka");
      } else {
        toast.error(data.error || "Błąd podczas dodawania do koszyka");
      }
    } catch (error) {
      console.error("Błąd podczas dodawania do koszyka:", error);
      toast.error("Błąd serwera");
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const response = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId, quantity }),
      });
      const data = await response.json();
      if (response.ok) {
        const updatedCart = cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity } : item
        );
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        toast.success("Ilość zaktualizowana");
      } else {
        toast.error(data.error || "Błąd podczas aktualizacji koszyka");
      }
    } catch (error) {
      console.error("Błąd podczas aktualizacji koszyka:", error);
      toast.error("Błąd serwera");
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId }),
      });
      if (response.ok) {
        const updatedCart = cartItems.filter((item) => item.id !== cartItemId);
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        toast.success("Produkt usunięty z koszyka");
      } else {
        const data = await response.json();
        toast.error(data.error || "Błąd podczas usuwania z koszyka");
      }
    } catch (error) {
      console.error("Błąd podczas usuwania z koszyka:", error);
      toast.error("Błąd serwera");
    }
  };

  const clearCart = async () => {
    try {
      if (session) {
        await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clearAll: true }),
        });
      }
      setCartItems([]);
      localStorage.removeItem("cart");
      toast.success("Koszyk wyczyszczony");
    } catch (error) {
      console.error("Błąd podczas czyszczenia koszyka:", error);
      toast.error("Błąd podczas czyszczenia koszyka");
    }
  };

  // Synchronizacja koszyka po zalogowaniu
  useEffect(() => {
    if (session) {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (localCart.length > 0) {
        // Przenieś produkty z localStorage do bazy danych
        localCart.forEach(async (item) => {
          try {
            const response = await fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: item.productId,
                size: item.size,
                quantity: item.quantity,
              }),
            });
            const data = await response.json();
            if (!response.ok) {
              toast.error(data.error || "Błąd podczas synchronizacji koszyka");
            }
          } catch (error) {
            console.error("Błąd podczas synchronizacji koszyka:", error);
            toast.error("Błąd podczas synchronizacji koszyka");
          }
        });
        // Wyczyść localStorage i odśwież koszyk z bazy
        localStorage.removeItem("cart");
        fetchCart();
      }
    }
  }, [session, fetchCart]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
