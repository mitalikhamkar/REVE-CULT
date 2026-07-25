import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Check, Minus, Gift, ShieldCheck, Bluetooth } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useStore } from "@/context/StoreContext";

// Products eligible for comparison — the hampers (SERAPH / FLORA), since
// the spec rows below (ANC, battery, Bluetooth) are earbud-hamper fields.
const COMPARABLE = PRODUCTS.filter((p) => p.category.toLowerCase().includes("earbud"));

const MAX_ROW_DELAY = 0.12;

function BatteryBar({ label, delay }) {
  return (
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className="h-1.5 rounded-full bg-sage/70 max-w-[80px]"
    />
  );
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
                    <p className="text-xs text-muted-foreground mt-1">₹{p.price}</p>
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
          <div className="p-6 sm:p-8 overflow-x-auto">
            <button
              onClick={() => setView("select")}
              className="text-xs font-medium text-blush hover:underline mb-5"
            >
              ← Add or change products
            </button>

            <table className="w-full border-collapse min-w-[480px]">
              <thead>
                <tr>
                  <th className="w-36" />
                  {compareList.map((p) => (
                    <th key={p.id} className="text-center px-3 pb-4 align-top">
                      <div className="h-20 flex items-center justify-center mb-2">
                        <img src={p.image_url} alt={p.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <p className="text-sm font-medium line-clamp-2">{p.name}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price */}
                <motion.tr
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 * MAX_ROW_DELAY, duration: 0.4 }}
                  className="border-t border-border/40"
                >
                  <td className="py-4 pr-4 text-xs uppercase tracking-wide text-muted-foreground">Price</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-3 text-sm text-center font-heading font-semibold">₹{p.price}</td>
                  ))}
                </motion.tr>

                {/* Color swatches */}
                <motion.tr
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 * MAX_ROW_DELAY, duration: 0.4 }}
                  className="border-t border-border/40"
                >
                  <td className="py-4 pr-4 text-xs uppercase tracking-wide text-muted-foreground">Color</td>
                  {compareList.map((p, i) => (
                    <td key={p.id} className="py-4 px-3 text-center">
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1 * MAX_ROW_DELAY + 0.1 + i * 0.05, type: "spring", stiffness: 300, damping: 16 }}
                        className="inline-block w-6 h-6 rounded-full border border-border align-middle mr-1.5"
                        style={{ background: p.color_hex }}
                      />
                      <span className="text-xs align-middle">{p.color}</span>
                    </td>
                  ))}
                </motion.tr>

                {/* Bluetooth version */}
                <motion.tr
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 * MAX_ROW_DELAY, duration: 0.4 }}
                  className="border-t border-border/40"
                >
                  <td className="py-4 pr-4 text-xs uppercase tracking-wide text-muted-foreground">Bluetooth</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-3 text-sm text-center">
                      <span className="inline-flex items-center gap-1.5 justify-center">
                        <Bluetooth size={13} className="text-sage" />
                        {p.specs?.["Bluetooth Version"] || p.specs?.["Bluetooth"] || "—"}
                      </span>
                    </td>
                  ))}
                </motion.tr>

                {/* Battery / playback bars */}
                <motion.tr
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3 * MAX_ROW_DELAY, duration: 0.4 }}
                  className="border-t border-border/40"
                >
                  <td className="py-4 pr-4 text-xs uppercase tracking-wide text-muted-foreground">Playback</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-3 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <BatteryBar delay={3 * MAX_ROW_DELAY + 0.15} />
                        <span className="text-xs text-muted-foreground">{p.specs?.["Playback"] || "—"}</span>
                      </div>
                    </td>
                  ))}
                </motion.tr>

                {/* ANC */}
                <motion.tr
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 4 * MAX_ROW_DELAY, duration: 0.4 }}
                  className="border-t border-border/40"
                >
                  <td className="py-4 pr-4 text-xs uppercase tracking-wide text-muted-foreground">
                    Active Noise Cancellation
                  </td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-3 text-center">
                      <AnimatePresence>
                        {p.has_anc ? (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 4 * MAX_ROW_DELAY + 0.15, duration: 0.5 }}
                          >
                            <Check size={16} className="text-sage mx-auto" />
                          </motion.span>
                        ) : (
                          <Minus size={16} className="text-muted-foreground mx-auto" />
                        )}
                      </AnimatePresence>
                    </td>
                  ))}
                </motion.tr>

                {/* Gift packaging */}
                <motion.tr
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 5 * MAX_ROW_DELAY, duration: 0.4 }}
                  className="border-t border-border/40"
                >
                  <td className="py-4 pr-4 text-xs uppercase tracking-wide text-muted-foreground">Gift Packaging</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-3 text-center">
                      {p.is_hamper && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.7 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 5 * MAX_ROW_DELAY + 0.15, type: "spring", stiffness: 260, damping: 16 }}
                        >
                          <Gift size={16} className="text-gold mx-auto" />
                        </motion.span>
                      )}
                    </td>
                  ))}
                </motion.tr>

                {/* Warranty badge */}
                <motion.tr
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 6 * MAX_ROW_DELAY, duration: 0.4 }}
                  className="border-t border-border/40"
                >
                  <td className="py-4 pr-4 text-xs uppercase tracking-wide text-muted-foreground">Warranty</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-3 text-center">
                      <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 6 * MAX_ROW_DELAY + 0.15, duration: 0.4 }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium bg-accent/60 border border-border/50 rounded-full px-3 py-1.5"
                      >
                        <ShieldCheck size={13} className="text-sage" /> {p.is_hamper ? "Included" : "—"}
                      </motion.span>
                    </td>
                  ))}
                </motion.tr>

                {/* Description */}
                <motion.tr
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 7 * MAX_ROW_DELAY, duration: 0.4 }}
                  className="border-t border-border/40"
                >
                  <td className="py-4 pr-4 text-xs uppercase tracking-wide text-muted-foreground align-top">Description</td>
                  {compareList.map((p) => (
                    <td key={p.id} className="py-4 px-3 text-xs text-muted-foreground align-top">{p.description}</td>
                  ))}
                </motion.tr>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}