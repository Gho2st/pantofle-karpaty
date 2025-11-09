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
  const { data: session, status } = useSession();

  const [cartItems, setCartItems] = useState([]);
  const [availabilityErrors, setAvailabilityErrors] = useState([]);
  const [availableQuantities, setAvailableQuantities] = useState({});

  const getCurrentPrice = (product) => {
    if (!product) return 0;

    if (!product.promoEndDate || !product.promoPrice) {
      return product.price;
    }

    const now = new Date();
    const promoEnd = new Date(product.promoEndDate);

    if (isNaN(promoEnd.getTime())) {
      console.warn("→ Nieprawidłowa data promocji:", product.promoEndDate);
      return product.price;
    }

    const isPromoActive = product.promoPrice < product.price && promoEnd >= now;

    return isPromoActive ? product.promoPrice : product.price;
  };

  const consolidateCartItems = (items) => {
    const map = new Map();
    items.forEach((item) => {
      const key = `${item.productId}-${item.size}`;
      if (map.has(key)) {
        map.get(key).quantity += item.quantity;
      } else {
        map.set(key, { ...item });
      }
    });
    return Array.from(map.values());
  };

  // === 1. Wczytaj koszyk gościa z localStorage (tylko raz) ===
  useEffect(() => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem("cart");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCartItems(consolidateCartItems(parsed));
      } catch (error) {
        console.error("Błąd parsowania localStorage cart:", error);
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // === 2. Pobierz koszyk z API (tylko dla zalogowanych) ===
  const fetchCart = useCallback(async () => {
    if (!session?.user?.id) return;

    try {
      const response = await fetch("/api/cart");
      const data = await response.json();

      if (response.ok && data.cart) {
        const consolidated = consolidateCartItems(data.cart);
        setCartItems(consolidated);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error("fetchCart error:", error);
      setCartItems([]);
    }
  }, [session?.user?.id]);

  // === 3. Synchronizacja koszyka gościa przy logowaniu ===
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
    if (localCart.length === 0) {
      fetchCart();
      return;
    }

    const syncGuestCart = async () => {
      try {
        await Promise.all(
          localCart.map((item) =>
            fetch("/api/cart", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productId: item.productId,
                size: item.size,
                quantity: item.quantity,
              }),
            })
          )
        );
        localStorage.removeItem("cart");
        toast.success("Koszyk gościa został zsynchronizowany!");
      } catch (error) {
        console.error("Błąd synchronizacji koszyka:", error);
        toast.warn("Nie udało się zsynchronizować koszyka gościa.");
      } finally {
        await fetchCart();
      }
    };

    syncGuestCart();
  }, [status, session?.user?.id, fetchCart]);

  // === 4. Sprawdź dostępność ===
  const checkAvailability = useCallback(
    async (itemsToCheck = cartItems) => {
      const items = itemsToCheck || [];
      if (items.length === 0) {
        setAvailabilityErrors([]);
        setAvailableQuantities({});
        return true;
      }

      const consolidated = consolidateCartItems(items);
      try {
        const res = await fetch("/api/check-stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItems: consolidated }),
        });
        const data = await res.json();

        if (res.ok) {
          const unavailable = data.availability.filter((i) => !i.available);
          setAvailabilityErrors(unavailable);

          const quantities = {};
          data.availability.forEach((i) => {
            quantities[`${i.productId}-${i.size}`] = i.availableQuantity || 0;
          });
          setAvailableQuantities(quantities);

          return unavailable.length === 0;
        } else {
          setAvailabilityErrors([
            { message: data.error || "Błąd dostępności" },
          ]);
          return false;
        }
      } catch (error) {
        console.error("checkAvailability error:", error);
        setAvailabilityErrors([{ message: "Błąd połączenia z serwerem" }]);
        return false;
      }
    },
    [cartItems]
  );

  // === 5. Dodaj do koszyka ===
  const addToCart = async (productId, size, quantity) => {
    try {
      const productRes = await fetch(`/api/products/${productId}`);
      if (!productRes.ok) throw new Error("Produkt nie istnieje");
      const { product } = await productRes.json();

      const newItem = {
        id: Date.now() + Math.random(),
        productId,
        size,
        quantity,
        product: {
          id: product.id,
          name: product.name,
          price: product.price, // ← oryginalna
          promoPrice: product.promoPrice, // ← dodane
          promoEndDate: product.promoEndDate, // ← dodane
          images: product.images || ["/placeholder.png"],
        },
      };

      const updatedCart = consolidateCartItems([...cartItems, newItem]);
      setCartItems(updatedCart);

      if (!session) {
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      }

      toast.success("Dodano do koszyka!");
      await checkAvailability(updatedCart);

      if (session) {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, size, quantity }),
        });
        await fetchCart();
      }
    } catch (error) {
      toast.error(error.message || "Błąd dodawania do koszyka");
    }
  };

  // === 6. Aktualizuj ilość ===
  const updateQuantity = async (id, qty) => {
    if (qty < 1) return;

    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    const max =
      availableQuantities[`${item.productId}-${item.size}`] || Infinity;
    if (qty > max) {
      toast.error(`Maksymalna dostępna ilość: ${max}`);
      return;
    }

    const updated = cartItems.map((i) =>
      i.id === id ? { ...i, quantity: qty } : i
    );
    setCartItems(updated);

    if (!session) {
      localStorage.setItem("cart", JSON.stringify(updated));
    }

    if (session) {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId: id, quantity: qty }),
      });
      await fetchCart();
    }

    toast.success("Zaktualizowano ilość");
    await checkAvailability(updated);
  };

  // === 7. Usuń z koszyka ===
  const removeFromCart = async (id) => {
    const updated = cartItems.filter((i) => i.id !== id);
    setCartItems(updated);

    if (!session) {
      localStorage.setItem("cart", JSON.stringify(updated));
    } else {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItemId: id }),
      });
      await fetchCart();
    }

    toast.success("Usunięto z koszyka");
    if (updated.length > 0) {
      await checkAvailability(updated);
    } else {
      setAvailabilityErrors([]);
      setAvailableQuantities({});
    }
  };

  // === 8. Wyczyść koszyk ===
  const clearCart = async () => {
    setCartItems([]);
    setAvailabilityErrors([]);
    setAvailableQuantities({});

    if (!session) {
      localStorage.removeItem("cart");
    } else {
      await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true }),
      });
    }

    toast.success("Koszyk wyczyszczony");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        checkAvailability,
        availabilityErrors,
        setAvailabilityErrors,
        availableQuantities,
        fetchCart,
        getCurrentPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
