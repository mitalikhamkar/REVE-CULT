// SignatureBoxPackingOverlay.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GiftBoxVisual from "@/components/store/GiftBoxVisual";

/**
 * Fullscreen, centered packing animation — shown over the entire page
 * (not inside the builder's left preview) when the user adds a
 * Signature Box to cart. Mirrors the RitualLoader's presentation
 * language: soft radial backdrop, centered content, elegant fade-ins.
 *
 * Sequence: empty box -> pouch slides in -> earbuds slide in -> sparkle
 * -> lid closes -> ribbon wraps -> bow ties -> soft glow -> "Your
 * Signature Box is Ready" -> onComplete (parent navigates to cart).
 */
export default function SignatureBoxPackingOverlay({
  earbudsImage,
  earbudsAlt,
  pouchImage,
  onComplete,
}) {
  const [boxDone, setBoxDone] = useState(false);

  useEffect(() => {
    if (!boxDone) return;
    const t = setTimeout(() => {
      onComplete && onComplete();
    }, 1200);
    return () => clearTimeout(t);
  }, [boxDone, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        background:
          "radial-gradient(circle at center, hsl(var(--cream)) 0%, hsl(var(--blush) / 24%) 100%)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div className="flex flex-col items-center text-center">
        <GiftBoxVisual
          mode="packing"
          playing={true}
          onComplete={() => setBoxDone(true)}
          earbudsImage={earbudsImage}
          earbudsAlt={earbudsAlt}
          pouchImage={pouchImage}
          size="large"
        />
        <AnimatePresence>
          {boxDone && (
            <motion.p
              key="ready-text"
              className="mt-8 text-2xl sm:text-3xl font-heading font-light text-foreground"
              initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              Your Signature Box is Ready
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}