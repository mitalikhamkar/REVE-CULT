// GiftBoxVisual.jsx
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * GiftBoxVisual — premium Signature Box illustration (Framer Motion).
 *
 * mode="idle"      — Homepage box. Fully closed: lid sits flush on the
 *                     base with a visible seam/rim line, ONE continuous
 *                     satin ribbon crosses lid + seam + base + bow, like
 *                     an untouched luxury gift. Gentle float, breathing
 *                     shadow, soft under-glow, ribbon shimmer, occasional
 *                     sparkle.
 *
 * mode="revealing" — Tap-to-open sequence (~1.3s): ribbon loosens, lid
 *                     lifts, soft light appears inside, sparkles emerge.
 *                     If `audioSrc` is provided, the voice line plays
 *                     once, right as the lid begins lifting — never on
 *                     mount. Calls onComplete when finished.
 *
 * mode="revealed"  — Static open + empty box, held after `revealing`.
 *
 * mode="builder"   — Signature Box page live preview. Lid open and
 *                     attached, pouch fixed inside by default, selected
 *                     earbuds appear inside on choice. No animation
 *                     replay — this mode never plays the packing sequence.
 *
 * mode="packing"   — Used only inside the fullscreen packing overlay:
 *                     box appears open + empty → pouch slides in →
 *                     selected earbuds slide into place → sparkle → lid
 *                     closes → ribbon wraps → bow ties → soft glow.
 *                     Calls onComplete when the box sequence itself is
 *                     done (the overlay adds the "Ready" text after).
 *
 * mode="wrapped"   — Static closed + ribboned box, no idle float. Held
 *                     state for anywhere the box needs to sit still and
 *                     sealed without the ambient motion.
 */
export default function GiftBoxVisual({
  earbudsImage,
  pouchImage,
  earbudsAlt = "Selected REVE CULT earbuds",
  mode = "idle",
  playing = false,
  onComplete,
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
      // Total ~1.3s
      schedule(1, 100); // box scales up
      schedule(2, 320); // ribbon loosens, lid begins lifting -> audio fires here
      schedule(3, 520); // lid fully open + inner glow fades in
      schedule(4, 800); // sparkles rise
      schedule(5, 1100); // box settles back down
      timers.push(setTimeout(() => onComplete && onComplete(), 1300));
    } else if (isPacking) {
      // Total ~2.9s
      schedule(1, 300); // pouch slides in
      schedule(2, 650); // earbuds slide into place
      schedule(3, 950); // small sparkle
      schedule(4, 1250); // brief settle
      schedule(5, 1550); // lid closes
      schedule(6, 2150); // ribbon wraps back around
      schedule(7, 2550); // bow ties
      schedule(8, 2800); // soft glow
      timers.push(setTimeout(() => onComplete && onComplete(), 2900));
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRevealing, isPacking]);

  // Voice line: fires exactly once, only after the tap has already
  // started the opening animation (never on mount, never on load).
  useEffect(() => {
    if (isRevealing && step === 2 && audioSrc && !hasPlayedAudio.current) {
      hasPlayedAudio.current = true;
      const audio = audioRef.current || new Audio(audioSrc);
      audioRef.current = audio;
      audio.currentTime = 0;
      audio.play().catch(() => {
        /* autoplay-policy safe no-op — the tap is already the user
           gesture; this only guards rare edge cases */
      });
    }
  }, [isRevealing, step, audioSrc]);

  const lidOpen =
    mode === "builder" ||
    mode === "revealed" ||
    (mode === "revealing" && step >= 3) ||
    (mode === "packing" && step < 5);

  const showEmptyGlow = mode === "revealed" || (mode === "revealing" && step >= 3);
  const showPouch = mode === "builder" || (mode === "packing" && step >= 1);
  const showEarbuds = mode === "builder" || (mode === "packing" && step >= 2);

  // Ribbon is ONE continuous piece crossing lid + seam + base + bow,
  // independent of the lid's own rotation — this is what reads as a
  // sealed package instead of a wrapped lid resting on a bare box.
  const ribbonVisible =
    mode === "idle" ||
    mode === "wrapped" ||
    (mode === "revealing" && step < 2) ||
    (mode === "packing" && step >= 6);
  const ribbonLoosened = mode === "revealing" && step >= 2 && step < 3;
  const bowTight = !(mode === "packing" && step >= 6 && step < 7);

  const glowActive =
    mode === "idle" ||
    mode === "wrapped" ||
    (mode === "revealing" && step >= 3) ||
    mode === "revealed" ||
    (mode === "packing" && step >= 8);
  const sparkleActive =
    (mode === "revealing" && step >= 4 && step < 5) || (mode === "packing" && step >= 3 && step < 4);

  const lidRotate = lidOpen ? -112 : 0;
  const boxScale = mode === "revealing" && step >= 1 && step < 5 ? 1.035 : 1;

  return (
    <div
      className={"relative mx-auto " + boxSize + (mode === "idle" ? " gift-box-idle-float" : "")}
      style={{ perspective: "1400px" }}
    >
      {/* Ground shadow — breathes gently at idle, static elsewhere */}
      <div
        className={"absolute left-1/2 bottom-[-8%] w-[64%] h-[12%] rounded-full pointer-events-none" + (mode === "idle" ? " gift-box-idle-shadow" : "")}
        style={{
          transform: "translateX(-50%)",
          background: "radial-gradient(ellipse at center, rgba(150,90,70,0.26) 0%, transparent 72%)",
          filter: "blur(10px)",
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

      {/* Sparkle cluster near the ribbon/bow */}
      <AnimatePresence>
        {(sparkleActive || mode === "idle") && (
          <motion.div
            key="sparkle"
            className="absolute left-1/2 top-[4%] -translate-x-1/2 z-40 pointer-events-none"
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

      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        animate={{ scale: boxScale }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        {/* Base — front face + inset "well" so the box reads as a real
            container, not a flat card */}
        <div
          className="absolute inset-x-0 bottom-0 h-[64%] rounded-[20px] overflow-hidden"
          style={{
            background:
              "linear-gradient(165deg, hsl(38 45% 92%) 0%, hsl(var(--blush) / 55%) 55%, hsl(var(--gold) / 45%) 100%)",
            boxShadow:
              "0 26px 48px -24px rgba(150,90,70,0.4), inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -10px 18px -12px rgba(120,70,55,0.28)",
          }}
        >
          {/* Interior well — only reads once the lid is open */}
          <div
            className="absolute inset-x-[7%] bottom-[7%] top-[16%] rounded-2xl"
            style={{
              background: "linear-gradient(180deg, hsl(38 55% 96%) 0%, hsl(30 40% 90%) 100%)",
              boxShadow: "inset 0 4px 10px rgba(150,110,80,0.16)",
            }}
          />

          {/* Warm inner glow once the box is open + empty */}
          {showEmptyGlow && (
            <motion.div
              className="absolute inset-x-0 bottom-[22%] flex items-center justify-center pointer-events-none"
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
          <div className="absolute inset-x-0 bottom-[14%] flex items-end justify-center gap-3 sm:gap-4">
            <AnimatePresence>
              {showPouch && pouchImage && (
                <motion.img
                  key="pouch"
                  src={pouchImage}
                  alt="REVE CULT premium carry pouch"
                  draggable={false}
                  className="w-11 h-11 sm:w-16 sm:h-16 object-contain drop-shadow-md"
                  initial={mode === "packing" ? { opacity: 0, y: -20, scale: 0.85 } : false}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
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
                      ? { opacity: 0, y: -20, scale: 0.85 }
                      : { opacity: 0, x: 34, scale: 0.8 }
                  }
                  animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                  exit={
                    mode === "packing"
                      ? { opacity: 0, y: -20, scale: 0.85 }
                      : { opacity: 0, x: -34, scale: 0.8 }
                  }
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </AnimatePresence>
          </div>

          <p className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] tracking-[0.3em] font-heading text-blush/60">
            REVE CULT
          </p>
        </div>

        {/* Lid — sits flush on the base at rest (no gap, no float-above
            look). Rotates open from the back-bottom hinge. */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[38%] rounded-t-[20px] rounded-b-[6px] origin-bottom z-20 overflow-hidden"
          style={{
            background:
              "linear-gradient(155deg, hsl(13 60% 86%) 0%, hsl(var(--blush)) 50%, hsl(var(--gold) / 90%) 100%)",
            boxShadow: "0 12px 22px -10px rgba(150,90,70,0.35), inset 0 1px 0 rgba(255,255,255,0.5)",
            transformStyle: "preserve-3d",
          }}
          animate={{ rotateX: lidRotate }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 3px)",
            }}
          />
          {/* Lid rim — a slightly darker strip along the bottom edge that
              reads as the lid's own thickness sitting over the base seam */}
          {!lidOpen && (
            <div
              className="absolute inset-x-0 bottom-0 h-[16%]"
              style={{
                background: "linear-gradient(180deg, transparent 0%, rgba(120,70,55,0.16) 100%)",
              }}
            />
          )}
          {!lidOpen && (
            <p
              className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs tracking-[0.35em] font-heading"
              style={{ color: "hsl(var(--gold))" }}
            >
              REVE
            </p>
          )}
          {(mode === "idle" || mode === "wrapped") && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.55) 50%, transparent 60%)",
                animation: "giftBoxRibbonLightSweep 8s ease-in-out infinite",
              }}
            />
          )}
        </motion.div>

        {/* Seam shadow line — sits under the lid rim, only visible when
            closed, sells the "lid resting on base" read */}
        {!lidOpen && (
          <div
            className="absolute inset-x-[3%] top-[36%] h-[3px] rounded-full pointer-events-none z-10"
            style={{ background: "rgba(120,70,55,0.18)", filter: "blur(1px)" }}
          />
        )}

        {/* Continuous satin ribbon — one wrap crossing lid + seam + base +
            bow, independent of the lid's own rotation. */}
        <AnimatePresence>
          {ribbonVisible && (
            <motion.div
              key="ribbon"
              className="absolute inset-0 z-30 pointer-events-none"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: ribbonLoosened ? 0.35 : 1, scale: ribbonLoosened ? 0.97 : 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {/* Vertical band — full height, satin sheen */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[13%] overflow-hidden"
                style={{ background: "linear-gradient(180deg, #fff 0%, hsl(38 50% 92%) 100%)" }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.7) 48%, transparent 66%)" }}
                />
              </div>
              {/* Horizontal band at the lid/base seam */}
              <div
                className="absolute left-0 right-0 top-[36%] h-[13%] overflow-hidden"
                style={{ background: "linear-gradient(90deg, #fff 0%, hsl(38 50% 92%) 100%)" }}
              >
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(190deg, transparent 30%, rgba(255,255,255,0.7) 48%, transparent 66%)" }}
                />
              </div>
              {/* Bow, centered on the seam */}
              <motion.div
                className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9"
                animate={{ scale: bowTight ? 1 : 0.7, opacity: bowTight ? 1 : 0.5 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-3 sm:w-5 sm:h-4 rounded-full bg-white -rotate-12 shadow-sm" />
                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-3 sm:w-5 sm:h-4 rounded-full bg-white rotate-12 shadow-sm" />
                <span
                  className="absolute left-1/2 top-1/2 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full -translate-x-1/2 -translate-y-1/2"
                  style={{ background: "hsl(var(--gold))" }}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}