import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { SlidersHorizontal, Sparkles, ScanLine, X, ChevronDown } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import ProductCard from "@/components/store/ProductCard";
import FindMyReveMatch from "@/components/store/FindMyReveMatch";
import VisualSearch from "@/components/store/VisualSearch";
import { useStore } from "@/context/StoreContext";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showVisual, setShowVisual] = useState(false);
  const { recentlyViewed } = useStore();

  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    priceMax: 2000,
    minRating: 0,
  });

  const query = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "";
  const filterParam = searchParams.get("filter") || "";

  useEffect(() => {
    if (categoryParam) {
      setFilters((prev) => ({ ...prev, categories: [categoryParam] }));
    }
  }, [categoryParam]);

  const allCategories = [...new Set(PRODUCTS.map((p) => p.category))];
  const allColors = [...new Set(PRODUCTS.map((p) => p.color))];

  const toggleArrayFilter = (key, value) => {
    setFilters((prev) => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  };

  const filtered = useMemo(() => {
    let result = [...PRODUCTS];

    if (query) {
      const q = query.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.collection.toLowerCase().includes(q)
      );
    }

    if (filterParam === "new") result = result.filter((p) => p.is_new_arrival);
    if (filterParam === "bestsellers") result = result.filter((p) => p.is_bestseller);

    if (filters.categories.length) result = result.filter((p) => filters.categories.includes(p.category));
    if (filters.colors.length) result = result.filter((p) => filters.colors.includes(p.color));
    result = result.filter((p) => p.price <= filters.priceMax);
    if (filters.minRating > 0) result = result.filter((p) => p.avg_rating >= filters.minRating);

    switch (sort) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.avg_rating - a.avg_rating); break;
      case "newest": result.sort((a, b) => (b.is_new_arrival ? 1 : 0) - (a.is_new_arrival ? 1 : 0)); break;
      default: result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }
    return result;
  }, [query, filterParam, filters, sort]);

  // AI Recommended for You — based on recently viewed collections
  const recommended = useMemo(() => {
    if (recentlyViewed.length === 0) {
      return PRODUCTS.filter((p) => p.is_bestseller).slice(0, 4);
    }
    const viewedCollections = recentlyViewed.map((r) => {
      const prod = PRODUCTS.find((p) => p.id === r.product_id);
      return prod?.collection;
    });
    return PRODUCTS
      .map((p) => ({
        ...p,
        recScore: viewedCollections.filter((c) => c === p.collection).length + (p.is_bestseller ? 1 : 0),
      }))
      .filter((p) => p.recScore > 0)
      .sort((a, b) => b.recScore - a.recScore)
      .slice(0, 4);
  }, [recentlyViewed]);

  const clearFilters = () => {
    setFilters({ categories: [], colors: [], priceMax: 2000, minRating: 0 });
    setSearchParams({});
  };

  const hasActiveFilters = filters.categories.length > 0 || filters.colors.length > 0 || filters.minRating > 0 || query || filterParam;

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
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} products</p>
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

      {/* AI Recommended for You */}
      {recommended.length > 0 && (
        <section className="mb-10 p-5 bg-gradient-to-r from-blush/5 to-sage/5 rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-blush" />
            <h2 className="text-sm font-semibold">Recommended for You</h2>
            <span className="text-xs text-muted-foreground">— based on your browsing</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {recommended.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-full text-sm font-medium hover:bg-accent transition-colors min-h-[48px]"
        >
          <SlidersHorizontal size={15} /> Filters
          {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blush" />}
        </button>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-border rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blush/40 min-h-[48px] cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters sidebar */}
        {showFilters && (
          <aside className="w-64 shrink-0 hidden lg:block">
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              allCategories={allCategories}
              allColors={allColors}
              toggleArrayFilter={toggleArrayFilter}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </aside>
        )}

        {/* Product grid */}
        <div className="flex-1">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-sm text-muted-foreground mb-4">No products match your filters.</p>
              <button onClick={clearFilters} className="text-sm font-medium text-blush hover:underline">Clear all filters</button>
            </div>
          ) : (
            <div className={`grid gap-4 lg:gap-6 ${showFilters ? "grid-cols-2 lg:grid-cols-3" : "grid-cols-2 lg:grid-cols-4"}`}>
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative w-80 max-w-[85vw] bg-cream h-full overflow-y-auto p-5 animate-slide-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg">Filters</h3>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-accent rounded-full"><X size={18} /></button>
            </div>
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              allCategories={allCategories}
              allColors={allColors}
              toggleArrayFilter={toggleArrayFilter}
              clearFilters={clearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        </div>
      )}

      {showQuiz && <FindMyReveMatch onClose={() => setShowQuiz(false)} />}
      {showVisual && <VisualSearch onClose={() => setShowVisual(false)} />}
    </div>
  );
}

function FilterPanel({ filters, setFilters, allCategories, allColors, toggleArrayFilter, clearFilters, hasActiveFilters }) {
  return (
    <div className="space-y-6">
      {hasActiveFilters && (
        <button onClick={clearFilters} className="text-xs text-blush font-medium hover:underline">Clear all</button>
      )}

      <div>
        <h4 className="text-sm font-semibold mb-3">Category</h4>
        <div className="space-y-2">
          {allCategories.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleArrayFilter("categories", cat)}
                className="w-4 h-4 rounded border-border text-blush focus:ring-blush/40"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Color</h4>
        <div className="space-y-2">
          {allColors.map((color) => {
            const product = PRODUCTS.find((p) => p.color === color);
            return (
              <label key={color} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={filters.colors.includes(color)}
                  onChange={() => toggleArrayFilter("colors", color)}
                  className="w-4 h-4 rounded border-border text-blush focus:ring-blush/40"
                />
                <span className="w-4 h-4 rounded-full border border-border" style={{ background: product?.color_hex }} />
                <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{color}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Max Price</h4>
        <input
          type="range"
          min="499"
          max="2000"
          step="100"
          value={filters.priceMax}
          onChange={(e) => setFilters({ ...filters, priceMax: Number(e.target.value) })}
          className="w-full accent-blush"
        />
        <p className="text-xs text-muted-foreground mt-1">Up to ₹{filters.priceMax}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-3">Min Rating</h4>
        <div className="space-y-2">
          {[0, 3, 4].map((r) => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === r}
                onChange={() => setFilters({ ...filters, minRating: r })}
                className="w-4 h-4 border-border text-blush focus:ring-blush/40"
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {r === 0 ? "All ratings" : `${r}★ & above`}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}