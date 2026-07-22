// GiftBoxVisual.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * GiftBoxVisual — premium Signature Box illustration (Framer Motion).
 *
 * Built as two flat, crossfading cards (closed / open) rather than a
 * rotated 3D lid. A rotated lid needs real perspective to read correctly
 * and easily ends up looking "ajar" at rest — a flat card with a ribbon
 * crossing over it (closed) that crossfades into an interior "well"
 * (open) is what actually reads as a sealed box at a glance.
 *
 * mode="idle"      — Homepage box. Fully closed card: soft blush/peach
 *                     gradient, ONE continuous ribbon crossing the top
 *                     with a round gold knot at the center, exactly like
 *                     an untouched wrapped gift. Gentle float, breathing
 *                     shadow, soft under-glow, ribbon shimmer, occasional
 *                     sparkle.
 *
 * mode="revealing" — Tap-to-open sequence (~1.2s): ribbon bands slide
 *                     apart and fade, the closed card crossfades into the
 *                     open interior, sparkles rise. If `audioSrc` is
 *                     provided, the voice line plays once, right as the
 *                     ribbon starts separating — never on mount. Calls
 *                     onComplete when the box visual itself is done, and
 *                     onAudioEnd separately once the narration finishes
 *                     (or fails to load), so a caller can time on-screen
 *                     text to when the voice line actually ends rather
 *                     than to the box animation.
 *
 * mode="revealed"  — Static open + empty box, held after `revealing`.
 *
 * mode="builder"   — Signature Box page live preview. Open card, pouch
 *                     fixed inside by default, selected earbuds appear on
 *                     choice. Never plays the packing sequence.
 *
 * mode="packing"   — Used only inside the fullscreen packing overlay:
 *                     open + empty → pouch fades in → selected earbuds
 *                     fade in → sparkle → card crossfades to closed →
 *                     ribbon reassembles → knot ties → soft glow. Calls
 *                     onComplete when done.
 *
 * mode="wrapped"   — Static closed card, no idle float. For anywhere the
 *                     box needs to sit still and sealed.
 */
export default function GiftBoxVisual({
  earbudsImage,
  pouchImage,
  earbudsAlt = "Selected REVE CULT earbuds",
  mode = "idle",
  playing = false,
  onComplete,
  onAudioEnd,
  audioSrc,
  size = "default", // "default" | "large"
}) {
  const boxSize =
    size === "large" ? "w-64 h-52 sm:w-80 sm:h-64" : "w-52 h-44 sm:w-64 sm:h-52";

  const [step, setStep] = useState(0);
  const audioRef = useRef(null);
  const hasPlayedAudio = useRef(false);

  const isRevealing = mode === "revealing" && playing;
  const isPacking = mode === "packing" && playing;

  useEffect(() => {
    if (!isRevealing && !isPacking) {
      setStep(0);
      return;
    }
    setStep(0);
    hasPlayedAudio.current = false;
    const timers = [];
    const schedule = (n, delay) => timers.push(setTimeout(() => setStep(n), delay));

    if (isRevealing) {
      // Total ~1.2s
      schedule(1, 120); // ribbon begins separating -> audio fires here
      schedule(2, 420); // card crossfades open
      schedule(3, 650); // sparkles rise
      schedule(4, 950); // settle
      timers.push(setTimeout(() => onComplete && onComplete(), 1200));
    } else if (isPacking) {
      // Total ~2.9s
      schedule(1, 300); // pouch fades in
      schedule(2, 650); // earbuds fade in
      schedule(3, 950); // small sparkle
      schedule(4, 1250); // brief settle
      schedule(5, 1550); // card crossfades to closed, ribbon reassembles
      schedule(6, 2150); // knot ties
      schedule(7, 2400); // gold sparkle
      schedule(8, 2650); // soft glow
      timers.push(setTimeout(() => onComplete && onComplete(), 2900));
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRevealing, isPacking]);

  // Voice line: fires exactly once, only after the tap has already
  // started the opening animation (never on mount, never on load).
  // onAudioEnd fires separately from onComplete so a caller can time
  // on-screen text to when the narration actually finishes, instead of
  // to the (much shorter) box animation — that mismatch is what made
  // the reveal text and the voice line feel out of sync.
  useEffect(() => {
    if (!(isRevealing && step === 1 && audioSrc) || hasPlayedAudio.current) return;
    hasPlayedAudio.current = true;
    const audio = audioRef.current || new Audio(audioSrc);
    audioRef.current = audio;
    audio.currentTime = 0;

    const finish = () => onAudioEnd && onAudioEnd();
    audio.addEventListener("ended", finish);
    audio.play().catch(() => {
      // Autoplay-blocked or file missing — don't leave the caller
      // waiting forever for a callback that will never come.
      finish();
    });
    return () => audio.removeEventListener("ended", finish);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRevealing, step, audioSrc]);

  const isOpen =
    mode === "builder" ||
    mode === "revealed" ||
    (mode === "revealing" && step >= 2) ||
    (mode === "packing" && step < 5);

  const showEmptyGlow = mode === "revealed" || (mode === "revealing" && step >= 2);
  const showPouch = mode === "builder" || (mode === "packing" && step >= 1);
  const showEarbuds = mode === "builder" || (mode === "packing" && step >= 2);

  const ribbonVisible =
    mode === "idle" ||
    mode === "wrapped" ||
    (mode === "revealing" && step < 1) ||
    (mode === "packing" && step >= 5);
  const ribbonSeparating = mode === "revealing" && step >= 1 && step < 2;
  const knotTied = !(mode === "packing" && step >= 5 && step < 6);

  const glowActive =
    mode === "idle" ||
    mode === "wrapped" ||
    (mode === "revealing" && step >= 2) ||
    mode === "revealed" ||
    (mode === "packing" && step >= 8);
  const sparkleActive =
    (mode === "revealing" && step >= 3 && step < 4) || (mode === "packing" && step >= 3 && step < 4);

  const boxScale = mode === "revealing" && step >= 1 && step < 4 ? 1.03 : 1;

  return (
    <div className={"relative mx-auto " + boxSize + (mode === "idle" ? " gift-box-idle-float" : "")}>
      {/* Ground shadow — breathes gently at idle, static elsewhere */}
      <div
        className={"absolute left-1/2 bottom-[-10%] w-[70%] h-[13%] rounded-full pointer-events-none" + (mode === "idle" ? " gift-box-idle-shadow" : "")}
        style={{
          transform: "translateX(-50%)",
          background: "radial-gradient(ellipse at center, rgba(150,90,70,0.28) 0%, transparent 72%)",
          filter: "blur(11px)",
        }}
      />

      {/* Ambient under-glow */}
      <motion.div
        className={"absolute inset-[-18%] rounded-full pointer-events-none -z-10" + (mode === "idle" ? " gift-box-idle-glow" : "")}
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--gold) / 30%) 0%, hsl(var(--blush) / 18%) 45%, transparent 72%)",
          filter: "blur(18px)",
        }}
        animate={{ opacity: glowActive ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />

      {/* Sparkle cluster */}
      <AnimatePresence>
        {(sparkleActive || mode === "idle") && (
          <motion.div
            key="sparkle"
            className="absolute left-1/2 top-[2%] -translate-x-1/2 z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: mode !== "idle" ? -14 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: mode === "idle" ? 0.3 : 0.6 }}
            style={mode === "idle" ? { animation: "giftBoxIdleSparkle 8s ease-in-out infinite" } : undefined}
          >
            <div className="relative w-16 h-6">
              {[0, 1, 2, 3].map((k) => (
                <span
                  key={k}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: k % 2 === 0 ? 4 : 3,
                    height: k % 2 === 0 ? 4 : 3,
                    left: `${k * 22}%`,
                    top: `${(k % 2) * 60}%`,
                    boxShadow: "0 0 6px 1px hsl(var(--gold) / 70%)",
                    animation: "sparkleTwinkle 1.4s ease-in-out infinite",
                    animationDelay: `${k * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The box itself: two flat, crossfading cards */}
      <motion.div
        className="relative w-full h-full"
        animate={{ scale: boxScale }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* CLOSED CARD — soft gradient, ribbon cross + knot, brand mark */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              key="closed"
              className="absolute inset-0 rounded-[26px] overflow-hidden"
              style={{
                background:
                  "linear-gradient(155deg, hsl(13 60% 88%) 0%, hsl(var(--blush)) 45%, hsl(var(--gold) / 85%) 100%)",
                boxShadow: "0 28px 50px -22px rgba(150,90,70,0.4), inset 0 2px 0 rgba(255,255,255,0.55)",
              }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {/* Slow light sweep for premium shimmer at idle */}
              {(mode === "idle" || mode === "wrapped") && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
                    animation: "giftBoxRibbonLightSweep 8s ease-in-out infinite",
                  }}
                />
              )}

              {/* Ribbon — one continuous cross over the closed card */}
              <AnimatePresence>
                {ribbonVisible && (
                  <motion.div
                    key="ribbon"
                    className="absolute inset-0 z-10 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {/* Vertical band */}
                    <motion.div
                      className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[15%] overflow-hidden"
                      style={{ background: "linear-gradient(180deg, #fff 0%, hsl(38 50% 92%) 100%)" }}
                      animate={{
                        y: ribbonSeparating ? -18 : 0,
                        opacity: ribbonSeparating ? 0 : 1,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.7) 48%, transparent 66%)" }}
                      />
                    </motion.div>
                    {/* Horizontal band */}
                    <motion.div
                      className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[15%] overflow-hidden"
                      style={{ background: "linear-gradient(90deg, #fff 0%, hsl(38 50% 92%) 100%)" }}
                      animate={{
                        x: ribbonSeparating ? 18 : 0,
                        opacity: ribbonSeparating ? 0 : 1,
                      }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div
                        className="absolute inset-0"
                        style={{ background: "linear-gradient(190deg, transparent 30%, rgba(255,255,255,0.7) 48%, transparent 66%)" }}
                      />
                    </motion.div>
                    {/* Round gold knot, centered on the cross */}
                    <motion.div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                      style={{
                        background: "radial-gradient(circle at 35% 30%, hsl(45 70% 78%) 0%, hsl(var(--gold)) 60%, hsl(30 45% 42%) 100%)",
                        boxShadow: "0 3px 8px rgba(120,70,40,0.35)",
                      }}
                      animate={{
                        scale: ribbonSeparating ? 0 : knotTied ? 1 : 0,
                        opacity: ribbonSeparating ? 0 : knotTied ? 1 : 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <p
                className="absolute left-1/2 top-[64%] -translate-x-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] tracking-[0.16em] font-heading whitespace-nowrap"
                style={{ color: "hsl(30 35% 30% / 55%)" }}
              >
                REVE CULT
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* OPEN CARD — interior well, pouch + earbuds sit inside */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="open"
              className="absolute inset-0 rounded-[26px] overflow-hidden"
              style={{
                background:
                  "linear-gradient(165deg, hsl(38 45% 93%) 0%, hsl(var(--blush) / 40%) 55%, hsl(var(--gold) / 32%) 100%)",
                boxShadow: "0 28px 50px -22px rgba(150,90,70,0.4), inset 0 2px 0 rgba(255,255,255,0.55)",
              }}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {/* Interior well */}
              <div
                className="absolute inset-[8%] rounded-2xl"
                style={{
                  background: "linear-gradient(180deg, hsl(38 55% 97%) 0%, hsl(30 40% 91%) 100%)",
                  boxShadow: "inset 0 5px 12px rgba(150,110,80,0.18)",
                }}
              />

              {showEmptyGlow && (
                <motion.div
                  className="absolute inset-x-0 top-[30%] flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.55 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <div
                    className="w-14 h-8 rounded-full"
                    style={{ background: "radial-gradient(circle, hsl(var(--gold)/55%) 0%, transparent 70%)", filter: "blur(6px)" }}
                  />
                </motion.div>
              )}

              {/* Pouch + earbuds */}
              <div className="absolute inset-x-0 bottom-[16%] flex items-end justify-center gap-3 sm:gap-4">
                <AnimatePresence>
                  {showPouch && pouchImage && (
                    <motion.img
                      key="pouch"
                      src={pouchImage}
                      alt="REVE CULT premium carry pouch"
                      draggable={false}
                      className="w-11 h-11 sm:w-16 sm:h-16 object-contain drop-shadow-md"
                      initial={mode === "packing" ? { opacity: 0, y: -16, scale: 0.85 } : false}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </AnimatePresence>

                <AnimatePresence mode="popLayout">
                  {showEarbuds && earbudsImage && (
                    <motion.img
                      key={mode === "builder" ? earbudsImage : "earbuds-packing"}
                      src={earbudsImage}
                      alt={earbudsAlt}
                      draggable={false}
                      className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-md"
                      initial={
                        mode === "packing"
                          ? { opacity: 0, y: -16, scale: 0.85 }
                          : { opacity: 0, x: 30, scale: 0.8 }
                      }
                      animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                      exit={
                        mode === "packing"
                          ? { opacity: 0, y: -16, scale: 0.85 }
                          : { opacity: 0, x: -30, scale: 0.8 }
                      }
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    />
                  )}
                </AnimatePresence>
              </div>

              <p
                className="absolute left-1/2 top-[64%] -translate-x-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] tracking-[0.16em] font-heading whitespace-nowrap"
                style={{ color: "hsl(30 35% 30% / 45%)" }}
              >
                REVE CULT
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}