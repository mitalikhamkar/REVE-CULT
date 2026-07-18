import React from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import ProductCard from "@/components/store/ProductCard";
import { getProductById } from "@/data/products";

export default function Wishlist() {
  const { wishlist } = useStore();

  if (wishlist.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex w-20 h-20 rounded-full bg-accent items-center justify-center mb-6">
          <Heart size={32} className="text-muted-foreground" strokeWidth={1} />
        </div>
        <h1 className="text-3xl font-heading font-light mb-3">Your wishlist is empty</h1>
        <p className="text-sm text-muted-foreground mb-6">Save the pieces you love and find them all here when you're ready.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors min-h-[48px]"
        >
          Explore Products <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  const products = wishlist.map((item) => getProductById(item.product_id)).filter(Boolean);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground">Home</Link> <span className="mx-1">/</span> <span className="text-foreground">Wishlist</span>
      </nav>

      <h1 className="text-3xl lg:text-4xl font-heading font-light mb-2">My Wishlist</h1>
      <p className="text-sm text-muted-foreground mb-8">{wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}