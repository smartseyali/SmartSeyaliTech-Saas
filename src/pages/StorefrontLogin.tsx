import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStorefrontAuth } from "@/hooks/useStorefrontAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowRight, ShoppingBag, Package, CheckCircle2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function StorefrontLogin() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { isAuthenticated, isVerified, customer, signIn, signUp, resendVerification, loading: authLoading } = useStorefrontAuth();

    const [mode, setMode] = useState<"login" | "signup">("login");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showVerifyBanner, setShowVerifyBanner] = useState(false);
    const [resending, setResending] = useState(false);

    // Form fields
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");

    // Company context (from URL param ?store=slug)
    const companySlug = searchParams.get("store") || "";
    const [companyId, setCompanyId] = useState<number | null>(null);
    const [storeName, setStoreName] = useState("Store");

    const redirect = searchParams.get("redirect") || "/store/my-orders";

    // Resolve company from slug or load first available
    useEffect(() => {
        const loadCompany = async () => {
            if (companySlug) {
                const { data } = await supabase.from("companies").select("id, name").eq("subdomain", companySlug).maybeSingle();
                if (data) { setCompanyId(data.id); setStoreName(data.name); return; }
            }
            // Fallback: load first active company (single-tenant mode)
            const { data } = await supabase.from("companies").select("id, name").eq("is_active", true).limit(1).maybeSingle();
            if (data) { setCompanyId(data.id); setStoreName(data.name); }
        };
        loadCompany();
    }, [companySlug]);

    // Redirect if authenticated and verified, or show verify banner
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            if (isVerified) {
                navigate(redirect, { replace: true });
            } else {
                setShowVerifyBanner(true);
            }
        }
    }, [isAuthenticated, isVerified, authLoading]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyId) {
            toast({ variant: "destructive", title: "Store not configured" });
            return;
        }
        setLoading(true);
        try {
            const cust = await signIn(email, password, companyId);
            if (cust.email_verified) {
                toast({ title: "Welcome back!" });
                navigate(redirect, { replace: true });
            } else {
                setShowVerifyBanner(true);
            }
        } catch (err: any) {
            toast({ variant: "destructive", title: "Login Failed", description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyId) {
            toast({ variant: "destructive", title: "Store not configured" });
            return;
        }
        if (password.length < 6) {
            toast({ variant: "destructive", title: "Password must be at least 6 characters" });
            return;
        }
        setLoading(true);
        try {
            await signUp({ email, password, fullName, phone, companyId });
            toast({ title: "Account created!", description: "Please check your email to verify." });
            setShowVerifyBanner(true);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Signup Failed", description: err.message });
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none transition-all";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-blue-600/20">
                        <ShoppingBag className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">{storeName}</h1>
                    <p className="text-sm text-slate-500">
                        {mode === "login" ? "Sign in to view your orders and track deliveries" : "Create an account to start shopping"}
                    </p>
                </div>

                {/* Tab Toggle */}
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    {(["login", "signup"] as const).map(m => (
                        <button key={m} onClick={() => setMode(m)}
                            className={cn(
                                "flex-1 h-10 rounded-lg text-sm font-bold transition-all",
                                mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                            )}>
                            {m === "login" ? "Sign In" : "Create Account"}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-8 shadow-sm space-y-5">
                    {mode === "signup" && (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-widest text-slate-500">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input value={fullName} onChange={e => setFullName(e.target.value)}
                                        placeholder="Your full name" required className={inputCls} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold tracking-widest text-slate-500">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                    <input value={phone} onChange={e => setPhone(e.target.value)}
                                        placeholder="9876543210" type="tel" className={inputCls} />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-bold tracking-widest text-slate-500">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@email.com" type="email" required className={inputCls} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold tracking-widest text-slate-500">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                            <input value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="Min 6 characters" type={showPassword ? "text" : "password"}
                                required minLength={6} className={cn(inputCls, "pr-12")} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <Button type="submit" disabled={loading}
                        className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 gap-2 transition-all active:scale-[0.98]">
                        {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                    </Button>
                </form>

                {/* Verify Email Banner */}
                {showVerifyBanner && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4 text-center animate-in fade-in duration-300">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto">
                            <Mail className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Verify Your Email</h3>
                            <p className="text-sm text-slate-500 mt-1">
                                We've sent a verification link to <strong>{customer?.email || email}</strong>. Please check your inbox and click the link to verify your account.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2">
                            <Button variant="outline"
                                className="h-10 rounded-xl font-bold text-sm gap-2"
                                disabled={resending}
                                onClick={async () => {
                                    setResending(true);
                                    try {
                                        await resendVerification();
                                        toast({ title: "Verification email sent!" });
                                    } catch (err: any) {
                                        toast({ variant: "destructive", title: err.message });
                                    } finally {
                                        setResending(false);
                                    }
                                }}>
                                {resending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                                {resending ? "Sending..." : "Resend Verification Email"}
                            </Button>
                            <button onClick={() => navigate("/store/my-orders")}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700">
                                Continue to My Orders (limited access)
                            </button>
                        </div>
                    </div>
                )}

                {/* Track Order Link */}
                <div className="text-center">
                    <button onClick={() => navigate("/store/track")}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-2">
                        <Package className="w-4 h-4" /> Track an order without signing in
                    </button>
                </div>
            </div>
        </div>
    );
}
