import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { Package, MapPin, CreditCard, Heart, LogOut, User, Plus, Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useStore } from "@/context/StoreContext";
import { entities } from "@/api/entities";

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const isAdmin = user?.role === "admin";
  const { wishlist } = useStore();
  const [activeTab, setActiveTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      Promise.all([
        entities.Order.filter({ created_by_id: user?.id }).catch(() => []),
        entities.Address.filter({ created_by_id: user?.id }).catch(() => []),
      ]).then(([o, a]) => {
        setOrders(o);
        setAddresses(a);
        setLoading(false);
      });
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const tabs = [
    { id: "orders", label: "Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground">Home</Link> <span className="mx-1">/</span> <span className="text-foreground">My Account</span>
      </nav>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="p-5 bg-white rounded-2xl border border-border">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-blush/15 flex items-center justify-center">
                <User size={20} className="text-blush" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{user?.full_name || user?.email || "Member"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    activeTab === tab.id ? "bg-blush/10 text-blush" : "text-muted-foreground hover:bg-accent"
                  }`}
                >
                  <tab.icon size={16} strokeWidth={1.5} />
                  {tab.label}
                  {tab.id === "wishlist" && wishlist.length > 0 && (
                    <span className="ml-auto text-xs bg-blush text-white w-5 h-5 rounded-full flex items-center justify-center">{wishlist.length}</span>
                  )}
                </button>
              ))}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blush hover:bg-blush/10 transition-colors"
                >
                  <ShieldCheck size={16} strokeWidth={1.5} /> Admin Panel
                </Link>
              )}
              <button
                onClick={() => logout("/")}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
              >
                <LogOut size={16} strokeWidth={1.5} /> Sign Out
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === "orders" && (
            <div>
              <h1 className="text-2xl font-heading font-light mb-6">Order History</h1>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="p-10 bg-white rounded-2xl border border-border text-center">
                  <Package size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
                  <p className="text-sm text-muted-foreground mb-4">No orders yet — your purchases will appear here.</p>
                  <Link to="/shop" className="text-sm font-medium text-blush hover:underline">Start shopping</Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-5 bg-white rounded-2xl border border-border">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div>
                          <p className="text-sm font-medium">{order.order_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                            order.status === "delivered" ? "bg-sage/15 text-sage" :
                            order.status === "shipped" ? "bg-blush/15 text-blush" :
                            "bg-accent text-muted-foreground"
                          }`}>
                            {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                          </span>
                          <span className="text-sm font-heading font-semibold">₹{order.total}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {order.items?.length} {order.items?.length === 1 ? "item" : "items"}
                        {order.tracking_number && <><span>·</span><span>Tracking: {order.tracking_number}</span></>}
                      </div>
                      <Link
                        to={`/order-confirmation?order=${order.order_number}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-blush hover:underline mt-2"
                      >
                        View details →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "addresses" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-heading font-light">Saved Addresses</h1>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors">
                  <Plus size={16} /> Add New
                </button>
              </div>
              {addresses.length === 0 ? (
                <div className="p-10 bg-white rounded-2xl border border-border text-center">
                  <MapPin size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
                  <p className="text-sm text-muted-foreground">No saved addresses yet.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="p-5 bg-white rounded-2xl border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-blush">{addr.label}</span>
                        {addr.is_default && <span className="text-[10px] bg-sage/15 text-sage px-2 py-0.5 rounded-full">Default</span>}
                      </div>
                      <p className="text-sm font-medium">{addr.full_name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{addr.address_line1}</p>
                      <p className="text-sm text-muted-foreground">{addr.city}, {addr.state} {addr.pincode}</p>
                      <p className="text-sm text-muted-foreground">📞 {addr.phone}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "payments" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-heading font-light">Payment Methods</h1>
                <button className="inline-flex items-center gap-1.5 px-4 py-2 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors">
                  <Plus size={16} /> Add Card
                </button>
              </div>
              <div className="p-6 bg-gradient-to-br from-foreground to-foreground/80 text-background rounded-2xl">
                <div className="flex items-center justify-between mb-8">
                  <CreditCard size={28} strokeWidth={1} className="text-blush" />
                  <span className="text-xs uppercase tracking-wider text-background/60">REVE Card</span>
                </div>
                <p className="text-lg font-heading tracking-widest mb-4">•••• •••• •••• 4242</p>
                <div className="flex justify-between text-xs text-background/60">
                  <span>REVE CULT Member</span>
                  <span>12/27</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">Prototype — add real payment methods in production.</p>
            </div>
          )}

          {activeTab === "wishlist" && (
            <div>
              <h1 className="text-2xl font-heading font-light mb-6">My Wishlist</h1>
              {wishlist.length === 0 ? (
                <div className="p-10 bg-white rounded-2xl border border-border text-center">
                  <Heart size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
                  <p className="text-sm text-muted-foreground mb-4">Your wishlist is empty.</p>
                  <Link to="/shop" className="text-sm font-medium text-blush hover:underline">Browse products</Link>
                </div>
              ) : (
                <Link to="/wishlist" className="inline-flex items-center gap-1 text-sm font-medium text-blush hover:underline">
                  View all {wishlist.length} items →
                </Link>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h1 className="text-2xl font-heading font-light mb-6">Account Settings</h1>
              <div className="p-6 bg-white rounded-2xl border border-border space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Name</label>
                  <p className="text-sm font-medium mt-1">{user?.full_name || "Not set"}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Email</label>
                  <p className="text-sm font-medium mt-1">{user?.email}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Role</label>
                  <p className="text-sm font-medium mt-1 capitalize">{user?.role || "Member"}</p>
                </div>
                <p className="text-xs text-muted-foreground pt-3 border-t border-border">
                  To update your details, please contact our support team.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}