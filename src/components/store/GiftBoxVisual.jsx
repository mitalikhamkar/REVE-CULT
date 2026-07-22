// GiftBoxVisual.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * GiftBoxVisual — premium Signature Box illustration (Framer Motion).
 *
 * mode="idle"      — Homepage box. Fully closed: lid sits flush on the
 *                     base, ONE continuous ribbon wraps lid + seam + base
 *                     + bow, exactly like an unopened wrapped gift. Gentle
 *                     2-4px float, breathing shadow, soft under-glow,
 *                     slow light sweep across the ribbon, tiny sparkles.
 *
 * mode="revealing" — Tap-to-open sequence (~1.1s): box scales up slightly,
 *                     ribbon loosens and fades, lid rotates open from the
 *                     back hinge, warm glow appears inside, sparkles rise.
 *                     Calls onComplete when finished. Ends open + empty.
 *
 * mode="revealed"  — Static open + empty box, held after `revealing`.
 *
 * mode="builder"   — Signature Box page live preview. Lid open and
 *                     attached (not floating), pouch fixed inside,
 *                     earbuds fly in/out on selection change. No ribbon.
 *
 * mode="packing"   — "Add Signature Box to Cart" sequence (~2.3s): earbuds
 *                     slide in beside the pouch → gift note card slides
 *                     into place → everything settles → lid closes → the
 *                     continuous ribbon wraps back around → bow tightens →
 *                     sparkles → soft glow. Calls onComplete when finished
 *                     (parent should navigate to cart immediately).
 */
export default function GiftBoxVisual({
  earbudsImage,
  pouchImage,
  earbudsAlt = "Selected REVE CULT earbuds",
  giftNote,
  mode = "idle",
  playing = false,
  onComplete,
  size = "default", // "default" | "large"
}) {
  const boxSize =
    size === "large" ? "w-64 h-52 sm:w-80 sm:h-64" : "w-52 h-44 sm:w-64 sm:h-52";

  const [step, setStep] = useState(0);

  const isRevealing = mode === "revealing" && playing;
  const isPacking = mode === "packing" && playing;

  useEffect(() => {
    if (!isRevealing && !isPacking) {
      setStep(0);
      return;
    }
    setStep(0);
    const timers = [];
    const schedule = (n, delay) => timers.push(setTimeout(() => setStep(n), delay));

    if (isRevealing) {
      // Total ~1.1s
      schedule(1, 100); // box scales up
      schedule(2, 300); // ribbon loosens
      schedule(3, 450); // lid rotates open (500ms) + inner glow fades in
      schedule(4, 700); // sparkles rise
      schedule(5, 950); // box settles back down
      timers.push(setTimeout(() => onComplete && onComplete(), 1100));
    } else if (isPacking) {
      // Total ~2.3s
      schedule(1, 350); // earbuds slide in beside pouch
      schedule(2, 650); // gift note card slides into place
      schedule(3, 950); // everything settles (brief pause)
      schedule(4, 1150); // lid closes
      schedule(5, 1600); // ribbon wraps back around
      schedule(6, 1950); // bow tightens
      schedule(7, 2100); // sparkles
      schedule(8, 2200); // soft glow
      timers.push(setTimeout(() => onComplete && onComplete(), 2300));
    }
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRevealing, isPacking]);

  const lidOpen =
    mode === "builder" ||
    mode === "revealed" ||
    (mode === "revealing" && step >= 3) ||
    (mode === "packing" && step < 4);

  const showEmptyGlow = mode === "revealed" || (mode === "revealing" && step >= 3);
  const showProducts = mode === "builder" || mode === "packing";

  // Ribbon is ONE continuous piece spanning lid + seam + base, independent
  // of the lid's own rotation — this is what reads as "closed package"
  // instead of "wrapped lid resting on a bare box".
  const ribbonVisible =
    mode === "idle" ||
    (mode === "revealing" && step < 2) ||
    (mode === "packing" && step >= 5);
  const ribbonLoosened = mode === "revealing" && step >= 2 && step < 3;
  const bowTight = !(mode === "packing" && step >= 5 && step < 6);

  const glowActive =
    mode === "idle" ||
    (mode === "revealing" && step >= 3) ||
    mode === "revealed" ||
    (mode === "packing" && step >= 8);
  const sparkleActive =
    (mode === "revealing" && step >= 4 && step < 5) || (mode === "packing" && step >= 7);

  const lidRotate = lidOpen ? -118 : 0;
  const boxScale = mode === "revealing" && step >= 1 && step < 5 ? 1.035 : 1;

  return (
    <div
      className={"relative mx-auto " + boxSize + (mode === "idle" ? " gift-box-idle-float" : "")}
      style={{ perspective: "1200px" }}
    >
      {/* Ground shadow — breathes gently at idle */}
      <div
        className={"absolute left-1/2 bottom-[-8%] w-[68%] h-[14%] rounded-full pointer-events-none" + (mode === "idle" ? " gift-box-idle-shadow" : "")}
        style={{
          transform: "translateX(-50%)",
          background: "radial-gradient(ellipse at center, rgba(150,90,70,0.22) 0%, transparent 72%)",
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
            className="absolute left-1/2 top-[6%] -translate-x-1/2 z-40 pointer-events-none"
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
        {/* Base */}
        <div
          className="absolute inset-x-0 bottom-0 h-[70%] rounded-[22px] overflow-hidden"
          style={{
            background:
              "linear-gradient(165deg, hsl(38 45% 92%) 0%, hsl(var(--blush) / 55%) 55%, hsl(var(--gold) / 45%) 100%)",
            boxShadow: "0 26px 48px -24px rgba(150,90,70,0.4), inset 0 2px 0 rgba(255,255,255,0.55)",
          }}
        >
          <div
            className="absolute inset-x-[6%] bottom-[6%] top-[30%] rounded-2xl"
            style={{
              background: "linear-gradient(180deg, hsl(38 55% 96%) 0%, hsl(30 40% 90%) 100%)",
              boxShadow: "inset 0 2px 6px rgba(150,110,80,0.12)",
            }}
          />

          {/* Warm inner glow once the box is open + empty */}
          {showEmptyGlow && (
            <motion.div
              className="absolute inset-x-0 bottom-[16%] flex items-center justify-center pointer-events-none"
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

          {/* Pouch + Earbuds */}
          {showProducts && (
            <div className="absolute inset-x-0 bottom-[10%] flex items-end justify-center gap-3 sm:gap-4">
              {pouchImage && (
                <img
                  src={pouchImage}
                  alt="REVE CULT premium carry pouch"
                  draggable={false}
                  className="w-11 h-11 sm:w-16 sm:h-16 object-contain drop-shadow-md"
                />
              )}

              <AnimatePresence mode="popLayout">
                {earbudsImage && (
                  <motion.img
                    key={mode === "builder" ? earbudsImage : "earbuds-packing"}
                    src={earbudsImage}
                    alt={earbudsAlt}
                    draggable={false}
                    className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-md"
                    initial={{ opacity: 0, x: 34, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: -34, scale: 0.8 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Gift note card sliding into place during packing */}
          <AnimatePresence>
            {mode === "packing" && step >= 2 && giftNote && (
              <motion.div
                key="note"
                className="absolute inset-x-0 bottom-[24%] flex justify-center"
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div className="px-3 py-1 rounded-lg text-[9px] sm:text-[10px] font-medium text-blush bg-white shadow-sm border border-blush/15 max-w-[80%] truncate">
                  ✦ {giftNote}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[8px] sm:text-[9px] tracking-[0.3em] font-heading text-blush/60">
            REVE CULT
          </p>
        </div>

        {/* Lid — rotates open from the back-bottom hinge, sits flush when closed */}
        <motion.div
          className="absolute inset-x-0 top-0 h-[42%] rounded-[22px] origin-bottom z-20 overflow-hidden"
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
          {!lidOpen && (
            <p
              className="absolute inset-0 flex items-center justify-center text-[10px] sm:text-xs tracking-[0.35em] font-heading"
              style={{ color: "hsl(var(--gold))" }}
            >
              REVE
            </p>
          )}
          {mode === "idle" && (
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

        {/* Continuous ribbon — a single wrap across lid + seam + base + bow.
            Independent of the lid's rotation, which is what makes the idle
            box read as one sealed package instead of a wrapped lid resting
            on a bare box. */}
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
              {/* Vertical band — full height */}
              <div
                className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[14%]"
                style={{ background: "linear-gradient(180deg, #fff 0%, hsl(38 50% 92%) 100%)" }}
              />
              {/* Horizontal band at the lid/base seam */}
              <div
                className="absolute left-0 right-0 top-[38%] h-[14%]"
                style={{ background: "linear-gradient(90deg, #fff 0%, hsl(38 50% 92%) 100%)" }}
              />
              {/* Bow, centered on the seam */}
              <motion.div
                className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 w-7 h-7 sm:w-9 sm:h-9"
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