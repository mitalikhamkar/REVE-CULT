import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, Users, BarChart3, MessageSquare, Store, UserCog } from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: Package },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/users", label: "User Roles", icon: UserCog },
  { to: "/admin/products", label: "Product Performance", icon: BarChart3 },
  { to: "/admin/feedback", label: "Feedback & Support", icon: MessageSquare },
];

export default function AdminSidebar() {
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-border min-h-screen flex flex-col">
      <div className="p-5 border-b border-border">
        <NavLink to="/admin" className="block">
          <span className="text-lg font-heading font-semibold">
            REVE <span className="text-blush">CULT</span>
          </span>
          <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">Admin Panel</span>
        </NavLink>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? "bg-blush/10 text-blush" : "text-muted-foreground hover:bg-accent"
              }`
            }
          >
            <item.icon size={16} strokeWidth={1.5} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-border">
        <NavLink
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
        >
          <Store size={16} strokeWidth={1.5} />
          Back to Store
        </NavLink>
      </div>
    </aside>
  );
}