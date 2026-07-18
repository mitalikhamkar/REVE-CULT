import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Check, MapPin, CreditCard, Truck, Package } from "lucide-react";
import { entities } from "@/api/entities";

const STATUS_FLOW = ["confirmed", "packed", "shipped", "delivered", "cancelled"];

const STATUS_BADGE = {
  pending: "bg-accent text-muted-foreground",
  confirmed: "bg-blush/15 text-blush",
  packed: "bg-gold/15 text-gold",
  shipped: "bg-blush/15 text-blush",
  delivered: "bg-sage/15 text-sage",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    entities.Order
      .get(id)
      .then((o) => setOrder(o))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const updateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await entities.Order.update(order.id, { status: newStatus });
      setOrder({ ...order, status: newStatus });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      /* prototype */
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-blush/30 border-t-blush rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-8">
        <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm text-blush hover:underline mb-4">
          <ArrowLeft size={14} /> Back to Orders
        </Link>
        <div className="p-12 bg-white rounded-2xl border border-border text-center">
          <p className="text-sm text-muted-foreground">Order not found.</p>
        </div>
      </div>
    );
  }

  const addr = order.shipping_address || {};

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <Link to="/admin/orders" className="inline-flex items-center gap-1 text-sm text-blush hover:underline mb-4">
        <ArrowLeft size={14} /> Back to Orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-heading font-light mb-1">{order.order_number}</h1>
          <p className="text-sm text-muted-foreground">
            {new Date(order.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <span className={`text-sm px-3 py-1.5 rounded-full font-medium capitalize ${STATUS_BADGE[order.status] || STATUS_BADGE.pending}`}>
          {order.status}
        </span>
      </div>

      {/* Status update */}
      <div className="p-5 bg-white rounded-2xl border border-border mb-6">
        <h2 className="text-sm font-semibold mb-3">Update Order Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={updating || order.status === s}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                order.status === s
                  ? `${STATUS_BADGE[s]} ring-2 ring-offset-1 ring-current`
                  : "bg-accent text-muted-foreground hover:bg-accent/70"
              } disabled:opacity-50`}
            >
              {order.status === s && <Check size={14} className="inline mr-1" />}
              {s}
            </button>
          ))}
        </div>
        {updating && <p className="text-xs text-muted-foreground mt-2">Updating...</p>}
        {saved && <p className="text-xs text-sage mt-2">Status updated — the customer's tracking page will reflect this change.</p>}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="p-5 bg-white rounded-2xl border border-border">
            <h2 className="text-sm font-semibold mb-4">Items in this order</h2>
            <div className="space-y-3">
              {(order.items || []).map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity} · ₹{item.price} each</p>
                  </div>
                  <span className="font-medium">₹{(item.price || 0) * (item.quantity || 1)}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{order.subtotal || 0}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping ({order.shipping_method || "Standard"})</span>
                <span>{order.shipping_cost ? `₹${order.shipping_cost}` : "Free"}</span>
              </div>
              <div className="flex justify-between font-heading font-semibold text-base">
                <span>Total</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="p-5 bg-white rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={16} className="text-blush" strokeWidth={1.5} />
              <h2 className="text-sm font-semibold">Shipping Address</h2>
            </div>
            <div className="text-sm space-y-1 text-muted-foreground">
              <p className="font-medium text-foreground">{addr.full_name || order.customer_name}</p>
              <p>{addr.address_line1}</p>
              {addr.address_line2 && <p>{addr.address_line2}</p>}
              <p>{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.pincode}</p>
              {addr.phone && <p>Phone: {addr.phone}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Payment */}
          <div className="p-5 bg-white rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard size={16} className="text-sage" strokeWidth={1.5} />
              <h2 className="text-sm font-semibold">Payment</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Method</span>
                <span className="font-medium">{order.payment_method || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{order.payment_status}</span>
              </div>
            </div>
          </div>

          {/* Tracking */}
          <div className="p-5 bg-white rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Truck size={16} className="text-gold" strokeWidth={1.5} />
              <h2 className="text-sm font-semibold">Tracking</h2>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">Tracking Number</span>
                <p className="font-medium">{order.tracking_number || "Not assigned yet"}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Estimated Delivery</span>
                <p className="font-medium">
                  {order.estimated_delivery
                    ? new Date(order.estimated_delivery).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Customer */}
          <div className="p-5 bg-white rounded-2xl border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Package size={16} className="text-blush" strokeWidth={1.5} />
              <h2 className="text-sm font-semibold">Customer</h2>
            </div>
            <div className="text-sm space-y-1">
              <p className="font-medium">{order.customer_name}</p>
              <p className="text-muted-foreground">{order.customer_email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}