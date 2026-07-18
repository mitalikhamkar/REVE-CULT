import React from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Check } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useState } from "react";

export default function ProductCard({ product, index = 0 }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [added, setAdded] = useState(false);
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

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group block animate-fade-in-up"
      style={{ animationDelay: `${index * 0.08}s`, opacity: 0 }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-card halo-bg">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden">
          <img
            src={product.image_url}
            alt={`${product.name} — ${product.color}`}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
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

          {/* Quick add to cart — slides up on hover */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className={`w-full h-10 flex items-center justify-center gap-2 text-white text-xs font-medium transition-colors ${
                added ? "bg-sage" : "bg-blush hover:bg-blush/90"
              }`}
              aria-label="Add to cart"
            >
              {added ? <><Check size={14} strokeWidth={2} /> Added!</> : <><ShoppingBag size={14} strokeWidth={1.5} /> Quick Add</>}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">{product.collection}</p>
          <h3 className="text-sm font-medium text-foreground leading-snug mb-1.5 line-clamp-2">{product.name}</h3>
          <div className="flex items-center justify-between">
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
  );
}