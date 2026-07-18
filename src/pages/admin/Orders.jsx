import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Download, ChevronRight, Package } from "lucide-react";
import { entities } from "@/api/entities";

const STATUS_OPTIONS = ["all", "pending", "confirmed", "packed", "shipped", "delivered", "cancelled"];

const STATUS_BADGE = {
  pending: "bg-accent text-muted-foreground",
  confirmed: "bg-blush/15 text-blush",
  packed: "bg-gold/15 text-gold",
  shipped: "bg-blush/15 text-blush",
  delivered: "bg-sage/15 text-sage",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    entities.Order
      .list("-created_date")
      .then((o) => setOrders(o))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      o.order_number?.toLowerCase().includes(q) ||
      o.customer_name?.toLowerCase().includes(q) ||
      o.customer_email?.toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredTotal = filtered.reduce((sum, o) => sum + (o.total || 0), 0);

  const exportCSV = () => {
    const headers = ["Order Number", "Customer Name", "Customer Email", "Status", "Items", "Total", "Date"];
    const rows = filtered.map((o) => [
      o.order_number || "",
      o.customer_name || "",
      o.customer_email || "",
      o.status || "",
      o.items?.length || 0,
      o.total || 0,
      new Date(o.created_date).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reve-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-2 border-blush/30 border-t-blush rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-heading font-light mb-1">Orders</h1>
        <p className="text-sm text-muted-foreground">View and manage all customer orders</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by order #, name, or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blush/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-white rounded-xl border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blush/40 cursor-pointer capitalize"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Showing <span className="font-medium text-foreground">{filtered.length}</span> orders,{" "}
        <span className="font-medium text-foreground">₹{filteredTotal.toLocaleString("en-IN")}</span> total
      </p>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-border text-center">
          <Package size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">No orders match your search.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-accent/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Order #</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{o.order_number}</td>
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{o.customer_name || "—"}</p>
                    <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                    {new Date(o.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground">{o.items?.length || 0}</td>
                  <td className="px-5 py-3.5 font-medium">₹{o.total}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${STATUS_BADGE[o.status] || STATUS_BADGE.pending}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/admin/orders/${o.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-blush hover:underline">
                      View <ChevronRight size={12} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}