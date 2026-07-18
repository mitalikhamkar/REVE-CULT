import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Youtube, Mail, Send } from "lucide-react";
import { entities } from "@/api/entities";

const PinterestIcon = ({ size = 18, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.5 2 3 5.5 3 10c0 3 1.5 5.5 4 6.5l-.5 2.5c-.2.8.5 1.4 1.2 1l2.3-1.5c.7.1 1.3.2 2 .2 5.5 0 9-3.5 9-8.5S17.5 2 12 2z" />
    <path d="M9.5 13.5l2-5" />
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      await entities.NewsletterSubscriber.create({ email });
    } catch {
      /* prototype — still show success */
    }
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 4000);
  };

  const socials = [
    { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
    { icon: Facebook, label: "Facebook", href: "https://facebook.com" },
    { icon: Twitter, label: "X / Twitter", href: "https://twitter.com" },
    { icon: PinterestIcon, label: "Pinterest", href: "https://pinterest.com" },
    { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
  ];

  const linkSections = [
    {
      title: "Shop",
      links: [
        { label: "All Products", path: "/shop" },
        { label: "New Arrivals", path: "/shop?filter=new" },
        { label: "Bestsellers", path: "/shop?filter=bestsellers" },
        { label: "Wishlist", path: "/wishlist" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", path: "/about" },
        { label: "Support Center", path: "/support" },
        { label: "My Account", path: "/profile" },
        { label: "Track Order", path: "/profile" },
      ],
    },
    {
      title: "Help",
      links: [
        { label: "FAQs", path: "/support" },
        { label: "Contact Us", path: "/support" },
        { label: "Shipping & Returns", path: "/support" },
        { label: "My Orders", path: "/profile" },
      ],
    },
  ];

  return (
    <footer className="mt-20 bg-foreground text-background">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-2xl mx-auto text-center">
            <Mail size={28} strokeWidth={1.5} className="mx-auto mb-4 text-blush" />
            <h3 className="text-2xl font-heading font-light mb-2">Join the REVE CULT Circle</h3>
            <p className="text-sm text-background/60 mb-6">
              Be the first to know about new arrivals, exclusive offers, and stories from our community.
            </p>
            {subscribed ? (
              <p className="text-blush text-sm font-medium animate-fade-in">
                Welcome to the circle! Check your inbox for something special. ♡
              </p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/15 text-sm placeholder:text-background/40 focus:outline-none focus:ring-2 focus:ring-blush/50"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors flex items-center gap-2"
                >
                  <Send size={16} strokeWidth={1.5} />
                  <span className="hidden sm:inline">Subscribe</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <Link to="/" className="text-2xl font-heading font-semibold">
              REVE <span className="text-blush">CULT</span>
            </Link>
            <p className="mt-4 text-sm text-background/60 max-w-xs leading-relaxed">
              A women-first technology brand creating aesthetic and functional consumer electronics for modern lifestyles.
            </p>
            <div className="flex gap-3 mt-6">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-blush flex items-center justify-center transition-colors"
                >
                  <s.icon size={18} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {linkSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold mb-4 text-background/90">{section.title}</h4>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-background/60 hover:text-blush transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-background/50">
            © {new Date().getFullYear()} REVE CULT. All rights reserved. Crafted with care.
          </p>
          <div className="flex gap-6 text-xs text-background/50">
            <Link to="/support" className="hover:text-blush transition-colors">Privacy Policy</Link>
            <Link to="/support" className="hover:text-blush transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}