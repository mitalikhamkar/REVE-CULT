import React from "react";
import { Link } from "react-router-dom";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 relative overflow-hidden">
      {/* Halo background */}
      <div className="absolute inset-0 halo-bg pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blush/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-sage/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-heading font-semibold tracking-wide mb-1">
              REVE <span className="text-blush">CULT</span>
            </h1>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blush/10 mb-4">
            {Icon && <Icon className="w-7 h-7 text-blush" aria-hidden="true" strokeWidth={1.5} />}
          </div>
          <h2 className="text-2xl font-heading font-light text-foreground">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>}
        </div>

        <div className="bg-card rounded-3xl shadow-sm border border-border p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6">{footer}</p>
        )}
      </div>
    </div>
  );
}