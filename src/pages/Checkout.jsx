import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Check, ChevronRight, Lock, CreditCard, Smartphone, Wallet, Building2, ShieldCheck } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useAuth } from "@/lib/AuthContext";
import { entities } from "@/api/entities";

const SHIPPING_METHODS = [
  { id: "standard", label: "Standard Delivery", desc: "3-5 business days", price: 0 },
  { id: "express", label: "Express Delivery", desc: "1-2 business days", price: 99 },
  { id: "sameday", label: "Same-Day Delivery", desc: "Within city limits", price: 149 },
];

const PAYMENT_METHODS = [
  { id: "card", label: "Credit / Debit Card", icon: CreditCard, desc: "Visa, Mastercard, RuPay" },
  { id: "upi", label: "UPI", icon: Smartphone, desc: "GPay, PhonePe, Paytm" },
  { id: "netbanking", label: "Net Banking", icon: Building2, desc: "All major banks" },
  { id: "wallet", label: "Wallet", icon: Wallet, desc: "Paytm, Amazon Pay" },
];

export default function Checkout() {
  const { cart, cartSubtotal, clearCart } = useStore();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [processing, setProcessing] = useState(false);
  const [address, setAddress] = useState({
    full_name: user?.full_name || "",
    phone: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const shippingCost = SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.price || 0;
  const total = cartSubtotal + shippingCost;

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-heading mb-4">Your bag is empty</h1>
        <Link to="/shop" className="text-blush hover:underline">Continue shopping</Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    setProcessing(true);
    try {
      const orderNumber = "RC" + Date.now().toString().slice(-8);
      const estimatedDelivery = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const trackingNumber = "TRK" + Math.random().toString(36).substring(2, 12).toUpperCase();

      await entities.Order.create({
        order_number: orderNumber,
        status: "confirmed",
        items: cart.map((item) => ({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          price: item.product_price,
        })),
        subtotal: cartSubtotal,
        shipping_cost: shippingCost,
        total,
        shipping_address: address,
        shipping_method: SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.label,
        payment_method: PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label,
        payment_status: "paid",
        tracking_number: trackingNumber,
        estimated_delivery: estimatedDelivery,
        customer_name: address.full_name,
        customer_email: user?.email || "guest@revecult.com",
      });

      clearCart();
      navigate(`/order-confirmation?order=${orderNumber}`, {
        state: { orderNumber, total, trackingNumber, estimatedDelivery, email: user?.email, items: cart },
      });
    } catch (e) {
      setProcessing(false);
    }
  };

  const steps = [
    { num: 1, label: "Address" },
    { num: 2, label: "Shipping" },
    { num: 3, label: "Payment" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="text-xs text-muted-foreground mb-4">
        <Link to="/" className="hover:text-foreground">Home</Link> <span className="mx-1">/</span>
        <Link to="/cart" className="hover:text-foreground">Cart</Link> <span className="mx-1">/</span>
        <span className="text-foreground">Checkout</span>
      </nav>

      <h1 className="text-3xl lg:text-4xl font-heading font-light mb-6">Checkout</h1>

      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                step >= s.num ? "bg-blush text-white" : "bg-accent text-muted-foreground"
              }`}>
                {step > s.num ? <Check size={14} /> : s.num}
              </div>
              <span className={`text-sm font-medium ${step >= s.num ? "text-foreground" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${step > s.num ? "bg-blush" : "bg-border"}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="p-6 bg-white rounded-2xl border border-border animate-fade-in">
              <h2 className="text-lg font-heading font-medium mb-4">Shipping Address</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <input type="text" required placeholder="Full name" value={address.full_name} onChange={(e) => setAddress({ ...address, full_name: e.target.value })} className="px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40" />
                <input type="tel" required placeholder="Phone number" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} className="px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40" />
                <input type="text" required placeholder="Address line 1" value={address.address_line1} onChange={(e) => setAddress({ ...address, address_line1: e.target.value })} className="sm:col-span-2 px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40" />
                <input type="text" placeholder="Address line 2 (optional)" value={address.address_line2} onChange={(e) => setAddress({ ...address, address_line2: e.target.value })} className="sm:col-span-2 px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40" />
                <input type="text" required placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40" />
                <input type="text" required placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40" />
                <input type="text" required placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} className="px-4 py-2.5 rounded-xl border border-border bg-cream/50 text-sm focus:outline-none focus:ring-2 focus:ring-blush/40" />
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!address.full_name || !address.phone || !address.address_line1 || !address.city || !address.state || !address.pincode}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[48px]"
              >
                Continue to Shipping <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Shipping */}
          {step === 2 && (
            <div className="p-6 bg-white rounded-2xl border border-border animate-fade-in">
              <h2 className="text-lg font-heading font-medium mb-4">Shipping Method</h2>
              <div className="space-y-3">
                {SHIPPING_METHODS.map((m) => (
                  <label key={m.id} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    shippingMethod === m.id ? "border-blush bg-blush/5" : "border-border hover:border-blush/40"
                  }`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" name="shipping" checked={shippingMethod === m.id} onChange={() => setShippingMethod(m.id)} className="w-4 h-4 text-blush" />
                      <div>
                        <p className="text-sm font-medium">{m.label}</p>
                        <p className="text-xs text-muted-foreground">{m.desc}</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">{m.price === 0 ? "Free" : `₹${m.price}`}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep(1)} className="px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                <button onClick={() => setStep(3)} className="inline-flex items-center gap-2 px-6 py-3 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors min-h-[48px]">
                  Continue to Payment <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 3 && (
            <div className="p-6 bg-white rounded-2xl border border-border animate-fade-in">
              <h2 className="text-lg font-heading font-medium mb-1">Payment Method</h2>
              <p className="text-xs text-muted-foreground mb-4">This is a prototype — no real payment will be processed.</p>
              <div className="space-y-3">
                {PAYMENT_METHODS.map((m) => (
                  <label key={m.id} className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === m.id ? "border-blush bg-blush/5" : "border-border hover:border-blush/40"
                  }`}>
                    <input type="radio" name="payment" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} className="w-4 h-4 text-blush" />
                    <m.icon size={18} strokeWidth={1.5} className="text-foreground/70" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-xs text-muted-foreground">{m.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Mock card form */}
              {paymentMethod === "card" && (
                <div className="mt-4 p-4 bg-cream/50 rounded-xl space-y-3 animate-fade-in">
                  <input type="text" placeholder="Card number" className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blush/40" />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="MM / YY" className="px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blush/40" />
                    <input type="text" placeholder="CVV" className="px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blush/40" />
                  </div>
                </div>
              )}

              {paymentMethod === "upi" && (
                <div className="mt-4 p-4 bg-cream/50 rounded-xl animate-fade-in">
                  <input type="text" placeholder="yourname@upi" className="w-full px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blush/40" />
                </div>
              )}

              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <Lock size={14} className="text-sage" /> Your payment information is secure and encrypted
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep(2)} className="px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors">Back</button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={processing}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blush text-white rounded-full text-sm font-medium hover:bg-blush/90 transition-colors disabled:opacity-50 min-h-[48px]"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Place Order — ₹{total}</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 p-6 bg-white rounded-2xl border border-border">
            <h2 className="text-lg font-heading font-medium mb-4">REVE Bag</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {cart.map((item) => (
                <div key={item.product_id} className="flex gap-3">
                  <img src={item.product_image} alt={item.product_name} className="w-14 h-14 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium line-clamp-1">{item.product_name}</p>
                    <p className="text-xs text-muted-foreground">Qty {item.quantity}</p>
                  </div>
                  <span className="text-xs font-medium">₹{item.product_price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t border-border pt-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `₹${shippingCost}`}</span>
              </div>
            </div>
            <div className="flex justify-between items-center border-t border-border mt-4 pt-4">
              <span className="font-heading text-lg">Total</span>
              <span className="font-heading text-xl font-semibold">₹{total}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck size={14} className="text-sage" /> SSL secured · Safe delivery · Easy returns
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}