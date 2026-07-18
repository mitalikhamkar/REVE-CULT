import React from "react";
import { ShieldCheck, Truck, RotateCcw, Heart } from "lucide-react";

const ICONS = {
  "Authentic Product": ShieldCheck,
  "Safe Delivery": Truck,
  "Easy Returns": RotateCcw,
  "Women-Friendly Design": Heart,
};

export default function TrustBadges({ badges, compact = false }) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {badges.map((badge) => {
          const Icon = ICONS[badge] || ShieldCheck;
          return (
            <span key={badge} className="flex items-center gap-1.5 text-[11px] text-muted-foreground uppercase tracking-wide">
              <Icon size={14} strokeWidth={1.5} className="text-gold" />
              {badge}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {badges.map((badge) => {
        const Icon = ICONS[badge] || ShieldCheck;
        return (
          <div
            key={badge}
            className="flex items-center gap-2.5 p-3 rounded-xl bg-accent/50 border border-border/50"
          >
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0">
              <Icon size={16} strokeWidth={1.5} className="text-gold" />
            </div>
            <span className="text-[11px] font-medium uppercase tracking-wide text-foreground/80 leading-tight">
              {badge}
            </span>
          </div>
        );
      })}
    </div>
  );
}