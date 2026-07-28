import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { formatPrice } from "@/lib/formatPrice";

// Pull the showcased earbuds straight from the existing product catalog —
// name, price, and tagline are never re-hardcoded here.
const SHOWCASE_SLUGS = [
  "reve-flora-golden-black",
  "reve-seraph-mint-green",
  "reve-seraph-silver-black",
  "reve-flora-golden-beige",
];

const SHOWCASE_ITEMS = SHOWCASE_SLUGS.map((slug) => PRODUCTS.find((p) => p.slug === slug)).filter(Boolean);

const ROTATE_INTERVAL_MS = 5000;
const FULL_TRANSITION = "transform 900ms cubic-bezier(0.22, 1, 0.36, 1), opacity 900ms ease";
// The item that is fully offstage only needs to crossfade — its position can
// jump instantly while invisible, so it never visibly slides across the stage.
const HIDDEN_TRANSITION = "opacity 500ms ease";

// Editorial "peek" layout: one large featured card in the center, with only
// partial previews of the previous/next products visible at the edges of the
// display case. The 4th item sits fully offstage (opacity 0) until its turn.
const SLOTS = [
  {
    // Center — active, fully featured
    transform: "translate(-50%, -50%) translate(0px, 0px) scale(1)",
    opacity: 1,
    zIndex: 30,
    transition: FULL_TRANSITION,
  },
  {
    // Right — partial preview, peeking in from the edge
    transform: "translate(-50%, -50%) translate(clamp(150px,34vw,320px), clamp(10px,2vw,18px)) scale(0.62)",
    opacity: 0.5,
    zIndex: 20,
    transition: FULL_TRANSITION,
  },
  {
    // Offstage — waiting its turn, not visible
    transform: "translate(-50%, -50%) translate(0px, 0px) scale(0.4)",
    opacity: 0,
    zIndex: 0,
    transition: HIDDEN_TRANSITION,
  },
  {
    // Left — partial preview, peeking in from the edge
    transform: "translate(-50%, -50%) translate(clamp(-320px,-34vw,-150px), clamp(10px,2vw,18px)) scale(0.62)",
    opacity: 0.5,
    zIndex: 20,
    transition: FULL_TRANSITION,
  },
];

const SIZE_CLASSES = [
  "w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72", // center
  "w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48", // right peek
  "w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48", // offstage
  "w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48", // left peek
];

export default function ProductShowcase() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  // Preload every showcased image so rotation never shows a flash of empty space.
  useEffect(() => {
    SHOWCASE_ITEMS.forEach((item) => {
      const img = new Image();
      img.src = item.image_url;
    });
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % SHOWCASE_ITEMS.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, []);

  const len = SHOWCASE_ITEMS.length;
  const activeItem = SHOWCASE_ITEMS[active];

  const goToActiveProduct = () => {
    if (activeItem) navigate(`/product/${activeItem.slug}`);
  };

  return (
    <section className="bg-gradient-to-b from-[#FDF1F4]/40 via-[#FDF1F4]/10 to-transparent py-14 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-9 lg:mb-11">
          <p className="text-xs uppercase tracking-[0.25em] text-gold mb-2.5">Featured Rotation</p>
          <h2 className="text-3xl lg:text-[2.75rem] font-heading font-light tracking-tight">Find Your Perfect Sound</h2>
          <div className="w-12 h-px bg-gold/40 mx-auto mt-5 mb-5" />
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Explore REVE CULT's premium wireless earbuds, thoughtfully designed to complement your style,
            comfort, and everyday lifestyle.
          </p>
        </div>

        {/* Premium display case */}
        <div
          className="relative mx-auto rounded-[32px] border border-white/60 px-6 py-11 sm:px-10 sm:py-12 lg:px-16 lg:py-16"
          style={{
            width: "90%",
            maxWidth: "74rem",
            background: "linear-gradient(160deg, #FFF4F6 0%, #f4c7cf 100%)",
            boxShadow: "0 28px 64px -32px rgba(120,60,70,0.20), inset 0 1px 0 rgba(255,255,255,0.8)",
          }}
        >
          {/* Faint decorative accents — behind the cards, purely atmospheric */}
          <div
            className="absolute -top-10 -left-10 w-56 h-56 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, hsl(var(--gold) / 12%) 0%, transparent 72%)",
            }}
          />
          <div
            className="absolute -bottom-14 -right-10 w-64 h-64 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.55) 0%, transparent 72%)",
            }}
          />
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M -5 70 Q 50 55 105 68" fill="none" stroke="hsl(var(--gold) / 16%)" strokeWidth="0.3" />
          </svg>

          {/* Stage — clips the peeking side cards at the case edge */}
          <div className="relative w-full h-64 sm:h-72 lg:h-80 overflow-hidden">
            {SHOWCASE_ITEMS.map((item, i) => {
              const offset = (i - active + len) % len;
              const slot = SLOTS[offset];
              const isActive = offset === 0;

              return (
                <div
                  key={item.id}
                  className={`absolute top-1/2 left-1/2 ${SIZE_CLASSES[offset]}`}
                  style={{
                    transform: slot.transform,
                    opacity: slot.opacity,
                    zIndex: slot.zIndex,
                    transition: slot.transition,
                    willChange: "transform, opacity",
                  }}
                >
                  <div
                    className={"relative w-full h-full" + (isActive ? " animate-showcase-float" : "")}
                    onMouseEnter={() => isActive && setHovered(true)}
                    onMouseLeave={() => isActive && setHovered(false)}
                  >
                    {/* Tinted pedestal — gives the product something to sit on, in
                        a lighter tone that stands out against the blush case */}
                    <div
                      className="absolute inset-0 rounded-[24px] pointer-events-none"
                      style={{
                        background: "linear-gradient(150deg, rgba(255,255,255,0.9) 0%, hsl(var(--cream)) 100%)",
                        border: "1px solid rgba(255,255,255,0.9)",
                        boxShadow:
                          isActive && hovered
                            ? "0 22px 40px -20px rgba(120,60,70,0.24)"
                            : isActive
                            ? "0 14px 28px -18px rgba(120,60,70,0.16)"
                            : "0 8px 16px -12px rgba(120,60,70,0.10)",
                        transition: "box-shadow 350ms ease",
                      }}
                    />
                    {/* Soft ambient floor shadow for realistic depth — no fake 3D */}
                    <div
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 w-1/2 h-4 rounded-full pointer-events-none"
                      style={{
                        background: "radial-gradient(ellipse, rgba(38,30,20,0.18) 0%, transparent 72%)",
                        filter: "blur(4px)",
                        opacity: isActive ? 1 : 0.6,
                        transition: "opacity 350ms ease",
                      }}
                    />
                    <img
                      src={item.image_url}
                      alt={item.name}
                      draggable={false}
                      className="absolute inset-0 w-full h-full object-contain p-4 sm:p-5"
                      style={{
                        mixBlendMode: "multiply",
                        pointerEvents: isActive ? "auto" : "none",
                        cursor: isActive ? "pointer" : "default",
                        transform: isActive && hovered ? "scale(1.03)" : "scale(1)",
                        transition: "transform 350ms ease",
                        filter:
                          isActive && hovered
                            ? "drop-shadow(0 18px 24px rgba(38,30,20,0.18))"
                            : "drop-shadow(0 10px 14px rgba(38,30,20,0.10))",
                      }}
                      onClick={() => isActive && goToActiveProduct()}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active product info panel */}
          {activeItem && (
            <div className="relative mt-5 sm:mt-7 text-center" key={activeItem.id}>
              <div className="animate-fade-in-up" style={{ opacity: 0 }}>
                <h3 className="product-title inline-block tracking-wide">
                  {activeItem.name}
                </h3>
                <p className="text-sm italic text-muted-foreground mt-1.5">{activeItem.tagline}</p>
                <p className="product-price mt-2.5">{formatPrice(activeItem.price)}</p>
                <Link
                  to={`/product/${activeItem.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gold hover:gap-2.5 transition-all mt-3.5"
                >
                  View Product <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}