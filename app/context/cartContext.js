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
  const [availabilityErrors, setAvailabilityErrors] = useState([]);
  const [availableQuantities, setAvailableQuantities] = useState({});

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cart");
      const data = await response.json();
      if (response.ok && data.cart && data.cart.length > 0) {
        const consolidatedCart = consolidateCartItems(data.cart);
        setCartItems(consolidatedCart);
      } else {
        const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
        const enrichedCart = consolidateCartItems(
          localCart.map((item) => ({
            ...item,
            id: item.id || Date.now(),
          }))
        );
        setCartItems(enrichedCart);
      }
    } catch (error) {
      console.error("Błąd podczas pobierania koszyka:", error);
      toast.error("Błąd podczas pobierania koszyka", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const consolidateCartItems = (items) => {
    const consolidated = [];
    items.forEach((item) => {
      const existingItem = consolidated.find(
        (i) => i.productId === item.productId && i.size === item.size
      );
      if (existingItem) {
        existingItem.quantity += item.quantity;
      } else {
        consolidated.push({ ...item });
      }
    });
    return consolidated;
  };

  const checkAvailability = useCallback(
    async (items = cartItems) => {
      try {
        const consolidatedCart = consolidateCartItems(items);
        console.log("Sprawdzanie dostępności dla:", consolidatedCart); // Debugowanie
        if (consolidatedCart.length === 0) {
          setAvailabilityErrors([]);
          setAvailableQuantities({});
          return true;
        }

        const response = await fetch("/api/check-stock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItems: consolidatedCart }),
        });
        const data = await response.json();
        console.log("Odpowiedź z /api/check-stock:", data); // Debugowanie
        if (response.ok) {
          const unavailableItems = data.availability.filter(
            (item) => !item.available
          );
          setAvailabilityErrors(unavailableItems);
          const quantities = {};
          data.availability.forEach((item) => {
            quantities[`${item.productId}-${item.size}`] =
              item.availableQuantity || 0;
          });
          setAvailableQuantities(quantities);
          return unavailableItems.length === 0;
        } else {
          setAvailabilityErrors([
            { message: data.error || "Błąd podczas sprawdzania dostępności" },
          ]);
          return false;
        }
      } catch (error) {
        console.error("Błąd podczas sprawdzania dostępności:", error);
        setAvailabilityErrors([
          { message: "Błąd serwera podczas sprawdzania dostępności" },
        ]);
        return false;
      }
    },
    [cartItems]
  );

  const addToCart = async (productId, size, quantity, product) => {
    try {
      const tempCart = consolidateCartItems([
        ...cartItems,
        { productId, size, quantity, product },
      ]);
      const isAvailable = await checkAvailability(tempCart);
      if (!isAvailable) {
        const errorItem = tempCart.find(
          (item) => item.productId === productId && item.size === size
        );
        if (errorItem) {
          const maxQuantity = availableQuantities[`${productId}-${size}`] || 0;
          setAvailabilityErrors([
            ...availabilityErrors.filter(
              (e) => !(e.productId === productId && e.size === size)
            ),
            {
              productId,
              size,
              message: `Nie można dodać produktu ${product.name} (rozmiar: ${size}) - maksymalna dostępna ilość: ${maxQuantity}`,
              product: { name: product.name },
            },
          ]);
        }
        return;
      }

      const existingItem = cartItems.find(
        (item) => item.productId === productId && item.size === size
      );

      if (existingItem && !session) {
        const updatedCart = cartItems.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        toast.success("Ilość produktu zaktualizowana w koszyku", {
          position: "bottom-right",
          autoClose: 3000,
        });
        await checkAvailability();
        return;
      }

      if (session) {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId, size, quantity }),
        });
        const data = await response.json();
        if (!response.ok) {
          toast.error(data.error || "Błąd podczas dodawania do koszyka", {
            position: "bottom-right",
            autoClose: 3000,
          });
          return;
        }
        const newItem = {
          id: data.cartItem.id,
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
        const updatedCart = consolidateCartItems([...cartItems, newItem]);
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        toast.success("Produkt dodany do koszyka", {
          position: "bottom-right",
          autoClose: 3000,
        });
      } else {
        const newItem = {
          id: Date.now(),
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
        const updatedCart = consolidateCartItems([...cartItems, newItem]);
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
        toast.success("Produkt dodany do koszyka", {
          position: "bottom-right",
          autoClose: 3000,
        });
      }
      await checkAvailability();
    } catch (error) {
      console.error("Błąd podczas dodawania do koszyka:", error);
      toast.error("Błąd serwera", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    try {
      const item = cartItems.find((item) => item.id === cartItemId);
      if (!item) return;

      const currentQuantity = item.quantity;
      const maxQuantity =
        availableQuantities[`${item.productId}-${item.size}`] || Infinity;

      // Blokuj zwiększanie ilości powyżej stanu magazynowego
      if (newQuantity > maxQuantity && newQuantity > currentQuantity) {
        setAvailabilityErrors([
          ...availabilityErrors.filter(
            (e) => !(e.productId === item.productId && e.size === item.size)
          ),
          {
            productId: item.productId,
            size: item.size,
            message: `Nie można zwiększyć ilości produktu ${item.product.name} (rozmiar: ${item.size}). Maksymalna dostępna ilość: ${maxQuantity}`,
            product: { name: item.product.name },
          },
        ]);
        return;
      }

      const updatedCart = cartItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity: newQuantity } : item
      );
      const isAvailable = await checkAvailability(updatedCart);
      if (!isAvailable && newQuantity > currentQuantity) {
        setAvailabilityErrors([
          ...availabilityErrors.filter(
            (e) => !(e.productId === item.productId && e.size === item.size)
          ),
          {
            productId: item.productId,
            size: item.size,
            message: `Nie można zwiększyć ilości produktu ${item.product.name} (rozmiar: ${item.size}). Maksymalna dostępna ilość: ${maxQuantity}`,
            product: { name: item.product.name },
          },
        ]);
        return;
      }

      if (session) {
        const response = await fetch("/api/cart", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId, quantity: newQuantity }),
        });
        const data = await response.json();
        if (!response.ok) {
          toast.error(data.error || "Błąd podczas aktualizacji koszyka", {
            position: "bottom-right",
            autoClose: 3000,
          });
          return;
        }
      }

      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      toast.success("Ilość zaktualizowana", {
        position: "bottom-right",
        autoClose: 3000,
      });
      await checkAvailability();
    } catch (error) {
      console.error("Błąd podczas aktualizacji koszyka:", error);
      toast.error("Błąd serwera", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      if (session) {
        const response = await fetch("/api/cart", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cartItemId }),
        });
        if (!response.ok) {
          const data = await response.json();
          toast.error(data.error || "Błąd podczas usuwania z koszyka", {
            position: "bottom-right",
            autoClose: 3000,
          });
          return;
        }
      }
      const updatedCart = cartItems.filter((item) => item.id !== cartItemId);
      setCartItems(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      toast.success("Produkt usunięty z koszyka", {
        position: "bottom-right",
        autoClose: 3000,
      });
      if (updatedCart.length > 0) {
        await checkAvailability();
      } else {
        setAvailabilityErrors([]);
        setAvailableQuantities({});
      }
    } catch (error) {
      console.error("Błąd podczas usuwania z koszyka:", error);
      toast.error("Błąd serwera", {
        position: "bottom-right",
        autoClose: 3000,
      });
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
      setAvailabilityErrors([]);
      setAvailableQuantities({});
      localStorage.removeItem("cart");
      toast.success("Koszyk wyczyszczony", {
        position: "bottom-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error("Błąd podczas czyszczenia koszyka:", error);
      toast.error("Błąd podczas czyszczenia koszyka", {
        position: "bottom-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    if (session) {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      if (localCart.length > 0) {
        const consolidatedCart = consolidateCartItems(localCart);
        consolidatedCart.forEach(async (item) => {
          try {
            const response = await fetch("/api/check-stock", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                cartItems: [
                  {
                    productId: item.productId,
                    size: item.size,
                    quantity: item.quantity,
                  },
                ],
              }),
            });
            const data = await response.json();
            if (
              response.ok &&
              data.availability.every((item) => item.available)
            ) {
              await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  productId: item.productId,
                  size: item.size,
                  quantity: item.quantity,
                }),
              });
            }
          } catch (error) {
            console.error("Błąd podczas synchronizacji koszyka:", error);
            toast.error("Błąd podczas synchronizacji koszyka", {
              position: "bottom-right",
              autoClose: 3000,
            });
          }
        });
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
        checkAvailability,
        availabilityErrors,
        setAvailabilityErrors,
        availableQuantities,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
