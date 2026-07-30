// Shared hamper accessories — identical for every product, loaded from
// the actual files in public/images/hamper-animation/. Filenames match
// what's on disk exactly, including the existing "warrenty_card" spelling.
export const HAMPER_ACCESSORIES = [
  { key: "potli", image_url: "/images/hamper-animation/potli.png", label: "Potli Pouch", motion: "rise" },
  { key: "cable", image_url: "/images/hamper-animation/wire_cable.png", label: "Charging Cable", motion: "slide" },
  { key: "pouch", image_url: "/images/hamper-animation/pouch.png", label: "Carry Pouch", motion: "fade" },
  { key: "card", image_url: "/images/hamper-animation/warrenty_card.png", label: "Warranty Card", motion: "bounce" },
];

export const HAMPER_LOGO_URL = "/images/hamper-animation/logo-mark.png";