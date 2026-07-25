import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Truck, Share2, Check } from "lucide-react";

const SIGNATURE_BOX_ROUTE = "/signature-box";
const DEFAULT_POUCH_SLUG = "mini-luxe-case-bag";

// Cross-sell chips unrelated to the Signature Box flow — kept separate
// from the single "Gift this Hamper" CTA below.
const STYLING_SUGGESTIONS = [
  { label: "Carry Pouch", slug: DEFAULT_POUCH_SLUG },
  { label: "REVE CULT T-Shirt", slug: "reve-cult-tshirt" },
];

/**
 * Drop this into QuickViewModal.jsx, right below the existing product
 * details, e.g.:
 *
 *   <ProductDetailsSection product={product} />
 *   <QuickViewExtras product={product} onNavigate={onClose} />
 */
export default function QuickViewExtras({ product, onNavigate }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = `${window.location.origin}/product/${product.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
        return;
      } catch {
        // cancelled or unsupported — fall through to copy-link
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — no-op
    }
  };

  const handleGiftHamper = () => {
    // Pre-selects this hamper's earbuds and the default carry pouch on
    // the Signature Box builder, which reads `earbud` off the query
    // string (see SignatureBox.jsx).
    navigate(`${SIGNATURE_BOX_ROUTE}?earbud=${product.slug}&pouch=${DEFAULT_POUCH_SLUG}`);
    onNavigate?.();
  };

  return (
    <div className="mt-8 pt-6 border-t border-border/50 space-y-6">
      {/* Complete Your Look */}
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Complete Your Look</p>
        <div className="flex flex-wrap gap-2">
          {STYLING_SUGGESTIONS.map((s) => (
            <Link
              key={s.label}
              to={`/product/${s.slug}`}
              onClick={() => onNavigate?.()}
              className="px-4 py-2 rounded-full text-xs font-medium bg-cream border border-border text-foreground hover:border-blush/50 hover:text-blush transition-all duration-200 hover:scale-[1.03]"
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Estimated Delivery + Share */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-foreground">
          <Truck size={16} strokeWidth={1.5} className="text-sage" />
          <span>
            Estimated Delivery: <span className="font-medium">3–5 Business Days</span>
          </span>
        </div>
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-blush transition-colors"
        >
          {copied ? (
            <>
              <Check size={15} strokeWidth={2} className="text-sage" /> Link Copied
            </>
          ) : (
            <>
              <Share2 size={15} strokeWidth={1.5} /> Share
            </>
          )}
        </button>
      </div>

      {/* Single premium CTA — replaces every other Signature Box action */}
      {product?.is_hamper && (
        <button
          onClick={handleGiftHamper}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium bg-gold/10 text-gold border border-gold/30 hover:bg-gold/20 transition-all duration-200 hover:scale-[1.01]"
        >
          🎁 Gift this Hamper
        </button>
      )}
    </div>
  );
}