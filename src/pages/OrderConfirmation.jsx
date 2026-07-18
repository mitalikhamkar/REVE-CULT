import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle2, Package, Truck, Mail, ArrowRight, Copy } from "lucide-react";
import { entities } from "@/api/entities";

export default function OrderConfirmation() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      entities.Order.filter({ order_number: orderNumber })
        .then((data) => setOrder(data[0]))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="inline-flex w-12 h-12 border-4 border-blush/20 border-t-blush rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-heading mb-4">Order not found</h1>
        <Link to="/shop" className="text-blush hover:underline">Continue shopping</Link>
      </div>
    );
  }

  const steps = [
    { icon: CheckCircle2, label: "Order Confirmed", date: "Today", active: true, done: true },
    { icon: Package, label: "Packed", date: "Tomorrow", active: false, done: false },
    { icon: Truck, label: "Shipped", date: "In 1-2 days", active: false, done: false },
    { icon: Mail, label: "Delivered", date: order.estimated_delivery, active: false, done: false },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success header */}
      <div className="text-center mb-10">
        <div className="inline-flex w-20 h-20 rounded-full bg-sage/15 items-center justify-center mb-5 animate-scale-in">
          <CheckCircle2 size={40} className="text-sage" strokeWidth={1.5} />
        </div>
        <h1 className="text-3xl lg:text-4xl font-heading font-light mb-2">Thank you for your order!</h1>
        <p className="text-sm text-muted-foreground">
          A confirmation has been sent to {order.customer_email || "your email"}.
        </p>
      </div>

      {/* Order details */}
      <div className="p-6 bg-white rounded-2xl border border-border mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Order Number</p>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-lg font-heading font-semibold">{order.order_number}</p>
              <button
                onClick={() => navigator.clipboard.writeText(order.order_number)}
                className="p-1 hover:bg-accent rounded transition-colors"
                aria-label="Copy order number"
              >
                <Copy size={14} className="text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Paid</p>
            <p className="text-lg font-heading font-semibold">₹{order.total}</p>
          </div>
        </div>

        {/* Tracking timeline */}
        <div className="relative">
          <div className="flex justify-between">
            {steps.map((s, i) => (
              <React.Fragment key={s.label}>
                <div className="flex flex-col items-center text-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    s.done ? "bg-sage text-white" : s.active ? "bg-blush text-white" : "bg-accent text-muted-foreground"
                  }`}>
                    <s.icon size={18} strokeWidth={1.5} />
                  </div>
                  <p className={`text-xs font-medium mt-2 ${s.done || s.active ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</p>
                  <p className="text-[10px] text-muted-foreground">{s.date}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 flex items-center mt-5">
                    <div className={`h-0.5 w-full ${steps[i].done ? "bg-sage" : "bg-border"}`} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {order.tracking_number && (
          <div className="mt-6 p-4 bg-accent/40 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Tracking Number</p>
              <p className="text-sm font-medium mt-0.5">{order.tracking_number}</p>
            </div>
            <p className="text-xs text-muted-foreground">Est. delivery: {new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
          </div>
        )}
      </div>

      {/* Items */}
      <div className="p-6 bg-white rounded-2xl border border-border mb-6">
        <h2 className="text-sm font-semibold mb-4">Items in this order</h2>
        <div className="space-y-3">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{item.product_name}</p>
                <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <span className="font-medium">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Trust */}
      <div className="p-5 bg-sage/5 border border-sage/20 rounded-2xl mb-6">
        <p className="text-sm text-foreground/80">
          We're preparing your order with care. You'll receive updates at each step. Need help? Visit our{" "}
          <Link to="/support" className="text-blush font-medium hover:underline">Support Center</Link>.
        </p>
      </div>

      <div className="text-center">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors min-h-[48px]"
        >
          Continue Shopping <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}