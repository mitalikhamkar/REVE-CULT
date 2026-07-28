// Shared price formatter for anywhere a product price is displayed
// (product cards, carousels, rotating showcase, shop grid, quick view,
// cart, etc). Formats as "₹ 1,499" — space after the symbol, Indian
// digit grouping — instead of "₹1499".
//
// Suggested location: src/lib/formatPrice.js

export function formatPrice(price) {
  const num = Number(price);
  if (Number.isNaN(num)) return `₹ ${price}`;
  return `₹ ${num.toLocaleString("en-IN")}`;
}