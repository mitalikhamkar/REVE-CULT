import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Search, Download, ChevronRight, Users as UsersIcon } from "lucide-react";
import { entities } from "@/api/entities";

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  useEffect(() => {
    Promise.all([
      entities.User.list().catch(() => []),
      entities.Order.list().catch(() => []),
    ]).then(([u, o]) => {
      setUsers(u);
      setOrders(o);
      setLoading(false);
    });
  }, []);

  const customers = useMemo(() => {
    return users
      .filter((u) => u.role !== "admin")
      .map((u) => {
        const userOrders = orders.filter((o) => o.created_by_id === u.id || o.customer_email === u.email);
        const totalSpent = userOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        return {
          ...u,
          orderCount: userOrders.length,
          totalSpent,
        };
      });
  }, [users, orders]);

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "name": return (a.full_name || "").localeCompare(b.full_name || "");
      case "orders-desc": return b.orderCount - a.orderCount;
      case "spent-desc": return b.totalSpent - a.totalSpent;
      case "date-desc":
      default:
        return new Date(b.created_date || 0) - new Date(a.created_date || 0);
    }
  });

  const exportCSV = () => {
    const headers = ["Name", "Email", "Join Date", "Orders", "Total Spent"];
    const rows = sorted.map((c) => [
      c.full_name || "",
      c.email || "",
      c.created_date ? new Date(c.created_date).toLocaleDateString("en-IN") : "",
      c.orderCount,
      c.totalSpent,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((x) => `"${x}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reve-customers-${new Date().toISOString().slice(0, 10)}.csv`;
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
        <h1 className="text-2xl font-heading font-light mb-1">Customers</h1>
        <p className="text-sm text-muted-foreground">All registered customers and their purchase history</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-blush/40"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-white rounded-xl border border-border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blush/40 cursor-pointer"
        >
          <option value="date-desc">Newest First</option>
          <option value="name">Name (A-Z)</option>
          <option value="orders-desc">Most Orders</option>
          <option value="spent-desc">Highest Spent</option>
        </select>
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-border rounded-xl text-sm font-medium hover:bg-accent transition-colors"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-border text-center">
          <UsersIcon size={32} className="mx-auto text-muted-foreground mb-3" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">No customers found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-accent/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium text-right">Orders</th>
                <th className="px-5 py-3 font-medium text-right">Total Spent</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-accent/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blush/15 flex items-center justify-center text-sm font-medium text-blush shrink-0">
                        {(c.full_name || c.email || "?")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.full_name || "No name set"}</p>
                        <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground whitespace-nowrap">
                    {c.created_date
                      ? new Date(c.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium">{c.orderCount}</td>
                  <td className="px-5 py-3.5 text-right font-medium">
                    {c.totalSpent > 0 ? `₹${c.totalSpent.toLocaleString("en-IN")}` : "—"}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link to={`/admin/customers/${c.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-blush hover:underline">
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