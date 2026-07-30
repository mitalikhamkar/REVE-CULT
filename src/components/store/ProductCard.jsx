import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Check, Eye } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { usePackingAnimation } from "@/context/PackingAnimationContext";
import QuickViewModal from "@/components/store/QuickViewModal";
import ProductImageGallery from "@/components/store/ProductImageGallery";
import { formatPrice } from "@/lib/formatPrice";

export default function ProductCard({ product, index = 0 }) {
  const { toggleWishlist, isInWishlist } = useStore();
  const { triggerPackingAnimation } = usePackingAnimation();
  const [added, setAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [wishPulse, setWishPulse] = useState(false);
  const wishlisted = isInWishlist(product.id);

  const handleAddToCart = (e) => {
  e.preventDefault();
  e.stopPropagation();
  triggerPackingAnimation(product, 1, `product-image-grid-${product.id}`);
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
          className="relative flex flex-col h-full overflow-hidden rounded-[22px] border border-border/30 group-hover:border-border/50 transition-all duration-500 ease-out group-hover:-translate-y-1.5"
          style={{ backgroundColor: "rgba(252, 186, 203, 0.12)", boxShadow: "0 2px 10px -6px rgba(38,30,20,0.10)" }}
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
  layoutId={`product-image-grid-${product.id}`}
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
                Two fully independent pill buttons, each with its own
                background/shadow/radius so each reads as a standalone
                premium action rather than a segmented control. A fixed
                14px gap keeps the space between them deliberate-looking
                (both pills are opaque, so the product photo never shows
                through the gap the way it did with the old thin-gap
                layout). Equal width via flex-1 on a fixed-width wrapper. */}
            <div className="hidden sm:flex absolute inset-x-3 bottom-3 gap-3.5 translate-y-[130%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
              <button
                onClick={handleAddToCart}
                className={`flex-1 min-w-0 h-10 rounded-full flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap text-xs font-medium shadow-md transition-colors ${
                  added ? "bg-sage text-white" : "bg-blush text-white hover:bg-blush/90"
                }`}
                aria-label="Add to cart"
              >
                {added ? (
                  <>
                    <Check size={14} strokeWidth={2} className="shrink-0" />
                    <span className="truncate">Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} strokeWidth={1.5} className="shrink-0" />
                    <span className="truncate">Quick Add</span>
                  </>
                )}
              </button>
              <button
                onClick={handleQuickView}
                className="flex-1 min-w-0 h-10 rounded-full flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap text-xs font-medium text-foreground bg-white/95 backdrop-blur-sm shadow-md hover:bg-white transition-colors"
                aria-label="Quick view"
              >
                <Eye size={14} strokeWidth={1.5} className="shrink-0" />
                <span className="truncate">Quick View</span>
              </button>
            </div>

            {/* Mobile only — always visible (no hover on touch). Both actions
                stay independent pills (own background/shadow each), 12px
                gap, content-sized rather than stretched edge-to-edge so the
                product photo stays the visual focus. h-11 (44px) keeps them
                touch-friendly without adding any height to the card itself,
                since this row floats over the image rather than pushing the
                info section down. */}
            <div className="flex sm:hidden absolute bottom-2.5 left-2.5 items-center gap-3 z-10">
              <button
                onClick={handleAddToCart}
                aria-label="Add to cart"
                className={`h-11 px-3.5 rounded-full flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap text-xs font-medium shadow-md transition-colors ${
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
                className="h-11 px-3.5 rounded-full flex items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap text-xs font-medium text-foreground bg-white/95 backdrop-blur-sm shadow-md active:bg-white transition-colors"
              >
                <Eye size={14} strokeWidth={1.5} className="shrink-0" />
                <span>View</span>
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1 p-4 sm:p-5 md:p-6">
            <p className="product-collection-label mb-1.5">{product.collection}</p>
            <h3 className="product-title mb-2 line-clamp-2 flex-1">{product.name}</h3>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2 pt-2.5">
              <span className="product-price">{formatPrice(product.price)}</span>
              {product.color && (
                <span className="product-color-label flex items-center gap-1.5 whitespace-nowrap truncate">
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