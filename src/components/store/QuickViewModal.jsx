import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { X, Heart, ShoppingBag, Check, Minus, Plus, ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useStore } from "@/context/StoreContext";

/**
 * Premium Quick View modal. Reuses the existing product catalog and
 * StoreContext (cart/wishlist) — no duplicated product data, no new
 * routing. Rendered via a portal so it always sits above the page
 * regardless of any hover transforms on the card that opened it.
 */
export default function QuickViewModal({ product, onClose }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [activeSlug, setActiveSlug] = useState(product.slug);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const activeProduct = PRODUCTS.find((p) => p.slug === activeSlug) || product;
  const siblings = PRODUCTS.filter((p) => p.collection === product.collection && p.color);
  const wishlisted = isInWishlist(activeProduct.id);

  // Lock background scroll while open.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  // ESC to close.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleAddToCart = () => {
    addToCart(activeProduct, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const modal = (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[28px] shadow-2xl animate-scale-in border border-white/60"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.96) 0%, rgba(253,251,247,0.98) 100%)",
          backdropFilter: "blur(16px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-white hover:scale-105 transition-all"
          aria-label="Close quick view"
        >
          <X size={18} />
        </button>

        <div className="grid sm:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative bg-cream/60 flex items-center justify-center p-10 sm:p-12 min-h-[280px] sm:min-h-[420px] rounded-t-[28px] sm:rounded-l-[28px] sm:rounded-tr-none">
            <img
              key={activeProduct.image_url}
              src={activeProduct.image_url}
              alt={activeProduct.name}
              className="max-w-full max-h-full w-auto h-auto object-contain animate-fade-in"
            />
            {activeProduct.is_bestseller && (
              <span className="absolute top-5 left-5 bg-blush text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                Bestseller
              </span>
            )}
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 flex flex-col">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
              {activeProduct.collection}
            </p>
            <h2 className="text-xl sm:text-2xl font-heading font-light leading-snug pr-8">{activeProduct.name}</h2>
            <p className="text-xl font-heading font-semibold mt-2">₹{activeProduct.price}</p>

            {activeProduct.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-3">
                {activeProduct.description}
              </p>
            )}

            {/* Available colors */}
            {siblings.length > 1 && (
              <div className="mt-5">
                <p className="text-xs font-medium text-foreground mb-2">
                  Color: <span className="text-muted-foreground font-normal">{activeProduct.color}</span>
                </p>
                <div className="flex items-center gap-2">
                  {siblings.map((s) => (
                    <button
                      key={s.slug}
                      onClick={() => setActiveSlug(s.slug)}
                      aria-label={s.color}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        s.slug === activeProduct.slug
                          ? "border-blush scale-110 shadow-sm"
                          : "border-border hover:scale-105"
                      }`}
                      style={{ background: s.color_hex }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-5">
              <p className="text-xs font-medium text-foreground mb-2">Quantity</p>
              <div className="inline-flex items-center gap-3 border border-border rounded-full px-1.5 py-1.5">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-6 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex items-center gap-2.5">
              <button
                onClick={handleAddToCart}
                className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2 text-white text-sm font-medium transition-colors ${
                  added ? "bg-sage" : "bg-blush hover:bg-blush/90"
                }`}
              >
                {added ? (
                  <>
                    <Check size={16} strokeWidth={2} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={16} strokeWidth={1.5} /> Add to Cart
                  </>
                )}
              </button>
              <button
                onClick={() => toggleWishlist(activeProduct)}
                aria-label="Toggle wishlist"
                className="w-12 h-12 flex-shrink-0 rounded-full border border-border flex items-center justify-center hover:bg-accent hover:scale-105 transition-all"
              >
                <Heart
                  size={18}
                  strokeWidth={1.5}
                  className={wishlisted ? "fill-blush text-blush" : "text-foreground"}
                />
              </button>
            </div>

            <Link
              to={`/product/${activeProduct.slug}`}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-foreground hover:text-blush transition-colors mt-4"
            >
              View Full Details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}