import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { supabase } from "@/lib/supabase";
import {
    ChevronLeft, ShieldCheck, CreditCard,
    Truck, MapPin, CheckCircle2, Lock,
    Smartphone, Tag, AlertCircle, ArrowRight,
    Package, User, Phone, Mail, Home, Building, X, Percent
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { GATEWAY_META } from "@/config/gateway-registry";
import { PageBanner } from "@/components/storefront/PageBanner";

export default function Checkout() {
    const { items, cartTotal, clearCart } = useCart();
    const { activeCompany } = useTenant();
    const { user } = useAuth();
    const { settings } = useStoreSettings();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [gateways, setGateways] = useState<any[]>([]);

    // Address fields
    const [address, setAddress] = useState({
        full_name: user?.user_metadata?.full_name || "",
        email: user?.email || "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
    });

    // Coupon
    const [couponCode, setCouponCode] = useState("");
    const [couponApplied, setCouponApplied] = useState<any>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState("");

    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [step, setStep] = useState<"address" | "payment">("address");

    useEffect(() => {
        if (activeCompany) loadGateways();
    }, [activeCompany?.id]);

    const loadGateways = async () => {
        const { data } = await supabase
            .from("payment_gateways")
            .select("*")
            .eq("company_id", activeCompany?.id)
            .eq("is_active", true);
        setGateways(data || []);
    };

    const storeLink = (path: string) => {
        const slug = activeCompany?.subdomain || "";
        return `/${slug}${path === "/" ? "" : path}`;
    };

    const primaryColor = settings?.primary_color || "#14532d";
    const tax = Math.round(cartTotal * 0.05);
    const shipping = cartTotal >= 999 ? 0 : 99;
    const discount = couponApplied
        ? couponApplied.type === "percentage"
            ? Math.min(Math.round(cartTotal * couponApplied.value / 100), couponApplied.max_discount || Infinity)
            : couponApplied.value
        : 0;
    const grandTotal = cartTotal + tax + shipping - discount;

    const applyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setCouponError("");
        try {
            const { data, error } = await supabase
                .from("coupons")
                .select("*")
                .eq("company_id", activeCompany?.id)
                .eq("code", couponCode.toUpperCase().trim())
                .eq("is_active", true)
                .maybeSingle();

            if (error) throw error;
            if (!data) {
                setCouponError("Invalid or expired coupon code");
                return;
            }
            if (data.min_order_amount && cartTotal < data.min_order_amount) {
                setCouponError(`Minimum order of ₹${data.min_order_amount} required`);
                return;
            }
            if (data.valid_until && new Date(data.valid_until) < new Date()) {
                setCouponError("This coupon has expired");
                return;
            }
            if (data.usage_limit && data.usage_count >= data.usage_limit) {
                setCouponError("This coupon has reached its usage limit");
                return;
            }
            setCouponApplied(data);
            toast.success(`Coupon applied! ${data.type === "percentage" ? `${data.value}% off` : `₹${data.value} off`}`);
        } catch (err: any) {
            setCouponError("Could not apply coupon");
        } finally {
            setCouponLoading(false);
        }
    };

    const removeCoupon = () => {
        setCouponApplied(null);
        setCouponCode("");
        setCouponError("");
    };

    const validateAddress = () => {
        if (!address.full_name) { toast.error("Enter your full name"); return false; }
        if (!address.phone) { toast.error("Enter your phone number"); return false; }
        if (!address.line1) { toast.error("Enter your street address"); return false; }
        if (!address.city) { toast.error("Enter your city"); return false; }
        if (!address.state) { toast.error("Enter your state"); return false; }
        if (!address.pincode) { toast.error("Enter your pincode"); return false; }
        return true;
    };

    const handlePlaceOrder = async () => {
        if (!user) { toast.error("Please login to complete your order"); return; }
        if (!validateAddress()) return;

        setLoading(true);
        try {
            // Razorpay flow
            if (paymentMethod === "razorpay") {
                const rp = gateways.find(g => g.gateway === "razorpay");
                if (!rp?.config?.key_id) throw new Error("Razorpay is not configured.");
                const options = {
                    key: rp.config.key_id,
                    amount: grandTotal * 100,
                    currency: "INR",
                    name: settings?.store_name || "EcomSuite",
                    description: "Order Checkout",
                    handler: async (response: any) => {
                        await finalizeOrder(response.razorpay_payment_id, "paid");
                    },
                    prefill: { name: address.full_name, email: address.email, contact: address.phone },
                    modal: { ondismiss: () => setLoading(false) },
                    theme: { color: primaryColor }
                };
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
                return;
            }

            await finalizeOrder(null, "pending");
        } catch (error: any) {
            toast.error(error.message || "Failed to place order");
            setLoading(false);
        }
    };

    const finalizeOrder = async (payId: string | null, payStatus: string) => {
        try {
            const { data: order, error: orderError } = await supabase
                .from("ecom_orders")
                .insert({
                    company_id: activeCompany?.id,
                    user_id: user?.id,
                    customer_name: address.full_name,
                    customer_email: address.email,
                    customer_phone: address.phone,
                    grand_total: grandTotal,
                    subtotal: cartTotal,
                    tax_amount: tax,
                    shipping_amount: shipping,
                    discount_amount: discount,
                    coupon_code: couponApplied?.code || null,
                    status: "pending",
                    shipping_address: address,
                    payment_status: payStatus,
                    payment_method: paymentMethod,
                    payment_id: payId
                })
                .select()
                .single();

            if (orderError) throw orderError;

            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                variant_id: item.variant_id,
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.price,
                amount: item.price * item.quantity,
                company_id: activeCompany?.id
            }));

            const { error: itemsError } = await supabase.from("ecom_order_items").insert(orderItems);
            if (itemsError) throw itemsError;

            // Increment coupon usage
            if (couponApplied) {
                await supabase.from("coupons")
                    .update({ usage_count: (couponApplied.usage_count || 0) + 1 })
                    .eq("id", couponApplied.id);
            }

            toast.success("Order Placed Successfully!");
            clearCart();
            navigate(storeLink(`/order-success/${order.id}`));
        } catch (error: any) {
            toast.error(error.message || "Order finalization failed.");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="bg-[#fafaf9] min-h-screen flex items-center justify-center p-6">
                <div className="bg-white rounded-[48px] text-center p-16 max-w-lg w-full space-y-8 shadow-xl border border-slate-50">
                    <div className="w-24 h-24 bg-[#14532d]/5 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-10 h-10 text-[#14532d]/20" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-[#14532d] uppercase tracking-tight">Checkout is empty</h2>
                        <p className="text-slate-400 text-sm font-medium mt-2">Finish your selection at the market first.</p>
                    </div>
                    <Button
                        onClick={() => navigate(storeLink("/shop"))}
                        style={{ backgroundColor: primaryColor }}
                        className="w-full h-14 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                    >
                        Return to Shop
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#fafaf9] min-h-screen pb-40 pt-28 font-sans">
            {/* Checkout Top Banner */}
            <div className="container mx-auto px-6 mb-8">
                <PageBanner position="checkout_top" height="h-28 md:h-36" />
            </div>

            <div className="container mx-auto px-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-3 text-[10px] font-black text-[#14532d]/40 hover:text-[#14532d] mb-12 transition-all uppercase tracking-widest"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to Cart
                </button>

                {/* Progress Steps */}
                <div className="flex items-center gap-4 mb-12">
                    {[{ id: "address", label: "Delivery Details", icon: MapPin },
                    { id: "payment", label: "Payment", icon: CreditCard }].map((s, i) => (
                        <div key={s.id} className="flex items-center gap-3">
                            {i > 0 && <div className={cn("h-px w-10 md:w-20 transition-all", step === "payment" ? "bg-[#14532d]" : "bg-slate-200")} />}
                            <button
                                onClick={() => { if (i === 1 && step === "address" && validateAddress()) setStep("payment"); if (i === 0) setStep("address"); }}
                                className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-2xl transition-all text-xs font-black uppercase tracking-wider",
                                    step === s.id
                                        ? "text-white shadow-lg"
                                        : i === 0 || step === "payment"
                                            ? "bg-white text-[#14532d] border border-slate-100"
                                            : "bg-white text-slate-300 border border-slate-100"
                                )}
                                style={step === s.id ? { backgroundColor: primaryColor } : {}}
                            >
                                <s.icon className="w-3 h-3" /> {s.label}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-start">

                    {/* ── LEFT COLUMN ── */}
                    <div className="xl:col-span-8 space-y-8">

                        <AnimatePresence mode="wait">
                            {step === "address" ? (
                                <motion.div
                                    key="address"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-50 space-y-8"
                                >
                                    <h2 className="text-lg font-black text-[#14532d] uppercase tracking-wider flex items-center gap-3">
                                        <MapPin className="w-5 h-5 text-[#f97316]" /> Delivery Details
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Full Name */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><User className="w-3 h-3" /> Full Name *</label>
                                            <input
                                                value={address.full_name}
                                                onChange={e => setAddress(a => ({ ...a, full_name: e.target.value }))}
                                                placeholder="John Doe"
                                                className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-800 outline-none focus:border-[#14532d]/30 focus:bg-white transition-all"
                                            />
                                        </div>
                                        {/* Phone */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Phone className="w-3 h-3" /> Phone *</label>
                                            <input
                                                value={address.phone}
                                                onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))}
                                                placeholder="+91 98765 43210"
                                                className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-800 outline-none focus:border-[#14532d]/30 focus:bg-white transition-all"
                                            />
                                        </div>
                                        {/* Email */}
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email Address</label>
                                            <input
                                                value={address.email}
                                                onChange={e => setAddress(a => ({ ...a, email: e.target.value }))}
                                                placeholder="john@example.com"
                                                className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-800 outline-none focus:border-[#14532d]/30 focus:bg-white transition-all"
                                            />
                                        </div>
                                        {/* Street */}
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Home className="w-3 h-3" /> Street Address *</label>
                                            <input
                                                value={address.line1}
                                                onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
                                                placeholder="Flat No / House / Building Name"
                                                className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-800 outline-none focus:border-[#14532d]/30 focus:bg-white transition-all"
                                            />
                                        </div>
                                        {/* Landmark */}
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Building className="w-3 h-3" /> Landmark / Area</label>
                                            <input
                                                value={address.line2}
                                                onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
                                                placeholder="Near landmark, area (optional)"
                                                className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-800 outline-none focus:border-[#14532d]/30 focus:bg-white transition-all"
                                            />
                                        </div>
                                        {/* City */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City *</label>
                                            <input
                                                value={address.city}
                                                onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                                                placeholder="Mumbai"
                                                className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-800 outline-none focus:border-[#14532d]/30 focus:bg-white transition-all"
                                            />
                                        </div>
                                        {/* State */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">State *</label>
                                            <input
                                                value={address.state}
                                                onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                                                placeholder="Maharashtra"
                                                className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-800 outline-none focus:border-[#14532d]/30 focus:bg-white transition-all"
                                            />
                                        </div>
                                        {/* Pincode */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pincode *</label>
                                            <input
                                                value={address.pincode}
                                                onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))}
                                                placeholder="400001"
                                                className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-800 outline-none focus:border-[#14532d]/30 focus:bg-white transition-all"
                                            />
                                        </div>
                                        {/* Country */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Country</label>
                                            <input
                                                value={address.country}
                                                onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}
                                                className="w-full h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-medium text-slate-800 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => { if (validateAddress()) setStep("payment"); }}
                                        style={{ backgroundColor: primaryColor }}
                                        className="w-full h-14 rounded-2xl text-white font-black uppercase tracking-widest text-xs border-none group"
                                    >
                                        Continue to Payment <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="payment"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-50 space-y-8"
                                >
                                    <h2 className="text-lg font-black text-[#14532d] uppercase tracking-wider flex items-center gap-3">
                                        <CreditCard className="w-5 h-5 text-[#f97316]" /> Payment Method
                                    </h2>

                                    {/* Address Summary */}
                                    <div className="bg-slate-50 rounded-2xl p-5 flex items-start gap-4 border border-slate-100">
                                        <MapPin className="w-4 h-4 text-[#14532d] mt-0.5 shrink-0" />
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-black text-[#14532d] uppercase tracking-wider">Delivering to</p>
                                            <p className="text-sm font-bold text-slate-700">{address.full_name} · {address.phone}</p>
                                            <p className="text-xs text-slate-500">{address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} - {address.pincode}</p>
                                        </div>
                                        <button onClick={() => setStep("address")} className="ml-auto text-[10px] font-black text-[#f97316] uppercase tracking-wider hover:underline">Edit</button>
                                    </div>

                                    {/* Payment Options */}
                                    <div className="space-y-3">
                                        {/* COD */}
                                        <button
                                            onClick={() => setPaymentMethod("cod")}
                                            className={cn(
                                                "w-full flex items-center gap-5 p-5 rounded-2xl border-2 transition-all",
                                                paymentMethod === "cod"
                                                    ? "border-[#14532d] bg-[#14532d]/5"
                                                    : "border-slate-100 bg-white hover:border-slate-200"
                                            )}
                                        >
                                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", paymentMethod === "cod" ? "bg-[#14532d]" : "bg-slate-100")}>
                                                <Package className={cn("w-5 h-5", paymentMethod === "cod" ? "text-white" : "text-slate-400")} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-black text-slate-800">Cash on Delivery</p>
                                                <p className="text-xs text-slate-400 font-medium">Pay when your order arrives</p>
                                            </div>
                                            <div className={cn("ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center", paymentMethod === "cod" ? "border-[#14532d]" : "border-slate-200")}>
                                                {paymentMethod === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-[#14532d]" />}
                                            </div>
                                        </button>

                                        {/* Online Gateways */}
                                        {gateways.map(gw => {
                                            const meta = GATEWAY_META[gw.gateway as keyof typeof GATEWAY_META];
                                            if (!meta) return null;
                                            return (
                                                <button
                                                    key={gw.id}
                                                    onClick={() => setPaymentMethod(gw.gateway)}
                                                    className={cn(
                                                        "w-full flex items-center gap-5 p-5 rounded-2xl border-2 transition-all",
                                                        paymentMethod === gw.gateway
                                                            ? "border-[#14532d] bg-[#14532d]/5"
                                                            : "border-slate-100 bg-white hover:border-slate-200"
                                                    )}
                                                >
                                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-lg", paymentMethod === gw.gateway ? "bg-[#14532d]" : "bg-slate-100")}>
                                                        <span>{meta.icon}</span>
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-sm font-black text-slate-800">{meta.name}</p>
                                                        <p className="text-xs text-slate-400 font-medium">Secure online payment · Instant confirmation</p>
                                                    </div>
                                                    <div className={cn("ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center", paymentMethod === gw.gateway ? "border-[#14532d]" : "border-slate-200")}>
                                                        {paymentMethod === gw.gateway && <div className="w-2.5 h-2.5 rounded-full bg-[#14532d]" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Trust Badges */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { icon: Lock, text: "256-bit SSL" },
                                            { icon: ShieldCheck, text: "Secure Payment" },
                                            { icon: Truck, text: "Safe Delivery" },
                                        ].map((b, i) => (
                                            <div key={i} className="flex flex-col items-center gap-2 p-4 bg-slate-50 rounded-2xl text-center">
                                                <b.icon className="w-5 h-5 text-[#14532d]" />
                                                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">{b.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                        style={{ backgroundColor: primaryColor }}
                                        className="w-full h-16 rounded-2xl text-white font-black uppercase tracking-widest text-xs border-none shadow-2xl"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                                Placing Order...
                                            </div>
                                        ) : (
                                            <span>Place Order · ₹{grandTotal.toLocaleString()}</span>
                                        )}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── RIGHT COLUMN: Order Summary ── */}
                    <div className="xl:col-span-4 space-y-6 xl:sticky xl:top-36">

                        {/* Items Summary */}
                        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#14532d] flex items-center gap-2 border-b border-slate-50 pb-5">
                                <Package className="w-4 h-4 text-[#f97316]" /> Your Order ({items.length})
                            </h3>

                            <div className="space-y-4 max-h-64 overflow-y-auto">
                                {items.map(item => (
                                    <div key={`${item.id}-${item.variant_id}`} className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                                            <img
                                                src={item.image_url || "https://via.placeholder.com/56"}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0">
                                            <p className="text-xs font-black text-slate-800 truncate">{item.name}</p>
                                            {item.variant_name && <p className="text-[10px] text-[#f97316] font-bold">{item.variant_name}</p>}
                                            <p className="text-[10px] text-slate-400 font-bold">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-sm font-black text-[#14532d] tabular-nums shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Coupon Code */}
                        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#14532d] flex items-center gap-2">
                                <Tag className="w-4 h-4 text-[#f97316]" /> Coupon Code
                            </h3>
                            {couponApplied ? (
                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <Percent className="w-4 h-4 text-green-600" />
                                        <div>
                                            <p className="text-xs font-black text-green-800">{couponApplied.code}</p>
                                            <p className="text-[10px] text-green-600 font-medium">
                                                {couponApplied.type === "percentage" ? `${couponApplied.value}% off` : `₹${couponApplied.value} off`} applied
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={removeCoupon} className="text-red-400 hover:text-red-600 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        value={couponCode}
                                        onChange={e => { setCouponCode(e.target.value); setCouponError(""); }}
                                        onKeyDown={e => e.key === "Enter" && applyCoupon()}
                                        placeholder="Enter promo code"
                                        className="flex-1 h-12 px-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-bold text-slate-800 outline-none focus:border-[#14532d]/30 focus:bg-white transition-all uppercase"
                                    />
                                    <Button
                                        onClick={applyCoupon}
                                        disabled={couponLoading || !couponCode}
                                        variant="outline"
                                        className="h-12 px-5 rounded-2xl text-xs font-black uppercase tracking-wider border-slate-200"
                                    >
                                        {couponLoading ? "..." : "Apply"}
                                    </Button>
                                </div>
                            )}
                            {couponError && (
                                <p className="text-xs text-red-500 font-bold flex items-center gap-1.5">
                                    <AlertCircle className="w-3 h-3" /> {couponError}
                                </p>
                            )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-50 space-y-5">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#14532d] border-b border-slate-50 pb-5">Bill Details</h3>

                            <div className="space-y-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span className="text-slate-700 tabular-nums">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>GST (5%)</span>
                                    <span className="text-slate-700 tabular-nums">₹{tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Delivery</span>
                                    {shipping === 0
                                        ? <span className="text-green-500">FREE</span>
                                        : <span className="text-slate-700 tabular-nums">₹{shipping}</span>
                                    }
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Coupon Discount</span>
                                        <span className="tabular-nums">− ₹{discount.toLocaleString()}</span>
                                    </div>
                                )}
                                {shipping > 0 && (
                                    <p className="text-[9px] text-[#f97316] font-bold">
                                        Add ₹{(999 - cartTotal).toLocaleString()} more for FREE delivery!
                                    </p>
                                )}
                            </div>

                            <div className="pt-5 border-t border-dashed border-slate-100 flex justify-between items-end">
                                <span className="text-[10px] font-black text-[#f97316] uppercase tracking-[0.2em]">Total Payable</span>
                                <span className="text-4xl font-black text-[#14532d] tracking-tighter tabular-nums">₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
