import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, MessageCircle, Mail, Send, Phone, HelpCircle } from "lucide-react";
import { entities } from "@/api/entities";

const FAQS = [
  {
    q: "How long does delivery take?",
    a: "Standard delivery takes 3-5 business days. Express delivery (1-2 days) and same-day delivery (within city limits) are available at checkout.",
  },
  {
    q: "What is your return policy?",
    a: "We offer easy returns within 7 days of delivery. Products must be unused and in original packaging. Simply visit your order history to initiate a return.",
  },
  {
    q: "Are REVE CULT earbuds waterproof?",
    a: "Our earbuds are designed for everyday use but should be kept away from water, dust, and extreme heat. Please handle them with care — the designs are hand-printed.",
  },
  {
    q: "Do you offer a warranty?",
    a: "Yes, all REVE CULT earbuds come with a 6-month manufacturer warranty against defects. Reach out to our support team for warranty claims.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, you'll receive a tracking number via email. You can also track your order anytime from your profile under Order History.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "We accept credit/debit cards, UPI (GPay, PhonePe, Paytm), net banking, and popular wallets. All payments are secured with SSL encryption.",
  },
  {
    q: "Can I change or cancel my order?",
    a: "You can modify or cancel your order within 2 hours of placing it. Contact our support team as soon as possible and we'll do our best to help.",
  },
  {
    q: "Are the product images on the website real photos?",
    a: "Currently, our product images are AI-generated samples that closely represent the actual products. Real product photography will be updated soon.",
  },
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await entities.SupportTicket.create(form);
      setSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch {
      /* prototype */
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground">Home</Link> <span className="mx-1">/</span> <span className="text-foreground">Support</span>
      </nav>

      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs uppercase tracking-[0.3em] text-blush mb-3">We're here to help</p>
        <h1 className="text-3xl lg:text-5xl font-heading font-light mb-3">Support Center</h1>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Find answers, reach out, or chat with us — we're always happy to help.
        </p>
      </div>

      {/* Quick options */}
      <div className="grid sm:grid-cols-3 gap-4 mb-12">
        {[
          { icon: MessageCircle, title: "Live Chat", desc: "Chat with our team", action: "Start Chat", iconBg: "bg-blush/15", iconColor: "text-blush", btnColor: "text-blush" },
          { icon: Mail, title: "Email Us", desc: "support@revecult.com", action: "Send Email", iconBg: "bg-sage/15", iconColor: "text-sage", btnColor: "text-sage" },
          { icon: Phone, title: "Call Us", desc: "Mon-Sat, 10am-7pm", action: "+91 98765 43210", iconBg: "bg-gold/15", iconColor: "text-gold", btnColor: "text-gold" },
        ].map((opt) => (
          <div key={opt.title} className="p-6 bg-white rounded-2xl border border-border text-center hover:shadow-md transition-shadow">
            <div className={`inline-flex w-12 h-12 rounded-full ${opt.iconBg} items-center justify-center mb-3`}>
              <opt.icon size={20} className={opt.iconColor} strokeWidth={1.5} />
            </div>
            <h3 className="text-sm font-semibold mb-1">{opt.title}</h3>
            <p className="text-xs text-muted-foreground mb-3">{opt.desc}</p>
            <button className={`text-xs font-medium ${opt.btnColor} hover:underline`}>{opt.action}</button>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* FAQs */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <HelpCircle size={20} className="text-blush" strokeWidth={1.5} />
            <h2 className="text-2xl font-heading font-light">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="border border-border rounded-2xl overflow-hidden bg-white">
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : i)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/40 transition-colors text-left"
                  >
                    <span className="text-sm font-medium">{faq.q}</span>
                    <ChevronDown size={16} className={`text-muted-foreground transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed animate-fade-in">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact form */}
        <div>
          <h2 className="text-2xl font-heading font-light mb-5">Send us a message</h2>
          <div className="p-6 bg-white rounded-2xl border border-border">
            {submitted ? (
              <div className="text-center py-8">
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
                    className="px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40"
                />
                <textarea
                  required
                  rows={5}
                  placeholder="How can we help?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40 resize-none"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors disabled:opacity-50 min-h-[48px]"
                >
                  {sending ? "Sending..." : <><Send size={16} /> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}