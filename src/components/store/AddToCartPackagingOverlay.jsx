import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import PackagingHamperVisual from "@/components/store/PackagingHamperVisual";
import useReducedMotion from "@/hooks/useReducedMotion";
import { usePackingAnimation } from "@/context/PackingAnimationContext";
import { HAMPER_ACCESSORIES } from "@/data/hamperAssets";

export default function AddToCartPackagingOverlay() {
  const { activeRequest, handleComplete } = usePackingAnimation();
  const prefersReducedMotion = useReducedMotion();

  const product = activeRequest?.product;

  return (
    <AnimatePresence>
      {activeRequest && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
          role="status"
          aria-live="polite"
          aria-label={`Packing ${product?.name || "your item"}`}
        >
          {/* Near-opaque warm backdrop — strong enough that nothing behind
              it (including whatever page loads next) is ever visible while
              this overlay is mounted, only once it fully fades on exit. */}
          <motion.div
            className="absolute inset-0"
            style={{
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              background:
                "radial-gradient(ellipse at 50% 40%, rgba(58,40,28,0.88) 0%, rgba(28,18,12,0.94) 100%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />

          <motion.div
            className="relative flex flex-col items-center text-center"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <PackagingHamperVisual
              productImage={product?.image_url}
              productAlt={product?.name}
              productLayoutId={activeRequest?.sourceLayoutId}
              accessories={HAMPER_ACCESSORIES}
              playing={!!activeRequest}
              reducedMotion={prefersReducedMotion}
              onComplete={handleComplete}
              size="large"
            />

            {!prefersReducedMotion && (
              <p className="mt-8 text-sm tracking-[0.15em] uppercase text-[#f3e9df]/70">
                Packing your hamper
              </p>
            )}

            <button
              onClick={handleComplete}
              className="mt-6 text-xs text-[#f3e9df]/50 hover:text-[#f3e9df]/80 underline underline-offset-4 transition-colors"
            >
              Skip animation
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}