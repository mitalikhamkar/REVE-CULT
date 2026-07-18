import React from "react";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { ShieldCheck, Truck } from "lucide-react";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal } = useStore();
  const shippingCost = cartSubtotal >= 999 || cartSubtotal === 0 ? 0 : 49;
  const total = cartSubtotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex w-20 h-20 rounded-full bg-accent items-center justify-center mb-6">
          <ShoppingBag size={32} className="text-muted-foreground" strokeWidth={1} />
        </div>
        <h1 className="text-3xl font-heading font-light mb-3">Your bag is empty</h1>
        <p className="text-sm text-muted-foreground mb-6">Looks like you haven't added anything yet. Let's find something you'll love.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors min-h-[48px]"
        >
          Start Shopping <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground">Home</Link> <span className="mx-1">/</span> <span className="text-foreground">Cart</span>
      </nav>

      <h1 className="text-3xl lg:text-4xl font-heading font-light mb-8">Your REVE Bag</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.product_id} className="flex gap-4 p-4 bg-white rounded-2xl border border-border animate-fade-in">
              <Link to={`/product/${item.product_id}`}>
                <img src={item.product_image} alt={item.product_name} className="w-24 h-24 rounded-xl object-cover shrink-0" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/product/${item.product_id}`} className="text-sm font-medium hover:text-blush transition-colors line-clamp-1">
                  {item.product_name}
                </Link>
                {item.color && <p className="text-xs text-muted-foreground mt-0.5">{item.color}</p>}
                <p className="text-base font-heading font-semibold mt-1">₹{item.product_price}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-border rounded-full">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-accent rounded-l-full transition-colors"
                      aria-label="Decrease"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center hover:bg-accent rounded-r-full transition-colors"
                      aria-label="Increase"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">Subtotal</p>
                <p className="text-base font-heading font-semibold">₹{item.product_price * item.quantity}</p>
              </div>
            </div>
          ))}

          <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mt-2">
            ← Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 bg-white rounded-2xl border border-border">
            <h2 className="text-lg font-heading font-medium mb-4">Order Summary</h2>

            {/* Promo */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Promo code"
                className="flex-1 px-4 py-2.5 rounded-full border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40"
              />
              <button className="px-4 py-2.5 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/90 transition-colors">
                Apply
              </button>
            </div>

            <div className="space-y-2.5 text-sm border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">{shippingCost === 0 ? "Free" : `₹${shippingCost}`}</span>
              </div>
              {shippingCost === 0 && cartSubtotal > 0 && (
                <p className="text-xs text-sage flex items-center gap-1">
                  <Tag size={12} /> Free shipping on orders above ₹999
                </p>
              )}
            </div>

            <div className="flex justify-between items-center border-t border-border mt-4 pt-4 mb-5">
              <span className="font-heading text-lg">Total</span>
              <span className="font-heading text-xl font-semibold">₹{total}</span>
            </div>

            <Link
              to="/checkout"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors min-h-[48px]"
            >
              Proceed to Checkout <ArrowRight size={16} />
            </Link>

            <div className="mt-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck size={14} className="text-sage" /> Secure SSL encrypted checkout
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck size={14} className="text-sage" /> Safe delivery with secure packaging
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}