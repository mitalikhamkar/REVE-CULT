import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import CompareModal from "@/components/store/CompareModal";

// Single floating "Compare Products" entry point, top-right of the Shop
// page. Always visible — the picking, removing, and comparing all happen
// inside CompareModal now, so this component only needs to open it and
// show a small badge with the current count.
export default function CompareBar() {
  const { compareList } = useStore();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setModalOpen(true)}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ y: -2 }}
        className="fixed top-24 right-4 sm:right-8 z-40 flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-border/50 rounded-full pl-4 pr-3.5 py-2.5 shadow-[0_16px_36px_-18px_rgba(38,30,20,0.35)] hover:border-blush/40 transition-colors"
        aria-label="Compare Products"
      >
        <Scale size={16} strokeWidth={1.75} className="text-blush" />
        <span className="text-sm font-medium text-foreground hidden sm:inline">Compare Products</span>
        <AnimatePresence>
          {compareList.length > 0 && (
            <motion.span
              key="count"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="w-5 h-5 rounded-full bg-blush text-white text-[10px] font-semibold flex items-center justify-center"
            >
              {compareList.length}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {modalOpen && <CompareModal onClose={() => setModalOpen(false)} />}
      </AnimatePresence>
    </>
  );
}