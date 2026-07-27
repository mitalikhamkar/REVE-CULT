import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Check, Eye } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import QuickViewModal from "@/components/store/QuickViewModal";
import ProductImageGallery from "@/components/store/ProductImageGallery";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [added, setAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [wishPulse, setWishPulse] = useState(false); // micro-animation on wishlist toggle
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    setWishPulse(true);
    setTimeout(() => setWishPulse(false), 400);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  // Default image is the Hamper image; gallery also includes Earbuds + Carry
  // Pouch when available. Falls back to the single product image otherwise.
  const galleryImages =
    product.gallery_images && product.gallery_images.length > 0
      ? product.gallery_images
      : [product.image_url];

  return (
    <>
      <Link
        to={`/product/${product.slug}`}
        className="group block h-full animate-fade-in-up"
        style={{ animationDelay: `${index * 0.08}s`, opacity: 0 }}
      >
        <div
          className="relative flex flex-col h-full overflow-hidden rounded-[22px] bg-card border border-border/30 group-hover:border-border/50 transition-all duration-500 ease-out group-hover:-translate-y-1.5"
          style={{ boxShadow: "0 2px 10px -6px rgba(38,30,20,0.10)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 26px 48px -24px rgba(38,30,20,0.28)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 2px 10px -6px rgba(38,30,20,0.10)";
          }}
        >
          {/* Image stage — fixed height, image always centered & contained,
              so every product reads at the same visual size regardless of
              its native image dimensions. Shorter on mobile so the card
              doesn't read as an overly tall rectangle at 2-column width. */}
          <div className="relative h-44 sm:h-56 md:h-64 shrink-0 overflow-hidden bg-cream/60">
            <div className="absolute inset-0 flex items-center justify-center p-5 sm:p-7 md:p-8">
              <ProductImageGallery
                images={galleryImages}
                alt={`${product.name} — ${product.color}`}
                imgClassName="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-500 ease-out group-hover:scale-[1.05]"
              />
            </div>

            {/* Top-left: badges — ANC only, shown solely when the product supports it */}
            <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1.5 items-start z-10">
              {product.has_anc && (
                <span className="bg-gold text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">ANC</span>
              )}
            </div>

            {/* Top-right: wishlist button */}
            <button
              onClick={handleWishlist}
              aria-label="Add to wishlist"
              className={`absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-10 ${
                wishPulse ? "wishlist-pop" : ""
              }`}
            >
              <Heart
                size={16}
                strokeWidth={1.5}
                className={wishlisted ? "fill-blush text-blush" : "text-foreground"}
              />
            </button>

            {/* Desktop / tablet only — no touch device has a hover state, so
                this stays hidden on mobile entirely rather than faking it.
                Both actions live inside ONE shared rounded-full pill (bg +
                padding on the outer wrapper) instead of two separate floating
                pills with a gap between them — that gap was the "white dash"
                artifact, since the product photo showed through it. Now any
                space between the two buttons is filled by the shared pill
                background, so there's nothing to show through. */}
            <div className="hidden sm:flex absolute inset-x-2 bottom-2 translate-y-[130%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10 rounded-full bg-white/95 backdrop-blur-sm shadow-md p-1 gap-1">
              <button
                onClick={handleAddToCart}
                className={`flex-1 min-w-0 h-8 rounded-full flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap text-xs font-medium transition-colors ${
                  added ? "bg-sage text-white" : "bg-blush text-white hover:bg-blush/90"
                }`}
                aria-label="Add to cart"
              >
                {added ? (
                  <>
                    <Check size={13} strokeWidth={2} className="shrink-0" />
                    <span className="truncate">Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={13} strokeWidth={1.5} className="shrink-0" />
                    <span className="truncate">Quick Add</span>
                  </>
                )}
              </button>
              <button
                onClick={handleQuickView}
                className="flex-1 min-w-0 h-8 rounded-full flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap text-xs font-medium text-foreground hover:bg-cream/70 transition-colors"
                aria-label="Quick view"
              >
                <Eye size={13} strokeWidth={1.5} className="shrink-0" />
                <span className="truncate">Quick View</span>
              </button>
            </div>

            {/* Mobile only — always visible (no hover on touch), both actions
                shown per brand preference: small content-sized pills anchored
                bottom-left, NOT stretched across the image, so the product
                photo stays the hero. Both buttons share one rounded-full
                container (bg + padding, no gap between separate pills) so
                there's no seam for the photo to show through — that seam was
                the recurring "white dash". Height is 44px (h-11) to stay
                touch-friendly; width hugs the label so the pair reads as a
                compact accent, not a UI bar. */}
            <div className="flex sm:hidden absolute bottom-2.5 left-2.5 items-center gap-1 z-10 rounded-full bg-white/95 backdrop-blur-sm shadow-md p-1">
              <button
                onClick={handleAddToCart}
                aria-label="Add to cart"
                className={`h-11 px-3 rounded-full flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap text-xs font-medium transition-colors ${
                  added ? "bg-sage text-white" : "bg-blush text-white active:bg-blush/90"
                }`}
              >
                {added ? (
                  <>
                    <Check size={14} strokeWidth={2} className="shrink-0" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} strokeWidth={1.5} className="shrink-0" />
                    <span>Add</span>
                  </>
                )}
              </button>
              <button
                onClick={handleQuickView}
                aria-label="Quick view"
                className="h-11 px-3 rounded-full flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap text-xs font-medium text-foreground active:bg-cream/70 transition-colors"
              >
                <Eye size={14} strokeWidth={1.5} className="shrink-0" />
                <span>View</span>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1 p-4 sm:p-5 md:p-6">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">{product.collection}</p>
            <h3 className="text-sm font-medium text-foreground leading-snug mb-2 line-clamp-2 flex-1">{product.name}</h3>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2 pt-1">
              <span className="text-base font-heading font-semibold text-foreground">₹{product.price}</span>
              {product.color && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap truncate">
                  <span className="w-3 h-3 rounded-full border border-border shrink-0" style={{ background: product.color_hex }} />
                  <span className="truncate">{product.color}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {quickViewOpen && <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />}
    </>
  );
}