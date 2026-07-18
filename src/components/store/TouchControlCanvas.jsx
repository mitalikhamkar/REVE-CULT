import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function TouchControlCanvas({ controls }) {
  const [activeKey, setActiveKey] = useState(null);

  return (
    <div className="space-y-3">
      {Object.entries(controls).map(([section, items]) => {
        const isOpen = activeKey === section;
        return (
          <div key={section} className="border border-border rounded-2xl overflow-hidden bg-white">
            <button
              onClick={() => setActiveKey(isOpen ? null : section)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-accent/40 transition-colors"
            >
              <span className="text-sm font-medium">{section}</span>
              {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>
            {isOpen && (
              <div className="px-5 pb-4 space-y-2 animate-fade-in">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-t border-border/50 first:border-0">
                    <span className="text-sm text-muted-foreground">{item.action}</span>
                    <span className="text-sm font-medium text-foreground">{item.function}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}