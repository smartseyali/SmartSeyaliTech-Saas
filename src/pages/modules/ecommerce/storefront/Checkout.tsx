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
    Package, User, Phone, Mail, Home, Building, X, Percent,
    Box, Zap, Layout
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
            <div className="bg-[#f8fafc] min-h-screen flex items-center justify-center p-6 font-sans">
                <div className="bg-white rounded-[4rem] text-center p-20 max-w-xl w-full space-y-10 shadow-2xl shadow-slate-200/50 border border-slate-50">
                    <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto border border-slate-100 shadow-inner">
                        <Box className="w-12 h-12 text-slate-200" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">Checkout <span className="text-blue-600">Inactive</span></h2>
                        <p className="text-slate-400 text-sm font-medium italic">"No active stagings identified. Please initialize acquisitions in the inventory matrix."</p>
                    </div>
                    <Button
                        onClick={() => navigate(storeLink("/shop"))}
                        className="w-full h-20 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:bg-blue-600 transition-all border-none"
                    >
                        Return to Inventory Hub <ArrowRight className="w-5 h-5 ml-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-40 pt-32 font-sans text-slate-900">
            {/* Checkout Top Banner */}
            <div className="max-w-7xl mx-auto px-6 mb-12">
                <PageBanner position="checkout_top" height="h-32 md:h-40" className="rounded-[2.5rem] shadow-xl" />
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-4 text-[11px] font-black text-slate-400 hover:text-blue-600 mb-16 transition-all uppercase tracking-[0.3em] font-sans"
                >
                    <ChevronLeft className="w-5 h-5" /> RE-ENTER STAGING MATRIX
                </button>

                {/* Progress Steps */}
                <div className="flex flex-wrap items-center gap-8 mb-20 border-b border-slate-100 pb-12">
                    <div className="space-y-4 mr-auto">
                        <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-600 font-bold" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Lock Protocol</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 uppercase tracking-tighter italic leading-[0.8]">Stage <span className="text-blue-600">Initialization</span></h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {[{ id: "address", label: "Allocation Signal", icon: MapPin },
                        { id: "payment", label: "Financial", icon: CreditCard }].map((s, i) => (
                            <div key={s.id} className="flex items-center gap-6">
                                {i > 0 && <div className={cn("h-px w-8 md:w-16", step === "payment" ? "bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]" : "bg-slate-100")} />}
                                <button
                                    onClick={() => { if (i === 1 && step === "address" && validateAddress()) setStep("payment"); if (i === 0) setStep("address"); }}
                                    className={cn(
                                        "flex items-center gap-3 px-8 py-4 rounded-xl transition-all text-[11px] font-black uppercase tracking-widest italic border-2",
                                        step === s.id
                                            ? "bg-slate-900 border-slate-900 text-white shadow-2xl"
                                            : i === 0 || step === "payment"
                                                ? "bg-white border-slate-100 text-slate-900 hover:border-blue-600"
                                                : "bg-white border-slate-50 text-slate-200"
                                    )}
                                >
                                    <s.icon className="w-4 h-4" /> {s.label}
                                </button>
                            </div>
                        ))}
                    </div>
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
                                    className="bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-200/30 border border-slate-50 space-y-12"
                                >
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-4 italic">
                                        <MapPin className="w-5 h-5 text-blue-600" /> Allocation Signal
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Full Name */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                                <User className="w-3.5 h-3.5" /> Identity Signature *
                                            </label>
                                            <input
                                                value={address.full_name}
                                                onChange={e => setAddress(a => ({ ...a, full_name: e.target.value }))}
                                                placeholder="AUTHORIZED PERSONNEL"
                                                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all uppercase tracking-widest"
                                            />
                                        </div>
                                        {/* Phone */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                                <Phone className="w-3.5 h-3.5" /> Comms Uplink *
                                            </label>
                                            <input
                                                value={address.phone}
                                                onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))}
                                                placeholder="+91 [NODE_NUMBER]"
                                                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all uppercase tracking-widest"
                                            />
                                        </div>
                                        {/* Email */}
                                        <div className="space-y-3 md:col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                                <Mail className="w-3.5 h-3.5" /> Network Address
                                            </label>
                                            <input
                                                value={address.email}
                                                onChange={e => setAddress(a => ({ ...a, email: e.target.value }))}
                                                placeholder="INTEL@ECOSYSTEM.CORP"
                                                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all uppercase tracking-widest"
                                            />
                                        </div>
                                        {/* Street */}
                                        <div className="space-y-3 md:col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                                <Home className="w-3.5 h-3.5" /> Deployment Sector *
                                            </label>
                                            <input
                                                value={address.line1}
                                                onChange={e => setAddress(a => ({ ...a, line1: e.target.value }))}
                                                placeholder="SECTOR / GRID / BLOCK"
                                                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all uppercase tracking-widest"
                                            />
                                        </div>
                                        {/* Landmark */}
                                        <div className="space-y-3 md:col-span-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 italic">
                                                <Building className="w-3.5 h-3.5" /> Proximity Marker
                                            </label>
                                            <input
                                                value={address.line2}
                                                onChange={e => setAddress(a => ({ ...a, line2: e.target.value }))}
                                                placeholder="LANDMARK LOGIC (OPTIONAL)"
                                                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all uppercase tracking-widest"
                                            />
                                        </div>
                                        {/* City */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">City *</label>
                                            <input
                                                value={address.city}
                                                onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                                                placeholder="METROPOLIS"
                                                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all uppercase tracking-widest"
                                            />
                                        </div>
                                        {/* State */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Territory *</label>
                                            <input
                                                value={address.state}
                                                onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                                                placeholder="STATE_PROTOCOL"
                                                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all uppercase tracking-widest"
                                            />
                                        </div>
                                        {/* Pincode */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Node Index *</label>
                                            <input
                                                value={address.pincode}
                                                onChange={e => setAddress(a => ({ ...a, pincode: e.target.value }))}
                                                placeholder="6-DIGIT_INDEX"
                                                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50 text-xs font-black text-slate-900 outline-none focus:border-blue-600 focus:bg-white transition-all uppercase tracking-widest"
                                            />
                                        </div>
                                        {/* Country */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Geographic Domain</label>
                                            <input
                                                value={address.country}
                                                onChange={e => setAddress(a => ({ ...a, country: e.target.value }))}
                                                className="w-full h-16 px-6 rounded-2xl border-2 border-slate-50 bg-slate-50 text-xs font-black text-slate-900 outline-none uppercase tracking-widest"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        onClick={() => { if (validateAddress()) setStep("payment"); }}
                                        className="w-full h-20 rounded-[1.5rem] bg-blue-600 text-white font-black uppercase tracking-[0.4em] text-[11px] border-none group shadow-2xl shadow-blue-600/30 hover:bg-slate-900 transition-all"
                                    >
                                        Synchronize Node <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-2 transition-transform" />
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="payment"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-200/30 border border-slate-50 space-y-12"
                                >
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-[0.3em] flex items-center gap-4 italic text-slate-900">
                                        <CreditCard className="w-5 h-5 text-blue-600" /> Financial Node
                                    </h2>

                                    {/* Address Summary as Read-only Logic */}
                                    <div className="bg-slate-50 rounded-3xl p-8 flex items-start gap-6 border border-slate-100">
                                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm shrink-0">
                                            <MapPin className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="space-y-2 grow">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] italic">Active Sector</p>
                                            <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{address.full_name} · {address.phone}</p>
                                            <p className="text-xs text-slate-400 font-medium italic">{address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}</p>
                                        </div>
                                        <button onClick={() => setStep("address")} className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline pt-1 italic">Re-Configure</button>
                                    </div>

                                    {/* Payment Options */}
                                    <div className="space-y-6">
                                        {/* COD as Manual Settlement */}
                                        <button
                                            onClick={() => setPaymentMethod("cod")}
                                            className={cn(
                                                "w-full flex items-center gap-8 p-8 rounded-[2.5rem] border-2 transition-all group",
                                                paymentMethod === "cod"
                                                    ? "border-slate-900 bg-slate-900 shadow-2xl shadow-slate-900/20"
                                                    : "border-slate-50 bg-white hover:border-blue-600"
                                            )}
                                        >
                                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all", paymentMethod === "cod" ? "bg-blue-600" : "bg-slate-50 group-hover:bg-blue-50")}>
                                                <Package className={cn("w-6 h-6", paymentMethod === "cod" ? "text-white" : "text-slate-200 group-hover:text-blue-600")} />
                                            </div>
                                            <div className="text-left grow">
                                                <p className={cn("text-sm font-black uppercase tracking-[0.1em] italic", paymentMethod === "cod" ? "text-white" : "text-slate-900")}>Manual Settlement (COD)</p>
                                                <p className={cn("text-[10px] font-medium italic mt-1", paymentMethod === "cod" ? "text-white/40" : "text-slate-400")}>Finalize credentials upon physical delivery</p>
                                            </div>
                                            <div className={cn("w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all", paymentMethod === "cod" ? "border-blue-600 bg-white" : "border-slate-100")}>
                                                {paymentMethod === "cod" && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
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
                                                        "w-full flex items-center gap-8 p-8 rounded-[2.5rem] border-2 transition-all group",
                                                        paymentMethod === gw.gateway
                                                            ? "border-slate-900 bg-slate-900 shadow-2xl shadow-slate-900/20"
                                                            : "border-slate-50 bg-white hover:border-blue-600"
                                                    )}
                                                >
                                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-xl transition-all", paymentMethod === gw.gateway ? "bg-blue-600" : "bg-slate-50 group-hover:bg-blue-50")}>
                                                        <span className={cn(paymentMethod === gw.gateway ? "grayscale brightness-200" : "grayscale opacity-50")}>{meta.icon}</span>
                                                    </div>
                                                    <div className="text-left grow">
                                                        <p className={cn("text-sm font-black uppercase tracking-[0.1em] italic", paymentMethod === gw.gateway ? "text-white" : "text-slate-900")}>{meta.name} Bridge</p>
                                                        <p className={cn("text-[10px] font-medium italic mt-1", paymentMethod === gw.gateway ? "text-white/40" : "text-slate-400")}>Encrypted direct-link confirmation</p>
                                                    </div>
                                                    <div className={cn("w-6 h-6 rounded-full border-4 flex items-center justify-center transition-all", paymentMethod === gw.gateway ? "border-blue-600 bg-white" : "border-slate-100")}>
                                                        {paymentMethod === gw.gateway && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Security Matrix Badges */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                        {[
                                            { icon: Lock, text: "256-BIT QUANTUM" },
                                            { icon: ShieldCheck, text: "PROTOCOL SECURE" },
                                            { icon: Truck, text: "STAGED LOGISTICS" },
                                        ].map((b, i) => (
                                            <div key={i} className="flex items-center gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                                <b.icon className="w-5 h-5 text-blue-600 font-bold" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic leading-none">{b.text}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                        className="w-full h-24 rounded-[2rem] bg-blue-600 hover:bg-slate-900 text-white font-black uppercase tracking-[0.4em] text-[12px] border-none shadow-2xl shadow-blue-600/30 transition-all flex items-center justify-center gap-4"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-4">
                                                <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                                                PROCESSING...
                                            </div>
                                        ) : (
                                            <>
                                                Initialize Settlement <ArrowRight className="w-6 h-6" /> <span className="text-white/30 font-black pl-4">₹{grandTotal.toLocaleString()}</span>
                                            </>
                                        )}
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── RIGHT COLUMN: Order Summary ── */}
                    <div className="xl:col-span-4 space-y-8 xl:sticky xl:top-36">

                        {/* Items Summary */}
                        <div className="bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-200/30 border border-slate-50 space-y-10">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 flex items-center gap-4 border-b border-slate-100 pb-8 italic">
                                <Layout className="w-5 h-5 text-blue-600" /> Staging Array ({items.length})
                            </h3>

                            <div className="space-y-6 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                {items.map(item => (
                                    <div key={`${item.id}-${item.variant_id}`} className="flex items-center gap-6 group">
                                        <div className="w-20 h-24 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0 p-3 flex items-center justify-center group-hover:border-blue-200 transition-colors">
                                            <img
                                                src={item.image_url || `https://source.unsplash.com/400x600/?tech,${item.id}`}
                                                alt={item.name}
                                                className="max-w-full max-h-full object-contain grayscale-[40%] group-hover:grayscale-0 transition-all"
                                            />
                                        </div>
                                        <div className="flex-grow min-w-0 space-y-1">
                                            <p className="text-[11px] font-black text-slate-900 truncate uppercase tracking-tight italic group-hover:text-blue-600 transition-colors">{item.name}</p>
                                            {item.variant_name && <p className="text-[9px] text-blue-600 font-black uppercase tracking-widest">{item.variant_name}</p>}
                                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">QUANTITY: {item.quantity}</p>
                                        </div>
                                        <p className="text-xs font-black text-slate-900 tabular-nums shrink-0 italic">₹{item.price * item.quantity}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Coupon Code as Auth Token */}
                        <div className="bg-slate-900 rounded-[3rem] p-10 shadow-2xl space-y-6 border border-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white flex items-center gap-4 italic">
                                <Tag className="w-4 h-4 text-blue-500" /> Redemption Hash
                            </h3>
                            {couponApplied ? (
                                <div className="flex items-center justify-between bg-blue-600 rounded-2xl px-6 py-4 shadow-xl shadow-blue-600/20">
                                    <div className="flex items-center gap-4">
                                        <Zap className="w-5 h-5 text-white animate-pulse" />
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-widest">{couponApplied.code}</p>
                                            <p className="text-[9px] text-white/60 font-black uppercase tracking-widest italic">
                                                {couponApplied.type === "percentage" ? `${couponApplied.value}% VALIDATED` : `₹${couponApplied.value} REDEEMED`}
                                            </p>
                                        </div>
                                    </div>
                                    <button onClick={removeCoupon} className="text-white/40 hover:text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <input
                                        value={couponCode}
                                        onChange={e => { setCouponCode(e.target.value); setCouponError(""); }}
                                        onKeyDown={e => e.key === "Enter" && applyCoupon()}
                                        placeholder="ENTER_HASH"
                                        className="flex-1 h-14 px-6 rounded-2xl border border-white/10 bg-white/5 text-[11px] font-black text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all uppercase tracking-[0.2em]"
                                    />
                                    <Button
                                        onClick={applyCoupon}
                                        disabled={couponLoading || !couponCode}
                                        className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-white hover:text-blue-600 text-white text-[10px] font-black uppercase tracking-widest transition-all border-none"
                                    >
                                        {couponLoading ? "..." : "AUTH"}
                                    </Button>
                                </div>
                            )}
                            {couponError && (
                                <p className="text-[9px] text-red-400 font-black flex items-center gap-2 uppercase tracking-widest italic">
                                    <AlertCircle className="w-3.5 h-3.5" /> {couponError}
                                </p>
                            )}
                        </div>

                        {/* Price Breakdown as Data Matrix */}
                        <div className="bg-white rounded-[4rem] p-12 shadow-2xl shadow-slate-200/30 border border-slate-50 space-y-8">
                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-900 border-b border-slate-100 pb-8 italic">Allocation Matrix</h3>

                            <div className="space-y-5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                                <div className="flex justify-between items-center">
                                    <span>Base Valuation</span>
                                    <span className="text-slate-900 tabular-nums">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Protocol Tax (5%)</span>
                                    <span className="text-slate-900 tabular-nums">₹{tax.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Logistics Protocol</span>
                                    {shipping === 0
                                        ? <span className="text-blue-600">FREE DEPLOYMENT</span>
                                        : <span className="text-slate-900 tabular-nums">₹{shipping}</span>
                                    }
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between items-center text-blue-600">
                                        <span>Redemption Offset</span>
                                        <span className="tabular-nums">− ₹{discount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            <div className="pt-10 border-t border-dashed border-slate-100 flex flex-col gap-2">
                                <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] italic leading-none">Total Exposure</span>
                                <span className="text-6xl font-black text-slate-900 tracking-tighter tabular-nums leading-none">₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
