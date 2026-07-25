import React from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";

// Mount this once, anywhere inside <StoreProvider> (ideally in your root
// layout so it also appears from the cart page, product detail page, and
// the Signature Box — not just from Shop). It reads cartToast from context;
// StoreContext already fires it from addToCart, so no other file needs to
// change to get the toast working everywhere addToCart is called.
export default function AddToCartToast() {
  const { cartToast, dismissCartToast } = useStore();

  return (
    <AnimatePresence>
      {cartToast?.visible && cartToast.product && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-4 sm:right-6 z-50 w-[calc(100%-2rem)] max-w-sm bg-white rounded-2xl border border-border/50 shadow-[0_24px_50px_-20px_rgba(38,30,20,0.35)] p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-cream/60 flex items-center justify-center shrink-0 overflow-hidden">
              <img src={cartToast.product.product_image} alt="" className="max-w-full max-h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <CheckCircle2 size={15} className="text-sage" /> Added to Cart
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{cartToast.product.product_name}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={dismissCartToast}
                  className="flex-1 px-3 py-2 rounded-full text-xs font-medium border border-border text-foreground hover:bg-accent transition-colors"
                >
                  Continue Shopping
                </button>
                <Link
                  to="/cart"
                  onClick={dismissCartToast}
                  className="flex-1 px-3 py-2 rounded-full text-xs font-medium bg-blush text-white text-center hover:bg-blush/90 transition-colors"
                >
                  View Cart
                </Link>
              </div>
            </div>
            <button
              onClick={dismissCartToast}
              aria-label="Dismiss"
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <X size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}