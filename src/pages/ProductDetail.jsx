import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, ShoppingBag, Check, Minus, Plus, ChevronRight, ShieldCheck } from "lucide-react";
import { getProductBySlug, PRODUCTS } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import TrustBadges from "@/components/store/TrustBadges";
import TouchControlCanvas from "@/components/store/TouchControlCanvas";
import ReviewSection from "@/components/store/ReviewSection";
import DemoVideoSection from "@/components/store/DemoVideoSection";
import RitualLoader from "@/components/store/RitualLoader";
import ProductCard from "@/components/store/ProductCard";
import ProductImageGallery from "@/components/store/ProductImageGallery";

export default function ProductDetail() {
  const { slug } = useParams();
  const product = getProductBySlug(slug);
  const { addToCart, toggleWishlist, isInWishlist, addToRecentlyViewed } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [showRitual, setShowRitual] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setAdded(false);
    if (product?.has_ritual) {
      const key = `reve_ritual_${product.id}`;
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "true");
        setShowRitual(true);
      }
    }
    if (product) addToRecentlyViewed(product);
    window.scrollTo(0, 0);
  }, [slug]);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-heading mb-4">Product not found</h1>
        <Link to="/shop" className="text-blush hover:underline">Back to shop</Link>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const relatedProducts = PRODUCTS.filter((p) => p.collection === product.collection && p.id !== product.id).slice(0, 4);

  // Same gallery source used on the Homepage / Shop product cards:
  // Hamper (default) -> Hamper (other angle) -> Product close-up.
  // Falls back to gallery_urls, then the single image_url, for
  // non-hamper products (T-shirt, mini case bag) so they're unaffected.
  const galleryImages =
    product.gallery_images && product.gallery_images.length > 0
      ? product.gallery_images
      : product.gallery_urls && product.gallery_urls.length > 0
      ? product.gallery_urls
      : [product.image_url];

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      {showRitual && <RitualLoader onDone={() => setShowRitual(false)} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-foreground">Shop</Link>
          <ChevronRight size={12} />
          <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-foreground">{product.category}</Link>
          <ChevronRight size={12} />
          <span className="text-foreground truncate">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Visual story — left */}
          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="relative overflow-hidden rounded-3xl halo-bg group">
              <ProductImageGallery
                images={galleryImages}
                alt={`${product.name} — ${product.color}`}
                imgClassName="w-full aspect-square object-cover"
              />
              {product.has_anc && (
                <span className="absolute top-4 right-4 z-10 bg-gold text-white text-[10px] font-semibold px-3 py-1 rounded-full">
                  ANC Enabled
                </span>
              )}
            </div>
            {product.essence && (
              <div className="p-5 bg-accent/40 rounded-2xl">
                <p className="text-sm text-foreground/70 italic leading-relaxed font-heading">{product.essence}</p>
              </div>
            )}
          </div>

          {/* Product info — right */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">{product.collection}</p>
            <h1 className="text-3xl lg:text-4xl font-heading font-light leading-tight mb-3">{product.name}</h1>
            {product.tagline && (
              <p className="text-base text-muted-foreground italic mb-4">"{product.tagline}"</p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl font-heading font-semibold">₹{product.price}</span>
              <span className="text-xs text-muted-foreground">No reviews yet</span>
            </div>

            {/* Color */}
            <div className="mb-6">
              <p className="text-sm font-medium mb-2">Color: <span className="text-muted-foreground">{product.color}</span></p>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full border-2 border-foreground/20 shadow-sm" style={{ background: product.color_hex }} />
                <span className="text-sm text-muted-foreground">{product.color}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-foreground/80 leading-relaxed mb-6">{product.description}</p>

            {/* Highlights */}
            {product.highlights && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">Highlights</h3>
                <ul className="space-y-2">
                  {product.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                      <Check size={16} className="text-sage shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-border rounded-full bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 flex items-center justify-center hover:bg-accent rounded-l-full transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 flex items-center justify-center hover:bg-accent rounded-r-full transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-medium transition-all min-h-[48px] ${
                  added ? "bg-sage text-white" : "bg-blush text-white hover:bg-blush/90 hover:scale-[1.01]"
                }`}
              >
                {added ? <><Check size={18} /> Added to Cart!</> : <><ShoppingBag size={16} /> Add to Cart</>}
              </button>
              <button
                onClick={() => toggleWishlist(product)}
                className={`w-12 h-12 flex items-center justify-center rounded-full border transition-all min-h-[48px] ${
                  wishlisted ? "border-blush bg-blush/5" : "border-border bg-white hover:bg-accent"
                }`}
                aria-label="Toggle wishlist"
              >
                <Heart size={18} className={wishlisted ? "fill-blush text-blush" : "text-foreground"} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="mb-6">
              <TrustBadges badges={product.trust_badges} />
            </div>

            {/* Secure checkout signal */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
              <ShieldCheck size={14} className="text-sage" />
              Secure checkout · SSL encrypted · Your data is safe
            </div>
          </div>
        </div>

        {/* Demo video */}
        <DemoVideoSection product={product} />

        {/* Touch controls */}
        {product.touch_controls && (
          <div className="mt-12 grid lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-heading font-light mb-2">Touch Controls</h2>
              <p className="text-sm text-muted-foreground mb-5">Tap, press, and hold — your sound, at your fingertips.</p>
              <TouchControlCanvas controls={product.touch_controls} />
            </div>
            <div className="p-6 bg-accent/40 rounded-2xl">
              <h3 className="text-lg font-heading font-light mb-4">How it works</h3>
              <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                Each earbud responds to gentle taps and holds. The right earbud handles playback and volume, while the left earbud manages track navigation. It's intuitive — like a natural extension of your hand.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-blush/15 flex items-center justify-center text-xs font-bold text-blush">1×</div>
                  <span className="text-sm">Single tap — Play or Pause</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-blush/15 flex items-center justify-center text-xs font-bold text-blush">2×</div>
                  <span className="text-sm">Double tap — Next or Previous track</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-blush/15 flex items-center justify-center text-xs font-bold text-blush">⌐</div>
                  <span className="text-sm">Press & hold — Voice assistant or ANC</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Specs */}
        {product.specs && (
          <div className="mt-12">
            <h2 className="text-2xl font-heading font-light mb-5">Technical Specifications</h2>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0 bg-white rounded-2xl border border-border overflow-hidden">
              {Object.entries(product.specs).map(([key, value], i) => (
                <div key={key} className={`flex items-center justify-between px-5 py-3 ${i % 2 === 0 ? "sm:border-r border-border/50" : ""} border-b border-border/50`}>
                  <span className="text-sm text-muted-foreground">{key}</span>
                  <span className="text-sm font-medium text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Care instructions */}
        {product.care_instructions && (
          <div className="mt-8 p-5 bg-gold/5 border border-gold/20 rounded-2xl">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <ShieldCheck size={16} className="text-gold" /> Care Instructions
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed">{product.care_instructions}</p>
          </div>
        )}

        {/* Reviews */}
        <ReviewSection product={product} />

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-heading font-light mb-6">You May Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}