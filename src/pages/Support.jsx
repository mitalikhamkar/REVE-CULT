import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  ChevronDown, MessageCircle, Mail, Send, Phone, HelpCircle,
  Truck, RefreshCw, ShieldCheck, Gift, ArrowRight, Users,
  CheckCircle2, Clock, MapPin, Bluetooth, BatteryCharging,
  Volume2, Package, Plus, Minus,
} from "lucide-react";
import { entities } from "@/api/entities";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const QUICK_HELP = [
  { icon: Truck, title: "Track Order", desc: "See where your order is, in real time." },
  { icon: Headphones_Icon, title: "Product Support", desc: "Pairing, sound, and setup help." },
  { icon: RefreshCw, title: "Returns & Exchanges", desc: "Easy returns within 7 days." },
  { icon: ShieldCheck, title: "Warranty", desc: "6-month coverage on every pair." },
  { icon: Gift, title: "Signature Box Help", desc: "Questions about your gift box." },
  { icon: MessageCircle, title: "Contact Support", desc: "Reach our team directly." },
];

const JOURNEY_STEPS = [
  { icon: HelpCircle, title: "Need Help" },
  { icon: Send, title: "Contact REVE CULT" },
  { icon: Users, title: "Support Team Reviews" },
  { icon: CheckCircle2, title: "Solution Provided" },
];

const PRODUCT_HELP = [
  { icon: Bluetooth, title: "Earbuds Pairing", desc: "Get connected in seconds." },
  { icon: BatteryCharging, title: "Charging Issues", desc: "Troubleshoot power problems." },
  { icon: Volume2, title: "Sound Quality", desc: "Tune your listening experience." },
  { icon: Clock, title: "Battery Questions", desc: "Life, health, and replacement." },
  { icon: Package, title: "Signature Box", desc: "Everything about your hamper." },
];

const FAQ_CATEGORIES = ["Orders", "Products", "Warranty", "Returns", "Payments"];

const FAQS = [
  { category: "Orders", q: "How long does delivery take?", a: "Standard delivery takes 3-5 business days. Express delivery (1-2 days) and same-day delivery (within city limits) are available at checkout." },
  { category: "Orders", q: "How do I track my order?", a: "Once your order ships, you'll receive a tracking number via email. You can also track your order anytime from your profile under Order History." },
  { category: "Orders", q: "Can I change or cancel my order?", a: "You can modify or cancel your order within 2 hours of placing it. Contact our support team as soon as possible and we'll do our best to help." },
  { category: "Products", q: "Are REVE CULT earbuds waterproof?", a: "Our earbuds are designed for everyday use but should be kept away from water, dust, and extreme heat. Please handle them with care — the designs are hand-printed." },
  { category: "Products", q: "Are the product images on the website real photos?", a: "Currently, our product images are AI-generated samples that closely represent the actual products. Real product photography will be updated soon." },
  { category: "Warranty", q: "Do you offer a warranty?", a: "Yes, all REVE CULT earbuds come with a 6-month manufacturer warranty against defects. Reach out to our support team for warranty claims." },
  { category: "Returns", q: "What is your return policy?", a: "We offer easy returns within 7 days of delivery. Products must be unused and in original packaging. Simply visit your order history to initiate a return." },
  { category: "Payments", q: "Which payment methods do you accept?", a: "We accept credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, and popular wallets. All payments are secured with SSL encryption." },
];

const STATS = [
  { value: 98, suffix: "%", label: "Customer Satisfaction" },
  { value: 24, suffix: "hr", label: "Average Response Time" },
  { value: 10000, suffix: "+", label: "Happy Customers" },
  { value: 5000, suffix: "+", label: "Support Requests Resolved" },
];

/* Small local icon alias so QUICK_HELP above reads cleanly (lucide has no
   default export named Headphones in some versions of this icon set — using
   MessageCircle's cousin to avoid an import error either way). */
import { Headphones as Headphones_Icon } from "lucide-react";

/* ------------------------------------------------------------------ */
/* Reusable bits                                                      */
/* ------------------------------------------------------------------ */

function MagneticButton({ children, className = "", ...props }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState([]);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setPos({ x: x * 0.25, y: y * 0.25 });
  };

  const handleClick = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const id = Date.now();
    setRipples((r) => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples((r) => r.filter((rp) => rp.id !== id)), 600);
    props.onClick?.(e);
  };

  return (
    <button
      ref={ref}
      {...props}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPos({ x: 0, y: 0 })}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, transition: "transform 0.2s ease-out" }}
      className={`relative overflow-hidden ${className}`}
    >
      {children}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-effect"
          style={{ left: r.x, top: r.y }}
        />
      ))}
    </button>
  );
}

function StatCounter({ value, suffix, label }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1400;
    const start = performance.now();
    let frame;
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl lg:text-5xl font-heading font-light text-blush mb-2">
        {display.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function QuickHelpCard({ item, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: i * 0.08 }}
      className="group relative rounded-2xl p-[1.5px] gradient-border-hover"
    >
      <div className="relative bg-white rounded-2xl p-6 h-full transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1.5">
        <div className="inline-flex w-12 h-12 rounded-full bg-blush/10 items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-6">
          <item.icon size={22} className="text-blush" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-semibold mb-1.5">{item.title}</h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{item.desc}</p>
        <div className="flex items-center gap-1.5 text-xs font-medium text-blush">
          Learn more
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1.5" />
        </div>
      </div>
    </motion.div>
  );
}

function ProductHelpCard({ item, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: i * 0.08 }}
      className="glass rounded-2xl p-6 border border-border animate-float transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      style={{ animationDelay: `${i * 0.4}s` }}
    >
      <div className="inline-flex w-11 h-11 rounded-full bg-sage/10 items-center justify-center mb-4">
        <item.icon size={20} className="text-sage" strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-semibold mb-1.5">{item.title}</h3>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{item.desc}</p>
      <button className="flex items-center gap-1.5 text-xs font-medium text-sage hover:gap-2.5 transition-all">
        Learn More <ArrowRight size={13} />
      </button>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Hero with cursor-follow glow                                       */
/* ------------------------------------------------------------------ */

function SupportHero() {
  const sectionRef = useRef(null);
  const [glow, setGlow] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const rect = sectionRef.current.getBoundingClientRect();
    setGlow({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-cream py-20 lg:py-28"
    >
      {/* cursor-follow glow */}
      <div
        className="absolute inset-0 pointer-events-none transition-[background] duration-300 ease-out"
        style={{
          background: `radial-gradient(circle at ${glow.x}% ${glow.y}%, hsl(var(--blush) / 0.18), transparent 45%)`,
        }}
      />
      {/* slow-moving abstract blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-blush/10 blur-3xl animate-float" />
      <div className="absolute -bottom-24 -right-10 w-80 h-80 rounded-full bg-sage/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-xs uppercase tracking-[0.3em] text-blush mb-4">We're here to help</p>
          <h1 className="text-4xl lg:text-6xl font-heading font-light leading-tight mb-5">
            How Can We Help <span className="italic text-blush">You Today?</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-8 max-w-md">
            Our team is here to make every REVE CULT experience effortless — from product
            questions to order support.
          </p>
          <MagneticButton className="inline-flex items-center gap-2 px-7 py-3.5 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors min-h-[48px]">
            Explore Support <ArrowRight size={16} />
          </MagneticButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="relative flex justify-center"
        >
          <div className="animate-float">
            <svg viewBox="0 0 320 360" className="w-64 sm:w-80" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="haloGrad" cx="50%" cy="45%" r="60%">
                  <stop offset="0%" stopColor="hsl(13 49% 71% / 0.35)" />
                  <stop offset="100%" stopColor="hsl(13 49% 71% / 0)" />
                </radialGradient>
                <linearGradient id="figureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(13 49% 71%)" />
                  <stop offset="100%" stopColor="hsl(150 18% 55%)" />
                </linearGradient>
              </defs>
              <circle cx="160" cy="160" r="150" fill="url(#haloGrad)" />
              {/* simple figure silhouette */}
              <circle cx="160" cy="110" r="46" fill="url(#figureGrad)" opacity="0.9" />
              <path d="M100 340 C100 250 220 250 220 340 Z" fill="url(#figureGrad)" opacity="0.85" />
              {/* earbud */}
              <circle cx="196" cy="112" r="9" fill="white" stroke="hsl(var(--blush))" strokeWidth="2" />
              <circle cx="124" cy="112" r="9" fill="white" stroke="hsl(var(--blush))" strokeWidth="2" />
              {/* floating particles */}
              {[...Array(6)].map((_, i) => (
                <circle
                  key={i}
                  cx={60 + i * 40}
                  cy={40 + (i % 3) * 30}
                  r={3 + (i % 2)}
                  fill="hsl(var(--gold))"
                  opacity="0.6"
                />
              ))}
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ with category tabs                                             */
/* ------------------------------------------------------------------ */

function PremiumFaq() {
  const [category, setCategory] = useState("Orders");
  const [openIdx, setOpenIdx] = useState(0);
  const filtered = FAQS.filter((f) => f.category === category);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">Answers, fast</p>
        <h2 className="text-3xl lg:text-4xl font-heading font-light">Frequently Asked Questions</h2>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => { setCategory(cat); setOpenIdx(0); }}
            className={`px-5 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
              category === cat
                ? "bg-blush text-white shadow-md"
                : "bg-white border border-border text-foreground/70 hover:border-blush/40"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">No FAQs in this category yet.</p>
          )}
          {filtered.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={faq.q} className="border border-border rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/40 transition-colors text-left"
                >
                  <span className="text-sm font-medium pr-4">{faq.q}</span>
                  <span className="shrink-0 w-6 h-6 rounded-full border border-border flex items-center justify-center">
                    {isOpen ? <Minus size={12} /> : <Plus size={12} />}
                  </span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Main page                                                           */
/* ------------------------------------------------------------------ */

export default function Support() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", category: "General", orderId: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await entities.SupportTicket.create(form);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", category: "General", orderId: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      /* prototype */
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="overflow-x-hidden">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link> <span className="mx-1">/</span> <span className="text-foreground">Support</span>
      </nav>

      <SupportHero />

      {/* Quick Help Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">Quick help</p>
          <h2 className="text-3xl lg:text-4xl font-heading font-light">What do you need?</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {QUICK_HELP.map((item, i) => (
            <QuickHelpCard key={item.title} item={item} i={i} />
          ))}
        </div>
      </section>

      {/* Support Journey */}
      <section className="bg-accent/30 py-16 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">The process</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-light">Your Support Journey</h2>
          </div>
          <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-10 md:gap-4">
            <div className="hidden md:block absolute top-7 left-0 right-0 h-px bg-border">
              <motion.div
                className="h-full bg-gradient-to-r from-blush via-gold to-sage"
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                style={{ transformOrigin: "left" }}
              />
            </div>
            {JOURNEY_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="group relative z-10 flex flex-col items-center text-center max-w-[160px]"
              >
                <div className="w-14 h-14 rounded-full bg-white border-2 border-blush/30 flex items-center justify-center mb-3 transition-all duration-300 group-hover:border-blush group-hover:shadow-[0_0_20px_rgba(212,150,140,0.4)]">
                  <step.icon size={22} className="text-blush" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium">{step.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Help */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">Product topics</p>
          <h2 className="text-3xl lg:text-4xl font-heading font-light">Common Questions</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRODUCT_HELP.map((item, i) => (
            <ProductHelpCard key={item.title} item={item} i={i} />
          ))}
        </div>
      </section>

      {/* Premium FAQ */}
      <PremiumFaq />

      {/* Contact Section */}
      <section className="bg-accent/30 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Contact info cards */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">Get in touch</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-light mb-8">Contact Us</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Mail, title: "Email", value: "support@revecult.com" },
                { icon: Phone, title: "Phone", value: "+91 98765 43210" },
                { icon: Clock, title: "Business Hours", value: "Mon-Sat, 10am-7pm" },
                { icon: MapPin, title: "Location", value: "Mumbai, India" },
              ].map((c) => (
                <motion.div
                  key={c.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5 }}
                  className="glass rounded-2xl p-5 border border-border transition-all duration-300 hover:shadow-lg hover:shadow-blush/10"
                >
                  <div className="inline-flex w-10 h-10 rounded-full bg-blush/10 items-center justify-center mb-3 transition-transform duration-300 hover:rotate-6">
                    <c.icon size={18} className="text-blush" strokeWidth={1.5} />
                  </div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{c.title}</p>
                  <p className="text-sm font-medium">{c.value}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl border border-border p-6 lg:p-8"
          >
            {submitted ? (
              <div className="text-center py-10">
                <div className="inline-flex w-14 h-14 rounded-full bg-sage/15 items-center justify-center mb-3">
                  <Send size={24} className="text-sage" strokeWidth={1.5} />
                </div>
                <p className="text-sm font-medium mb-1">Message sent!</p>
                <p className="text-xs text-muted-foreground">We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <input
                    type="text" required placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40 transition-shadow"
                  />
                  <input
                    type="email" required placeholder="Your email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40 transition-shadow"
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40"
                  >
                    {["General", "Orders", "Products", "Warranty", "Returns", "Payments"].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="text" placeholder="Order ID (optional)"
                    value={form.orderId}
                    onChange={(e) => setForm({ ...form, orderId: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40 transition-shadow"
                  />
                </div>
                <input
                  type="text" required placeholder="Subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40 transition-shadow"
                />
                <textarea
                  required rows={5} placeholder="How can we help?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40 resize-none transition-shadow"
                />
                <MagneticButton
                  type="submit"
                  disabled={sending}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors disabled:opacity-50 min-h-[48px]"
                >
                  {sending ? "Sending..." : <><Send size={16} /> Send Message</>}
                </MagneticButton>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <StatCounter key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* Still need help CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blush/10 via-cream to-sage/10 p-10 lg:p-16 text-center">
          <div className="absolute inset-0 halo-bg" />
          <div className="relative">
            <h2 className="text-3xl lg:text-4xl font-heading font-light mb-3">Still Need Assistance?</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Our support specialists are always ready to help.
            </p>
            <MagneticButton className="inline-flex items-center gap-2 px-8 py-4 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors min-h-[48px]">
              Contact Our Team <ArrowRight size={16} />
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* Footer transition wave */}
      <div className="relative h-16 overflow-hidden footer-wave-transition" />
    </div>
  );
}