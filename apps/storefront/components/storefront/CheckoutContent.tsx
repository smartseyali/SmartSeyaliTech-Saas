"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight, ShieldCheck, Truck, AlertCircle,
  CreditCard, Wallet, Package, CheckCircle, Tag, X, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatINR, cn } from "@/lib/utils";
import { getTenant } from "@/lib/tenant";
import { supabase } from "@/lib/supabase-client";
import {
  createOrder, confirmOrderPayment, cancelPendingOrder,
  type CheckoutAddress, type PaymentMethod,
} from "@/lib/checkout";
import type { CartItem } from "./CartContent";

declare global {
  interface Window {
    Razorpay: new (opts: Record<string, unknown>) => { open(): void };
  }
}

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Chandigarh","Delhi","Jammu & Kashmir","Ladakh","Puducherry",
];

const STEPS = ["Delivery", "Payment", "Confirm"] as const;
type Step = 0 | 1 | 2;

const EMPTY_ADDRESS: CheckoutAddress = {
  firstName: "", lastName: "", email: "", phone: "",
  address: "", city: "", state: "Tamil Nadu", pincode: "",
};

function StepIndicator({ step }: { step: Step }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center">
          <div className={cn(
            "flex items-center gap-2 text-sm font-semibold",
            i < step ? "text-brand" : i === step ? "text-brand-900" : "text-muted-foreground"
          )}>
            <span className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
              i < step ? "bg-brand border-brand text-white" :
              i === step ? "border-brand text-brand bg-brand-50" :
              "border-border text-muted-foreground"
            )}>
              {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
            </span>
            <span className="hidden sm:block">{label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <ChevronRight className="w-4 h-4 text-border mx-2" />
          )}
        </div>
      ))}
    </div>
  );
}

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium text-brand-900 block mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-11 px-4 text-sm border border-border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand/30";

export function CheckoutContent() {
  const router = useRouter();
  const tenant = getTenant();

  const [step, setStep] = useState<Step>(0);
  const [items, setItems] = useState<CartItem[]>([]);
  const [addr, setAddr] = useState<CheckoutAddress>(EMPTY_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponId, setCouponId] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [couponFreeShipping, setCouponFreeShipping] = useState(false);

  // Gift card state
  const [gcInput, setGcInput] = useState("");
  const [gcDiscount, setGcDiscount] = useState(0);
  const [gcId, setGcId] = useState<string | null>(null);
  const [gcError, setGcError] = useState<string | null>(null);
  const [gcLoading, setGcLoading] = useState(false);
  const [appliedGc, setAppliedGc] = useState<string | null>(null);

  // Store settings (shipping + tax)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(999);
  const [defaultShippingRate, setDefaultShippingRate] = useState(99);
  const [taxRate, setTaxRate] = useState(0);
  const [companyState, setCompanyState] = useState("");

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("ss_cart") ?? "[]"));
    } catch { setItems([]); }

    // Load store settings
    if (supabase && tenant.companyId) {
      supabase
        .from("ecom_settings")
        .select("tax_rate, company_state, free_shipping_threshold, default_shipping_rate")
        .eq("company_id", tenant.companyId)
        .maybeSingle()
        .then(({ data }) => {
          if (!data) return;
          if (data.tax_rate != null) setTaxRate(Number(data.tax_rate));
          if (data.company_state) setCompanyState(data.company_state);
          if (data.free_shipping_threshold != null) setFreeShippingThreshold(Number(data.free_shipping_threshold));
          if (data.default_shipping_rate != null) setDefaultShippingRate(Number(data.default_shipping_rate));
        });

      // Auto-apply coupons
      supabase
        .from("ecom_coupons")
        .select("code, discount_type, discount_value, min_order_amount, free_shipping")
        .eq("company_id", tenant.companyId)
        .eq("is_active", true)
        .eq("auto_apply", true)
        .then(({ data: autoCoupons }) => {
          if (!autoCoupons?.length) return;
          const cartSubtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
          const applicable = autoCoupons.find(
            (c) => !c.min_order_amount || cartSubtotal >= Number(c.min_order_amount)
          );
          if (!applicable) return;
          const discountVal =
            applicable.discount_type === "percent"
              ? Math.round((cartSubtotal * Number(applicable.discount_value)) / 100)
              : Number(applicable.discount_value);
          setCouponDiscount(discountVal);
          setAppliedCode(applicable.code);
          setCouponFreeShipping(!!applicable.free_shipping);
        });
    }
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = couponFreeShipping || subtotal >= freeShippingThreshold ? 0 : defaultShippingRate;
  const total = subtotal + shipping - couponDiscount - gcDiscount;

  // GST: CGST+SGST if same state, IGST if interstate (both inclusive in price)
  const gstAmount = taxRate > 0 ? Math.round((subtotal * taxRate) / (100 + taxRate)) : 0;
  const isIntrastate = companyState && addr.state && companyState.toLowerCase() === addr.state.toLowerCase();
  const halfGst = gstAmount > 0 ? Math.round(gstAmount / 2) : 0;

  async function applyCoupon() {
    if (!couponInput.trim() || !supabase) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const { data, error: rpcErr } = await supabase.rpc("validate_coupon", {
        p_company_id: tenant.companyId,
        p_code: couponInput.trim().toUpperCase(),
        p_order_total: subtotal,
        p_customer_email: addr.email || null,
      });
      if (rpcErr) throw new Error(rpcErr.message);
      if (!data?.valid) throw new Error(data?.error || "Invalid coupon");
      setCouponDiscount(Number(data.discount_amount) || 0);
      setCouponId(data.coupon_id);
      setCouponFreeShipping(!!data.free_shipping);
      setAppliedCode(couponInput.trim().toUpperCase());
      setCouponInput("");
    } catch (err) {
      setCouponError(err instanceof Error ? err.message : "Invalid coupon");
      setCouponDiscount(0);
      setCouponId(null);
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCouponDiscount(0);
    setCouponId(null);
    setAppliedCode(null);
    setCouponError(null);
    setCouponFreeShipping(false);
  }

  async function applyGiftCard() {
    if (!gcInput.trim() || !supabase) return;
    setGcLoading(true);
    setGcError(null);
    try {
      const { data, error: rpcErr } = await supabase.rpc("validate_gift_card", {
        p_company_id: tenant.companyId,
        p_code: gcInput.trim().toUpperCase(),
      });
      if (rpcErr) throw new Error(rpcErr.message);
      if (!data?.valid) throw new Error(data?.error || "Invalid gift card");
      const discount = Math.min(Number(data.remaining_value), total);
      setGcDiscount(discount);
      setGcId(data.gift_card_id);
      setAppliedGc(gcInput.trim().toUpperCase());
      setGcInput("");
    } catch (err) {
      setGcError(err instanceof Error ? err.message : "Invalid gift card");
      setGcDiscount(0);
      setGcId(null);
    } finally {
      setGcLoading(false);
    }
  }

  function removeGiftCard() {
    setGcDiscount(0);
    setGcId(null);
    setAppliedGc(null);
    setGcError(null);
  }

  async function trackCartAbandonment() {
    if (!addr.email || !tenant.companyId) return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) return;
    fetch(`${supabaseUrl}/functions/v1/track-cart`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${anonKey}` },
      body: JSON.stringify({
        company_id: tenant.companyId,
        customer_email: addr.email,
        customer_name: `${addr.firstName} ${addr.lastName}`.trim() || undefined,
        customer_phone: addr.phone || undefined,
        cart_items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity })),
        cart_value: subtotal,
      }),
    }).catch(() => { /* ignore */ });
  }

  // Empty cart
  if (items.length === 0 && step === 0) {
    return (
      <div className="container-tight py-20 text-center">
        <Package className="w-12 h-12 text-brand/30 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-brand-900 mb-2">Your cart is empty</h2>
        <Button asChild className="mt-4"><Link href="/shop/">Browse products</Link></Button>
      </div>
    );
  }

  // Supabase required for checkout
  if (!supabase) {
    return (
      <div className="container-tight py-20 max-w-lg mx-auto text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-brand-900 mb-2">Checkout unavailable</h2>
        <p className="text-muted-foreground text-sm">
          The store is not yet connected to the database. Please contact{" "}
          <a href={`mailto:${tenant.contact.email}`} className="text-brand underline">{tenant.contact.email}</a> to place your order.
        </p>
      </div>
    );
  }

  function validateAddress(): string | null {
    if (!addr.firstName.trim()) return "First name is required";
    if (!addr.lastName.trim()) return "Last name is required";
    if (!addr.email.trim() || !/\S+@\S+\.\S+/.test(addr.email)) return "Valid email is required";
    if (!addr.phone.trim() || addr.phone.replace(/\D/g, "").length < 10) return "Valid 10-digit phone is required";
    if (!addr.address.trim()) return "Street address is required";
    if (!addr.city.trim()) return "City is required";
    if (!addr.state) return "State is required";
    if (!addr.pincode.trim() || !/^\d{6}$/.test(addr.pincode)) return "Valid 6-digit pincode is required";
    return null;
  }

  async function handlePlaceOrder() {
    setError(null);
    setProcessing(true);

    try {
      const order = await createOrder({
        address: addr, items, paymentMethod, subtotal, shippingAmount: shipping, total,
        taxAmount: gstAmount,
        couponCode: appliedCode ?? undefined, couponDiscount,
        giftCardCode: appliedGc ?? undefined, giftCardDiscount: gcDiscount, giftCardId: gcId ?? undefined,
      });

      if (paymentMethod === "cod") {
        localStorage.removeItem("ss_cart");
        router.push(`/checkout/success/?order=${order.order_number}`);
        return;
      }

      // Razorpay flow
      if (!tenant.razorpayKeyId) {
        throw new Error("Razorpay is not configured for this store.");
      }

      await new Promise<void>((resolve, reject) => {
        if (window.Razorpay) { resolve(); return; }
        const s = document.createElement("script");
        s.src = "https://checkout.razorpay.com/v1/checkout.js";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.body.appendChild(s);
      });

      const rzp = new window.Razorpay({
        key: tenant.razorpayKeyId,
        amount: Math.round(total * 100),
        currency: "INR",
        name: tenant.brandName,
        description: `Order ${order.order_number}`,
        prefill: {
          name: `${addr.firstName} ${addr.lastName}`,
          email: addr.email,
          contact: addr.phone,
        },
        theme: { color: tenant.theme.primary },
        handler: async (response: { razorpay_payment_id: string }) => {
          await confirmOrderPayment(order.id, response.razorpay_payment_id);
          localStorage.removeItem("ss_cart");
          router.push(`/checkout/success/?order=${order.order_number}`);
        },
        modal: {
          ondismiss: async () => {
            await cancelPendingOrder(order.id);
            setProcessing(false);
            setError("Payment was cancelled. Your order has not been placed.");
          },
        },
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setProcessing(false);
    }
  }

  // ─── Order summary sidebar ────────────────────────────────────────────
  const OrderSummary = (
    <div className="bg-brand-50/50 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-brand-900 text-sm">Order Summary</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 items-center">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
              <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-brand-900 line-clamp-1">{item.name}</p>
              {item.variantLabel && <p className="text-xs text-muted-foreground">{item.variantLabel}</p>}
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <span className="text-xs font-bold text-brand shrink-0">{formatINR(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      {/* Gift card input */}
      {!appliedGc ? (
        <div className="space-y-1">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Gift card code"
              value={gcInput}
              onChange={(e) => { setGcInput(e.target.value.toUpperCase()); setGcError(null); }}
              onKeyDown={(e) => e.key === "Enter" && applyGiftCard()}
              className="flex-1 h-9 px-3 text-xs border border-border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 uppercase"
            />
            <button
              type="button"
              onClick={applyGiftCard}
              disabled={gcLoading || !gcInput.trim()}
              className="h-9 px-3 rounded-full bg-emerald-600 text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
            >
              {gcLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
            </button>
          </div>
          {gcError && <p className="text-xs text-red-500 pl-1">{gcError}</p>}
        </div>
      ) : (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">Gift Card — {formatINR(gcDiscount)} off</span>
          </div>
          <button type="button" onClick={removeGiftCard} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Coupon input */}
      {!appliedCode ? (
        <div className="space-y-1">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Coupon code"
              value={couponInput}
              onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(null); }}
              onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
              className="flex-1 h-9 px-3 text-xs border border-border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-brand/30 uppercase"
            />
            <button
              type="button"
              onClick={applyCoupon}
              disabled={couponLoading || !couponInput.trim()}
              className="h-9 px-4 rounded-full bg-brand text-white text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
            >
              {couponLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Tag className="w-3 h-3" />}
              Apply
            </button>
          </div>
          {couponError && <p className="text-xs text-red-500 pl-1">{couponError}</p>}
        </div>
      ) : (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-bold text-green-700">{appliedCode} — {formatINR(couponDiscount)} off</span>
          </div>
          <button type="button" onClick={removeCoupon} className="text-green-500 hover:text-green-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="border-t border-border/50 pt-3 space-y-1.5 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span><span>{formatINR(subtotal)}</span>
        </div>
        {couponDiscount > 0 && (
          <div className="flex justify-between text-green-600 font-semibold">
            <span>Coupon ({appliedCode})</span><span>−{formatINR(couponDiscount)}</span>
          </div>
        )}
        {gcDiscount > 0 && (
          <div className="flex justify-between text-emerald-600 font-semibold">
            <span>Gift Card</span><span>−{formatINR(gcDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className={shipping === 0 ? "text-brand font-semibold" : ""}>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
        </div>
        {gstAmount > 0 && isIntrastate && (
          <>
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>CGST (incl.)</span><span>{formatINR(halfGst)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground text-xs">
              <span>SGST (incl.)</span><span>{formatINR(halfGst)}</span>
            </div>
          </>
        )}
        {gstAmount > 0 && !isIntrastate && (
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>IGST (incl.)</span><span>{formatINR(gstAmount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-brand-900 pt-1 border-t border-border/50">
          <span>Total</span><span className="text-brand">{formatINR(total)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-tight py-10 max-w-5xl mx-auto">
      <StepIndicator step={step} />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* ─── Step 0: Delivery address ─────────────────────── */}
          {step === 0 && (
            <div className="bg-white border border-border rounded-2xl p-6">
              <h2 className="font-bold text-brand-900 text-lg mb-5">Delivery Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First Name" required>
                  <input className={inputCls} value={addr.firstName} onChange={(e) => setAddr({ ...addr, firstName: e.target.value })} placeholder="Ravi" />
                </Field>
                <Field label="Last Name" required>
                  <input className={inputCls} value={addr.lastName} onChange={(e) => setAddr({ ...addr, lastName: e.target.value })} placeholder="Kumar" />
                </Field>
                <Field label="Email Address" required>
                  <input
                    className={inputCls}
                    type="email"
                    value={addr.email}
                    onChange={(e) => setAddr({ ...addr, email: e.target.value })}
                    onBlur={trackCartAbandonment}
                    placeholder="ravi@example.com"
                  />
                </Field>
                <Field label="Phone Number" required>
                  <input className={inputCls} type="tel" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} placeholder="+91 98765 43210" />
                </Field>
                <Field label="Street Address" required>
                  <input className={cn(inputCls, "sm:col-span-2")} value={addr.address} onChange={(e) => setAddr({ ...addr, address: e.target.value })} placeholder="House No., Street, Colony" />
                </Field>
                <Field label="City" required>
                  <input className={inputCls} value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} placeholder="Chennai" />
                </Field>
                <Field label="State" required>
                  <div className="relative">
                    <select
                      value={addr.state}
                      onChange={(e) => setAddr({ ...addr, state: e.target.value })}
                      className={cn(inputCls, "appearance-none pr-8")}
                    >
                      {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronRight className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rotate-90 text-muted-foreground" />
                  </div>
                </Field>
                <Field label="Pincode" required>
                  <input className={inputCls} value={addr.pincode} onChange={(e) => setAddr({ ...addr, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="600001" maxLength={6} />
                </Field>
              </div>
              {error && (
                <div className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}
              <Button
                className="w-full mt-6"
                size="lg"
                onClick={() => {
                  const err = validateAddress();
                  if (err) { setError(err); return; }
                  setError(null);
                  setStep(1);
                }}
              >
                Continue to Payment <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* ─── Step 1: Payment method ───────────────────────── */}
          {step === 1 && (
            <div className="bg-white border border-border rounded-2xl p-6 space-y-6">
              <h2 className="font-bold text-brand-900 text-lg">Payment Method</h2>

              <div className="space-y-3">
                {[
                  { id: "cod" as PaymentMethod, icon: Truck, label: "Cash on Delivery", desc: "Pay when your order arrives" },
                  ...(tenant.razorpayKeyId
                    ? [{ id: "razorpay" as PaymentMethod, icon: CreditCard, label: "Pay Online", desc: "UPI, cards, net banking via Razorpay" }]
                    : []
                  ),
                ].map(({ id, icon: Icon, label, desc }) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPaymentMethod(id)}
                    className={cn(
                      "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left",
                      paymentMethod === id ? "border-brand bg-brand-50" : "border-border hover:border-brand/40"
                    )}
                  >
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", paymentMethod === id ? "bg-brand text-white" : "bg-brand-50 text-brand")}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-brand-900 text-sm">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", paymentMethod === id ? "border-brand" : "border-border")}>
                      {paymentMethod === id && <div className="w-2.5 h-2.5 rounded-full bg-brand" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* Delivery address recap */}
              <div className="bg-brand-50/50 rounded-xl p-4 text-sm">
                <p className="font-semibold text-brand-900 mb-1">Delivering to</p>
                <p className="text-muted-foreground">{addr.firstName} {addr.lastName} · {addr.phone}</p>
                <p className="text-muted-foreground">{addr.address}, {addr.city}, {addr.state} — {addr.pincode}</p>
                <button type="button" onClick={() => setStep(0)} className="text-xs text-brand hover:underline mt-1">Edit address</button>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-none">Back</Button>
                <Button className="flex-1" size="lg" onClick={() => setStep(2)}>
                  Review Order <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ─── Step 2: Confirm & place ──────────────────────── */}
          {step === 2 && (
            <div className="bg-white border border-border rounded-2xl p-6 space-y-5">
              <h2 className="font-bold text-brand-900 text-lg">Confirm Order</h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center text-sm">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-brand-50 shrink-0">
                      <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-brand-900 line-clamp-1">{item.name}</p>
                      <p className="text-muted-foreground text-xs">
                        Qty {item.quantity}
                        {item.variantLabel ? ` · ${item.variantLabel}` : item.weight ? ` · ${item.weight}` : ""}
                      </p>
                    </div>
                    <span className="font-bold text-brand shrink-0">{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4 pt-2 border-t border-border">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Ship to</p>
                  <p className="text-sm text-brand-900">{addr.firstName} {addr.lastName}</p>
                  <p className="text-xs text-muted-foreground">{addr.address}, {addr.city}</p>
                  <p className="text-xs text-muted-foreground">{addr.state} — {addr.pincode}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Payment</p>
                  <div className="flex items-center gap-2 text-sm text-brand-900">
                    {paymentMethod === "cod" ? <Truck className="w-4 h-4 text-brand" /> : <CreditCard className="w-4 h-4 text-brand" />}
                    {paymentMethod === "cod" ? "Cash on Delivery" : "Pay Online (Razorpay)"}
                  </div>
                </div>
              </div>

              {/* Order totals in confirm step */}
              <div className="bg-brand-50/50 rounded-xl p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>{formatINR(subtotal)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-green-600 font-semibold">
                    <span>Coupon ({appliedCode})</span><span>−{formatINR(couponDiscount)}</span>
                  </div>
                )}
                {gcDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Gift Card</span><span>−{formatINR(gcDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-brand font-semibold" : ""}>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
                </div>
                {gstAmount > 0 && isIntrastate && (
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>CGST + SGST (incl.)</span><span>{formatINR(gstAmount)}</span>
                  </div>
                )}
                {gstAmount > 0 && !isIntrastate && (
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>IGST (incl.)</span><span>{formatINR(gstAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-brand-900 pt-1 border-t border-border/40">
                  <span>Total</span><span className="text-brand text-base">{formatINR(total)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-brand-50 px-4 py-3 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
                Your order details are encrypted and stored securely.
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} disabled={processing} className="flex-none">Back</Button>
                <Button className="flex-1" size="lg" onClick={handlePlaceOrder} disabled={processing}>
                  {processing ? (
                    <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />Processing…</>
                  ) : (
                    <><Wallet className="w-4 h-4 mr-2" />Place Order — {formatINR(total)}</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">{OrderSummary}</div>
      </div>
    </div>
  );
}
