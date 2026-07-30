import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Manual product image gallery (Hamper -> Earbuds -> Carry Pouch).
// Accepts an optional `layoutId` — when provided, the currently
// displayed image is a motion.img with that layoutId, enabling a
// Framer Motion shared-element flight (e.g. into the Add to Cart
// packaging animation). When omitted, behaves exactly as before.
export default function ProductImageGallery({ images, alt, imgClassName = "", layoutId }) {
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
    return <motion.img layoutId={layoutId} src={list[0]} alt={alt} className={imgClassName} />;
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <motion.img layoutId={layoutId} key={list[index]} src={list[index]} alt={alt} className={imgClassName} />

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