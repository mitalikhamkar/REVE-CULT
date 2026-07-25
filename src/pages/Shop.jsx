import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Sparkles, ScanLine } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProductBySlug } from "@/data/products";
import ProductCard from "@/components/store/ProductCard";
import FindMyReveMatch from "@/components/store/FindMyReveMatch";
import VisualSearch from "@/components/store/VisualSearch";

// Fixed catalog order, exactly as specified — pulled from the existing
// product data by slug. Nothing about price/description/images is invented
// or changed here; this only decides display order.
const ALL_ORDER = [
  "reve-flora-golden-black",
  "reve-flora-golden-beige",
  "reve-seraph-mint-green",
  "reve-seraph-silver-black",
  "reve-seraph-silver-white",
  "reve-cult-tshirt",
  "mini-luxe-case-bag",
];
const EARBUD_SLUGS = ALL_ORDER.slice(0, 5);
const APPAREL_SLUGS = ["reve-cult-tshirt"];
const ACCESSORY_SLUGS = ["mini-luxe-case-bag"];

const COLLECTIONS = [
  { key: "earbuds", label: "Earbuds", slugs: EARBUD_SLUGS },
  { key: "apparel", label: "Apparel", slugs: APPAREL_SLUGS },
  { key: "accessories", label: "Accessories", slugs: ACCESSORY_SLUGS },
];

const bySlug = (slugs) => slugs.map((s) => getProductBySlug(s)).filter(Boolean);

function chunk(arr, size) {
  const rows = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

// Scroll-reveal — gentle, no bounce.
const gridVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const cardVariants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
};
const bannerVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

function EditorialBanner() {
  return (
    <motion.div
      className="relative overflow-hidden rounded-[28px] px-8 py-12 sm:py-14 text-center my-4"
      style={{
        background: "linear-gradient(150deg, hsl(var(--blush) / 12%) 0%, hsl(var(--cream)) 55%, hsl(var(--gold) / 10%) 100%)",
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.5 }}
      variants={bannerVariants}
    >
      <div
        className="absolute -top-10 -left-10 w-52 h-52 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--gold) / 14%) 0%, transparent 72%)" }}
      />
      <div
        className="absolute -bottom-12 -right-10 w-60 h-60 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--blush) / 14%) 0%, transparent 72%)" }}
      />
      <p className="relative text-xl sm:text-2xl font-heading font-light tracking-tight text-foreground">
        Designed for everyday elegance
      </p>
      <p className="relative text-sm text-muted-foreground mt-2">
        Technology that complements your style.
      </p>
    </motion.div>
  );
}

// A full row of up to 3 cards.
function ProductRow({ products }) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
      variants={gridVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
    >
      {products.map((p, i) => (
        <motion.div key={p.id} variants={cardVariants}>
          <ProductCard product={p} index={i} />
        </motion.div>
      ))}
    </motion.div>
  );
}

// A leftover row of 1–2 cards, centered and given a little extra room so it
// reads as an intentional closing moment rather than a stray, left-aligned
// card trailing off a grid.
function LeftoverRow({ products }) {
  const widthClass = products.length === 1 ? "max-w-xs sm:max-w-sm" : "max-w-xl";
  return (
    <motion.div
      className={`grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 mx-auto ${widthClass}`}
      variants={gridVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      {products.map((p, i) => (
        <motion.div key={p.id} variants={cardVariants}>
          <ProductCard product={p} index={i} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [showQuiz, setShowQuiz] = useState(false);
  const [showVisual, setShowVisual] = useState(false);
  const [activeCollection, setActiveCollection] = useState("all");

  const query = (searchParams.get("q") || "").toLowerCase();
  const categoryParam = (searchParams.get("category") || "").toLowerCase();
  const filterParam = searchParams.get("filter") || "";

  // Preserve the existing "/shop?category=..." deep-link behaviour (used by
  // the ProductDetail breadcrumb) by mapping it onto the pill filters.
  useEffect(() => {
    if (!categoryParam) return;
    if (categoryParam.includes("earbud")) setActiveCollection("earbuds");
    else if (categoryParam.includes("shirt") || categoryParam.includes("apparel")) setActiveCollection("apparel");
    else if (categoryParam.includes("bag") || categoryParam.includes("case") || categoryParam.includes("accessor"))
      setActiveCollection("accessories");
  }, [categoryParam]);

  const orderedSlugs =
    activeCollection === "all"
      ? ALL_ORDER
      : COLLECTIONS.find((c) => c.key === activeCollection)?.slugs || ALL_ORDER;

  const ordered = useMemo(() => bySlug(orderedSlugs), [orderedSlugs]);

  // Preserve the existing "?q=" search and "?filter=new|bestsellers" deep
  // links by narrowing within the fixed catalog order.
  const matches = (p) => {
    if (query) {
      const hit =
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.color.toLowerCase().includes(query) ||
        p.collection.toLowerCase().includes(query);
      if (!hit) return false;
    }
    if (filterParam === "new" && !p.is_new_arrival) return false;
    if (filterParam === "bestsellers" && !p.is_bestseller) return false;
    return true;
  };

  const visible = ordered.filter(matches);
  const rows = chunk(visible, 3);
  const fullRows = rows.filter((r) => r.length === 3);
  const leftover = rows.find((r) => r.length < 3) || [];

  // Only break up the page with the editorial banner in the unfiltered,
  // full-catalog view — showing a single filtered category (e.g. just the
  // T-shirt) doesn't need a mid-page divider.
  const showBanner = activeCollection === "all" && !query && !filterParam && fullRows.length > 0 && leftover.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-4">
        <span>Home</span> <span className="mx-1">/</span> <span className="text-foreground">Shop</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-heading font-light">Shop All</h1>
          <p className="text-sm text-muted-foreground mt-1">{visible.length} products</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowQuiz(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blush/10 text-blush rounded-full text-sm font-medium hover:bg-blush/20 transition-colors min-h-[48px]"
          >
            <Sparkles size={15} /> Find My Match
          </button>
          <button
            onClick={() => setShowVisual(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-sage/10 text-sage rounded-full text-sm font-medium hover:bg-sage/20 transition-colors min-h-[48px]"
          >
            <ScanLine size={15} /> Visual Search
          </button>
        </div>
      </div>

      {/* Elegant pill filters */}
      <div className="flex flex-wrap items-center gap-2.5 mb-12">
        <button
          onClick={() => setActiveCollection("all")}
          className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 ${
            activeCollection === "all"
              ? "bg-blush text-white border-blush shadow-[0_8px_18px_-10px_hsl(var(--blush)/60%)]"
              : "bg-white text-foreground border-border hover:border-blush/40"
          }`}
        >
          All
        </button>
        {COLLECTIONS.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCollection(c.key)}
            className={`px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-300 ${
              activeCollection === c.key
                ? "bg-blush text-white border-blush shadow-[0_8px_18px_-10px_hsl(var(--blush)/60%)]"
                : "bg-white text-foreground border-border hover:border-blush/40"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-muted-foreground mb-4">No products match your search.</p>
          <button onClick={() => setActiveCollection("all")} className="text-sm font-medium text-blush hover:underline">
            View all products
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCollection + query + filterParam}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="space-y-8 lg:space-y-10"
          >
            {fullRows.map((row, i) => (
              <ProductRow key={i} products={row} />
            ))}

            {showBanner && <EditorialBanner />}

            {leftover.length > 0 && <LeftoverRow products={leftover} />}
          </motion.div>
        </AnimatePresence>
      )}

      {showQuiz && <FindMyReveMatch onClose={() => setShowQuiz(false)} />}
      {showVisual && <VisualSearch onClose={() => setShowVisual(false)} />}
    </div>
  );
}