//Home.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sparkles, ScanLine, ArrowRight, Quote } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import ProductCard from "@/components/store/ProductCard";
import FindMyReveMatch from "@/components/store/FindMyReveMatch";
import VisualSearch from "@/components/store/VisualSearch";
import RitualLoader from "@/components/store/RitualLoader";
import ProductShowcase from "@/components/store/ProductShowcase";
import CategoryShowcase from "@/components/store/CategoryShowcase";
import HeroGallery from "@/components/store/HeroGallery";
import SignatureBoxTeaser from "@/components/store/SignatureBoxTeaser";

const TESTIMONIALS = [
  { name: "Ananya", text: "The Mint Green SERAPH earbuds are honestly the prettiest tech I own. Sound is crystal clear and they look gorgeous.", role: "College Student" },
  { name: "Priya", text: "Finally a tech brand that feels designed for me. The FLORA earbuds fit perfectly and the ANC is a lifesaver at work.", role: "Marketing Professional" },
  { name: "Meera", text: "The packaging, the design, the sound — everything feels premium. The Mini Luxe case is my everyday essential now.", role: "Designer" },
];

export default function Home() {
  const [showQuiz, setShowQuiz] = useState(false);
  const [showVisual, setShowVisual] = useState(false);
  const [showRitual, setShowRitual] = useState(true);

  useEffect(() => {
    const seen = sessionStorage.getItem("reve_ritual_seen");
    if (seen) setShowRitual(false);
    else sessionStorage.setItem("reve_ritual_seen", "true");
  }, []);

  const newArrivals = PRODUCTS.filter((p) => p.is_new_arrival);
  const bestsellers = PRODUCTS.filter((p) => p.is_bestseller);
  const featured = PRODUCTS.filter((p) => p.is_featured).slice(0, 4);

  return (
    <>
      {showRitual && <RitualLoader onDone={() => setShowRitual(false)} />}

      {/* Hero */}
      <section className="relative overflow-hidden bg-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10 lg:pt-8 lg:pb-14">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur-sm rounded-full text-xs font-medium text-blush mb-6">
                <Sparkles size={14} /> A women-first technology brand
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-light leading-[1.1] text-foreground mb-5">
                Technology, <br />
                <span className="italic text-blush">styled with intention.</span>
              </h1>
              <p className="text-base text-muted-foreground leading-relaxed mb-8 max-w-md">
                Where innovation meets self-expression. Discover premium earbuds, accessories, and apparel designed for the way you live.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-all hover:scale-[1.02] min-h-[48px]"
                >
                  Shop Collection <ArrowRight size={16} />
                </Link>
                <button
                  onClick={() => setShowQuiz(true)}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-white text-foreground rounded-full text-sm font-medium hover:bg-accent transition-all border border-border min-h-[48px]"
                >
                  <Sparkles size={16} className="text-blush" /> Find My REVE Match
                </button>
              </div>
            </div>
            <HeroGallery />
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-y border-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Authentic Product", desc: "100% genuine" },
              { title: "Safe Delivery", desc: "Secure packaging" },
              { title: "Easy Returns", desc: "Hassle-free" },
              { title: "Women-Friendly Design", desc: "Made for you" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Find Your Perfect Sound — rotating product showcase */}
      <ProductShowcase />

      {/* Shop by Category */}
      <CategoryShowcase />

      {/* Bestsellers */}
      <section className="bg-accent/30 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blush mb-1">Loved by many</p>
              <h2 className="text-3xl lg:text-4xl font-heading font-light">Bestsellers</h2>
            </div>
            <Link to="/shop" className="text-sm font-medium text-foreground hover:text-blush transition-colors flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {bestsellers.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Find My REVE Match CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-9 lg:mb-11">
          <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">Not Sure Where To Start</p>
          <h2 className="text-3xl lg:text-4xl font-heading font-light">Let REVE CULT Guide You</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {/* Find Your REVE Match */}
          <button
            onClick={() => setShowQuiz(true)}
            className="group relative overflow-hidden rounded-[32px] p-8 lg:p-12 text-left min-h-[320px] lg:min-h-[380px] flex flex-col justify-between border border-white/70 transition-all duration-500 ease-out hover:-translate-y-2"
            style={{
              background: "linear-gradient(150deg, hsl(var(--blush) / 18%) 0%, hsl(var(--cream)) 58%, hsl(var(--blush) / 12%) 100%)",
              boxShadow: "0 18px 42px -26px rgba(196,120,120,0.30)",
            }}
          >
            {/* Base shadow lifts further on hover */}
            <div
              className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"
              style={{ boxShadow: "0 32px 60px -24px rgba(196,120,120,0.42)" }}
            />
            {/* Faint watermark icon — editorial touch */}
            <Sparkles
              size={200}
              strokeWidth={0.75}
              className="absolute -right-8 -bottom-10 text-blush opacity-[0.07] pointer-events-none transition-transform duration-700 ease-out group-hover:rotate-6 group-hover:scale-105"
            />
            {/* Glow blob */}
            <div
              className="absolute -top-16 -right-12 w-72 h-72 rounded-full pointer-events-none transition-all duration-700 ease-out group-hover:scale-125"
              style={{ background: "radial-gradient(circle, hsl(var(--blush) / 26%) 0%, transparent 70%)" }}
            />
            {/* Soft glow ring on hover */}
            <div
              className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"
              style={{ boxShadow: "inset 0 0 0 1px hsl(var(--blush) / 45%)" }}
            />

            <div className="relative z-10">
              <div className="relative inline-flex w-16 h-16 rounded-full bg-white items-center justify-center shadow-md transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:rotate-6 group-hover:shadow-lg">
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
                  style={{ boxShadow: "0 0 0 8px hsl(var(--blush) / 14%)" }}
                />
                <Sparkles size={24} className="relative text-blush" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-blush/70 font-medium mt-5">AI Style Quiz</p>
              <h3 className="text-2xl lg:text-3xl font-heading font-light mt-2 mb-2.5">Find Your REVE Match</h3>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Answer 3 quick questions and we'll recommend the perfect REVE product for your vibe and
                lifestyle.
              </p>
            </div>
            <div className="relative z-10 inline-flex items-center gap-3 text-sm font-medium text-blush mt-8">
              Start the Quiz
              <span className="inline-flex w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm transition-all duration-300 ease-out group-hover:translate-x-1.5 group-hover:shadow-md">
                <ArrowRight size={14} />
              </span>
            </div>
          </button>

          {/* Scan & Match */}
          <button
            onClick={() => setShowVisual(true)}
            className="group relative overflow-hidden rounded-[32px] p-8 lg:p-12 text-left min-h-[320px] lg:min-h-[380px] flex flex-col justify-between border border-white/70 transition-all duration-500 ease-out hover:-translate-y-2"
            style={{
              background: "linear-gradient(150deg, hsl(var(--sage) / 16%) 0%, hsl(var(--cream)) 58%, hsl(var(--gold) / 12%) 100%)",
              boxShadow: "0 18px 42px -26px rgba(120,140,110,0.28)",
            }}
          >
            {/* Base shadow lifts further on hover */}
            <div
              className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"
              style={{ boxShadow: "0 32px 60px -24px rgba(120,140,110,0.40)" }}
            />
            {/* Faint watermark icon — editorial touch */}
            <ScanLine
              size={200}
              strokeWidth={0.75}
              className="absolute -left-8 -bottom-10 text-sage opacity-[0.07] pointer-events-none transition-transform duration-700 ease-out group-hover:-rotate-6 group-hover:scale-105"
            />
            {/* Glow blob */}
            <div
              className="absolute -bottom-16 -left-12 w-72 h-72 rounded-full pointer-events-none transition-all duration-700 ease-out group-hover:scale-125"
              style={{ background: "radial-gradient(circle, hsl(var(--sage) / 24%) 0%, transparent 70%)" }}
            />
            {/* Soft glow ring on hover */}
            <div
              className="absolute inset-0 rounded-[32px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out pointer-events-none"
              style={{ boxShadow: "inset 0 0 0 1px hsl(var(--sage) / 40%)" }}
            />

            <div className="relative z-10">
              <div className="relative inline-flex w-16 h-16 rounded-full bg-white items-center justify-center shadow-md transition-all duration-300 ease-out group-hover:-translate-y-1.5 group-hover:-rotate-6 group-hover:shadow-lg">
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
                  style={{ boxShadow: "0 0 0 8px hsl(var(--sage) / 14%)" }}
                />
                <ScanLine size={24} className="relative text-sage" />
              </div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-sage/80 font-medium mt-5">Visual Search</p>
              <h3 className="text-2xl lg:text-3xl font-heading font-light mt-2 mb-2.5">Scan &amp; Match</h3>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                Upload a photo of your style and we'll instantly find the REVE piece that fits you best.
              </p>
            </div>
            <div className="relative z-10 inline-flex items-center gap-3 text-sm font-medium text-sage mt-8">
              Scan a Photo
              <span className="inline-flex w-8 h-8 rounded-full bg-white items-center justify-center shadow-sm transition-all duration-300 ease-out group-hover:translate-x-1.5 group-hover:shadow-md">
                <ArrowRight size={14} />
              </span>
            </div>
          </button>
        </div>
      </section>

      {/* Create Your Signature Box — premium gifting preview */}
      <SignatureBoxTeaser />

      {/* New Arrivals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blush mb-1">Just landed</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-light">New Arrivals</h2>
          </div>
          <Link to="/shop" className="text-sm font-medium text-foreground hover:text-blush transition-colors flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {newArrivals.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Featured grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blush mb-1">Curated for you</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-light">Featured Collection</h2>
          </div>
          <Link to="/shop" className="text-sm font-medium text-foreground hover:text-blush transition-colors flex items-center gap-1">
            Shop all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>

      {/* Brand Story */}
      <section className="bg-foreground text-background py-20 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-blush mb-3">Our Story</p>
              <h2 className="text-3xl lg:text-5xl font-heading font-light leading-tight mb-5">
                Innovation, design, and <span className="italic text-blush">self-expression.</span>
              </h2>
              <p className="text-sm text-background/70 leading-relaxed mb-4">
                REVE CULT was born from a simple idea: technology should feel like an extension of who you are. We create premium-looking products that combine functionality, aesthetics, and affordability — designed for modern lifestyles.
              </p>
              <p className="text-sm text-background/70 leading-relaxed mb-6">
                As a women-first brand, every detail — from the soft pastel palettes to the minimalist artwork — is thoughtfully crafted to feel elegant, calm, and uniquely yours.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-sm font-medium text-blush hover:gap-3 transition-all"
              >
                Read our story <ArrowRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-3xl font-heading font-light text-blush">7+</p>
                <p className="text-xs text-background/60 mt-1">Thoughtfully designed products</p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 mt-8">
                <p className="text-3xl font-heading font-light text-blush">100%</p>
                <p className="text-xs text-background/60 mt-1">Women-friendly design</p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                <p className="text-3xl font-heading font-light text-blush">₹499+</p>
                <p className="text-xs text-background/60 mt-1">Starting price point</p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-white/10 mt-8">
                <p className="text-3xl font-heading font-light text-blush">5★</p>
                <p className="text-xs text-background/60 mt-1">Premium experience</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Favorites / Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">Customer Favorites</p>
          <h2 className="text-3xl lg:text-4xl font-heading font-light">Loved by our community</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              className="p-6 bg-white rounded-2xl border border-border animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
            >
              <Quote size={24} className="text-blush/30 mb-3" />
              <p className="text-sm text-foreground/80 leading-relaxed mb-4">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blush/15 flex items-center justify-center text-sm font-medium text-blush">
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {showQuiz && <FindMyReveMatch onClose={() => setShowQuiz(false)} />}
      {showVisual && <VisualSearch onClose={() => setShowVisual(false)} />}
    </>
  );
}