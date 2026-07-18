import React, { useEffect, useRef, useState } from "react";

// Editorial hero gallery — premium magazine-style collage.
// Large lifestyle image rotates slowly (~9s), the four smaller
// images rotate faster (~3.5s) through the remaining pool so the
// same photo is never shown twice at once. Transitions are a
// directional slide + fade (images "rearrange" rather than swap).

const GALLERY_IMAGES = [
  "/images/hero/REVE FLORA - Golden_Beige_AI.png",
  "/images/hero/REVE FLORA - Golden_Black_AI.png",
  "/images/hero/REVE SERAPH - Mint_Green_AI.png",
  "/images/hero/REVE SERAPH - Silver_Black_AI.png",
  "/images/hero/REVE SERAPH - Silver_White_AI.png",
];

const LARGE_INTERVAL = 9000;
const SMALL_INTERVAL = 3500;
const CROSSFADE_MS = 800;

/**
 * Crossfades between images with a directional slide: the outgoing
 * image gently drifts out while fading, and the incoming image
 * drifts into place while fading in — a rearrange, not a swap.
 */
function CrossfadeImage({ src, alt, direction = "up", priority = false }) {
  const [current, setCurrent] = useState(src);
  const [previous, setPrevious] = useState(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (src === current) return;
    setPrevious(current);
    setCurrent(src);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPrevious(null), CROSSFADE_MS);
    return () => clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  useEffect(() => () => timeoutRef.current && clearTimeout(timeoutRef.current), []);

  return (
    <>
      {previous && (
        <img
          src={previous}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover hero-gallery-out-${direction}`}
        />
      )}
      <img
        key={current}
        src={current}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
        className={`absolute inset-0 w-full h-full object-cover hero-gallery-in-${direction}`}
      />
    </>
  );
}

function GalleryTile({ src, alt, priority, direction, floatDelay, className = "" }) {
  return (
    <div
      className={`relative rounded-[18px] overflow-hidden bg-white/40 shadow-[0_2px_10px_rgba(0,0,0,0.05)] hover:shadow-[0_14px_32px_rgba(0,0,0,0.14)] transition-shadow duration-300 hero-gallery-float ${className}`}
      style={{ animationDelay: floatDelay }}
    >
      <div className="w-full h-full transition-transform duration-300 ease-out will-change-transform hover:scale-[1.025]">
        <CrossfadeImage src={src} alt={alt} direction={direction} priority={priority} />
      </div>
    </div>
  );
}

export default function HeroGallery() {
  const [largeIndex, setLargeIndex] = useState(0);
  const [smallOffset, setSmallOffset] = useState(0);

  useEffect(() => {
    const largeTimer = setInterval(() => {
      setLargeIndex((i) => (i + 1) % GALLERY_IMAGES.length);
    }, LARGE_INTERVAL);
    return () => clearInterval(largeTimer);
  }, []);

  useEffect(() => {
    const smallTimer = setInterval(() => {
      setSmallOffset((o) => (o + 1) % GALLERY_IMAGES.length);
    }, SMALL_INTERVAL);
    return () => clearInterval(smallTimer);
  }, []);

  // Preload every hero image once, up front, to avoid layout shift / pop-in.
  useEffect(() => {
    GALLERY_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const largeSrc = GALLERY_IMAGES[largeIndex];
  const remaining = GALLERY_IMAGES.filter((_, i) => i !== largeIndex);
  const smallSrcs = [0, 1, 2, 3].map((i) => remaining[(smallOffset + i) % remaining.length]);

  return (
    <div
      className="relative rounded-[28px] border border-border/60 p-3.5 sm:p-5 lg:p-6 hero-gallery-load-in"
      style={{
        backgroundColor: "#FAF8F4",
        boxShadow: "0 20px 60px -20px rgba(0,0,0,0.12)",
        animationDelay: "0.15s",
      }}
    >
      <div
        className="grid gap-2 sm:gap-3"
        style={{
          gridTemplateColumns: "1.4fr 1fr",
          gridTemplateRows: "repeat(3, minmax(0, 1fr))",
          aspectRatio: "4 / 4.6",
        }}
      >
        <GalleryTile
          src={largeSrc}
          alt="REVE CULT — editorial lifestyle image"
          priority
          direction="up"
          floatDelay="0s"
          className="[grid-column:1] [grid-row:1/3]"
        />
        <GalleryTile
          src={smallSrcs[0]}
          alt="REVE CULT product detail"
          direction="side"
          floatDelay="0.6s"
          className="[grid-column:2] [grid-row:1]"
        />
        <GalleryTile
          src={smallSrcs[1]}
          alt="REVE CULT product detail"
          direction="side-reverse"
          floatDelay="1.2s"
          className="[grid-column:2] [grid-row:2]"
        />
        <GalleryTile
          src={smallSrcs[2]}
          alt="REVE CULT product detail"
          direction="up"
          floatDelay="0.9s"
          className="[grid-column:1] [grid-row:3]"
        />
        <GalleryTile
          src={smallSrcs[3]}
          alt="REVE CULT product detail"
          direction="side"
          floatDelay="0.3s"
          className="[grid-column:2] [grid-row:3]"
        />
      </div>
    </div>
  );
}