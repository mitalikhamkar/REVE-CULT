import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const StoreContext = createContext(null);

const CART_KEY = "reve_cart";
const WISHLIST_KEY = "reve_wishlist";
const RECENT_KEY = "reve_recent";

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => loadJSON(CART_KEY, []));
  const [wishlist, setWishlist] = useState(() => loadJSON(WISHLIST_KEY, []));
  const [recentlyViewed, setRecentlyViewed] = useState(() => loadJSON(RECENT_KEY, []));
  const [cartPulse, setCartPulse] = useState(false);

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyViewed)); }, [recentlyViewed]);

  const addToCart = useCallback((product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          product_image: product.image_url,
          product_price: product.price,
          color: product.color,
          quantity,
          // Signature Box fields — undefined/null for ordinary products,
          // so this stays backward compatible with everything already
          // going through addToCart.
          type: product.type || "product",
          earbuds: product.earbuds || null,
          pouch: product.pouch || null,
          giftRecipient: product.giftRecipient || null,
          giftNote: product.giftNote || null,
        },
      ];
    });
    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 1600);
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => item.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((product) => {
    setWishlist((prev) => {
      const exists = prev.find((item) => item.product_id === product.id);
      if (exists) {
        return prev.filter((item) => item.product_id !== product.id);
      }
      return [
        ...prev,
        {
          product_id: product.id,
          product_name: product.name,
          product_image: product.image_url,
          product_price: product.price,
          color: product.color,
        },
      ];
    });
  }, []);

  const isInWishlist = useCallback(
    (productId) => wishlist.some((item) => item.product_id === productId),
    [wishlist]
  );

  const addToRecentlyViewed = useCallback((product) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item.product_id !== product.id);
      return [
        {
          product_id: product.id,
          product_name: product.name,
          product_image: product.image_url,
          product_price: product.price,
          color: product.color,
        },
        ...filtered,
      ].slice(0, 6);
    });
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product_price * item.quantity, 0);

  const value = {
    cart,
    wishlist,
    recentlyViewed,
    cartCount,
    cartSubtotal,
    cartPulse,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleWishlist,
    isInWishlist,
    addToRecentlyViewed,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}