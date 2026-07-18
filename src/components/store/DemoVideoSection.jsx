import React from "react";
import { Play, Video } from "lucide-react";

export default function DemoVideoSection({ product }) {
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-heading font-light mb-4">See It In Motion</h2>
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-accent to-cream group cursor-pointer">
        <img
          src={product.image_url}
          alt={`${product.name} demo`}
          className="w-full h-full object-cover opacity-60 group-hover:opacity-50 transition-opacity"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <button
            className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
            aria-label="Play demo video"
          >
            <Play size={24} className="text-blush ml-1" fill="currentColor" />
          </button>
          <div className="flex items-center gap-2 text-xs text-foreground/70 bg-white/80 px-3 py-1.5 rounded-full">
            <Video size={14} strokeWidth={1.5} />
            <span>Product demo video — placeholder for AI-generated lifestyle video</span>
          </div>
        </div>
        <span className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm text-[10px] font-medium px-2.5 py-1 rounded-full text-muted-foreground">
          Sample / Placeholder
        </span>
      </div>
      <p className="mt-3 text-xs text-muted-foreground text-center">
        A short lifestyle video showing the {product.name} in use will be added here soon.
      </p>
    </div>
  );
}