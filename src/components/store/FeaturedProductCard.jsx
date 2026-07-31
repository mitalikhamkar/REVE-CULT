import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Check, Eye } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import QuickViewModal from "@/components/store/QuickViewModal";
import ProductImageGallery from "@/components/store/ProductImageGallery";

export default function FeaturedProductCard({ product }) {
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

  const galleryImages =
    product.gallery_images && product.gallery_images.length > 0
      ? product.gallery_images
      : [product.image_url];

  return (
    <>
      <Link to={`/product/${product.slug}`} className="group block">
        <div
          className="relative grid sm:grid-cols-2 overflow-hidden rounded-[32px] border border-white/60 transition-all duration-500 ease-out group-hover:-translate-y-1"
          style={{
            background: "linear-gradient(150deg, hsl(var(--blush) / 10%) 0%, hsl(var(--cream)) 55%, hsl(var(--gold) / 10%) 100%)",
            boxShadow: "0 18px 40px -26px rgba(120,60,70,0.22)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = "0 32px 64px -28px rgba(120,60,70,0.32)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 18px 40px -26px rgba(120,60,70,0.22)";
          }}
        >
          {/* LEFT — large lifestyle image, never stretched */}
          <div className="relative h-64 sm:h-auto min-h-[280px] flex items-center justify-center p-8 sm:p-10">
            {product.has_anc && (
              <span className="absolute top-5 left-5 z-10 bg-gold text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                ANC
              </span>
            )}
            <button
              onClick={handleWishlist}
              aria-label="Add to wishlist"
              className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-all hover:scale-110"
            >
              <Heart
                size={16}
                strokeWidth={1.5}
                className={wishlisted ? "fill-blush text-blush" : "text-foreground"}
              />
            </button>
            <ProductImageGallery
              images={galleryImages}
              alt={`${product.name} — ${product.color}`}
              imgClassName="max-w-full max-h-full w-auto h-auto object-contain drop-shadow-[0_18px_28px_rgba(38,30,20,0.14)] transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          </div>

          {/* RIGHT — info */}
          <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12 border-t sm:border-t-0 sm:border-l border-white/50">
            <p className="product-collection-label mb-2">{product.collection}</p>
            <h3 className="product-title text-2xl lg:text-3xl leading-snug mb-3">{product.name}</h3>

            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 line-clamp-3 max-w-md">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-4 mb-6">
              <span className="product-price text-xl">₹{product.price}</span>
              {product.color && (
                <span className="product-color-label flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded-full border border-border" style={{ background: product.color_hex }} />
                  {product.color}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleAddToCart}
                className={`inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium text-white transition-all hover:scale-[1.02] min-h-[48px] ${
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
                onClick={handleQuickView}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium bg-white border border-border text-foreground hover:bg-accent transition-all min-h-[48px]"
              >
                <Eye size={16} strokeWidth={1.5} /> Quick View
              </button>
            </div>
          </div>
        </div>
      </Link>

      {quickViewOpen && <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />}
    </>
  );
}