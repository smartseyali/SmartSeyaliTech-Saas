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
import { cn } from "@/lib/utils";

export default function Login() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    // SaaS is for merchants by default
    const isMerchantLogin = window.location.pathname === "/login" || window.location.pathname === "/ecommerce-login";
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
            const { data: localUser } = await supabase
                .from('users')
                .select('is_super_admin')
                .ilike('username', user?.email || '')
                .maybeSingle();

            if (localUser?.is_super_admin) {
                navigate("/super-admin");
                return;
            }

            // Check if the user has any company (owned OR as a member)
            const [{ data: mappings }, { data: ownedCompanies }] = await Promise.all([
                supabase.from('company_users').select('role').eq('user_id', user?.id),
                supabase.from('companies').select('id').eq('user_id', user?.id).limit(1)
            ]);

            const hasCompany = (mappings && mappings.length > 0) || (ownedCompanies && ownedCompanies.length > 0);

            if (!hasCompany) {
                // Logged in but no company — send to onboarding to finish setup
                navigate("/onboarding");
                return;
            }

            // Go to ecommerce dashboard
            navigate("/ecommerce");
        } catch (err) {
            navigate("/ecommerce");
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast({ title: "Welcome back!", description: "Signature verification successful." });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Access Denied", description: err?.message });
        } finally { setLoading(false); }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } }
            });
            if (error) throw error;
            toast({ title: "Engine Initialized", description: "Your merchant account is being provisioned." });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Initialization Failed", description: err?.message });
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
            toast({ title: "Secure Link Sent", description: "Identity verification link dispatched." });
            setMode("login");
        } catch (err: any) {
            toast({ variant: "destructive", title: "Dispatch Failed", description: err?.message });
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex overflow-hidden selection:bg-blue-500/30">
            {/* ── Background Elements ── */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
            </div>

            {/* ── Left Sidebar (Brand/Promo) ── */}
            <div className="hidden lg:flex w-[40%] relative z-10 flex-col justify-between p-16 border-r border-white/5 bg-black/20 backdrop-blur-md">
                <div>
                    <Link to="/" className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-transform group-hover:rotate-12">
                            <Zap className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                            <span className="text-white font-black text-2xl uppercase tracking-tighter block leading-none">Smartseyali Tech</span>
                            <span className="text-white/40 text-[10px] uppercase font-bold tracking-[0.3em]">Enterprise Cloud Edition</span>
                        </div>
                    </Link>
                </div>

                <div className="space-y-12">
                    <div className="flex gap-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                                {i === 1 && <Globe className="w-6 h-6 text-blue-400" />}
                                {i === 2 && <Layers className="w-6 h-6 text-indigo-400" />}
                                {i === 3 && <ShoppingBag className="w-6 h-6 text-purple-400" />}
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-6xl font-black text-white leading-[0.9] tracking-tighter uppercase">
                            Consult. <br />
                            Scal<span className="text-blue-500 italic font-medium">e</span>. <br />
                            Deploy.
                        </h2>
                        <p className="text-white/40 max-w-sm text-lg font-medium leading-relaxed">
                            Smartseyali Tech: High-performance SaaS infrastructure & elite IT consulting for the modern enterprise.
                        </p>
                    </div>

                    <div className="flex items-center gap-10">
                        <div>
                            <p className="text-white font-black text-2xl leading-none">99.99%</p>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-2">SLA Guarantee</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div>
                            <p className="text-white font-black text-2xl leading-none">500+</p>
                            <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-2">Global Projects</p>
                        </div>
                    </div>
                </div>

                <div className="text-white/20 text-[10px] font-black uppercase tracking-[0.4em]">
                    © 2026 Smartseyali Tech Systems Inc.
                </div>
            </div>

            {/* ── Main Auth Area ── */}
            <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-8 lg:p-16">
                <div className="w-full max-w-md space-y-12 transition-all duration-700">
                    <div className="text-center lg:text-left">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6"
                        >
                            <ShieldCheck className="w-3 h-3" /> Secure Gateway Alpha
                        </motion.div>
                        <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-4">
                            {mode === 'login' ? 'Consultant Login' : mode === 'signup' ? 'Project Onboarding' : 'Recovery'}
                        </h1>
                        <p className="text-white/40 font-medium text-lg">
                            {mode === 'login' ? 'Secure access to the Smartseyali command center.' : 'Initialize your SaaS instance.'}
                        </p>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-8"
                        >
                            {/* Social Providers */}
                            <div className="grid grid-cols-3 gap-4">
                                {[Chrome, Github, Twitter].map((Icon, i) => (
                                    <button key={i} className="h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all group">
                                        <Icon className="w-5 h-5 text-white/40 group-hover:text-white transition-colors" />
                                    </button>
                                ))}
                            </div>

                            <div className="relative flex items-center">
                                <div className="flex-1 h-px bg-white/5" />
                                <span className="px-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Corporate ID</span>
                                <div className="flex-1 h-px bg-white/5" />
                            </div>

                            <form onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgotPassword} className="space-y-6">
                                {mode === 'signup' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Legal Entity / Full Name</label>
                                        <div className="relative group">
                                            <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={e => setFullName(e.target.value)}
                                                placeholder="Natesh Systems Ltd."
                                                required
                                                className="w-full h-16 pl-14 pr-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-1">Work Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            placeholder="admin@enterprise.com"
                                            required
                                            className="w-full h-16 pl-14 pr-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                {mode !== 'forgot-password' && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Secret Key</label>
                                            {mode === 'login' && (
                                                <button type="button" onClick={() => setMode('forgot-password')} className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400 transition-colors">
                                                    Recover?
                                                </button>
                                            )}
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="••••••••••••"
                                                required
                                                className="w-full h-16 pl-14 pr-14 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/10 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-bold"
                                            />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors">
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-18 rounded-2xl bg-white text-black hover:bg-white/90 font-black uppercase text-xs tracking-[0.2em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] transition-all transform active:scale-95 disabled:opacity-50 mt-4"
                                    disabled={loading}
                                >
                                    {loading ? "Decrypting Protocols..." : (
                                        <span className="flex items-center gap-3 justify-center">
                                            {mode === 'login' ? 'Access Console' : mode === 'signup' ? 'Deploy Infrastructure' : 'Send Pulse'}
                                            <ArrowRight className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>
                            </form>
                        </motion.div>
                    </AnimatePresence>

                    <div className="pt-8 text-center flex flex-col gap-4">
                        <button
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="text-sm font-bold text-white/40 hover:text-white transition-all group"
                        >
                            {mode === 'login'
                                ? <>Already verified? <span className="text-white group-hover:text-blue-500 transition-colors">Return to Console</span></>
                                : <>Already have an account? <span className="text-white group-hover:text-blue-500 transition-colors">Sign In</span></>}
                        </button>

                        <Link to="/onboarding" className="text-sm font-bold text-white/40 hover:text-white transition-all group">
                            New here? <span className="text-emerald-400 group-hover:text-emerald-300 transition-colors">Start your free setup →</span>
                        </Link>

                        <div className="pt-6 border-t border-white/5 flex gap-8 justify-center opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">PCI-DSS Level 1</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">GDPR Compliant</span>
                            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white">ISO 27001</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
