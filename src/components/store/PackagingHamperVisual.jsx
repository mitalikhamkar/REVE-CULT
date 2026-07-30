import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HAMPER_LOGO_URL } from "@/data/hamperAssets";

const ACCESSORY_VARIANTS = {
  fade: {
    initial: { opacity: 0, y: 10, scale: 0.92 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.92 },
    transition: { type: "spring", stiffness: 140, damping: 20 },
  },
  slide: {
    initial: { opacity: 0, x: 26, rotate: -8 },
    animate: { opacity: 1, x: 0, rotate: 0 },
    exit: { opacity: 0, x: 18, rotate: -6 },
    transition: { type: "spring", stiffness: 130, damping: 17 },
  },
  bounce: {
    initial: { opacity: 0, y: -14, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.85 },
    transition: { type: "spring", stiffness: 210, damping: 14 },
  },
  rise: {
    initial: { opacity: 0, y: 18, rotate: 6, scale: 0.88 },
    animate: { opacity: 1, y: 0, rotate: 0, scale: 1 },
    exit: { opacity: 0, y: 12, rotate: 4, scale: 0.9 },
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

const COMPLETION_SOUND_SRC = "/audio/hamper-complete.mp3";

export default function PackagingHamperVisual({
  productImage,
  productAlt = "Selected product",
  productLayoutId,
  accessories = [],
  playing = false,
  reducedMotion = false,
  onComplete,
  size = "large",
}) {
  const boxSize = size === "large" ? "w-72 h-56 sm:w-96 sm:h-72" : "w-56 h-44 sm:w-72 sm:h-56";

  const totalItemSteps = 1 + accessories.length;
  const settleStep = totalItemSteps + 1;
  const closeStep = totalItemSteps + 2;
  const logoStep = totalItemSteps + 3;

  const [step, setStep] = useState(0);
  const soundPlayedRef = useRef(false);

  const playCompletionSound = () => {
    if (soundPlayedRef.current) return;
    soundPlayedRef.current = true;
    try {
      const audio = new Audio(COMPLETION_SOUND_SRC);
      audio.volume = 0.55;
      audio.play().catch(() => {});
    } catch {
      // no-op
    }
  };

  useEffect(() => {
    if (!playing) {
      setStep(0);
      soundPlayedRef.current = false;
      return;
    }

    if (reducedMotion) {
      setStep(closeStep);
      const t = setTimeout(() => {
        setStep(logoStep);
        playCompletionSound();
        setTimeout(() => onComplete && onComplete(), 450);
      }, 400);
      return () => clearTimeout(t);
    }

    setStep(0);
    soundPlayedRef.current = false;
    const timers = [];
    const STEP_MS = 820;
    for (let i = 1; i <= totalItemSteps; i++) {
      timers.push(setTimeout(() => setStep(i), i * STEP_MS));
    }
    const settleAt = totalItemSteps * STEP_MS + 500;
    timers.push(setTimeout(() => setStep(settleStep), settleAt));
    const closeAt = settleAt + 900;
    timers.push(setTimeout(() => setStep(closeStep), closeAt));
    const logoAt = closeAt + 950;
    timers.push(
      setTimeout(() => {
        setStep(logoStep);
        playCompletionSound();
      }, logoAt)
    );
    timers.push(setTimeout(() => onComplete && onComplete(), logoAt + 850));

    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, reducedMotion]);

  const isClosed = step >= closeStep;
  const showLogo = step >= logoStep;

  const springSoft = { type: "spring", stiffness: 120, damping: 18 };
  const springSettle = { type: "spring", stiffness: 90, damping: 16 };

  // Only apply our own fade/blur entrance when there is NO shared
  // layoutId — i.e. no live "flight" is already handling the entrance.
  // When a layoutId IS present (Quick View), initial={false} lets the
  // shared-layout transition be the ONLY entrance animation, avoiding
  // a double-animation where the product appears to arrive twice.
  const productInitial = productLayoutId
    ? false
    : { opacity: 0, scale: 0.85, filter: "blur(6px)" };

  return (
    <div className={"relative mx-auto " + boxSize}>
      <div
        className="absolute left-1/2 bottom-[-8%] w-[68%] h-[12%] rounded-full pointer-events-none"
        style={{
          transform: "translateX(-50%)",
          background: "radial-gradient(ellipse at center, rgba(30,18,10,0.32) 0%, transparent 72%)",
          filter: "blur(14px)",
        }}
      />

      <motion.div
        className="relative w-full h-full"
        animate={{ scale: isClosed ? 1 : 1.015 }}
        transition={springSoft}
      >
        {/* OPEN HAMPER */}
        <AnimatePresence>
          {!isClosed && (
            <motion.div
              key="hamper-open"
              className="absolute inset-0 rounded-[28px] overflow-hidden"
              style={{
                background:
                  "linear-gradient(165deg, hsl(30 35% 88%) 0%, hsl(25 40% 76%) 55%, hsl(20 45% 62%) 100%)",
                boxShadow: "0 28px 50px -22px rgba(60,35,15,0.42), inset 0 2px 0 rgba(255,255,255,0.35)",
              }}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.01 }}
              transition={springSettle}
            >
              <motion.div
                className="absolute inset-x-0 top-0 h-1/2 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse at 50% 0%, hsl(35 70% 75% / 55%) 0%, transparent 70%)",
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />

              <div
                className="absolute inset-[7%] rounded-2xl"
                style={{
                  background: "linear-gradient(180deg, hsl(35 45% 95%) 0%, hsl(28 30% 87%) 100%)",
                  boxShadow: "inset 0 5px 12px rgba(80,50,25,0.2)",
                }}
              />

              <div className="absolute inset-x-0 top-[18%] flex items-center justify-center">
                <AnimatePresence>
                  {step >= 1 && productImage && (
                    <motion.img
                      key="product"
                      layoutId={productLayoutId}
                      src={productImage}
                      alt={productAlt}
                      draggable={false}
                      className="w-20 h-20 sm:w-28 sm:h-28 object-contain drop-shadow-xl"
                      initial={productInitial}
                      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ ...springSoft, filter: { duration: 0.5, ease: "easeOut" } }}
                    />
                  )}
                </AnimatePresence>
              </div>

              <div className="absolute inset-x-0 bottom-[13%] flex items-end justify-center gap-2.5 sm:gap-3.5">
                {accessories.map((acc, idx) => {
                  const accStep = idx + 2;
                  const variant = ACCESSORY_VARIANTS[acc.motion] || ACCESSORY_VARIANTS.fade;
                  return (
                    <AnimatePresence key={acc.key}>
                      {step >= accStep && (
                        <motion.img
                          src={acc.image_url}
                          alt={acc.label || acc.key}
                          draggable={false}
                          className="w-8 h-8 sm:w-11 sm:h-11 object-contain drop-shadow-md"
                          initial={variant.initial}
                          animate={variant.animate}
                          exit={variant.exit}
                          transition={variant.transition}
                        />
                      )}
                    </AnimatePresence>
                  );
                })}
              </div>

              {step >= settleStep && (
                <motion.div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)",
                  }}
                  initial={{ x: "-120%" }}
                  animate={{ x: "120%" }}
                  transition={{ duration: 1.1, ease: "easeInOut" }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CLOSED HAMPER — matte lid, logo dead-center on the lid */}
        <AnimatePresence>
          {isClosed && (
            <motion.div
              key="hamper-closed"
              className="absolute inset-0 rounded-[28px] overflow-hidden flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(155deg, hsl(25 35% 42%) 0%, hsl(20 40% 30%) 45%, hsl(15 45% 20%) 100%)",
                boxShadow: "0 28px 50px -22px rgba(30,18,10,0.5), inset 0 2px 0 rgba(255,255,255,0.1)",
                transformOrigin: "top",
              }}
              initial={{ opacity: 0, scaleY: 0.85 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={springSettle}
            >
              <div
                className="absolute inset-x-[8%] top-[30%] h-px"
                style={{ background: "rgba(255,255,255,0.1)" }}
              />

              <AnimatePresence>
                {showLogo && (
                  <motion.div
                    key="logo"
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
                    initial={{ opacity: 0, scale: 0.88 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.55, ease: "easeOut" }}
                  >
                    <img
                      src={HAMPER_LOGO_URL}
                      alt="REVE CULT"
                      className="h-11 sm:h-14 w-auto object-contain"
                      style={{
                        filter: "brightness(2.1) saturate(1.15) drop-shadow(0 1px 2px rgba(0,0,0,0.35))",
                      }}
                      draggable={false}
                    />
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(115deg, transparent 35%, rgba(255,255,255,0.8) 50%, transparent 65%)",
                        mixBlendMode: "overlay",
                      }}
                      initial={{ x: "-140%" }}
                      animate={{ x: "140%" }}
                      transition={{ duration: 0.9, ease: "easeInOut", delay: 0.2 }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}