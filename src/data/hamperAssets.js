// Shared hamper accessories — identical for every product. Only the
// earbuds image varies per product, read from product.hamper_image_url
// (falls back to product.image_url if a bg-removed version isn't set yet).
export const HAMPER_ACCESSORIES = [
  { key: "potli", image_url: "/images/hamper-animation/potli.png", label: "Potli Pouch" },
  { key: "cable", image_url: "/images/hamper-animation/cable.png", label: "Charging Cable" },
  { key: "pouch", image_url: "/images/hamper-animation/pouch.png", label: "Carry Pouch" },
  { key: "card", image_url: "/images/hamper-animation/card.png", label: "Welcome Card" },
];