// SignatureBox.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { useStore } from "@/context/StoreContext";
import GiftBoxVisual from "@/components/store/GiftBoxVisual";

const EARBUD_OPTIONS = PRODUCTS.filter((p) => p.category.toLowerCase().includes("earbuds"));
const CARRY_POUCH = PRODUCTS.find((p) => p.id === "p2");

const GIFT_FOR_OPTIONS = ["Mother", "Sister", "Friend", "Partner", "Family", "Myself"];

const MESSAGE_SUGGESTIONS = [
  "Hope you love this gift!",
  "Made with love.",
  "Thinking of you.",
];

export default function SignatureBox() {
  const { addToCart } = useStore();
  const navigate = useNavigate();

  const [selectedId, setSelectedId] = useState(EARBUD_OPTIONS[0]?.id);
  const [giftFor, setGiftFor] = useState(null);
  const [message, setMessage] = useState("");
  // idle -> packing -> success -> (navigate to cart)
  const [phase, setPhase] = useState("idle");

  const selectedEarbuds = useMemo(
    () => EARBUD_OPTIONS.find((p) => p.id === selectedId) || EARBUD_OPTIONS[0],
    [selectedId]
  );

  const totalPrice = (selectedEarbuds?.price || 0) + (CARRY_POUCH?.price || 0);

  useEffect(() => {
    if (phase !== "success") return;
    const hamperImage = selectedEarbuds?.hamper_image_url || selectedEarbuds?.image_url;
    addToCart(
      {
        id: `signature-box-${selectedEarbuds.id}`,
        name: "REVE CULT Signature Box",
        image_url: hamperImage,
        price: totalPrice,
        type: "signature-box",
        earbuds: { name: selectedEarbuds.name },
        pouch: { name: CARRY_POUCH?.name },
        giftRecipient: giftFor,
        giftNote: message.trim() || null,
      },
      1
    );
    const t = setTimeout(() => navigate("/cart"), 1200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const isPacking = phase === "packing";
  const boxMode = phase === "success" ? "wrapped" : isPacking ? "packing" : "builder";

  return (
    <section className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-10 lg:mb-12">
          <p className="text-xs uppercase tracking-[0.2em] text-blush mb-2">Premium Gifting</p>
          <h1 className="text-3xl lg:text-5xl font-heading font-light mb-4">Create Your Signature Box</h1>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Choose your favourite REVE CULT earbuds and we'll package them inside our premium signature gift box.
          </p>
        </div>

        <div className="grid lg:grid-cols-[45%_55%] gap-10 lg:gap-14 items-start">
          {/* LEFT — box visual */}
          <div className="lg:sticky lg:top-24">
            <div
              className="rounded-[32px] border border-white/70 p-8 sm:p-10 lg:p-12 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[440px]"
              style={{
                background:
                  "linear-gradient(150deg, hsl(var(--blush) / 14%) 0%, hsl(var(--cream)) 55%, hsl(var(--gold) / 12%) 100%)",
                boxShadow: "0 30px 70px -40px rgba(196,120,120,0.26)",
              }}
            >
              <GiftBoxVisual
                mode={boxMode}
                playing={isPacking}
                onComplete={() => setPhase("success")}
                earbudsImage={selectedEarbuds?.image_url}
                earbudsAlt={selectedEarbuds?.name}
                pouchImage={CARRY_POUCH?.image_url}
                giftNote={message.trim()}
                size="large"
              />

              <AnimatePresence mode="wait">
                {phase === "idle" && (
                  <motion.p
                    key="preview-label"
                    className="text-xs text-muted-foreground mt-6 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Live preview — updates as you choose
                  </motion.p>
                )}
                {phase === "success" && (
                  <motion.p
                    key="success-label"
                    className="text-sm sm:text-base font-heading font-light text-blush mt-6 text-center"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    Your Signature Box is Ready ✨
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT — control panel */}
          <div className="space-y-8">
            {/* Choose Your Earbuds */}
            <div>
              <h2 className="text-xl font-heading font-light mb-5">Choose Your Earbuds</h2>
              <div className="flex flex-col gap-3">
                {EARBUD_OPTIONS.map((p) => {
                  const isSelected = p.id === selectedEarbuds?.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedId(p.id)}
                      disabled={phase !== "idle"}
                      className={
                        "flex items-center gap-4 text-left rounded-2xl border bg-white p-3 sm:p-4 transition-all duration-300 ease-out disabled:cursor-not-allowed " +
                        (isSelected ? "border-blush scale-[1.01]" : "border-border hover:border-blush/40")
                      }
                      style={{
                        boxShadow: isSelected
                          ? "0 16px 30px -16px hsl(var(--blush) / 45%), 0 0 0 1px hsl(var(--blush) / 30%)"
                          : "0 6px 14px -10px rgba(0,0,0,0.10)",
                      }}
                    >
                      <span
                        className={
                          "w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center " +
                          (isSelected ? "border-blush" : "border-border")
                        }
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-blush" />}
                      </span>
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-accent/40 shrink-0">
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">{p.name}</p>
                        <p className="text-sm font-heading font-semibold text-blush mt-1">₹{p.price}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gift For */}
            <div>
              <h2 className="text-xl font-heading font-light mb-4">Gift For</h2>
              <div className="flex flex-wrap gap-2.5">
                {GIFT_FOR_OPTIONS.map((label) => {
                  const isSelected = giftFor === label;
                  return (
                    <button
                      key={label}
                      onClick={() => setGiftFor(isSelected ? null : label)}
                      disabled={phase !== "idle"}
                      className={
                        "px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300 disabled:cursor-not-allowed " +
                        (isSelected
                          ? "bg-blush text-white border-blush scale-[1.03] shadow-[0_8px_18px_-10px_hsl(var(--blush)/60%)]"
                          : "bg-white text-foreground border-border hover:border-blush/40")
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Personal Message */}
            <div>
              <h2 className="text-xl font-heading font-light mb-4">Personal Message</h2>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={phase !== "idle"}
                placeholder="Write your message..."
                rows={3}
                className="w-full rounded-2xl border border-border bg-white p-4 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blush/40 resize-none disabled:opacity-70"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {MESSAGE_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setMessage(s)}
                    disabled={phase !== "idle"}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-accent/60 text-foreground border border-border/60 hover:border-blush/40 hover:bg-white transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Card */}
            <div
              className="rounded-2xl border border-white/70 p-5 sm:p-6"
              style={{
                background: "linear-gradient(150deg, rgba(255,255,255,0.85) 0%, hsl(var(--blush)/10%) 100%)",
                backdropFilter: "blur(10px)",
                boxShadow: "0 20px 46px -30px rgba(196,120,120,0.32)",
              }}
            >
              <h3 className="text-sm font-heading font-medium mb-4">Order Summary</h3>
              <div className="flex items-center justify-between mb-1.5 text-sm">
                <span className="text-muted-foreground">Carry Pouch</span>
                <span className="text-foreground">₹{CARRY_POUCH?.price}</span>
              </div>
              <div className="flex items-center justify-between mb-3 text-sm">
                <span className="text-muted-foreground">{selectedEarbuds?.name}</span>
                <span className="text-foreground">₹{selectedEarbuds?.price}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border overflow-hidden">
                <span className="text-sm font-medium text-foreground">Final Price</span>
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={totalPrice}
                    className="text-xl font-heading font-semibold text-blush inline-block"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  >
                    ₹{totalPrice}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-foreground rounded-full text-sm font-medium hover:bg-accent transition-all border border-border min-h-[48px]"
              >
                Continue Shopping
              </Link>
              <button
                onClick={() => setPhase("packing")}
                disabled={phase !== "idle"}
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-all hover:scale-[1.01] min-h-[48px] disabled:opacity-70 disabled:cursor-default"
              >
                <ShoppingBag size={16} />
                Add Signature Box to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}