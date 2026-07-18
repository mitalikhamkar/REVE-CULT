import React from "react";
import { Link } from "react-router-dom";
import { Sparkles, Heart, Target, Eye, Award, ArrowRight } from "lucide-react";

const VALUES = [
  { icon: Sparkles, title: "Innovation", desc: "Always exploring new ways to make technology feel personal." },
  { icon: Heart, title: "Simplicity", desc: "Clean, intuitive design that makes every interaction effortless." },
  { icon: Award, title: "Quality", desc: "Premium materials and thoughtful craftsmanship in every product." },
  { icon: Target, title: "Customer First", desc: "Your experience is at the heart of everything we create." },
];

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-cream py-16 lg:py-24">
        <div className="absolute inset-0 halo-bg" />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-blush mb-4">Our Story</p>
          <h1 className="text-4xl lg:text-6xl font-heading font-light leading-tight mb-6">
            Technology as an <span className="italic text-blush">expression of self.</span>
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            REVE CULT is a women-first technology brand creating aesthetic and functional consumer electronics designed for modern lifestyles. We believe technology should feel like an extension of who you are — soft, intentional, and beautifully made.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-8 bg-white rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-full bg-blush/15 flex items-center justify-center mb-4">
              <Target size={22} className="text-blush" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-heading font-light mb-3">Our Mission</h2>
            <p className="text-sm text-foreground/70 leading-relaxed">
              Create premium-looking technology products that combine functionality, aesthetics, affordability, and thoughtful user experience. Every product is designed with intention — to be beautiful, useful, and a joy to use every day.
            </p>
          </div>
          <div className="p-8 bg-white rounded-2xl border border-border">
            <div className="w-12 h-12 rounded-full bg-sage/15 flex items-center justify-center mb-4">
              <Eye size={22} className="text-sage" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-heading font-light mb-3">Our Vision</h2>
            <p className="text-sm text-foreground/70 leading-relaxed">
              To build a technology brand where innovation, design, and self-expression come together to create products people love using every day. We envision a world where technology feels personal, calm, and uniquely yours.
            </p>
          </div>
        </div>
      </section>

      {/* Brand story */}
      <section className="bg-accent/30 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-blush mb-3">Why REVE CULT</p>
          <h2 className="text-3xl lg:text-4xl font-heading font-light mb-5">Designed for her, made for everyone</h2>
          <p className="text-sm text-foreground/70 leading-relaxed mb-4">
            We noticed that most tech products felt cold, bulky, and impersonal — designed without the people who'd actually use them in mind. So we set out to create something different.
          </p>
          <p className="text-sm text-foreground/70 leading-relaxed">
            From the soft pastel palettes to the minimalist celestial and floral artwork, every detail of REVE CULT is thoughtfully crafted. Our earbuds aren't just devices — they're objects of calm, designed to turn everyday listening into a personal ritual.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">What we stand for</p>
          <h2 className="text-3xl lg:text-4xl font-heading font-light">Our Values</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUES.map((v, i) => (
            <div
              key={v.title}
              className="p-6 bg-white rounded-2xl border border-border text-center animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
            >
              <div className="inline-flex w-12 h-12 rounded-full bg-blush/10 items-center justify-center mb-3">
                <v.icon size={20} className="text-blush" strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-semibold mb-2">{v.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blush/10 via-cream to-sage/10 p-10 lg:p-16 text-center">
          <div className="absolute inset-0 halo-bg" />
          <div className="relative">
            <h2 className="text-3xl lg:text-4xl font-heading font-light mb-3">Find your perfect REVE</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Explore our collection of earbuds, accessories, and apparel — designed for the way you live.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors min-h-[48px]"
            >
              Shop Collection <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}