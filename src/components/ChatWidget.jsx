import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Minus, Maximize2 } from "lucide-react";

/* ------------------------------------------------------------------
   Frontend-only chat widget. No backend call is made yet — replace
   the `getReply` function below with a real API call when the
   backend is ready. It already returns a Promise, so swapping it
   for a fetch() to your support/chat endpoint is a one-line change.

   Reply logic is now intent-based instead of one generic line:
   it looks for keywords in the user's message (order, return,
   warranty, payment, shipping, human) and answers accordingly,
   falling back to a general reply if nothing matches. Swap the
   INTENTS table below for a real NLU/LLM call later — the shape
   (input text -> reply text) stays the same.
------------------------------------------------------------------- */

const QUICK_REPLIES = [
  "Track my order",
  "Return an item",
  "Warranty question",
  "Talk to a human",
];

const INTENTS = [
  {
    keywords: ["track", "order status", "where is my order", "shipping status"],
    reply:
      "You can track your order anytime from your profile under Order History — you'll see real-time status from dispatch to delivery. If you have your order number handy, I can also flag it for the team to check manually.",
  },
  {
    keywords: ["return", "exchange", "refund", "send back"],
    reply:
      "Returns are simple — you have 7 days from delivery, and the item just needs to be unused and in its original packaging. Head to Order History and select 'Return this item' to start it, or I can loop in a specialist if it's something more specific.",
  },
  {
    keywords: ["warranty", "defect", "broken", "not working", "stopped working"],
    reply:
      "Every pair of REVE CULT earbuds comes with a 6-month warranty against manufacturing defects. If yours has an issue, tell me a bit about what's happening and I'll get a warranty claim started for you.",
  },
  {
    keywords: ["payment", "pay", "upi", "card declined", "charged twice"],
    reply:
      "We accept cards, UPI, net banking, and major wallets — all payments are SSL-secured. If something looks off with a charge, share the order email and I'll get our payments team to take a look.",
  },
  {
    keywords: ["human", "agent", "person", "real person", "representative"],
    reply:
      "Of course — I'm looping in a REVE CULT support specialist now. They typically respond within a few minutes during business hours (Mon–Sat, 10am–7pm). You can also reach us directly at support@revecult.com.",
  },
  {
    keywords: ["price", "cost", "how much"],
    reply:
      "Pricing for each product is listed on its product page, and any active offers show at checkout. Is there a specific piece you're looking at? I'm happy to point you to it.",
  },
  {
    keywords: ["pair", "connect", "bluetooth", "sync"],
    reply:
      "To pair your earbuds: open the case near your device, hold the button until the LED flashes, then select REVE CULT earbuds in your device's Bluetooth menu. Let me know if they're not showing up and we'll troubleshoot.",
  },
];

function getReply(userText) {
  // TODO(backend): replace this with a real API call, e.g.
  // return fetch('/api/chat', { method: 'POST', body: JSON.stringify({ message: userText }) }).then(r => r.json()).then(d => d.reply);
  const text = userText.toLowerCase();
  const matched = INTENTS.find((intent) => intent.keywords.some((k) => text.includes(k)));
  const reply =
    matched?.reply ||
    "Thanks for reaching out! I've noted your message and a REVE CULT support specialist will follow up shortly. You can also email support@revecult.com any time.";

  return new Promise((resolve) => {
    setTimeout(() => resolve(reply), 900 + Math.random() * 500);
  });
}

function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, from: "bot", text: "Hi! I'm the REVE CULT assistant. How can I help you today?", time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing, open, minimized]);

  // Surface a small "Need help?" hint a few seconds after load, so the
  // button isn't just a static icon easy to scroll past. It fades out
  // on its own and won't reappear once the person opens the chat.
  useEffect(() => {
    if (open) {
      setShowHint(false);
      return;
    }
    const showTimer = setTimeout(() => setShowHint(true), 4000);
    const hideTimer = setTimeout(() => setShowHint(false), 10000);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [open]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg = { id: Date.now(), from: "user", text: trimmed, time: new Date() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setTyping(true);
    const reply = await getReply(trimmed);
    setTyping(false);
    setMessages((m) => [...m, { id: Date.now() + 1, from: "bot", text: reply, time: new Date() }]);
  };

  return (
    <>
      {/* Floating trigger button */}
      <AnimatePresence>
        {!open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            className="fixed bottom-6 right-6 z-[60] flex items-end gap-3"
          >
            {/* Attention hint bubble */}
            <AnimatePresence>
              {showHint && (
                <motion.button
                  initial={{ opacity: 0, x: 10, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 10, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => { setOpen(true); setMinimized(false); }}
                  className="hidden sm:block glass border border-border shadow-lg rounded-2xl px-4 py-2.5 text-sm font-medium text-foreground hover:border-blush/40 transition-colors"
                >
                  Need help? Chat with us
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              onClick={() => { setOpen(true); setMinimized(false); }}
              className="relative w-16 h-16 rounded-full bg-blush shadow-[0_8px_30px_rgba(0,0,0,0.18)] flex items-center justify-center chat-fab-float"
              aria-label="Open support chat"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Expanding ring pulse — draws the eye without being obnoxious */}
              <motion.span
                className="absolute inset-0 rounded-full bg-blush"
                animate={{ scale: [1, 1.6], opacity: [0.45, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.span
                className="absolute inset-0 rounded-full bg-blush"
                animate={{ scale: [1, 1.6], opacity: [0.45, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 1 }}
              />
              <MessageCircle size={26} className="relative text-white" strokeWidth={1.75} />
              <span className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-sage border-2 border-white chat-fab-pulse" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed z-[60] right-4 sm:right-6 bottom-4 sm:bottom-6 w-[calc(100vw-2rem)] sm:w-[380px] bg-white rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col ${
              minimized ? "h-16" : "h-[520px] max-h-[75vh]"
            } transition-[height] duration-300`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blush/15 to-sage/10 border-b border-border shrink-0">
              <div>
                <p className="text-sm font-semibold">REVE CULT Support</p>
                {!minimized && <p className="text-xs text-muted-foreground">Usually replies within a few minutes</p>}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMinimized((m) => !m)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                  aria-label={minimized ? "Expand chat" : "Minimize chat"}
                >
                  {minimized ? <Maximize2 size={14} /> : <Minus size={14} />}
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-black/5 transition-colors"
                  aria-label="Close chat"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!minimized && (
              <>
                {/* Messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex flex-col ${m.from === "user" ? "items-end" : "items-start"}`}>
                      <div
                        className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                          m.from === "user"
                            ? "bg-blush text-white rounded-br-sm"
                            : "bg-accent/50 text-foreground rounded-bl-sm"
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1">{formatTime(m.time)}</span>
                    </div>
                  ))}
                  {typing && (
                    <div className="flex items-start">
                      <div className="bg-accent/50 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground chat-typing-dot" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground chat-typing-dot" style={{ animationDelay: "0.15s" }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground chat-typing-dot" style={{ animationDelay: "0.3s" }} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick replies — only show before the user's first message */}
                {messages.length === 1 && (
                  <div className="px-4 pb-2 flex flex-wrap gap-2">
                    {QUICK_REPLIES.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-blush/50 hover:bg-blush/5 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}

                {/* Input */}
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                  className="flex items-center gap-2 px-4 py-3 border-t border-border shrink-0"
                >
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40"
                  />
                  <button
                    type="submit"
                    className="w-10 h-10 rounded-full bg-blush text-white flex items-center justify-center hover:bg-blush/90 transition-colors shrink-0"
                    aria-label="Send message"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}