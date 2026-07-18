import React from "react";

export default function StatCard({ label, value, comparison, icon: Icon, iconBg = "bg-blush/10", iconColor = "text-blush" }) {
  const isNegative = comparison?.startsWith("-");

  return (
    <div className="p-5 bg-white rounded-2xl border border-border">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        {Icon && (
          <div className={`w-9 h-9 rounded-full ${iconBg} flex items-center justify-center`}>
            <Icon size={16} className={iconColor} strokeWidth={1.5} />
          </div>
        )}
      </div>
      <p className="text-2xl font-heading font-semibold">{value}</p>
      {comparison && (
        <p className={`text-xs mt-1 ${isNegative ? "text-destructive" : "text-sage"}`}>{comparison}</p>
      )}
    </div>
  );
}