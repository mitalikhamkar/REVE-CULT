import React, { createContext, useContext, useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "@/context/StoreContext";

const PackingAnimationContext = createContext(null);
const OVERLAY_EXIT_MS = 420;
const START_SOUND_SRC = "/audio/hamper-complete.mp3";

export function PackingAnimationProvider({ children }) {
  const { addToCart } = useStore();
  const navigate = useNavigate();
  const [activeRequest, setActiveRequest] = useState(null);
  const audioRef = useRef(null);

  const triggerPackingAnimation = useCallback((product, quantity = 1, sourceLayoutId) => {
    if (!product) return;

    try {
      const audio = new Audio(START_SOUND_SRC);
      audio.volume = 0.55;
      audioRef.current = audio;
      audio.play().catch(() => {
        // Autoplay blocked or file missing — never let this affect
        // the animation itself.
      });
    } catch {
      // no-op
    }

    setActiveRequest({ product, quantity, sourceLayoutId, id: `${product.id}-${Date.now()}` });
  }, []);

  const stopSound = () => {
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } catch {
        // no-op
      }
      audioRef.current = null;
    }
  };

  const handleComplete = useCallback(() => {
    if (!activeRequest) return;
    const { product, quantity } = activeRequest;
    addToCart(product, quantity, { suppressToast: true });
    // Covers BOTH the natural finish (audio has likely already ended,
    // since it's ~2s and the sequence runs longer — this is a no-op then)
    // and the Skip button (audio may still be mid-playback — this stops
    // it immediately). Same function, same effect either way.
    stopSound();
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