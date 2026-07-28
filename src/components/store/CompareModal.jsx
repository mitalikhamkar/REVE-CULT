import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check, Gift, Bluetooth } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/lib/formatPrice";

// Products eligible for comparison — the hampers (SERAPH / FLORA), since
// the spec rows below (ANC, battery, Bluetooth) are earbud-hamper fields.
const COMPARABLE = PRODUCTS.filter((p) => p.category.toLowerCase().includes("earbud"));

// Turns each product's existing structured fields into short "✓ label"
// chips instead of a paragraph. If a product's data ever gains a
// `highlights` array (e.g. ["Floral Artwork", "Soft Luxury Finish"]),
// those are picked up automatically and appended after the spec-derived
// chips — no other change needed here.
function buildChips(p) {
  const chips = [];
  if (p.has_anc) chips.push("ANC");
  const playback = p.specs?.["Playback"];
  if (playback) chips.push(`${playback} Battery`);
  const bluetooth = p.specs?.["Bluetooth Version"] || p.specs?.["Bluetooth"];
  if (bluetooth) chips.push(`Bluetooth ${bluetooth}`);
  if (p.is_hamper) chips.push("Premium Hamper Included");
  if (Array.isArray(p.highlights)) chips.push(...p.highlights);
  return chips;
}

export default function CompareModal({ onClose }) {
  const { compareList, toggleCompare, isInCompare, removeFromCompare } = useStore();
  const [view, setView] = useState(compareList.length >= 2 ? "compare" : "select");

  const compareFull = compareList.length >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative bg-white rounded-[28px] w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl"
      >
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm flex items-center justify-between px-6 sm:px-8 py-5 border-b border-border/50 z-10">
          <div>
            <h2 className="text-xl font-heading font-light">Compare Products</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {view === "select" ? "Add up to 3 products to compare" : `Comparing ${compareList.length} products`}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close comparison"
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-accent transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Selected chips — visible in both views */}
        {compareList.length > 0 && (
          <div className="flex flex-wrap gap-2 px-6 sm:px-8 pt-5">
            {compareList.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-cream border border-border/60 text-xs font-medium"
              >
                <img src={p.image_url} alt="" className="w-5 h-5 rounded-full object-contain bg-white" />
                {p.color}
                <button
                  onClick={() => removeFromCompare(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>
        )}

        {view === "select" ? (
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COMPARABLE.map((p) => {
                const selected = isInCompare(p.id);
                const disabled = !selected && compareFull;
                return (
                  <button
                    key={p.id}
                    onClick={() => !disabled && toggleCompare(p)}
                    disabled={disabled}
                    className={`relative flex flex-col items-center text-center rounded-2xl border p-4 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${
                      selected ? "border-blush bg-blush/5" : "border-border hover:border-blush/40"
                    }`}
                  >
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center bg-white border border-border">
                      {selected ? <Check size={13} className="text-blush" /> : <Plus size={13} className="text-muted-foreground" />}
                    </div>
                    <div className="h-16 flex items-center justify-center mb-2">
                      <img src={p.image_url} alt={p.name} className="max-h-full object-contain" />
                    </div>
                    <p className="text-xs font-medium text-foreground line-clamp-2">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatPrice(p.price)}</p>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setView("compare")}
              disabled={compareList.length < 2}
              className="w-full mt-6 h-12 rounded-full bg-blush text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blush/90 transition-colors"
            >
              Compare Now
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8">
            <button
              onClick={() => setView("select")}
              className="text-xs font-medium text-blush hover:underline mb-6"
            >
              ← Add or change products
            </button>

            {/* Fixed grid template regardless of whether there are 2 or 3
                products — column width (and therefore card size) stays
                identical either way; a 2-product comparison just leaves
                one slot open on lg screens rather than stretching to fill
                the row, so cards never resize based on count. */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {compareList.map((p, i) => {
                const chips = buildChips(p);
                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="flex flex-col rounded-[20px] border border-border/50 bg-cream/40 p-5"
                  >
                    <div className="h-32 sm:h-36 flex items-center justify-center mb-4">
                      <img src={p.image_url} alt={p.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    <p className="product-collection-label mb-1">{p.collection}</p>
                    <h3 className="font-heading font-semibold text-[15px] leading-snug mb-2 line-clamp-2" style={{ color: "#1a1a1a" }}>
                      {p.name}
                    </h3>
                    <p className="font-body font-semibold text-[15px] mb-3" style={{ color: "#2a2a2a" }}>
                      {formatPrice(p.price)}
                    </p>

                    <div className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-border shrink-0"
                        style={{ background: p.color_hex }}
                      />
                      {p.color}
                    </div>

                    {/* Feature chips — replaces the old paragraph description */}
                    <div className="flex flex-wrap gap-1.5 mt-auto">
                      {chips.map((label, ci) => (
                        <motion.span
                          key={label}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.08 + 0.15 + ci * 0.04, duration: 0.3 }}
                          className="inline-flex items-center gap-1 text-[11px] font-medium bg-sage/10 text-sage rounded-full px-2.5 py-1"
                        >
                          {label === "Premium Hamper Included" ? (
                            <Gift size={11} />
                          ) : label.startsWith("Bluetooth") ? (
                            <Bluetooth size={11} />
                          ) : (
                            <Check size={11} />
                          )}
                          {label}
                        </motion.span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}