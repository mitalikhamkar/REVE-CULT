import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Check, Eye } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import QuickViewModal from "@/components/store/QuickViewModal";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [added, setAdded] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);
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
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <Link
        to={`/product/${product.slug}`}
        className="group block h-full animate-fade-in-up"
        style={{ animationDelay: `${index * 0.08}s`, opacity: 0 }}
      >
        <div className="relative flex flex-col h-full overflow-hidden rounded-2xl bg-card border border-transparent transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_20px_40px_-20px_rgba(38,30,20,0.25)] group-hover:border-border/40">
          {/* Image stage — fixed height, image always centered & contained,
              so every product reads at the same visual size regardless of
              its native image dimensions. */}
          <div className="relative h-56 sm:h-64 shrink-0 overflow-hidden bg-cream/60">
            <div className="absolute inset-0 flex items-center justify-center p-6 sm:p-7">
              <img
                src={product.image_url}
                alt={`${product.name} — ${product.color}`}
                className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 ease-out group-hover:scale-[1.04]"
              />
            </div>

            {/* Top-left: badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start z-10">
              {product.is_new_arrival && (
                <span className="bg-sage text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">New</span>
              )}
              {product.is_bestseller && (
                <span className="bg-blush text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">Bestseller</span>
              )}
              {product.has_anc && (
                <span className="bg-gold text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">ANC</span>
              )}
            </div>

            {/* Top-right: wishlist button */}
            <button
              onClick={handleWishlist}
              aria-label="Add to wishlist"
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all hover:scale-110 z-10"
            >
              <Heart
                size={16}
                strokeWidth={1.5}
                className={wishlisted ? "fill-blush text-blush" : "text-foreground"}
              />
            </button>

            {/* Quick Add + Quick View — slide up together on hover */}
            <div className="absolute inset-x-2 bottom-2 flex gap-1.5 translate-y-[130%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10">
              <button
                onClick={handleAddToCart}
                className={`flex-1 h-10 rounded-full flex items-center justify-center gap-1.5 text-white text-xs font-medium shadow-md transition-colors ${
                  added ? "bg-sage" : "bg-blush hover:bg-blush/90"
                }`}
                aria-label="Add to cart"
              >
                {added ? (
                  <>
                    <Check size={14} strokeWidth={2} /> Added!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={14} strokeWidth={1.5} /> Quick Add
                  </>
                )}
              </button>
              <button
                onClick={handleQuickView}
                className="flex-1 h-10 rounded-full flex items-center justify-center gap-1.5 bg-white/95 text-foreground text-xs font-medium shadow-md hover:bg-white transition-colors"
                aria-label="Quick view"
              >
                <Eye size={14} strokeWidth={1.5} /> Quick View
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-col flex-1 p-4 sm:p-5">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">{product.collection}</p>
            <h3 className="text-sm font-medium text-foreground leading-snug mb-2 line-clamp-2 flex-1">{product.name}</h3>
            <div className="flex items-center justify-between pt-1">
              <span className="text-base font-heading font-semibold text-foreground">₹{product.price}</span>
              {product.color && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-3 h-3 rounded-full border border-border" style={{ background: product.color_hex }} />
                  {product.color}
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