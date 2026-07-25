import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const StoreContext = createContext(null);

const CART_KEY = "reve_cart";
const WISHLIST_KEY = "reve_wishlist";
const RECENT_KEY = "reve_recent";
const COMPARE_KEY = "reve_compare"; // NEW — Product Compare persistence

const MAX_COMPARE = 3;
const TOAST_DURATION_MS = 4000;

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

  // NEW — Product Compare (up to MAX_COMPARE earbuds)
  const [compareList, setCompareList] = useState(() => loadJSON(COMPARE_KEY, []));

  // NEW — Add to Cart success toast
  const [cartToast, setCartToast] = useState({ visible: false, product: null });

  useEffect(() => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist)); }, [wishlist]);
  useEffect(() => { localStorage.setItem(RECENT_KEY, JSON.stringify(recentlyViewed)); }, [recentlyViewed]);
  useEffect(() => { localStorage.setItem(COMPARE_KEY, JSON.stringify(compareList)); }, [compareList]);

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

    // NEW — fire the premium "Added to Cart" toast for every add-to-cart,
    // from any card, page, or the Signature Box, without touching the
    // callers of addToCart.
    setCartToast({
      visible: true,
      product: {
        product_name: product.name,
        product_image: product.image_url,
      },
    });
    setTimeout(() => {
      setCartToast((prev) => (prev.visible ? { visible: false, product: null } : prev));
    }, TOAST_DURATION_MS);
  }, []);

  const dismissCartToast = useCallback(() => {
    setCartToast({ visible: false, product: null });
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
          // NEW — needed so the "Recently Viewed" strip can link back to
          // the product page. Purely additive; nothing that already reads
          // this object is affected.
          slug: product.slug,
        },
        ...filtered,
      ].slice(0, 6);
    });
  }, []);

  // NEW — Product Compare helpers. We store the full product object so the
  // comparison modal can read any existing product field (price, collection,
  // color, has_anc, is_bestseller, is_new_arrival, description, …) without
  // inventing any new data.
  const isInCompare = useCallback(
    (productId) => compareList.some((item) => item.id === productId),
    [compareList]
  );

  const toggleCompare = useCallback((product) => {
    let didAdd = false;
    setCompareList((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      if (prev.length >= MAX_COMPARE) {
        // Already at the cap — no-op, caller can keep the button disabled.
        return prev;
      }
      didAdd = true;
      return [...prev, product];
    });
    return didAdd;
  }, []);

  const removeFromCompare = useCallback((productId) => {
    setCompareList((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const clearCompare = useCallback(() => setCompareList([]), []);

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
    // NEW
    compareList,
    isInCompare,
    toggleCompare,
    removeFromCompare,
    clearCompare,
    cartToast,
    dismissCartToast,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}