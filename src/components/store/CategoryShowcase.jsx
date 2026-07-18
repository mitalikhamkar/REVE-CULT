import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Premium editorial "Shop by Category" cards. Each card simulates a
// looping lifestyle video by cycling through local images with a
// gentle fade + vertical slide. Every card animates on its own timer
// (staggered offsets) so the section always feels alive.
//
// Card -> Shop page link uses the existing `q` search param (see
// Shop.jsx), matched against each product's `category`/`collection`
// fields — no changes to Shop.jsx or its filtering logic needed.

const CATEGORIES = [
  {
    key: "earbuds",
    name: "EARBUDS",
    description: "Premium Wireless Audio",
    query: "earbuds",
    interval: 3600,
    offset: 0,
    images: [
      "/images/airpods/REVE FLORA - Golden Beige.png",
      "/images/airpods/REVE SERAPH - Silver Black.png",
      "/images/airpods/REVE FLORA - Golden Black.png",
      "/images/airpods/REVE SERAPH - Mint Green.png",
      "/images/airpods/REVE SERAPH - Silver White.png",
    ],
  },
  {
    key: "apparel",
    name: "APPAREL",
    description: "Minimal Everyday Apparel",
    query: "apparel",
    interval: 3400,
    offset: 1200,
    images: [
      "/images/apparel/Tshirt_wearing.png",
      "/images/apparel/Tshirt_front.png",
      "/images/apparel/Tshirt_folded.png",
      "/images/apparel/REVE Tshirt.png",
    ],
  },
  {
    key: "accessories",
    name: "ACCESSORIES",
    description: "Carry Your Essentials",
    query: "accessories",
    interval: 3800,
    offset: 2200,
    images: [
      "/images/accessories/Carry pouch_hands.png",
      "/images/accessories/Carry pouch_desk.png",
      "/images/accessories/Carry pouch_airpods.png",
      "/images/accessories/Carry pouch.png",
      "/images/accessories/Carry pouch_basic.png",
    ],
  },
];

const CROSSFADE_MS = 800;

/** Cycles through `images` on its own staggered timer, crossfading
 * (fade + slight vertical slide) between each. */
function CategoryImageCycle({ images, interval, offset }) {
  const [index, setIndex] = useState(0);
  const [prevSrc, setPrevSrc] = useState(null);
  const prevIndexRef = useRef(0);
  const fadeTimeoutRef = useRef(null);

  useEffect(() => {
    let intervalId;
    const startTimeout = setTimeout(() => {
      setIndex((i) => (i + 1) % images.length);
      intervalId = setInterval(() => {
        setIndex((i) => (i + 1) % images.length);
      }, interval);
    }, offset + interval);

    return () => {
      clearTimeout(startTimeout);
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (prevIndexRef.current === index) return;
    setPrevSrc(images[prevIndexRef.current]);
    prevIndexRef.current = index;
    if (fadeTimeoutRef.current) clearTimeout(fadeTimeoutRef.current);
    fadeTimeoutRef.current = setTimeout(() => setPrevSrc(null), CROSSFADE_MS);
    return () => clearTimeout(fadeTimeoutRef.current);
  }, [index, images]);

  const current = images[index];

  return (
    <>
      {prevSrc && (
        <img
          src={prevSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover category-img-out"
        />
      )}
      <img
        key={current}
        src={current}
        alt=""
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover category-img-in"
      />
    </>
  );
}

function CategoryCard({ cat }) {
  return (
    <Link
      to={`/shop?q=${encodeURIComponent(cat.query)}`}
      className="group relative block h-[430px] lg:h-[460px] rounded-[28px] overflow-hidden bg-cream shadow-[0_10px_30px_-12px_rgba(0,0,0,0.18)] hover:shadow-[0_24px_50px_-14px_rgba(0,0,0,0.28)] transition-all duration-300 ease-out hover:scale-[1.02]"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="w-full h-full transition-transform duration-500 ease-out group-hover:scale-[1.05]">
          <CategoryImageCycle images={cat.images} interval={cat.interval} offset={cat.offset} />
        </div>
      </div>

      {/* Readability gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-7">
        <h3 className="text-white text-2xl lg:text-[26px] font-heading font-light tracking-wide mb-1.5">
          {cat.name}
        </h3>
        <p className="text-white/80 text-sm mb-3">{cat.description}</p>
        <span className="inline-flex items-center gap-1.5 text-white text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          Explore Collection <ArrowRight size={14} />
        </span>
      </div>
    </Link>
  );
}

export default function CategoryShowcase() {
  // Preload every category image once, up front.
  useEffect(() => {
    CATEGORIES.forEach((cat) => {
      cat.images.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    });
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">Shop by Category</p>
        <h2 className="text-3xl lg:text-4xl font-heading font-light">Discover the REVE CULT Lifestyle</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
        {CATEGORIES.map((cat, i) => (
          <div key={cat.key} className={i === 2 ? "sm:col-span-2 lg:col-span-1" : ""}>
            <CategoryCard cat={cat} />
          </div>
        ))}
      </div>
    </section>
  );
}