import React, { createContext, useContext, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/context/StoreContext";

const PackingAnimationContext = createContext(null);

export function PackingAnimationProvider({ children }) {
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const [activeRequest, setActiveRequest] = useState(null);
  // activeRequest shape: { id, product, quantity, sourceLayoutId }

  const triggerPackingAnimation = useCallback((product, quantity = 1, sourceLayoutId) => {
    if (!product) return;
    setActiveRequest({ product, quantity, sourceLayoutId, id: `${product.id}-${Date.now()}` });
  }, []);

  const handleComplete = useCallback(() => {
    if (!activeRequest) return;
    const { product, quantity } = activeRequest;
    addToCart(product, quantity, { suppressToast: true });
    setActiveRequest(null);
    navigate("/cart");
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