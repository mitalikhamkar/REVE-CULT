import React from "react";
import { Link } from "react-router-dom";
import { useStore } from "@/context/StoreContext";

// Reads recentlyViewed, which StoreContext already tracks via
// addToRecentlyViewed — this component only adds the display. Renders
// nothing until there's at least one recently viewed product.
export default function RecentlyViewedStrip() {
  const { recentlyViewed } = useStore();
  const items = recentlyViewed.slice(0, 4);

  if (items.length === 0) return null;

  return (
    <div className="mt-16 lg:mt-20 pt-10 border-t border-border/40">
      <p className="text-xs uppercase tracking-[0.25em] text-gold mb-5">Recently Viewed</p>
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
        {items.map((item) => (
          <Link
            key={item.product_id}
            to={item.slug ? `/product/${item.slug}` : "#"}
            className="group flex-shrink-0 w-36 sm:w-40"
          >
            <div className="h-32 sm:h-36 rounded-2xl bg-cream/60 flex items-center justify-center p-4 mb-2 transition-transform duration-300 group-hover:-translate-y-1">
              <img
                src={item.product_image}
                alt={item.product_name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <p className="text-xs font-medium text-foreground line-clamp-1">{item.product_name}</p>
            <p className="text-xs text-muted-foreground">₹{item.product_price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}