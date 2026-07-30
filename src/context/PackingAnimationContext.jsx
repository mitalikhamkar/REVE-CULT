import React, { createContext, useContext, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/context/StoreContext";

const PackingAnimationContext = createContext(null);
const OVERLAY_EXIT_MS = 420; // matches the overlay's own exit fade duration

export function PackingAnimationProvider({ children }) {
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const [activeRequest, setActiveRequest] = useState(null);

  const triggerPackingAnimation = useCallback((product, quantity = 1, sourceLayoutId) => {
    if (!product) return;
    setActiveRequest({ product, quantity, sourceLayoutId, id: `${product.id}-${Date.now()}` });
  }, []);

  const handleComplete = useCallback(() => {
    if (!activeRequest) return;
    const { product, quantity } = activeRequest;
    addToCart(product, quantity, { suppressToast: true });
    // Clear the request first so the overlay begins its exit fade —
    // only navigate once that fade has actually finished, so the Cart
    // page never mounts behind a still-visible (or still-fading) box.
    setActiveRequest(null);
    setTimeout(() => navigate("/cart"), OVERLAY_EXIT_MS);
  }, [activeRequest, addToCart, navigate]);

  return (
    <PackingAnimationContext.Provider
      value={{ triggerPackingAnimation, activeRequest, handleComplete }}
    >
      {children}
    </PackingAnimationContext.Provider>
  );
}

export function usePackingAnimation() {
  const ctx = useContext(PackingAnimationContext);
  if (!ctx) {
    throw new Error("usePackingAnimation must be used within a PackingAnimationProvider");
  }
  return ctx;
}