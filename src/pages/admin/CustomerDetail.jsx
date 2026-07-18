import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package, MapPin, MessageSquare, Star, Mail } from "lucide-react";
import { entities } from "@/api/entities";

const STATUS_BADGE = {
  open: "bg-destructive/10 text-destructive",
  in_progress: "bg-gold/15 text-gold",
  resolved: "bg-sage/15 text-sage",
};

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const u = await entities.User.get(id);
        setUser(u);

        const [o, a, t, r] = await Promise.all([
          entities.Order.filter({ created_by_id: id }).catch(() => []),
          entities.Address.filter({ created_by_id: id }).catch(() => []),
          entities.SupportTicket.filter({ email: u.email }).catch(() => []),
          entities.Review.list().catch(() => []),
        ]);

        setOrders(o.sort((x, y) => new Date(y.created_date) - new Date(x.created_date)));
        setAddresses(a);
        setTickets(t);
        setReviews(r.filter((rev) => rev.created_by_id === id));
      } catch {
        /* not found */
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-blush/30 border-t-blush rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <Link to="/admin/customers" className="inline-flex items-center gap-1 text-sm text-blush hover:underline mb-4">
          <ArrowLeft size={14} /> Back to Customers
        </Link>
        <div className="p-12 bg-white rounded-2xl border border-border text-center">
          <p className="text-sm text-muted-foreground">Customer not found.</p>
        </div>
      </div>
    );
  }

  const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <Link to="/admin/customers" className="inline-flex items-center gap-1 text-sm text-blush hover:underline mb-4">
        <ArrowLeft size={14} /> Back to Customers
      </Link>

      {/* Customer header */}
      <div className="flex items-center gap-4 mb-6 p-5 bg-white rounded-2xl border border-border">
        <div className="w-14 h-14 rounded-full bg-blush/15 flex items-center justify-center text-xl font-heading font-semibold text-blush shrink-0">
          {(user.full_name || user.email || "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-heading font-light">{user.full_name || "No name set"}</h1>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Mail size={14} /> {user.email}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-muted-foreground">Total Spent</p>
          <p className="text-lg font-heading font-semibold">{totalSpent > 0 ? `₹${totalSpent.toLocaleString("en-IN")}` : "—"}</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="p-4 bg-white rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Orders</p>
          <p className="text-lg font-heading font-semibold">{orders.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Addresses</p>
          <p className="text-lg font-heading font-semibold">{addresses.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Support Tickets</p>
          <p className="text-lg font-heading font-semibold">{tickets.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-border text-center">
          <p className="text-xs text-muted-foreground mb-1">Reviews</p>
          <p className="text-lg font-heading font-semibold">{reviews.length}</p>
        </div>
      </div>

      {/* Order history */}
      <Section icon={Package} title="Order History" color="text-blush">
        {orders.length === 0 ? (
          <Empty text="No orders yet." />
        ) : (
          <div className="space-y-3">
            {orders.map((o) => (
              <Link
                key={o.id}
                to={`/admin/orders/${o.id}`}
                className="flex items-center justify-between p-3 -mx-2 rounded-lg hover:bg-accent transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {o.items?.length || 0} items
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-medium">₹{o.total}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground capitalize">{o.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Addresses */}
      <Section icon={MapPin} title="Saved Addresses" color="text-sage">
        {addresses.length === 0 ? (
          <Empty text="No saved addresses." />
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {addresses.map((a) => (
              <div key={a.id} className="p-4 bg-white rounded-xl border border-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blush">{a.label}</span>
                  {a.is_default && <span className="text-[10px] bg-sage/15 text-sage px-2 py-0.5 rounded-full">Default</span>}
                </div>
                <p className="text-sm font-medium">{a.full_name}</p>
                <p className="text-xs text-muted-foreground">{a.address_line1}</p>
                <p className="text-xs text-muted-foreground">{a.city}, {a.state} {a.pincode}</p>
                <p className="text-xs text-muted-foreground mt-1">📞 {a.phone}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Support tickets */}
      <Section icon={MessageSquare} title="Support Tickets" color="text-gold">
        {tickets.length === 0 ? (
          <Empty text="No support tickets submitted." />
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 bg-white rounded-xl border border-border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{t.subject}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[t.status] || "bg-accent text-muted-foreground"}`}>
                    {t.status?.replace("_", " ")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">{t.message}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(t.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Reviews */}
      <Section icon={Star} title="Reviews Written" color="text-blush">
        {reviews.length === 0 ? (
          <Empty text="No reviews written." />
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 bg-white rounded-xl border border-border">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium">{r.product_name || "Product"}</p>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < (r.rating || 0) ? "fill-gold text-gold" : "text-border"} />
                    ))}
                  </div>
                </div>
                {r.title && <p className="text-xs font-medium text-foreground">{r.title}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">{r.content}</p>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, color, children }) {
  return (
    <div className="p-5 bg-white rounded-2xl border border-border mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={color} strokeWidth={1.5} />
        <h2 className="text-sm font-semibold">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return <p className="text-sm text-muted-foreground py-2">{text}</p>;
}