import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { PRODUCTS } from "@/data/products";

// Style/aesthetic and use-case answers map directly onto real product
// fields (color, vibes, uses, price, has_anc) so recommendations are
// deterministic — never a random pick. See getRecommendation() below.
const QUESTIONS = [
  {
    key: "style",
    title: "What's your aesthetic?",
    subtitle: "Pick the finish that feels most like you.",
    options: [
      { label: "Minimal", value: "Minimal", emoji: "◐", desc: "Clean beige & white tones" },
      { label: "Premium", value: "Premium", emoji: "✦", desc: "Bold black & gold finishes" },
      { label: "Soft", value: "Soft", emoji: "❀", desc: "Gentle pastel tones" },
    ],
  },
  {
    key: "use",
    title: "How will you use it most?",
    subtitle: "We'll match your everyday rhythm.",
    options: [
      { label: "Music Lover", value: "Music", emoji: "🎧", desc: "Premium, immersive sound" },
      { label: "Working Professional", value: "Work", emoji: "💼", desc: "Calls, focus, all day" },
      { label: "Workout", value: "Gym", emoji: "🏋", desc: "Secure fit, stays put" },
      { label: "Traveller", value: "Travel", emoji: "✈", desc: "Compact, on the go" },
    ],
  },
  {
    key: "budget",
    title: "What feels right for you?",
    subtitle: "No wrong answers — just your preference.",
    options: [
      { label: "Under ₹500", value: "low", emoji: "₹", desc: "Great value picks" },
      { label: "Under ₹1000", value: "mid", emoji: "₹₹", desc: "Premium essentials" },
      { label: "Premium", value: "high", emoji: "₹₹₹", desc: "Top-tier experience" },
    ],
  },
];

const TRANSITION_MS = 420;
const SELECT_HOLD_MS = 320; // time to let the check animation play before sliding on

export default function FindMyReveMatch({ onClose }) {
  const [step, setStep] = useState(0); // 0..QUESTIONS.length-1 = questions, QUESTIONS.length = results
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState("idle"); // 'idle' | 'out' | 'in' — drives the slide/fade transition
  const [dir, setDir] = useState(1); // 1 = forward (Next), -1 = backward (Back)
  const [locked, setLocked] = useState(false); // guards against double-selecting mid-transition

  const totalSteps = QUESTIONS.length;
  const isComplete = step === totalSteps;
  const currentQ = QUESTIONS[step];

  const changeStep = (nextStep, direction) => {
    setDir(direction);
    setPhase("out");
    setTimeout(() => {
      setStep(nextStep);
      setPhase("in");
      // Let the new content mount off-position first, then settle to
      // center on the next frame so the transition actually plays.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setPhase("idle"));
      });
    }, TRANSITION_MS);
  };

  const handleSelect = (key, value) => {
    if (locked) return;
    setLocked(true);
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setTimeout(() => {
      changeStep(step + 1, 1);
      setLocked(false);
    }, SELECT_HOLD_MS);
  };

  const handleBack = () => {
    if (step > 0 && !locked) changeStep(step - 1, -1);
  };

  // Deterministic scoring against real product data — no randomness.
  const getRecommendation = () => {
    const scored = PRODUCTS.map((p) => {
      let score = 0;
      const color = (p.color || "").toLowerCase();

      if (answers.style === "Minimal") {
        if (color.includes("beige") || color.includes("white")) score += 3;
        if (p.vibes?.includes("Minimal")) score += 1;
      } else if (answers.style === "Premium") {
        if (color.includes("black") || color.includes("gold")) score += 3;
        if (p.vibes?.includes("Bold")) score += 1;
      } else if (answers.style === "Soft") {
        if (p.vibes?.includes("Soft")) score += 2;
      }

      if (answers.use === "Music") {
        if (p.price >= 999) score += 3; // premium audio tier
        if (p.is_bestseller) score += 1;
      } else if (answers.use === "Work") {
        if (p.uses?.includes("Work")) score += 3;
      } else if (answers.use === "Gym") {
        if (p.uses?.includes("Gym")) score += 3; // secure-fit / workout ready
        if (p.has_anc) score += 1;
      } else if (answers.use === "Travel") {
        if (p.uses?.includes("Travel")) score += 3; // compact, travel-friendly
      }

      if (answers.budget === "low" && p.price < 500) score += 2;
      if (answers.budget === "mid" && p.price >= 500 && p.price < 1000) score += 2;
      if (answers.budget === "high" && p.price >= 1000) score += 2;

      if (p.is_bestseller) score += 0.5;

      return { product: p, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 2).map((s) => s.product);
  };

  const recommendations = isComplete ? getRecommendation() : [];

  const slideStyle = {
    transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1), opacity ${TRANSITION_MS}ms ease`,
    transform:
      phase === "out" ? `translateX(${-28 * dir}px)` : phase === "in" ? `translateX(${28 * dir}px)` : "translateX(0)",
    opacity: phase === "idle" ? 1 : 0,
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-cream rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blush/15 flex items-center justify-center">
              <Sparkles size={16} className="text-blush" />
            </div>
            <span className="font-heading text-lg font-medium">Find My REVE Match</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-accent rounded-full transition-colors" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Progress dots */}
        {!isComplete && (
          <div className="flex justify-center gap-2 pt-4">
            {QUESTIONS.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? "w-6 bg-blush" : i < step ? "w-1.5 bg-blush/50" : "w-1.5 bg-border"
                }`}
              />
            ))}
          </div>
        )}

        {/* Content — slides + fades between questions and into the results panel */}
        <div className="overflow-hidden">
          <div style={slideStyle}>
            {isComplete ? (
              <div className="p-6">
                <div className="text-center mb-5">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Your REVE Match</p>
                  <h3 className="text-2xl font-heading font-light">Here's what we found for you</h3>
                </div>
                <div className="space-y-3">
                  {recommendations.map((p, i) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 p-3 bg-white rounded-2xl hover:shadow-md transition-all group"
                    >
                      <img src={p.image_url} alt={p.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1">
                        {i === 0 && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-blush">Best Match</span>
                        )}
                        <p className="text-sm font-medium leading-tight">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.color}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-base font-heading font-semibold">₹{p.price}</p>
                        <ArrowRight
                          size={16}
                          className="text-muted-foreground group-hover:text-blush group-hover:translate-x-1 transition-all"
                        />
                      </div>
                    </Link>
                  ))}
                </div>
                <button
                  onClick={onClose}
                  className="w-full mt-5 py-3 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="p-6">
                <h3 className="text-xl font-heading font-light mb-1">{currentQ.title}</h3>
                <p className="text-sm text-muted-foreground mb-5">{currentQ.subtitle}</p>
                <div className={`grid gap-3 ${currentQ.options.length > 3 ? "grid-cols-2" : "grid-cols-1"}`}>
                  {currentQ.options.map((opt) => {
                    const selected = answers[currentQ.key] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelect(currentQ.key, opt.value)}
                        disabled={locked}
                        className={`group relative flex items-center gap-3.5 p-5 rounded-[20px] border-2 text-left min-h-[76px] transition-all duration-300 ease-out ${
                          selected
                            ? "border-blush bg-blush/8 shadow-[0_10px_24px_-14px_rgba(196,120,120,0.45)]"
                            : "border-border bg-white hover:border-blush/40 hover:bg-blush/5 hover:-translate-y-0.5 hover:shadow-md"
                        }`}
                      >
                        <span className="text-2xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3">
                          {opt.emoji}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground truncate">{opt.desc}</p>
                        </div>
                        {/* Check badge — pops in the moment this card is selected */}
                        {selected && (
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blush flex items-center justify-center animate-scale-in">
                            <Check size={14} className="text-white" strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {step > 0 && (
                  <button
                    onClick={handleBack}
                    className="mt-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ArrowLeft size={14} /> Back
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}