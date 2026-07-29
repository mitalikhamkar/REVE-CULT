import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Clock, MapPin, Send, Plus, Minus, ArrowRight, ArrowUpRight, Headphones, Sparkles, MessageCircle } from "lucide-react";
import { entities } from "@/api/entities";

const SUPPORT_EMAIL = "support@revecult.com";
const SUPPORT_PHONE_DISPLAY = "+91 98765 43210";
const SUPPORT_PHONE_TEL = "+919876543210";

const TOPICS = [
  { n: "01", title: "Track Your Order", desc: "Real-time updates from dispatch to doorstep." },
  { n: "02", title: "Returns & Exchanges", desc: "Simple returns within 7 days, no hassle." },
  { n: "03", title: "Product & Pairing Help", desc: "Pairing, charging, sound, and battery questions." },
  { n: "04", title: "Warranty", desc: "6-month coverage on every pair, explained clearly." },
  { n: "05", title: "Signature Box", desc: "Everything about your gifting experience." },
];

const JOURNEY_STEPS = ["Need Help", "Contact REVE CULT", "Support Team Reviews", "Solution Provided"];

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

function TopicRow({ topic, i }) {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, delay: i * 0.06 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group border-b border-border py-7 sm:py-8 flex items-center justify-between gap-6 cursor-pointer transition-colors"
    >
      <div className="flex items-baseline gap-5 sm:gap-8">
        <span className="text-xs sm:text-sm font-body text-blush/70 tabular-nums">{topic.n}</span>
        <div>
          <h3 className="text-xl sm:text-3xl font-heading font-light transition-transform duration-300 group-hover:translate-x-1.5">
            {topic.title}
          </h3>
          <AnimatePresence>
            {hovered && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="text-sm text-muted-foreground mt-2 max-w-md overflow-hidden hidden sm:block"
              >
                {topic.desc}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
      <ArrowUpRight
        size={22}
        className="text-muted-foreground shrink-0 transition-all duration-300 group-hover:text-blush group-hover:translate-x-1 group-hover:-translate-y-1"
      />
    </motion.div>
  );
}

function PremiumFaq() {
  const [category, setCategory] = useState("Orders");
  const [openIdx, setOpenIdx] = useState(0);
  const filtered = FAQS.filter((f) => f.category === category);

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">Answers, fast</p>
        <h2 className="text-3xl lg:text-5xl font-heading font-light">Frequently Asked Questions</h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
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
          {filtered.map((faq, i) => {
            const isOpen = openIdx === i;
            return (
              <div key={faq.q} className="border border-border rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/40 transition-colors text-left"
                >
                  <span className="text-sm font-medium pr-4">{faq.q}</span>
                  <span
                    className="shrink-0 w-6 h-6 rounded-full border border-border flex items-center justify-center transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
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

export default function Support() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", category: "General", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const scrollToTopics = () => {
    const el = document.getElementById("support-topics");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await entities.SupportTicket.create(form);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", category: "General", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      /* prototype */
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blush/10 blur-3xl animate-float" />
        <div className="absolute top-40 -right-20 w-80 h-80 rounded-full bg-sage/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute inset-0 halo-bg" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <p className="text-xs uppercase tracking-[0.3em] text-blush mb-5">Support</p>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-light leading-[1.05] mb-6">
              How can we help
              <br />
              you <span className="italic text-blush">today?</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-9 max-w-md">
              Whatever you need — an order update, a product question, or something else entirely — we're one message away.
            </p>
            <button
              onClick={scrollToTopics}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 min-h-[48px]"
            >
              Explore Support <ArrowRight size={16} />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative flex justify-center"
          >
            {/* Soft glow backdrop */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-full bg-gradient-to-br from-blush/25 via-blush/10 to-sage/20 blur-2xl" />
            </div>

            {/* Floating sparkle accents */}
            <motion.span
              className="absolute top-6 left-8 text-gold"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Sparkles size={18} strokeWidth={1.5} />
            </motion.span>
            <motion.span
              className="absolute bottom-16 right-4 text-sage"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <Sparkles size={14} strokeWidth={1.5} />
            </motion.span>

            {/* Main illustration: a support agent, headset front and center */}
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-white/70 backdrop-blur-sm border border-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex items-center justify-center animate-float">
              <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-gradient-to-br from-blush to-sage flex items-center justify-center">
                <Headphones size={64} className="text-white" strokeWidth={1.25} />
              </div>

              {/* Chat bubble badge, ties the illustration to the live chat feature */}
              <motion.div
                className="absolute -bottom-2 -right-2 w-14 h-14 rounded-full bg-white shadow-lg border border-border flex items-center justify-center"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8, type: "spring" }}
              >
                <MessageCircle size={22} className="text-blush" strokeWidth={1.5} />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Topics */}
      <section id="support-topics" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">What do you need help with</p>
        <h2 className="text-3xl lg:text-4xl font-heading font-light mb-4">Browse by Topic</h2>
        <div>
          {TOPICS.map((t, i) => (
            <TopicRow key={t.title} topic={t} i={i} />
          ))}
        </div>
      </section>

      {/* Journey */}
      <section className="bg-accent/30 py-20 lg:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">The process</p>
          <h2 className="text-3xl lg:text-4xl font-heading font-light mb-14">What happens after you reach out</h2>
          <div className="relative flex flex-col md:flex-row items-center md:items-start justify-between gap-10 md:gap-4">
            <div className="hidden md:block absolute top-3 left-0 right-0 h-px bg-border overflow-hidden">
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
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center max-w-[160px]"
              >
                <span className="w-6 h-6 rounded-full bg-blush mb-4 flex items-center justify-center text-white text-[11px] font-medium">
                  {i + 1}
                </span>
                <p className="text-sm font-medium">{step}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <PremiumFaq />

      {/* Contact */}
      <section className="py-20 lg:py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[0.8fr_1.2fr] gap-14">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">Talk to us</p>
            <h2 className="text-3xl lg:text-4xl font-heading font-light mb-10">Reach REVE CULT</h2>

            <div className="space-y-7">
              <a href={`mailto:${SUPPORT_EMAIL}?subject=REVE CULT Support Request`} className="group flex items-start gap-4">
                <span className="w-11 h-11 rounded-full bg-blush/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-6">
                  <Mail size={18} className="text-blush" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Email</p>
                  <p className="text-sm font-medium group-hover:text-blush transition-colors">{SUPPORT_EMAIL}</p>
                </div>
              </a>

              <a href={`tel:${SUPPORT_PHONE_TEL}`} className="group flex items-start gap-4">
                <span className="w-11 h-11 rounded-full bg-blush/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:rotate-6">
                  <Phone size={18} className="text-blush" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Phone</p>
                  <p className="text-sm font-medium group-hover:text-blush transition-colors">{SUPPORT_PHONE_DISPLAY}</p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <span className="w-11 h-11 rounded-full bg-blush/10 flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-blush" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Business Hours</p>
                  <p className="text-sm font-medium">Mon – Sat, 10am – 7pm</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="w-11 h-11 rounded-full bg-blush/10 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-blush" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground mb-0.5">Based In</p>
                  <p className="text-sm font-medium">Mumbai, India</p>
                </div>
              </div>
            </div>
          </div>

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
                    type="text"
                    required
                    placeholder="Your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40 transition-shadow"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your email"
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
                    type="text"
                    required
                    placeholder="Subject"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40 transition-shadow"
                  />
                </div>
                <textarea
                  required
                  rows={5}
                  placeholder="How can we help?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40 resize-none transition-shadow"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 disabled:opacity-50 min-h-[48px]"
                >
                  {sending ? "Sending..." : (
                    <>
                      <Send size={16} /> Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 lg:pb-28">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blush/10 via-cream to-sage/10 p-10 lg:p-16 text-center">
          <div className="absolute inset-0 halo-bg" />
          <div className="relative">
            <h2 className="text-3xl lg:text-4xl font-heading font-light mb-3">Still need assistance?</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Our team reads every message personally — we're happy to help.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=REVE CULT Support Request`}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 min-h-[48px]"
            >
              Contact Our Team <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}