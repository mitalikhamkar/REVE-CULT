// SignatureBoxTeaser.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import GiftBoxVisual from "@/components/store/GiftBoxVisual";
import RitualLoader from "@/components/store/RitualLoader";

// Voice line: "Every memorable gift begins with a beautiful box.
// Let's create yours." — plays once, only after the box is tapped.
const OPEN_VOICE_LINE_SRC = "/audio/signature-box-open.mp3";

// Explicit flow: idle -> opening -> (auto-navigate)
// idle    : closed box, "Tap to Open" visible, waiting for a tap.
// opening : the tap starts BOTH the voice line and the box-opening
//           animation at the same time. Once the box animation
//           finishes (~1.2s), the "Oops... your box is empty" text
//           fades in on the homepage and just sits there — we do NOT
//           navigate yet. Navigation only happens once the audio
//           itself finishes (or a safety fallback fires, in case the
//           audio fails to load/play), so the user stays on the
//           homepage for exactly as long as the voice line is playing.
export default function SignatureBoxTeaser() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("idle");
  const [boxDone, setBoxDone] = useState(false);
  const audioRef = useRef(null);

  const handleTap = () => {
    if (phase !== "idle") return;
    setPhase("opening");
  };

  // Starts the moment the user taps — audio and box animation begin
  // together. Navigation is gated on the audio finishing, not on the
  // (much shorter) box animation.
  useEffect(() => {
    if (phase !== "opening") return;

    let settled = false;
    const showLoaderThenNavigate = () => {
      if (settled) return;
      settled = true;
      // Instead of a custom fade cover, hand off to the existing
      // RitualLoader — it renders full-screen over the homepage, and
      // its own onDone callback (after its ~1.8s sequence) is what
      // actually triggers navigation. That gives the transition a
      // consistent, branded moment instead of a bare color fade.
      setPhase("leaving");
    };

    const audio = new Audio(OPEN_VOICE_LINE_SRC);
    audioRef.current = audio;
    // Safety net: if the audio never loads/plays/ends for any reason,
    // don't strand the user on the homepage forever.
    const fallbackTimer = setTimeout(showLoaderThenNavigate, 6000);

    audio.addEventListener("ended", showLoaderThenNavigate);
    audio.addEventListener("error", showLoaderThenNavigate);
    audio.play().catch(showLoaderThenNavigate);

    return () => {
      clearTimeout(fallbackTimer);
      audio.removeEventListener("ended", showLoaderThenNavigate);
      audio.removeEventListener("error", showLoaderThenNavigate);
    };
  }, [phase, navigate]);

  const boxMode =
    phase === "opening" ? "revealing" : phase === "leaving" ? "revealed" : "idle";

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
            disabled={phase !== "idle"}
            className="relative disabled:cursor-default"
            aria-label="Open the Signature Box"
          >
            <GiftBoxVisual
              mode={boxMode}
              playing={phase === "opening"}
              onComplete={() => {
                if (phase === "opening") setBoxDone(true);
              }}
              size="large"
            />
          </button>

          <AnimatePresence mode="wait">
            {phase === "idle" && (
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

            {phase === "opening" && boxDone && (
              <motion.p
                key="oops-label"
                className="mt-6 text-base sm:text-lg font-heading font-light text-foreground"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                Oops... your box is empty.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* RitualLoader takes over full-screen once the audio finishes,
          and its own onDone (after its ~1.8s branded sequence) is what
          actually navigates — this replaces the bare color fade with
          the same loader used elsewhere on the site, so the transition
          feels consistent with the rest of the experience instead of
          like a disconnected flicker. */}
      {phase === "leaving" && (
        <RitualLoader onDone={() => navigate("/signature-box")} />
      )}
    </section>
  );
}