import React, { useEffect, useState } from "react";

export default function RitualLoader({ onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDone) onDone();
    }, 1800);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-cream flex items-center justify-center animate-fade-in">
      <div className="text-center animate-ritual-draw">
        <div className="relative inline-block">
          <div className="absolute inset-0 blur-2xl bg-blush/30 rounded-full" />
          <h1 className="relative text-4xl font-heading font-semibold tracking-wide text-foreground">
            REVE <span className="text-blush">CULT</span>
          </h1>
        </div>
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-muted-foreground animate-fade-in" style={{ animationDelay: "0.4s", opacity: 0 }}>
          A personal ritual
        </p>
        <div className="mt-6 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blush"
              style={{
                animation: `float 1s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}