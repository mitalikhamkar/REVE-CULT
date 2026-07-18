import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Camera, X, Upload, ScanLine, ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/data/products";

// Reference case colors for every REVE CULT earbud — the only products
// Scan & Match is ever allowed to recommend (never T-shirts / pouches).
// These are approximate average RGB values for each product's real
// case color, used as the target set for nearest-color matching.
const EARBUD_REFERENCES = [
  { slug: "reve-seraph-silver-white", rgb: [230, 230, 228] }, // White
  { slug: "reve-seraph-mint-green", rgb: [163, 209, 190] }, // Mint
  { slug: "reve-flora-golden-beige", rgb: [214, 189, 152] }, // Gold / Beige
  { slug: "reve-seraph-silver-black", rgb: [46, 46, 50] }, // Black
  { slug: "reve-flora-golden-black", rgb: [36, 30, 26] }, // Black (gold trim)
];

const STAGES = ["Searching...", "Matching...", "Analyzing Design...", "Finding Similar Product..."];
const STAGE_MS = 520; // ~2.1s total for 4 stages — within the requested 2-3s window
const HIGH_CONFIDENCE = 82;
const LOW_CONFIDENCE = 55;

/** Reads the uploaded image via a hidden canvas and returns its average RGB. */
function computeDominantColor(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const size = 32;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 32) continue; // skip near-transparent pixels
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        if (!count) return reject(new Error("No visible pixels"));
        resolve([r / count, g / count, b / count]);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = reject;
    img.src = url;
  });
}

/** Nearest-color match against the earbud reference set, with a confidence score. */
function matchColor([r, g, b]) {
  const ranked = EARBUD_REFERENCES.map((ref) => {
    const [rr, rg, rb] = ref.rgb;
    const dist = Math.sqrt((r - rr) ** 2 + (g - rg) ** 2 + (b - rb) ** 2);
    return { slug: ref.slug, dist };
  }).sort((a, b2) => a.dist - b2.dist);

  const best = ranked[0];
  const confidence = Math.max(0, Math.min(99, Math.round(100 - (best.dist / 260) * 100)));
  return { slug: best.slug, confidence, ranked };
}

export default function VisualSearch({ onClose }) {
  const [phase, setPhase] = useState("idle"); // 'idle' | 'scanning' | 'result'
  const [previewUrl, setPreviewUrl] = useState(null);
  const [stageIndex, setStageIndex] = useState(0);
  const [match, setMatch] = useState(null); // { slug, confidence, ranked } | null
  const fileRef = useRef(null);
  const colorRef = useRef(null);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const handleFile = (file) => {
    if (!file) return;
    clearTimers();
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setMatch(null);
    setStageIndex(0);
    setPhase("scanning");
    colorRef.current = null;

    // Real dominant-color read of the uploaded image — runs alongside the
    // scan animation, not a fake delay.
    computeDominantColor(url)
      .then((rgb) => {
        colorRef.current = rgb;
      })
      .catch(() => {
        colorRef.current = null;
      });

    // Cycle the status copy through the scan sequence.
    STAGES.forEach((_, i) => {
      const t = setTimeout(() => setStageIndex(i), i * STAGE_MS);
      timersRef.current.push(t);
    });

    // Reveal the result once the full sequence has played.
    const finalTimer = setTimeout(() => {
      const rgb = colorRef.current;
      setMatch(rgb ? matchColor(rgb) : null);
      setPhase("result");
    }, STAGES.length * STAGE_MS + 300);
    timersRef.current.push(finalTimer);
  };

  const reset = () => {
    clearTimers();
    setPhase("idle");
    setMatch(null);
    setPreviewUrl(null);
  };

  const bestProduct = match && PRODUCTS.find((p) => p.slug === match.slug);
  const isConfidentMatch = match && bestProduct && match.confidence >= LOW_CONFIDENCE;
  const badgeLabel = match && match.confidence >= HIGH_CONFIDENCE ? `${match.confidence}% Match` : "Closest Match";

  // "You may also like" — always earbuds only, ranked by real color distance
  // when we have one, otherwise a sensible bestseller fallback. Never
  // includes the T-shirt or Carry Pouch.
  const alternatives = match
    ? match.ranked
        .filter((r) => r.slug !== match.slug)
        .slice(0, 3)
        .map((r) => PRODUCTS.find((p) => p.slug === r.slug))
        .filter(Boolean)
    : EARBUD_REFERENCES.slice(0, 3)
        .map((r) => PRODUCTS.find((p) => p.slug === r.slug))
        .filter(Boolean);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-cream rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sage/15 flex items-center justify-center">
              <ScanLine size={16} className="text-sage" />
            </div>
            <span className="font-heading text-lg font-medium">Scan & Match</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {phase === "idle" && (
            <>
              <p className="text-sm text-muted-foreground mb-5 text-center">
                Upload a photo of REVE CULT earbuds and we'll match the closest color and finish to a product in our
                collection.
              </p>
              <button
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-border rounded-2xl py-12 flex flex-col items-center gap-3 hover:border-sage/50 hover:bg-sage/5 transition-all group"
              >
                <div className="w-14 h-14 rounded-full bg-sage/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera size={24} className="text-sage" strokeWidth={1.5} />
                </div>
                <span className="text-sm font-medium">Upload an image</span>
                <span className="text-xs text-muted-foreground">JPG, PNG up to 10MB</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </>
          )}

          {phase === "scanning" && (
            <div className="py-6 text-center">
              <div className="relative w-40 h-40 sm:w-44 sm:h-44 mx-auto rounded-2xl overflow-hidden bg-white shadow-inner">
                <img src={previewUrl} alt="Uploaded" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/10" />
                {/* Scanning corner brackets */}
                <span className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-sage/90 rounded-tl-md" />
                <span className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-sage/90 rounded-tr-md" />
                <span className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-sage/90 rounded-bl-md" />
                <span className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-sage/90 rounded-br-md" />
                {/* Sweeping scan line */}
                <div className="absolute inset-x-0 h-1/3 visual-scan-line pointer-events-none" />
              </div>
              <p key={stageIndex} className="mt-5 text-sm font-medium text-sage visual-scan-text-fade">
                {STAGES[stageIndex]}
              </p>
              <div className="flex justify-center gap-1.5 mt-3">
                {STAGES.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i <= stageIndex ? "w-4 bg-sage" : "w-1.5 bg-border"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {phase === "result" && (
            <>
              {isConfidentMatch ? (
                <>
                  <div className="text-center mb-4">
                    <div className="inline-flex w-10 h-10 rounded-full bg-sage/15 items-center justify-center mb-2">
                      <ScanLine size={18} className="text-sage" />
                    </div>
                    <h3 className="text-lg font-heading font-light">We Found Your Match</h3>
                    <p className="text-xs text-muted-foreground">Based on the color and finish of your photo</p>
                  </div>

                  {/* Premium result card */}
                  <div className="relative bg-white rounded-[24px] p-4 shadow-[0_14px_32px_-18px_rgba(38,30,20,0.20)] border border-border/50">
                    <span className="absolute top-4 right-4 bg-sage text-white text-[10px] font-semibold px-2.5 py-1 rounded-full z-10">
                      {badgeLabel}
                    </span>
                    <div className="flex items-center gap-4">
                      <img
                        src={bestProduct.image_url}
                        alt={bestProduct.name}
                        className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug">{bestProduct.name}</p>
                        <p className="text-xs text-muted-foreground">{bestProduct.color}</p>
                        <p className="text-base font-heading font-semibold mt-1">₹{bestProduct.price}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 mt-4">
                      <Link
                        to={`/product/${bestProduct.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-full border border-border text-sm font-medium hover:border-sage hover:text-sage transition-colors"
                      >
                        View Product <ArrowRight size={14} />
                      </Link>
                      <Link
                        to={`/product/${bestProduct.slug}`}
                        onClick={onClose}
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-full bg-sage text-white text-sm font-medium hover:bg-sage/90 transition-colors"
                      >
                        Shop Now <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center mb-4">
                  <div className="inline-flex w-10 h-10 rounded-full bg-muted items-center justify-center mb-2">
                    <ScanLine size={18} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-base font-heading font-light">We couldn't find an exact REVE CULT match.</h3>
                  <p className="text-xs text-muted-foreground mt-1">Here's what you may like instead</p>
                </div>
              )}

              {!isConfidentMatch && (
                <div className="space-y-2.5">
                  {alternatives.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 p-2.5 bg-white rounded-2xl hover:shadow-md transition-all group"
                    >
                      <img src={p.image_url} alt={p.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-tight">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.color}</p>
                      </div>
                      <span className="text-sm font-heading font-semibold">₹{p.price}</span>
                      <ArrowRight
                        size={14}
                        className="text-muted-foreground group-hover:text-sage group-hover:translate-x-1 transition-all"
                      />
                    </Link>
                  ))}
                </div>
              )}

              <button
                onClick={reset}
                className="w-full mt-5 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
              >
                <Upload size={14} /> Try another image
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}