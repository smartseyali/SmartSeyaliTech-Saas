import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
    Mail, Lock, Eye, EyeOff, ArrowRight,
    Sparkles, ShieldCheck, ShoppingBag, User as UserIcon,
    Chrome, Github, Twitter, Zap, Globe, Layers, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PLATFORM_CONFIG from "@/config/platform";
import { cn } from "@/lib/utils";

export default function Login() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // SaaS is for merchants by default
    const isMerchantLogin = window.location.pathname === "/login" || window.location.pathname === "/ecommerce-login";
    const [mode, setMode] = useState<"login" | "forgot-password">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Handle Redirection based on Role
    useEffect(() => {
        if (user && !authLoading) {
            checkRoleAndRedirect();
        }
    }, [user, authLoading, navigate]);

    const checkRoleAndRedirect = async () => {
        if (!user) return;

        try {
            // HARDCORE BYPASS for the Primary Super Admin
            const isSuperAdminByEmail = user.email?.toLowerCase() === PLATFORM_CONFIG.superAdminEmail.toLowerCase();

            if (isSuperAdminByEmail) {
                console.log("Super Admin detected via email bypass");
                navigate("/super-admin");
                return;
            }

            // Check DB for Super Admin status
            const { data: localUser } = await supabase
                .from('users')
                .select('is_super_admin')
                .ilike('username', user.email || '')
                .maybeSingle();

            if (localUser?.is_super_admin) {
                navigate("/super-admin");
                return;
            }

            // Regular User Logic: Check if they have a company
            const [{ data: mappings }, { data: ownedCompanies }] = await Promise.all([
                supabase.from('company_users').select('role').eq('user_id', user.id),
                supabase.from('companies').select('id').eq('user_id', user.id).limit(1)
            ]);

            const hasCompany = (mappings && mappings.length > 0) || (ownedCompanies && ownedCompanies.length > 0);

            if (!hasCompany) {
                // Logged in but no company — send to onboarding to finish setup
                navigate(`/onboarding${window.location.search}`);
                return;
            }

            // Go to dashboard (App Launcher)
            navigate("/apps");
        } catch (err) {
            console.error("Redirect Error:", err);
            navigate("/apps");
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast({ title: "Welcome back!", description: "Logged in successfully." });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Login Failed", description: err?.message });
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
            toast({ title: "Email Sent", description: "Password reset link sent to your email." });
            setMode("login");
        } catch (err: any) {
            toast({ variant: "destructive", title: "Email Failed", description: err?.message });
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex overflow-hidden selection:bg-primary-600/10 font-sans">
            {/* ── Background Elements ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-primary-100/50 rounded-full blur-[200px] opacity-40 animate-blob" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-teal-100/40 rounded-full blur-[200px] opacity-30 animate-blob animation-delay-2000" />
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:40px_40px] opacity-40" />
            </div>

            {/* ── Left Sidebar (Brand/Promo) ── */}
            <div className="hidden lg:flex w-[40%] relative z-10 flex-col justify-between p-20 border-r border-slate-100 bg-white">
                <div>
                    <Link to="/" className="flex items-center gap-5 group">
                        <div className="w-14 h-14 bg-primary-600 rounded-[20px] flex items-center justify-center text-white shadow-2xl shadow-primary-500/30 transition-transform group-hover:scale-110">
                            <Zap className="w-7 h-7 fill-current" />
                        </div>
                        <div>
                            <span className="text-slate-900 font-bold text-3xl tracking-tight block leading-none mb-1 text-primary-600 font-outfit">{PLATFORM_CONFIG.name}</span>
                            <span className="text-slate-400 text-[11px] uppercase font-bold tracking-[0.4em]">{PLATFORM_CONFIG.tagline}</span>
                        </div>
                    </Link>
                </div>

                <div className="space-y-16">
                    <div className="flex gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-16 h-16 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner hover:border-primary-200 transition-colors">
                                {i === 1 && <Globe className="w-7 h-7 text-primary-600" />}
                                {i === 2 && <Layers className="w-7 h-7 text-teal-600" />}
                                {i === 3 && <ShoppingBag className="w-7 h-7 text-primary-500" />}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-7xl font-bold text-slate-900 leading-[0.8] tracking-tighter uppercase italic font-outfit">
                            Build. <br />
                            Manage<span className="text-primary-600">.</span>
                            <br />
                            Grow.
                        </h2>
                        <p className="text-slate-400 max-w-sm text-lg font-bold leading-relaxed uppercase tracking-widest">
                            The complete platform for your <span className="text-slate-900">Digital Store</span>.
                        </p>
                    </div>

                    <div className="flex items-center gap-12">
                        <div>
                            <p className="text-slate-900 font-black text-3xl leading-none italic">99.99<span className="text-primary-600">%</span></p>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Platform Uptime</p>
                        </div>
                        <div className="w-px h-12 bg-slate-100" />
                        <div>
                            <p className="text-slate-900 font-black text-3xl leading-none italic">500<span className="text-primary-600">+</span></p>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Deployments</p>
                        </div>
                    </div>
                </div>

                <div className="text-slate-300 text-[10px] font-black uppercase tracking-[0.6em]">
                    © 2026 {PLATFORM_CONFIG.name} Systems · Standard Cloud
                </div>
            </div>

            {/* ── Main Auth Area ── */}
            <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-8 lg:p-20">
                <div className="w-full max-w-md space-y-12">
                    <div className="text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary-600/10 border border-primary-600/20 text-primary-600 text-[11px] font-black uppercase tracking-widest mb-8"
                        >
                            <ShieldCheck className="w-4 h-4" /> Secure Login
                        </motion.div>
                        <h1 className="text-6xl font-bold text-slate-900 tracking-tighter uppercase italic leading-[0.9] mb-6 font-outfit whitespace-pre-line">
                            {mode === 'login' ? 'Welcome \nBack' : 'Reset \nPassword'}
                        </h1>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[11px] leading-relaxed">
                            {mode === 'login' ? 'Login to access your dashboard.' : 'Enter your email to receive reset link.'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-10"
                        >
                            {/* Social Providers */}
                            <div className="grid grid-cols-3 gap-4">
                                {[{ icon: Chrome, label: 'Google' }, { icon: Github, label: 'Github' }, { icon: Twitter, label: 'Twitter' }].map((provider, i) => (
                                    <button key={i} className="h-16 rounded-2xl bg-white border border-slate-100 flex items-center justify-center hover:bg-slate-50 hover:border-primary-100 shadow-sm transition-all group">
                                        <provider.icon className="w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors" />
                                    </button>
                                ))}
                            </div>

                            <div className="relative flex items-center">
                                <div className="flex-1 h-px bg-slate-100" />
                                <span className="px-6 text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">Sign in with</span>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>

                            <form onSubmit={mode === 'login' ? handleLogin : handleForgotPassword} className="space-y-6">

                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 ml-1 italic">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-600 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="admin@example.com"
                                            required
                                            className="w-full h-18 pl-16 pr-6 rounded-[20px] bg-white border border-slate-100 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-8 focus:ring-primary-600/5 focus:border-primary-600/50 transition-all font-bold shadow-sm"
                                        />
                                    </div>
                                </div>

                                {mode !== 'forgot-password' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 italic">Account Password</label>
                                            {mode === 'login' && (
                                                <button type="button" onClick={() => setMode('forgot-password')} className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-600 hover:text-primary-700 transition-colors">
                                                    Forgot Password?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-focus-within:text-primary-600 transition-colors" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="••••••••••••"
                                                required
                                                className="w-full h-18 pl-16 pr-16 rounded-[20px] bg-white border border-slate-100 text-slate-900 placeholder:text-slate-200 focus:outline-none focus:ring-8 focus:ring-primary-600/5 focus:border-primary-600/50 transition-all font-bold shadow-sm"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200 hover:text-slate-900 transition-colors">
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-18 rounded-[24px] bg-slate-900 text-white hover:bg-black font-bold uppercase text-[11px] tracking-[0.4em] shadow-2xl shadow-slate-900/10 transition-all transform active:scale-95 disabled:opacity-50 mt-4 leading-none"
                                    disabled={loading}
                                >
                                    {loading ? "Processing..." : (
                                        <span className="flex items-center gap-4 justify-center">
                                            {mode === 'login' ? 'Login Now' : 'Send Instructions'}
                                            <ArrowRight className="w-5 h-5 stroke-[3]" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </motion.div>
                    </AnimatePresence>

                    <div className="pt-10 text-center flex flex-col gap-8">
                        {mode === 'forgot-password' && (
                            <button
                                onClick={() => setMode('login')}
                                className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-all group uppercase tracking-[0.2em]"
                            >
                                Already have an account? <span className="text-primary-600 group-hover:underline ml-1">Return to Login</span>
                            </button>
                        )}

                        <Link to={`/onboarding${window.location.search}`} className="text-xs font-bold text-slate-900 transition-all group uppercase tracking-[0.4em] flex items-center justify-center gap-3">
                            No account yet? <span className="w-8 h-px bg-slate-900/10" /> <span className="text-primary-600 group-hover:translate-x-1 transition-transform">Create New Store →</span>
                        </Link>

                        <div className="pt-8 border-t border-slate-100 flex gap-8 justify-center opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">PCI-DSS L1</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">SOC2 Type II</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">ISO 27001</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
