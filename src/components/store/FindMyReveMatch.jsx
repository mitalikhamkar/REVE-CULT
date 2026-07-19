import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles, X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { PRODUCTS } from "@/data/products";

// Same three questions, same scoring targets as before — only the
// presentation layer changed. Each option now carries a short AI
// "feedback" line and a human-readable reasonLabel used in the final
// recommendation reveal.
const QUESTIONS = [
  {
    key: "style",
    icon: "🎨",
    title: "Which style do you prefer?",
    subtitle: "Pick the finish that feels most like you.",
    options: [
      {
        label: "Minimal",
        value: "Minimal",
        emoji: "◐",
        desc: "Clean beige & white tones",
        feedback: "Great choice. Clean tones suit an everyday, low-key style.",
        reasonLabel: "Minimal Style",
      },
      {
        label: "Premium",
        value: "Premium",
        emoji: "✦",
        desc: "Bold black & gold finishes",
        feedback: "Nice pick. Bold finishes make a statement.",
        reasonLabel: "Premium Look",
      },
      {
        label: "Soft",
        value: "Soft",
        emoji: "❀",
        desc: "Gentle pastel tones",
        feedback: "Lovely. Soft pastels feel gentle and personal.",
        reasonLabel: "Soft Aesthetic",
      },
    ],
  },
  {
    key: "use",
    icon: "🎵",
    title: "What do you mostly use earbuds for?",
    subtitle: "We'll match your everyday rhythm.",
    options: [
      {
        label: "Music Lover",
        value: "Music",
        emoji: "🎧",
        desc: "Rich bass & everyday listening",
        feedback: "Great choice. This helps us understand your listening preferences.",
        reasonLabel: "Music-Focused Listening",
      },
      {
        label: "Working Professional",
        value: "Work",
        emoji: "💼",
        desc: "Calls, focus, all day",
        feedback: "Got it. We'll prioritize all-day comfort and clarity on calls.",
        reasonLabel: "Everyday Professional Use",
      },
      {
        label: "Workout",
        value: "Gym",
        emoji: "🏋",
        desc: "Secure fit, stays put",
        feedback: "Noted. We'll look for a secure, workout-ready fit.",
        reasonLabel: "Workout-Ready Fit",
      },
      {
        label: "Traveller",
        value: "Travel",
        emoji: "✈",
        desc: "Compact, on the go",
        feedback: "Perfect. Compact and travel-friendly it is.",
        reasonLabel: "Travel-Friendly Design",
      },
    ],
  },
  {
    key: "budget",
    icon: "💎",
    title: "What best describes your comfort budget?",
    subtitle: "No wrong answers — just your preference.",
    options: [
      {
        label: "Under ₹500",
        value: "low",
        emoji: "₹",
        desc: "Great value picks",
        feedback: "Good to know. We'll keep it value-focused.",
        reasonLabel: "Value-Conscious Pick",
      },
      {
        label: "Under ₹1000",
        value: "mid",
        emoji: "₹₹",
        desc: "Premium essentials",
        feedback: "Great balance of quality and value.",
        reasonLabel: "Balanced Investment",
      },
      {
        label: "Premium",
        value: "high",
        emoji: "₹₹₹",
        desc: "Top-tier experience",
        feedback: "Excellent. We'll aim for our top-tier picks.",
        reasonLabel: "Premium Comfort",
      },
    ],
  },
];

const THINKING_STAGES = [
  "Analyzing your style...",
  "Understanding your preferences...",
  "Matching with REVE CULT collection...",
  "Almost ready...",
];

const TRANSITION_MS = 450;
const FEEDBACK_HOLD_MS = 900; // time the AI feedback line stays visible before advancing
const THINKING_STAGE_MS = 650; // ~2.6s total across 4 stages — within the requested 2-3s window

/** Very small, optional, synthesized click tone — no audio files or libraries. */
function playSelectSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.13);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.14);
    osc.onended = () => ctx.close();
  } catch {
    // Audio isn't available/allowed — it's optional, fail silently.
  }
}

export default function FindMyReveMatch({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [stage, setStage] = useState("quiz"); // 'quiz' | 'thinking' | 'result'
  const [slidePhase, setSlidePhase] = useState("idle"); // 'idle' | 'out' | 'in'
  const [dir, setDir] = useState(1);
  const [locked, setLocked] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const timersRef = useRef([]);

  const totalSteps = QUESTIONS.length;
  const currentQ = QUESTIONS[step];

  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);

  const changeStep = (nextStep, direction) => {
    setDir(direction);
    setSlidePhase("out");
    const t = setTimeout(() => {
      setStep(nextStep);
      setSlidePhase("in");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setSlidePhase("idle"));
      });
    }, TRANSITION_MS);
    timersRef.current.push(t);
  };

  const runThinkingSequence = () => {
    THINKING_STAGES.forEach((_, i) => {
      const t = setTimeout(() => setThinkingIndex(i), i * THINKING_STAGE_MS);
      timersRef.current.push(t);
    });
    const done = setTimeout(() => setStage("result"), THINKING_STAGES.length * THINKING_STAGE_MS + 250);
    timersRef.current.push(done);
  };

  const handleSelect = (opt) => {
    if (locked) return;
    setLocked(true);
    playSelectSound();
    setAnswers((prev) => ({ ...prev, [currentQ.key]: opt.value }));
    setFeedback(opt.feedback);

    const t = setTimeout(() => {
      setFeedback(null);
      if (step < totalSteps - 1) {
        changeStep(step + 1, 1);
        setLocked(false);
      } else {
        setSlidePhase("out");
        const t2 = setTimeout(() => {
          setStage("thinking");
          setThinkingIndex(0);
          setLocked(false);
          runThinkingSequence();
        }, TRANSITION_MS);
        timersRef.current.push(t2);
      }
    }, FEEDBACK_HOLD_MS);
    timersRef.current.push(t);
  };

  const handleBack = () => {
    if (step > 0 && !locked && stage === "quiz") changeStep(step - 1, -1);
  };

  // Unchanged scoring logic — deterministic, based on real product data.
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
        if (p.price >= 999) score += 3;
        if (p.is_bestseller) score += 1;
      } else if (answers.use === "Work") {
        if (p.uses?.includes("Work")) score += 3;
      } else if (answers.use === "Gym") {
        if (p.uses?.includes("Gym")) score += 3;
        if (p.has_anc) score += 1;
      } else if (answers.use === "Travel") {
        if (p.uses?.includes("Travel")) score += 3;
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

  const recommendations = stage === "result" ? getRecommendation() : [];
  const [primary, secondary] = recommendations;

  const reasons = QUESTIONS.map((q) => {
    const opt = q.options.find((o) => o.value === answers[q.key]);
    return opt?.reasonLabel;
  }).filter(Boolean);

  const slideStyle = {
    transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1), opacity ${TRANSITION_MS}ms ease`,
    transform:
      slidePhase === "out"
        ? `translateX(${-28 * dir}px)`
        : slidePhase === "in"
        ? `translateX(${28 * dir}px)`
        : "translateX(0)",
    opacity: slidePhase === "idle" ? 1 : 0,
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-foreground/35 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full rounded-[32px] shadow-2xl overflow-hidden animate-scale-in border border-white/70"
        style={{
          maxWidth: "680px",
          background: "linear-gradient(160deg, rgba(255,245,247,0.94) 0%, rgba(255,250,250,0.97) 100%)",
          backdropFilter: "blur(18px)",
          boxShadow: "0 40px 90px -30px rgba(196,120,120,0.35)",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-20 p-2 hover:bg-white/70 rounded-full transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* AI header */}
        <div className="px-7 sm:px-10 pt-8 pb-1 text-center">
          <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] text-blush font-semibold mb-3">
            <Sparkles size={13} /> AI Style Assistant
          </p>
          <h2 className="text-2xl sm:text-3xl font-heading font-light tracking-tight">Find Your Perfect REVE Match</h2>
          {stage !== "result" && (
            <p className="text-sm text-muted-foreground mt-2.5 max-w-md mx-auto leading-relaxed">
              Our AI understands your style and recommends the REVE CULT product that best fits your personality and
              lifestyle.
            </p>
          )}
          {stage !== "result" && (
            <div className="inline-flex items-center gap-1.5 mt-4 text-[11px] text-muted-foreground/80">
              <span className="relative flex w-2 h-2">
                <span className="absolute inline-flex w-full h-full rounded-full bg-blush opacity-70 animate-ping" />
                <span className="relative inline-flex rounded-full w-2 h-2 bg-blush" />
              </span>
              AI Thinking
            </div>
          )}
        </div>

        {/* Progress tracker */}
        {stage === "quiz" && (
          <div className="pt-5 pb-1">
            <div className="flex items-center justify-center gap-0">
              {QUESTIONS.map((_, i) => (
                <React.Fragment key={i}>
                  <span
                    className={`rounded-full transition-all duration-500 ${
                      i < step
                        ? "w-2.5 h-2.5 bg-blush"
                        : i === step
                        ? "w-3.5 h-3.5 bg-blush ring-4 ring-blush/20"
                        : "w-2.5 h-2.5 bg-border"
                    }`}
                  />
                  {i < QUESTIONS.length - 1 && (
                    <span
                      className={`h-[2px] w-10 sm:w-14 transition-colors duration-500 ${
                        i < step ? "bg-blush" : "bg-border"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-2.5">
              Step {step + 1} of {totalSteps}
            </p>
          </div>
        )}

        {/* QUIZ */}
        {stage === "quiz" && (
          <div className="overflow-hidden px-7 sm:px-10 pb-8 pt-4">
            <div style={slideStyle}>
              <div className="text-center mb-6">
                <span className="inline-flex w-12 h-12 rounded-2xl bg-white items-center justify-center text-2xl shadow-sm mb-3">
                  {currentQ.icon}
                </span>
                <h3 className="text-xl sm:text-2xl font-heading font-light">{currentQ.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{currentQ.subtitle}</p>
              </div>

              <div className={`grid gap-3 ${currentQ.options.length > 3 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
                {currentQ.options.map((opt) => {
                  const selected = answers[currentQ.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(opt)}
                      disabled={locked}
                      className={`group relative flex items-center gap-3.5 p-5 rounded-[20px] text-left min-h-[80px] transition-all duration-300 ease-out hover:scale-[1.015] ${
                        selected
                          ? "shadow-[0_0_0_4px_hsl(var(--blush)/14%),0_16px_30px_-16px_rgba(196,120,120,0.5)]"
                          : "border-2 border-border bg-white hover:border-blush/40 hover:bg-blush/5 hover:-translate-y-0.5 hover:shadow-md"
                      }`}
                      style={
                        selected
                          ? {
                              backgroundImage:
                                "linear-gradient(#fff,#fff), linear-gradient(120deg, hsl(var(--blush)), hsl(var(--gold)))",
                              backgroundOrigin: "border-box",
                              backgroundClip: "padding-box, border-box",
                              border: "2px solid transparent",
                            }
                          : undefined
                      }
                    >
                      <span className="text-2xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-3">
                        {opt.emoji}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{opt.desc}</p>
                      </div>
                      {selected && (
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-blush to-gold flex items-center justify-center animate-scale-in">
                          <Check size={14} className="text-white" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* AI feedback line */}
              <div className="h-9 mt-4">
                {feedback && (
                  <p key={feedback} className="text-sm text-blush flex items-center gap-1.5 animate-fade-in">
                    <Check size={14} strokeWidth={3} /> {feedback}
                  </p>
                )}
              </div>

              {step > 0 && !feedback && (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
            </div>
          </div>
        )}

        {/* AI THINKING SCREEN */}
        {stage === "thinking" && (
          <div className="px-7 sm:px-10 pb-12 pt-6 text-center">
            <div className="flex items-end justify-center gap-1.5 h-8 mb-6">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="w-1.5 rounded-full bg-gradient-to-t from-blush to-gold ai-wave-bar"
                  style={{ height: "100%", animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <p key={thinkingIndex} className="text-base font-heading font-light text-foreground animate-fade-in">
              {THINKING_STAGES[thinkingIndex]}
            </p>
          </div>
        )}

        {/* RECOMMENDATION REVEAL */}
        {stage === "result" && primary && (
          <div className="px-7 sm:px-10 pb-8 pt-2">
            <p
              className="text-center text-xs uppercase tracking-wider text-muted-foreground mb-1 animate-fade-in-up"
              style={{ opacity: 0 }}
            >
              Your REVE Match
            </p>

            <div
              className="relative bg-white rounded-[26px] p-5 sm:p-6 mt-4 shadow-[0_20px_50px_-24px_rgba(38,30,20,0.25)] border border-border/40 animate-fade-in-up"
              style={{ opacity: 0, animationDelay: "0.1s" }}
            >
              <span className="absolute top-5 right-5 text-[10px] font-semibold uppercase tracking-wide text-blush">
                Best Match
              </span>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <img
                  src={primary.image_url}
                  alt={primary.name}
                  className="w-28 h-28 rounded-2xl object-cover flex-shrink-0 animate-fade-in-up"
                  style={{ opacity: 0, animationDelay: "0.2s" }}
                />
                <div className="flex-1 text-center sm:text-left">
                  <h3
                    className="text-lg font-heading font-medium leading-snug animate-fade-in-up"
                    style={{ opacity: 0, animationDelay: "0.28s" }}
                  >
                    {primary.name}
                  </h3>
                  <p
                    className="text-xl font-heading font-semibold mt-1 animate-fade-in-up"
                    style={{ opacity: 0, animationDelay: "0.34s" }}
                  >
                    ₹{primary.price}
                  </p>

                  {reasons.length > 0 && (
                    <div className="mt-3 animate-fade-in-up" style={{ opacity: 0, animationDelay: "0.42s" }}>
                      <p className="text-xs text-muted-foreground">Recommended because you selected:</p>
                      <ul className="mt-1 space-y-0.5">
                        {reasons.map((r) => (
                          <li
                            key={r}
                            className="text-xs text-foreground/80 flex items-center gap-1.5 justify-center sm:justify-start"
                          >
                            <span className="w-1 h-1 rounded-full bg-blush flex-shrink-0" /> {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link
                    to={`/product/${primary.slug}`}
                    onClick={onClose}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blush hover:gap-2.5 transition-all mt-4 animate-fade-in-up"
                    style={{ opacity: 0, animationDelay: "0.5s" }}
                  >
                    View Product <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>

            {secondary && (
              <Link
                to={`/product/${secondary.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 p-3 mt-3 bg-white/70 rounded-2xl hover:bg-white hover:shadow-md transition-all group animate-fade-in-up"
                style={{ opacity: 0, animationDelay: "0.6s" }}
              >
                <img src={secondary.image_url} alt={secondary.name} className="w-12 h-12 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">You Might Also Like</p>
                  <p className="text-sm font-medium leading-tight truncate">{secondary.name}</p>
                </div>
                <span className="text-sm font-heading font-semibold">₹{secondary.price}</span>
                <ArrowRight
                  size={14}
                  className="text-muted-foreground group-hover:text-blush group-hover:translate-x-1 transition-all"
                />
              </Link>
            )}

            <button
              onClick={onClose}
              className="w-full mt-5 py-3 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors animate-fade-in-up"
              style={{ opacity: 0, animationDelay: "0.68s" }}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
}