import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Heart, ShoppingBag, User, Menu, X, ShieldCheck } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { PRODUCTS } from "@/data/products";
import { useAuth } from "@/lib/AuthContext";

export default function Navbar() {
  const { cartCount, cartPulse, wishlist, toggleWishlist } = useStore();
  const { isAuthenticated, user } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const suggestions = searchQuery
    ? PRODUCTS.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.color.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Shop", path: "/shop" },
    { label: "About", path: "/about" },
    { label: "Support", path: "/support" },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "glass shadow-sm" : "bg-cream/60 backdrop-blur-sm"
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 -ml-2 text-foreground"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <span className="text-xl lg:text-2xl font-heading font-semibold tracking-wide text-foreground">
                REVE <span className="text-blush">CULT</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium tracking-wide transition-colors hover:text-blush ${
                    location.pathname === link.path ? "text-blush" : "text-foreground/80"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blush/10 text-blush rounded-full text-xs font-medium hover:bg-blush/20 transition-colors"
                >
                  <ShieldCheck size={13} /> Admin
                </Link>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2.5 hover:bg-accent rounded-full transition-colors"
                aria-label="Search"
              >
                <Search size={20} strokeWidth={1.5} />
              </button>

              <Link
                to="/wishlist"
                className="relative p-2.5 hover:bg-accent rounded-full transition-colors"
                aria-label="Wishlist"
              >
                <Heart size={20} strokeWidth={1.5} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-blush text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className={`relative p-2.5 hover:bg-accent rounded-full transition-all ${
                  cartPulse ? "animate-pulse-gold" : ""
                }`}
                aria-label="Cart"
              >
                <ShoppingBag size={20} strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-blush text-white text-[10px] font-semibold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              <Link
                to={isAuthenticated ? "/profile" : "/login"}
                className="p-2.5 hover:bg-accent rounded-full transition-colors"
                aria-label="Account"
              >
                <User size={20} strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </nav>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-border bg-cream/95 backdrop-blur-md animate-fade-in" ref={searchRef}>
            <div className="max-w-2xl mx-auto px-4 py-4">
              <form onSubmit={handleSearch} className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for earbuds, t-shirts, accessories..."
                  className="w-full pl-12 pr-4 py-3 bg-white rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-blush/40 text-sm"
                />
              </form>
              {suggestions.length > 0 && (
                <div className="mt-2 bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                  {suggestions.map((p) => (
                    <Link
                      key={p.id}
                      to={`/product/${p.slug}`}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors"
                    >
                      <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">₹{p.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {searchQuery && suggestions.length === 0 && (
                <p className="mt-3 text-center text-sm text-muted-foreground">No matches found. Try "earbuds" or "flora".</p>
              )}
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border bg-cream animate-fade-in">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="block px-4 py-3 rounded-xl text-base font-medium hover:bg-accent transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === "admin" && (
                <Link
                  to="/admin"
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-blush hover:bg-blush/10 transition-colors"
                >
                  <ShieldCheck size={18} /> Admin Panel
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}