import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Heart, Target, Eye, Award, ArrowRight } from "lucide-react";

const VALUES = [
  { icon: Sparkles, title: "Innovation", desc: "Always exploring new ways to make technology feel personal." },
  { icon: Heart, title: "Simplicity", desc: "Clean, intuitive design that makes every interaction effortless." },
  { icon: Award, title: "Quality", desc: "Premium materials and thoughtful craftsmanship in every product." },
  { icon: Target, title: "Customer First", desc: "Your experience is at the heart of everything we create." },
];

const JOURNEY = [
  {
    img: "/images/about/Founder-story-1.png",
    heading: "🌸 It Started with a Simple Gift",
    caption:
      "Atman wanted to gift his girlfriend a pair of earbuds. While searching, he found that every option looked bulky, generic, and lacked personality.",
  },
  {
    img: "/images/about/Founder-story-2.png",
    heading: "💭 Something Didn't Feel Right",
    caption:
      "He gifted the earbuds, but the experience wasn't special. It made him realize that technology should feel more personal and thoughtfully designed.",
  },
  {
    img: "/images/about/Founder-story-3.png",
    heading: "🤝 A Dream Takes Shape",
    caption:
      "He shared this idea with his close friend Ayush. Together, they decided to create a technology brand that blended beauty, functionality, and emotion.",
  },
  {
    img: "/images/about/Founder-story-4.png",
    heading: "✨ REVE CULT Was Born",
    caption:
      "That dream became REVE CULT. Today, every product is delivered as a thoughtfully designed premium hamper, making every unboxing feel memorable.",
  },
];

const HAMPER_FEATURES = [
  "Premium Earbuds",
  "Premium Packaging",
  "Mini Case Bag",
  "Pocket Glam Potli",
  "USB Cable",
  "Warranty Card",
  "QR Support Card",
];

function JourneySection() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.7", "end 0.3"],
  });
  const dotTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="text-center mb-16 lg:mb-24">
        <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">How it started</p>
        <h2 className="text-3xl lg:text-5xl font-heading font-light">Our Journey</h2>
      </div>

      <div ref={containerRef} className="relative">
        {/* Center timeline line — desktop only, draws itself as user scrolls */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-border">
          <motion.div
            className="absolute top-0 left-0 w-full bg-gradient-to-b from-blush to-sage"
            style={{ height: lineHeight }}
          />
        </div>

        {/* Traveling glow dot — moves continuously with scroll progress */}
        <motion.div
          className="hidden md:block absolute left-1/2 w-3 h-3 -translate-x-1/2 rounded-full bg-blush shadow-[0_0_14px_4px_rgba(212,150,140,0.55)] z-20"
          style={{ top: dotTop }}
        />

        <div className="space-y-24 md:space-y-36">
          {JOURNEY.map((item, i) => {
            const imageEl = (
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="group rounded-2xl overflow-hidden border border-border"
              >
                <img
                  src={item.img}
                  alt={item.heading}
                  className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
              </motion.div>
            );
            const textEl = (
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.7, ease: "easeOut", delay: 0.25 }}
                className={`max-w-md ${i % 2 === 1 ? "md:text-right md:ml-auto" : ""}`}
              >
                <h3 className="text-xl lg:text-2xl font-heading font-medium mb-4">
                  {item.heading}
                </h3>
                <p className="text-base lg:text-lg font-body font-light leading-relaxed text-foreground/70">
                  {item.caption}
                </p>
              </motion.div>
            );

            return (
              <div key={item.heading} className="relative grid md:grid-cols-2 gap-8 md:gap-16 items-center">
                {i % 2 === 0 ? (
                  <>
                    {imageEl}
                    {textEl}
                  </>
                ) : (
                  <>
                    {textEl}
                    {imageEl}
                  </>
                )}

                {/* Static chapter marker on the center line, lights up when reached */}
                <motion.span
                  className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cream border-2 border-blush items-center justify-center z-10"
                  initial={{ scale: 0.7, opacity: 0.5 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blush" />
                </motion.span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function About() {
  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[85vh] sm:min-h-screen flex items-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(/images/about/hero-lifestyle.png)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: "easeOut" }}
          className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-blush mb-4">Our Story</p>
          <h1 className="text-3xl sm:text-4xl lg:text-6xl font-heading font-light leading-tight mb-6">
            More than Technology.
            <br className="hidden sm:block" />A Story Worth <span className="italic">Listening To.</span>
          </h1>
          <p className="text-sm sm:text-base text-white/80 leading-relaxed mb-8 max-w-xl mx-auto">
            REVE CULT is a women-first technology brand creating aesthetic, functional consumer
            electronics designed for modern lifestyles.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-blush text-white rounded-full text-sm font-medium transition-all duration-300 hover:bg-blush/90 hover:-translate-y-0.5 hover:shadow-lg min-h-[48px]"
          >
            Explore Collection <ArrowRight size={16} />
          </Link>
        </motion.div>
      </section>

      {/* Our Journey — comic timeline with staggered reveal + traveling glow dot */}
      <JourneySection />

      {/* Our Dream */}
      <section className="bg-accent/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-blush mb-4">Our Dream</p>
            {/* TODO: replace with your real founder story copy if you want it different from the journey text */}
            <p className="text-xl sm:text-2xl lg:text-3xl font-heading font-light leading-relaxed text-foreground/90 max-w-2xl mx-auto">
              We started REVE CULT because we couldn't find technology that felt like it belonged to us.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Premium Hamper Experience */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="group rounded-3xl overflow-hidden border border-border"
          >
            <img
              src="/images/about/hamper-showcase.png"
              alt="Premium hamper experience"
              className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </motion.div>
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">Unboxing</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-light mb-6">
              The Premium Hamper Experience
            </h2>
            <p className="text-sm text-foreground/70 leading-relaxed mb-8 max-w-md">
              Every REVE CULT order arrives as a full ritual, not just a delivery.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {HAMPER_FEATURES.map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="px-4 py-3 bg-white rounded-xl border border-border text-sm font-medium text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {f}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Designed For Her */}
      <section className="bg-accent/30 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="group order-2 md:order-1 rounded-3xl overflow-hidden border border-border"
          >
            <img
              src="/images/about/lifestyle-cafe.png"
              alt="REVE CULT lifestyle"
              className="w-full h-auto object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
            className="order-1 md:order-2"
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-light mb-4">Designed For Her</h2>
            <p className="text-sm text-foreground/70 leading-relaxed max-w-md">
              Every curve, colour, and finish is chosen with one person in mind — you. REVE CULT
              exists so that technology can finally feel personal.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">What we stand for</p>
          <h2 className="text-3xl lg:text-4xl font-heading font-light">Our Values</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {VALUES.map((v, i) => (
            <div
              key={v.title}
              className="p-6 bg-white rounded-2xl border border-border text-center animate-fade-in-up transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
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

      {/* Closing */}
      <section className="relative overflow-hidden py-20 sm:py-24 lg:py-32">
        <div
          className="absolute inset-0 bg-cover bg-center about-closing-zoom"
          style={{ backgroundImage: "url(/images/about/closing-flatlay.png)" }}
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-heading font-light leading-tight mb-8">
            Technology should never feel ordinary.
            <br className="hidden sm:block" />
            It should feel like <span className="italic text-blush">you.</span>
          </h2>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-foreground rounded-full text-sm font-medium transition-all duration-300 hover:bg-cream hover:-translate-y-0.5 hover:shadow-lg min-h-[48px]"
          >
            Shop Collection <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}