import React, { createContext, useContext, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/context/StoreContext";

const PackingAnimationContext = createContext(null);
const OVERLAY_EXIT_MS = 420;
const START_SOUND_SRC = "/audio/hamper-complete.mp3";

export function PackingAnimationProvider({ children }) {
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const [activeRequest, setActiveRequest] = useState(null);

  const triggerPackingAnimation = useCallback((product, quantity = 1, sourceLayoutId) => {
    if (!product) return;

    // Played HERE, synchronously inside the same click handler that
    // called triggerPackingAnimation — not inside a child component's
    // useEffect. That matters: Safari/iOS only reliably allow
    // audio.play() when it's invoked in the same tick as the user's
    // gesture, with no render/mount cycle in between. This is the one
    // and only place this sound is triggered from.
    try {
      const audio = new Audio(START_SOUND_SRC);
      audio.volume = 0.55;
      audio.play().catch(() => {
        // Autoplay blocked or file missing — never let this affect
        // the animation itself.
      });
    } catch {
      // no-op
    }

    setActiveRequest({ product, quantity, sourceLayoutId, id: `${product.id}-${Date.now()}` });
  }, []);

  const handleComplete = useCallback(() => {
    if (!activeRequest) return;
    const { product, quantity } = activeRequest;
    addToCart(product, quantity, { suppressToast: true });
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