import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, PackageCheck, HeartHandshake, RotateCcw } from "lucide-react";

const POINTS = [
  { icon: ShieldCheck, label: "Secure Checkout" },
  { icon: PackageCheck, label: "Premium Packaging" },
  { icon: HeartHandshake, label: "Women-first Design" },
  { icon: RotateCcw, label: "Easy Returns" },
];

// Drop this in above your global <Footer /> — on the Shop page it's
// rendered at the bottom of the page content, and since the footer
// mounts after the page body in the layout, it reads as "above the
// footer" wherever it's placed.
export default function WhyShopStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-16 lg:mt-20 rounded-[28px] px-6 sm:px-10 py-10"
      style={{
        background:
          "linear-gradient(150deg, hsl(var(--blush) / 8%) 0%, hsl(var(--cream)) 55%, hsl(var(--gold) / 8%) 100%)",
      }}
    >
      <p className="text-center text-xs uppercase tracking-[0.25em] text-gold mb-8">Why Shop With REVE CULT</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
        {POINTS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex flex-col items-center text-center gap-2.5 group">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110">
              <Icon size={18} strokeWidth={1.5} className="text-blush" />
            </div>
            <p className="text-xs sm:text-sm font-medium text-foreground">{label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}