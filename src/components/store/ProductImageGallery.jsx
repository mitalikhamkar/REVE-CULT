import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Manual product image gallery (Hamper -> Earbuds -> Carry Pouch).
// - Desktop: left/right arrows + dot indicators, appear on card hover
//   (relies on the parent element having the existing `group` class).
// - Mobile: swipe left/right.
// - No auto-rotation, ever.
// - If only one image is passed, renders a plain <img> with no controls
//   so single-image products (apparel, accessories) are unaffected.
//
// Usage: drop this in place of the existing <img> — pass the same
// className you were using on the <img> as `imgClassName` so sizing,
// object-fit, and hover-scale transitions stay identical.
export default function ProductImageGallery({ images, alt, imgClassName = "" }) {
  const list = images && images.length > 0 ? images : [];
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  const hasMultiple = list.length > 1;

  const goTo = (i) => setIndex((i + list.length) % list.length);
  const goPrev = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    goTo(index - 1);
  };
  const goNext = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    goTo(index + 1);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  if (list.length === 0) return null;

  if (!hasMultiple) {
    return <img src={list[0]} alt={alt} className={imgClassName} />;
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <img key={list[index]} src={list[index]} alt={alt} className={imgClassName} />

      {/* Desktop arrows — manual navigation only, revealed on hover */}
      <button
        onClick={goPrev}
        aria-label="Previous image"
        className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 backdrop-blur-sm items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white z-20"
      >
        <ChevronLeft size={14} />
      </button>
      <button
        onClick={goNext}
        aria-label="Next image"
        className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white/85 backdrop-blur-sm items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white z-20"
      >
        <ChevronRight size={14} />
      </button>

      {/* Dot indicators — tappable on mobile, visible on desktop hover */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 z-20 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
        {list.map((_, i) => (
          <button
            key={i}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goTo(i);
            }}
            aria-label={`View image ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "bg-white w-3.5" : "bg-white/60 w-1.5"
            }`}
          />
        ))}
      </div>
    </div>
  );
}