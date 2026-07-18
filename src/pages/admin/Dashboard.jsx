import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, IndianRupee, Users, TrendingUp, ArrowRight, Trophy, UserCheck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { entities } from "@/api/entities";
import { PRODUCTS } from "@/data/products";
import StatCard from "@/components/admin/StatCard";

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      entities.Order.list().catch(() => []),
      entities.User.list().catch(() => []),
    ]).then(([o, u]) => {
      setOrders(o);
      setUsers(u);
      setLoading(false);
    });
  }, []);

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalCustomers = users.filter((u) => u.role !== "admin").length;

  // Returning customers — customers who placed more than 1 order
  const customerOrderCounts = {};
  orders.forEach((o) => {
    const key = o.created_by_id || o.customer_email;
    if (key) customerOrderCounts[key] = (customerOrderCounts[key] || 0) + 1;
  });
  const returningCustomers = Object.values(customerOrderCounts).filter((c) => c > 1).length;
  const returningPct = totalCustomers > 0 ? Math.round((returningCustomers / totalCustomers) * 100) : 0;

  const now = new Date();
  const weekAgo = new Date(now - 7 * 86400000);
  const twoWeeksAgo = new Date(now - 14 * 86400000);

  const thisWeekOrders = orders.filter((o) => new Date(o.created_date) >= weekAgo);
  const lastWeekOrders = orders.filter((o) => {
    const d = new Date(o.created_date);
    return d >= twoWeeksAgo && d < weekAgo;
  });

  const thisWeekRevenue = thisWeekOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const lastWeekRevenue = lastWeekOrders.reduce((sum, o) => sum + (o.total || 0), 0);

  const pct = (curr, prev) => {
    if (prev === 0) return curr > 0 ? `+${curr} vs last week` : null;
    const diff = Math.round(((curr - prev) / prev) * 100);
    return `${diff >= 0 ? "+" : ""}${diff}% vs last week`;
  };

  const orderChange = pct(thisWeekOrders.length, lastWeekOrders.length);
  const revenueChange = pct(thisWeekRevenue, lastWeekRevenue);

  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 86400000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);
      const dayOrders = orders.filter((o) => {
        const d = new Date(o.created_date);
        return d >= dayStart && d < dayEnd;
      });
      days.push({
        day: dayStart.toLocaleDateString("en-IN", { weekday: "short" }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      });
    }
    return days;
  }, [orders]);

  const topProducts = useMemo(() => {
    const sales = {};
    orders.forEach((order) => {
      order.items?.forEach((item) => {
        const pid = item.product_id || item.id;
        if (!pid) return;
        if (!sales[pid]) {
          const p = PRODUCTS.find((x) => x.id === pid);
          sales[pid] = {
            product_id: pid,
            name: item.product_name || p?.name || "Unknown Product",
            image: p?.image_url || item.product_image,
            units: 0,
            revenue: 0,
          };
        }
        sales[pid].units += item.quantity || 1;
        sales[pid].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });
    return Object.values(sales).sort((a, b) => b.units - a.units).slice(0, 5);
  }, [orders]);

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 8);

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
        <h1 className="text-2xl font-heading font-light mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">See how your store is doing this week</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Orders" value={totalOrders} comparison={orderChange} icon={ShoppingCart} iconBg="bg-blush/10" iconColor="text-blush" />
        <StatCard label="Total Revenue" value={`₹${totalRevenue.toLocaleString("en-IN")}`} comparison={revenueChange} icon={IndianRupee} iconBg="bg-sage/10" iconColor="text-sage" />
        <StatCard label="Total Customers" value={totalCustomers} icon={Users} iconBg="bg-gold/10" iconColor="text-gold" />
        <StatCard
          label="Returning Customers"
          value={`${returningPct}%`}
          comparison={`${returningCustomers} of ${totalCustomers} ordered again`}
          icon={UserCheck}
          iconBg="bg-sage/10"
          iconColor="text-sage"
        />
      </div>

      <div className="p-6 bg-white rounded-2xl border border-border mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold">Orders This Week</h2>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </div>
          <TrendingUp size={18} className="text-blush" strokeWidth={1.5} />
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: 12 }} />
            <Bar dataKey="orders" fill="hsl(var(--blush))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Trophy size={18} className="text-gold" strokeWidth={1.5} />
            <h2 className="text-sm font-semibold">Top 5 Best-Selling Products</h2>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No sales data yet. Orders will appear here once customers start buying.</p>
          ) : (
            <div className="space-y-3">
              {topProducts.map((p, i) => (
                <div key={p.product_id} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-gold/20 text-gold" : "bg-accent text-muted-foreground"}`}>
                    {i + 1}
                  </span>
                  {p.image && <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.units} sold · ₹{p.revenue.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 bg-white rounded-2xl border border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-medium text-blush hover:underline flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No orders yet.</p>
          ) : (
            <div className="space-y-1">
              {recentOrders.map((o) => (
                <Link
                  key={o.id}
                  to={`/admin/orders/${o.id}`}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{o.customer_name || o.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
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
        </div>
      </div>
    </div>
  );
}