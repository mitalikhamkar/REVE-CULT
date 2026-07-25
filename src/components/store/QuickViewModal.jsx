//QuickViewModal.jsx
import React, { useEffect, useState, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Heart,
  ShoppingBag,
  Check,
  Minus,
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Volume2,
  BatteryCharging,
  Bluetooth,
  Droplets,
  Zap,
  Sparkles,
} from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useStore } from "@/context/StoreContext";

// Timing constants for the phase sequence below. Kept in one place so the
// scan duration here always matches the CSS `visualScanSweep` animation
// (already defined in index.css for the Scan & Match feature — reused here
// rather than duplicated) and so the fly-to-cart timing matches its own
// transition duration.
const SPOTLIGHT_DELAY = 450; // spotlight fades in shortly after the product settles center-stage
const SCAN_DURATION = 1600; // matches index.css visualScanSweep keyframe duration
const SUCCESS_HOLD = 800; // how long the "Added to Cart" success state is shown
const FLY_DURATION = 600;
const CLOSE_DURATION = 500;

// Reads the glow tone from the product's EXISTING `color` field only — no
// new specs, just a presentational mapping so the spotlight behind the
// product visually matches what's already in the catalog data.
function getGlowColor(colorName = "") {
  const c = colorName.toLowerCase();
  if (c.includes("gold")) return "38 55% 68%"; // warm champagne
  if (c.includes("mint")) return "150 30% 65%"; // soft mint
  if (c.includes("silver") || c.includes("white") || c.includes("beige")) return "38 20% 92%"; // pearl white
  if (c.includes("black")) return "220 8% 45%"; // charcoal grey
  return "13 49% 71%"; // brand blush default
}

// Picks a small icon for a feature chip based on keywords already present in
// the product's own highlight text — purely presentational, adds no data.
function getHighlightIcon(text = "") {
  const t = text.toLowerCase();
  if (t.includes("noise") || t.includes("anc")) return Volume2;
  if (t.includes("battery") || t.includes("charge") || t.includes("charging")) return BatteryCharging;
  if (t.includes("bluetooth")) return Bluetooth;
  if (t.includes("water") || t.includes("resist")) return Droplets;
  if (t.includes("fast")) return Zap;
  return Sparkles;
}

// Staggered reveal for the right-hand info column — 60-80ms between
// sections, each fading upward, per the requested order: name -> rating ->
// price -> description -> highlights -> colors -> quantity -> actions.
const columnVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Premium Quick View modal. Reuses the existing product catalog and
 * StoreContext (cart/wishlist) — no duplicated product data, no new
 * routing. Rendered via a portal so it always sits above the page
 * regardless of any hover transforms on the card that opened it.
 *
 * `originPoint` (optional {x, y} viewport coordinates of the click that
 * opened this modal, passed from ProductCard) drives the "grows from where
 * you clicked" opening/closing motion. If it isn't provided, the modal
 * falls back to a plain centered scale-fade.
 */
export default function QuickViewModal({ product, onClose, originPoint }) {
  const { addToCart, toggleWishlist, isInWishlist } = useStore();
  const [activeSlug, setActiveSlug] = useState(product.slug);
  const [quantity, setQuantity] = useState(1);
  const [imgIndex, setImgIndex] = useState(0);
  const [phase, setPhase] = useState("entering"); // entering -> spotlight -> scanning -> revealed -> success -> flying -> closing
  const [reflection, setReflection] = useState({ x: 50, y: 30 });
  const imageStageRef = useRef(null);
  const timers = useRef([]);

  const activeProduct = PRODUCTS.find((p) => p.slug === activeSlug) || product;
  const siblings = PRODUCTS.filter((p) => p.collection === product.collection && p.color);
  const wishlisted = isInWishlist(activeProduct.id);

  const gallery =
    activeProduct.gallery_urls && activeProduct.gallery_urls.length > 0
      ? activeProduct.gallery_urls
      : [activeProduct.image_url];
  const currentImage = gallery[Math.min(imgIndex, gallery.length - 1)];
  const hasRating = (activeProduct.review_count || 0) > 0;
  const glowHsl = getGlowColor(activeProduct.color);

  // Offset (in px) from screen center to the point that was clicked, and a
  // small starting scale — this is what makes the modal feel like it grew
  // out of the exact spot the person tapped, rather than just fading in.
  const flip = useMemo(() => {
    if (!originPoint) return { x: 0, y: 24, scale: 0.94 };
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    return { x: originPoint.x - cx, y: originPoint.y - cy, scale: 0.22 };
  }, [originPoint]);

  // Approximate on-screen cart position for the "fly to cart" moment — the
  // cart icon lives in the site header, outside this component, so this is
  // a stylistic approximation (top-right, where cart icons conventionally
  // sit) rather than a measured target.
  const cartTarget = { x: window.innerWidth / 2 - 40, y: -(window.innerHeight / 2) + 30, scale: 0.12 };

  const clearAllTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Phase sequence: settle center -> scan -> glow -> reveal info.
  useEffect(() => {
    if (phase !== "entering") return;
    timers.current.push(
      setTimeout(() => setPhase("scanning"), 500) // matches the "center" transition duration below
    );
    return clearAllTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "scanning") return;
    const t1 = setTimeout(() => setPhase("spotlight"), SCAN_DURATION);
    timers.current.push(t1);
    return () => clearTimeout(t1);
  }, [phase]);

  useEffect(() => {
    if (phase !== "spotlight") return;
    const t1 = setTimeout(() => setPhase("revealed"), SPOTLIGHT_DELAY);
    timers.current.push(t1);
    return () => clearTimeout(t1);
  }, [phase]);

  // Reset gallery position whenever the selected color/product changes.
  useEffect(() => {
    setImgIndex(0);
  }, [activeSlug]);

  // Lock background scroll while open.
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestClose = () => {
    if (phase === "closing" || phase === "flying") return;
    setPhase("closing");
    setTimeout(() => onClose && onClose(), CLOSE_DURATION);
  };

  // ESC to close.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && requestClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // Add to Cart: update the cart immediately (existing logic, unchanged),
  // then hold a success state, then shrink + drift toward the cart before
  // closing — instead of closing instantly.
  const handleAddToCart = () => {
    if (phase !== "revealed") return;
    addToCart(activeProduct, quantity);
    setPhase("success");
    const t1 = setTimeout(() => setPhase("flying"), SUCCESS_HOLD);
    const t2 = setTimeout(() => onClose && onClose(), SUCCESS_HOLD + FLY_DURATION);
    timers.current.push(t1, t2);
  };

  const goPrev = () => setImgIndex((i) => (i - 1 + gallery.length) % gallery.length);
  const goNext = () => setImgIndex((i) => (i + 1) % gallery.length);

  // Gentle reflection highlight that drifts toward the cursor — kept subtle,
  // no rotation or heavy 3D, just a soft light position shift.
  const handleMouseMove = (e) => {
    if (!imageStageRef.current || !window.matchMedia("(hover: hover)").matches) return;
    const rect = imageStageRef.current.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * 100;
    const relY = ((e.clientY - rect.top) / rect.height) * 100;
    setReflection({ x: relX, y: relY });
  };
  const resetReflection = () => setReflection({ x: 50, y: 30 });

  const glowVisible = ["spotlight", "revealed", "success", "flying"].includes(phase);
  const cardAnimate =
    phase === "entering"
      ? { x: flip.x, y: flip.y, scale: flip.scale, opacity: 0.85 }
      : phase === "closing"
      ? { x: flip.x, y: flip.y, scale: flip.scale, opacity: 0 }
      : phase === "flying"
      ? { x: cartTarget.x, y: cartTarget.y, scale: cartTarget.scale, opacity: 0 }
      : { x: 0, y: 0, scale: 1, opacity: 1 };
  const cardTransition =
    phase === "flying"
      ? { duration: FLY_DURATION / 1000, ease: [0.4, 0, 1, 1] }
      : phase === "closing"
      ? { duration: CLOSE_DURATION / 1000, ease: [0.4, 0, 0.2, 1] }
      : { duration: 0.5, ease: [0.22, 1, 0.36, 1] };

  const modal = (
    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/55 backdrop-blur-md"
        onClick={requestClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === "closing" || phase === "flying" ? 0 : 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      <motion.div
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-[28px] shadow-2xl border border-white/60 quickview-breathing-bg"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: flip.x, y: flip.y, scale: flip.scale, opacity: 0.7 }}
        animate={cardAnimate}
        transition={cardTransition}
      >
        <button
          onClick={requestClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-white hover:scale-105 transition-all"
          aria-label="Close quick view"
        >
          <X size={18} />
        </button>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-0">
          {/* LEFT — image stage */}
          <div className="relative flex flex-col bg-cream/60 p-6 sm:p-9 rounded-t-[28px] sm:rounded-l-[28px] sm:rounded-tr-none sm:border-r sm:border-border/40">
            {/* Color-adaptive spotlight — fades in only once the product has settled center-stage */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at center, hsl(${glowHsl} / 34%) 0%, transparent 70%)`,
                filter: "blur(8px)",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: glowVisible ? 1 : 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />

            <div
              ref={imageStageRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={resetReflection}
              className="relative flex-1 min-h-[220px] sm:min-h-[400px] rounded-[28px] overflow-hidden flex items-center justify-center"
              style={{
                boxShadow:
                  "0 30px 60px -30px rgba(120,60,70,0.32), 0 10px 24px -14px rgba(120,60,70,0.20), inset 0 1px 0 rgba(255,255,255,0.6)",
              }}
            >
              {activeProduct.is_bestseller && (
                <span className="absolute top-4 left-4 z-10 bg-blush text-white text-[10px] font-semibold px-2.5 py-1 rounded-full">
                  Bestseller
                </span>
              )}

              {gallery.length > 1 && phase === "revealed" && (
                <>
                  <button
                    onClick={goPrev}
                    aria-label="Previous image"
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:scale-105 transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={goNext}
                    aria-label="Next image"
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:scale-105 transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Premium top-to-bottom scan — reuses the existing
                  .visual-scan-line / visualScanSweep animation from
                  index.css (Scan & Match), only rendered once per open. */}
              {phase === "scanning" && (
                <div className="absolute inset-x-0 top-0 h-1/3 visual-scan-line z-20 pointer-events-none" />
              )}

              {/* Slow float + gentle cursor-following reflection highlight */}
              <motion.div
                className="relative w-full h-full flex items-center justify-center p-6 sm:p-9"
                animate={{
                  y: [0, -2, 0],
                  scale: phase === "success" ? 0.96 : 1,
                }}
                transition={{
                  y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  scale: { duration: 0.3, ease: "easeOut" },
                }}
              >
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay"
                  style={{
                    background: `radial-gradient(circle at ${reflection.x}% ${reflection.y}%, rgba(255,255,255,0.5) 0%, transparent 45%)`,
                    transition: "background 250ms ease-out",
                  }}
                />
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={currentImage}
                    alt={activeProduct.name}
                    className="max-w-full max-h-full w-auto h-auto object-contain"
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </AnimatePresence>

                {/* Add-to-cart success flash, shown over the image */}
                <AnimatePresence>
                  {phase === "success" && (
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center bg-white/70 rounded-3xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        className="flex flex-col items-center gap-2"
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="w-11 h-11 rounded-full bg-sage flex items-center justify-center">
                          <Check size={20} className="text-white" strokeWidth={2.5} />
                        </div>
                        <p className="text-sm font-medium text-foreground">Added to Cart</p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {gallery.length > 1 && phase === "revealed" && (
              <div className="relative flex items-center gap-2 mt-4 justify-center">
                {gallery.map((url, i) => (
                  <button
                    key={url + i}
                    onClick={() => setImgIndex(i)}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                      i === imgIndex ? "border-blush scale-105" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-contain bg-white" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — progressive info reveal, only once the scan has finished */}
          <AnimatePresence>
            {(phase === "revealed" || phase === "success" || phase === "flying") && (
              <motion.div
                className="p-6 sm:p-9 flex flex-col"
                variants={columnVariants}
                initial="hidden"
                animate="show"
              >
                <motion.p variants={itemVariants} className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                  {activeProduct.collection}
                </motion.p>

                <motion.h2 variants={itemVariants} className="text-xl sm:text-2xl font-heading font-light leading-snug pr-8">
                  {activeProduct.name}
                </motion.h2>

                <motion.div variants={itemVariants} className="flex items-center gap-2 mt-2">
                  {hasRating ? (
                    <>
                      <div className="flex items-center gap-0.5">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Star
                            key={i}
                            size={13}
                            className={
                              i < Math.round(activeProduct.avg_rating) ? "fill-gold text-gold" : "text-border"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {activeProduct.avg_rating.toFixed(1)} ({activeProduct.review_count})
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">No reviews yet</span>
                  )}
                </motion.div>

                <motion.p variants={itemVariants} className="text-xl font-heading font-semibold mt-2">
                  ₹{activeProduct.price}
                </motion.p>

                {activeProduct.tagline && (
                  <motion.p variants={itemVariants} className="text-sm italic text-gold mt-2.5">
                    {activeProduct.tagline}
                  </motion.p>
                )}

                {activeProduct.description && (
                  <motion.p variants={itemVariants} className="text-sm text-muted-foreground leading-relaxed mt-3 line-clamp-3">
                    {activeProduct.description}
                  </motion.p>
                )}

                {activeProduct.highlights && activeProduct.highlights.length > 0 && (
                  <motion.div variants={itemVariants} className="flex flex-wrap gap-2.5 mt-4">
                    {activeProduct.highlights.map((h, i) => {
                      const Icon = getHighlightIcon(h);
                      return (
                        <motion.span
                          key={i}
                          className="inline-flex items-center gap-2 text-xs font-medium text-foreground bg-accent/60 border border-border/50 rounded-full px-3.5 py-2 cursor-default"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ y: -2, boxShadow: "0 8px 16px -10px rgba(120,60,70,0.25)" }}
                        >
                          <Icon size={13} className="text-sage shrink-0" />
                          {h}
                        </motion.span>
                      );
                    })}
                  </motion.div>
                )}

                {siblings.length > 1 && (
                  <motion.div variants={itemVariants} className="mt-5">
                    <p className="text-xs font-medium text-foreground mb-2">
                      Color: <span className="text-muted-foreground font-normal">{activeProduct.color}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      {siblings.map((s) => (
                        <motion.button
                          key={s.slug}
                          onClick={() => setActiveSlug(s.slug)}
                          aria-label={s.color}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 1.05 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className={`w-8 h-8 rounded-full border-2 ${
                            s.slug === activeProduct.slug ? "border-blush shadow-sm scale-110" : "border-border"
                          }`}
                          style={{ background: s.color_hex }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}

                <motion.div variants={itemVariants} className="mt-5">
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
                </motion.div>

                <motion.div variants={itemVariants} className="mt-6 flex items-center gap-2.5">
                  <motion.button
                    onClick={handleAddToCart}
                    disabled={phase !== "revealed"}
                    whileHover={phase === "revealed" ? { y: -2 } : {}}
                    whileTap={phase === "revealed" ? { scale: 0.98 } : {}}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className={`flex-1 h-12 rounded-full flex items-center justify-center gap-2 text-white text-sm font-medium shadow-sm ${
                      phase === "success" || phase === "flying" ? "bg-sage" : "bg-blush hover:bg-blush/90"
                    }`}
                  >
                    {phase === "success" || phase === "flying" ? (
                      <>
                        <Check size={16} strokeWidth={2} /> Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingBag size={16} strokeWidth={1.5} /> Add to Cart
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    onClick={() => toggleWishlist(activeProduct)}
                    aria-label="Toggle wishlist"
                    whileHover={{ y: -2, scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={
                      !wishlisted
                        ? { boxShadow: ["0 0 0 0 hsl(var(--blush) / 0%)", "0 0 0 6px hsl(var(--blush) / 12%)", "0 0 0 0 hsl(var(--blush) / 0%)"] }
                        : { boxShadow: "0 0 0 0 hsl(var(--blush) / 0%)" }
                    }
                    transition={
                      !wishlisted
                        ? { boxShadow: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } }
                        : { duration: 0.2 }
                    }
                    className="w-12 h-12 flex-shrink-0 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors"
                  >
                    <Heart
                      size={18}
                      strokeWidth={1.5}
                      className={wishlisted ? "fill-blush text-blush" : "text-foreground"}
                    />
                  </motion.button>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Link
                    to={`/product/${activeProduct.slug}`}
                    onClick={onClose}
                    className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-foreground hover:text-blush transition-colors mt-4"
                  >
                    View Full Details <ArrowRight size={14} />
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modal, document.body);
}