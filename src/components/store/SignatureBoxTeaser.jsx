// SignatureBoxTeaser.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import GiftBoxVisual from "@/components/store/GiftBoxVisual";

// Voice line: "Every memorable gift begins with a beautiful box.
// Let's create yours." — plays once, only after the box is tapped.
const OPEN_VOICE_LINE_SRC = "/audio/signature-box-open.mp3";

export default function SignatureBoxTeaser() {
  const navigate = useNavigate();
  // "idle" (closed) -> click -> "revealing" (opens, ~1.3s) -> "revealed" (empty)
  const [state, setState] = useState("idle");

  const handleTap = () => {
    if (state !== "idle") return;
    setState("revealing");
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div
        className="relative overflow-hidden rounded-[36px] border border-white/70 px-6 py-14 sm:px-10 lg:px-16 lg:py-20"
        style={{
          background:
            "linear-gradient(150deg, hsl(var(--blush) / 16%) 0%, hsl(var(--cream)) 55%, hsl(var(--gold) / 14%) 100%)",
          boxShadow: "0 30px 70px -40px rgba(196,120,120,0.28)",
        }}
      >
        <div
          className="absolute -top-16 -left-10 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--blush) / 20%) 0%, transparent 72%)" }}
        />
        <div
          className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--gold) / 18%) 0%, transparent 72%)" }}
        />

        <div className="relative flex flex-col items-center text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-blush mb-3">Premium Gifting</p>
          <h2 className="text-3xl lg:text-4xl font-heading font-light mb-3">Build Your Signature Box</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mb-10">
            Create your own luxury REVE CULT gift.
          </p>

          <button
            onClick={handleTap}
            disabled={state !== "idle"}
            className="relative disabled:cursor-default"
            aria-label="Open the Signature Box"
          >
            <GiftBoxVisual
              mode={state}
              playing={state === "revealing"}
              onComplete={() => setState("revealed")}
              audioSrc={OPEN_VOICE_LINE_SRC}
              size="large"
            />
          </button>

          <AnimatePresence mode="wait">
            {state === "idle" && (
              <motion.p
                key="tap-label"
                className="mt-6 text-xs uppercase tracking-[0.25em] text-blush/70 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Tap to Open
              </motion.p>
            )}

            {state === "revealed" && (
              <motion.div
                key="revealed-copy"
                className="mt-6 max-w-sm"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <p className="text-base sm:text-lg font-heading font-light text-foreground leading-snug mb-6">
                  Oops... <br className="hidden sm:block" />
                  Your Signature Box is waiting to be created.
                </p>
                <button
                  onClick={() => navigate("/signature-box")}
                  className="inline-flex items-center gap-2 px-7 py-3.5 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-all hover:scale-[1.02] min-h-[48px]"
                >
                  Create My Box <ArrowRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}