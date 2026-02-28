import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
    Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
    Sparkles, ShieldCheck, ShoppingBag, User as UserIcon,
    Facebook, Github, Chrome
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Login() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const isMerchantLogin = window.location.pathname === "/ecommerce-login";
    const [mode, setMode] = useState<"login" | "signup" | "forgot-password">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");

    // Handle Redirection based on Role
    useEffect(() => {
        if (user && !authLoading) {
            checkRoleAndRedirect();
        }
    }, [user, authLoading, navigate]);

    const checkRoleAndRedirect = async () => {
        try {
            // Case-insensitive lookup for the user profile
            const { data: localUser } = await supabase
                .from('users')
                .select('is_super_admin')
                .ilike('username', user?.email || '')
                .maybeSingle();

            if (localUser?.is_super_admin) {
                console.log("Super Admin detected, navigating to dashboard...");
                navigate("/ecommerce");
                return;
            }

            const { data: mappings } = await supabase
                .from('company_users')
                .select('role')
                .eq('user_id', user?.id);

            const isAdmin = mappings?.some(m => ['admin', 'owner'].includes(m.role));

            if (isAdmin || isMerchantLogin) {
                navigate("/ecommerce");
            } else {
                navigate("/");
            }
        } catch (err) {
            navigate(isMerchantLogin ? "/ecommerce" : "/");
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast({ title: "Welcome back!", description: "Sign in successful." });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Login Failed", description: err?.message });
        } finally { setLoading(false); }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } }
            });
            if (error) throw error;

            // Auto-create user profile is handled by TenantContext/trigger usually
            // But let's ensure the user entry exists for redirection
            toast({ title: "Account Created", description: "Welcome to BeliBeli!" });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Signup Failed", description: err?.message });
        } finally { setLoading(false); }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            toast({ title: "Reset Link Sent", description: "Check your email." });
            setMode("login");
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err?.message });
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex bg-[#F8F9FA]">
            {/* Left Side: Brand Experience */}
            <div className="hidden lg:flex w-1/2 relative flex-col overflow-hidden bg-black p-16">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600"
                        className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                </div>

                <div className="relative z-10 h-full flex flex-col justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg transform group-hover:rotate-12 transition-all">
                            <ShoppingBag className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-white font-black text-2xl uppercase tracking-tighter">BeliBeli</span>
                    </Link>

                    <div className="space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-black bg-secondary overflow-hidden">
                                        <img src={`https://i.pravatar.cc/150?u=${i}`} />
                                    </div>
                                ))}
                            </div>
                            <p className="text-white/60 text-sm font-medium">Joined by <span className="text-white font-bold">10,000+</span> shoppers today</p>
                        </div>
                        <h2 className="text-5xl font-black text-white leading-tight uppercase tracking-tight">
                            Elevate Your <br />
                            <span className="text-primary italic font-normal">Everyday</span> Style
                        </h2>
                        <p className="text-white/40 max-w-sm text-lg leading-relaxed">
                            Discover curated collections and exclusive deals designed for the modern trendsetter.
                        </p>
                    </div>

                    <div className="flex items-center gap-8 text-white/30 text-[10px] font-black uppercase tracking-[0.3em]">
                        <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Secure Payment</span>
                        <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Original Products</span>
                    </div>
                </div>
            </div>

            {/* Right Side: Identity Form */}
            <div className="flex-1 flex items-center justify-center p-8 md:p-16">
                <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="text-center lg:text-left space-y-2">
                        <h1 className="text-4xl font-black tracking-tight uppercase">
                            {isMerchantLogin ? 'Command Center' : (mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password')}
                        </h1>
                        <p className="text-muted-foreground font-medium">
                            {isMerchantLogin
                                ? "Administrative Access for Merchant Partners"
                                : (mode === 'login'
                                    ? "Enter your details to continue your journey."
                                    : mode === 'signup'
                                        ? "Join the community and start shopping."
                                        : "We'll help you get back into your account.")}
                        </p>
                    </div>

                    <div className="space-y-6">
                        {!isMerchantLogin && (
                            <>
                                {/* Social Login placeholders */}
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { icon: Chrome, color: "hover:text-red-500" },
                                        { icon: Facebook, color: "hover:text-blue-600" },
                                        { icon: Github, color: "hover:text-gray-900" }
                                    ].map((s, i) => (
                                        <button key={i} className={cn("h-14 rounded-2xl border border-border bg-white flex items-center justify-center hover:shadow-lg transition-all transform hover:-translate-y-1", s.color)}>
                                            <s.icon className="w-5 h-5" />
                                        </button>
                                    ))}
                                </div>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-1 h-px bg-border" />
                                    <span className="px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Or continue with</span>
                                    <div className="flex-1 h-px bg-border" />
                                </div>
                            </>
                        )}

                        <form onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgotPassword} className="space-y-5">
                            {mode === 'signup' && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            placeholder="Jane Doe"
                                            required
                                            className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border bg-white text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="hello@example.com"
                                        required
                                        className="w-full h-14 pl-12 pr-4 rounded-2xl border border-border bg-white text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                    />
                                </div>
                            </div>

                            {mode !== 'forgot-password' && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Password</label>
                                        {mode === 'login' && (
                                            <button type="button" onClick={() => setMode('forgot-password')} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                                                Forgot?
                                            </button>
                                        )}
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full h-14 pl-12 pr-12 rounded-2xl border border-border bg-white text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-14 rounded-2xl bg-black text-white hover:bg-primary font-black uppercase text-xs tracking-widest shadow-xl transition-all disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? "Processing..." : (
                                    <span className="flex items-center gap-2">
                                        {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Link'}
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        <div className="pt-6 text-center">
                            <button
                                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                                className="text-sm font-medium text-muted-foreground"
                            >
                                {mode === 'login'
                                    ? <>New to BeliBeli? <span className="text-black font-black uppercase tracking-tight hover:text-primary transition-colors">Create Account</span></>
                                    : <>Already have an account? <span className="text-black font-black uppercase tracking-tight hover:text-primary transition-colors">Sign In</span></>}
                            </button>
                        </div>
                    </div>

                    {mode === 'login' && (
                        <div className="pt-10 border-t border-border flex flex-col items-center gap-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                {isMerchantLogin ? "Looking for your orders?" : "Are you a merchant?"}
                            </p>
                            <Link
                                to={isMerchantLogin ? "/login" : "/ecommerce-login"}
                                className="text-xs font-bold px-6 py-2 rounded-full border border-border hover:bg-secondary transition-all"
                            >
                                {isMerchantLogin ? "Customer Login" : "Merchant Portal"}
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

