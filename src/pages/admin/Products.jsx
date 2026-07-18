import React, { useState, useEffect, useMemo } from "react";
import { TrendingDown, Star, Crown, AlertCircle } from "lucide-react";
import { entities } from "@/api/entities";
import { PRODUCTS } from "@/data/products";

const RANGES = [
  { value: "week", label: "This Week", days: 7 },
  { value: "month", label: "This Month", days: 30 },
  { value: "all", label: "All Time", days: null },
];

export default function AdminProducts() {
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("all");

  useEffect(() => {
    Promise.all([
      entities.Order.list().catch(() => []),
      entities.Review.list().catch(() => []),
    ]).then(([o, r]) => {
      setOrders(o);
      setReviews(r);
      setLoading(false);
    });
  }, []);

  const rangeDays = RANGES.find((r) => r.value === range).days;
  const cutoff = rangeDays ? new Date(Date.now() - rangeDays * 86400000) : null;

  const filteredOrders = useMemo(
    () => (cutoff ? orders.filter((o) => new Date(o.created_date) >= cutoff) : orders),
    [orders, cutoff]
  );

  const productStats = useMemo(() => {
    const stats = PRODUCTS.map((p) => {
      let units = 0;
      let revenue = 0;
      filteredOrders.forEach((o) => {
        o.items?.forEach((item) => {
          if (item.product_id === p.id || item.product_name === p.name) {
            units += item.quantity || 1;
            revenue += (item.price || 0) * (item.quantity || 1);
          }
        });
      });
      const productReviews = reviews.filter((r) => r.product_id === p.id || r.product_name === p.name);
      const avgRating = productReviews.length
        ? productReviews.reduce((s, r) => s + (r.rating || 0), 0) / productReviews.length
        : 0;
      return {
        ...p,
        units,
        revenue,
        reviewCount: productReviews.length,
        avgRating,
      };
    });
    return stats.sort((a, b) => b.units - a.units);
  }, [filteredOrders, reviews]);

  const bestSeller = productStats[0]?.units > 0 ? productStats[0] : null;
  const lowestPerformer = [...productStats].reverse().find((p) => p.units === 0) || productStats[productStats.length - 1];

  const lowStock = PRODUCTS.filter((p) => (p.stock || 0) <= 50).sort((a, b) => (a.stock || 0) - (b.stock || 0));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-blush/30 border-t-blush rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-light mb-1">Product Performance</h1>
          <p className="text-sm text-muted-foreground">How your products are selling and what customers think</p>
        </div>
        <div className="flex gap-1 bg-white rounded-xl border border-border p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                range === r.value ? "bg-blush text-white" : "text-muted-foreground hover:bg-accent"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock alerts */}
      {lowStock.length > 0 && (
        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-2xl mb-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-destructive" strokeWidth={1.5} />
            <h3 className="text-sm font-semibold text-destructive">Stock Alerts</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span key={p.id} className="text-xs px-2.5 py-1 bg-white rounded-full border border-border">
                {p.name}: <span className="font-medium text-destructive">{p.stock === 0 ? "Out of stock" : `${p.stock} left`}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Highlights */}
      {(bestSeller || lowestPerformer) && (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {bestSeller && (
            <div className="p-5 bg-gradient-to-br from-gold/10 to-cream rounded-2xl border border-gold/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown size={18} className="text-gold" strokeWidth={1.5} />
                <span className="text-xs font-semibold uppercase tracking-wider text-gold">Best Seller</span>
              </div>
              <div className="flex items-center gap-3">
                <img src={bestSeller.image_url} alt={bestSeller.name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{bestSeller.name}</p>
                  <p className="text-xs text-muted-foreground">{bestSeller.units} sold · ₹{bestSeller.revenue.toLocaleString("en-IN")} revenue</p>
                </div>
              </div>
            </div>
          )}
          {lowestPerformer && lowestPerformer.id !== bestSeller?.id && (
            <div className="p-5 bg-white rounded-2xl border border-border">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown size={18} className="text-muted-foreground" strokeWidth={1.5} />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Needs Attention</span>
              </div>
              <div className="flex items-center gap-3">
                <img src={lowestPerformer.image_url} alt={lowestPerformer.name} className="w-12 h-12 rounded-lg object-cover" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{lowestPerformer.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {lowestPerformer.units === 0
                      ? "No sales in this period"
                      : `${lowestPerformer.units} sold · ₹${lowestPerformer.revenue}`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ranked list */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-accent/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Product</th>
              <th className="px-5 py-3 font-medium text-right">Units Sold</th>
              <th className="px-5 py-3 font-medium text-right">Revenue</th>
              <th className="px-5 py-3 font-medium text-center">Rating</th>
              <th className="px-5 py-3 font-medium text-right">Reviews</th>
              <th className="px-5 py-3 font-medium text-right">Stock</th>
            </tr>
          </thead>
          <tbody>
            {productStats.map((p, i) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                <td className="px-5 py-3.5">
                  <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold ${i === 0 && p.units > 0 ? "bg-gold/20 text-gold" : "bg-accent text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.collection}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right font-medium">{p.units}</td>
                <td className="px-5 py-3.5 text-right font-medium">₹{p.revenue.toLocaleString("en-IN")}</td>
                <td className="px-5 py-3.5 text-center">
                  {p.reviewCount > 0 ? (
                    <div className="inline-flex items-center gap-1">
                      <Star size={12} className="fill-gold text-gold" />
                      <span className="font-medium">{p.avgRating.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-xs">No ratings</span>
                  )}
                </td>
                <td className="px-5 py-3.5 text-right text-muted-foreground">{p.reviewCount}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className={`text-xs font-medium ${(p.stock || 0) <= 50 ? "text-destructive" : "text-muted-foreground"}`}>
                    {p.stock || 0}
                    {(p.stock || 0) <= 50 && (p.stock || 0) === 0 ? " (Out)" : (p.stock || 0) <= 50 ? " (Low)" : ""}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}