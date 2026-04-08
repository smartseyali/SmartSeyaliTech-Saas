import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
    Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
    Sparkles, ShieldCheck, ShoppingBag, User as UserIcon,
    Zap, Globe, Layers, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PLATFORM_CONFIG from "@/config/platform";
import { cn } from "@/lib/utils";
import { PlatformLoader } from "@/components/PlatformLoader";

export default function Login() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [mode, setMode] = useState<"login" | "forgot-password">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [redirecting, setRedirecting] = useState(false);

    useEffect(() => {
        if (user && !authLoading) {
            checkRoleAndRedirect();
        }
    }, [user?.id, authLoading]);

    const checkRoleAndRedirect = async () => {
        if (!user) return;
        setRedirecting(true);
        try {
            const isSuperAdminByEmail = user.email?.toLowerCase() === PLATFORM_CONFIG.superAdminEmail.toLowerCase();
            if (isSuperAdminByEmail) {
                navigate("/super-admin", { replace: true });
                return;
            }
            const { data: localUser } = await supabase
                .from('users')
                .select('is_super_admin')
                .ilike('username', user.email || '')
                .maybeSingle();

            if (localUser?.is_super_admin) {
                navigate("/super-admin", { replace: true });
                return;
            }
            const [{ data: mappings }, { data: ownedCompanies }] = await Promise.all([
                supabase.from('company_users').select('role').eq('user_id', user.id),
                supabase.from('companies').select('id').eq('user_id', user.id).limit(1)
            ]);
            const hasCompany = (mappings && mappings.length > 0) || (ownedCompanies && ownedCompanies.length > 0);
            if (!hasCompany) {
                navigate(`/onboarding${window.location.search}`, { replace: true });
                return;
            }
            navigate("/apps", { replace: true });
        } catch (err) {
            navigate("/apps", { replace: true });
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast({ title: "Welcome back!", description: "Access granted successfully." });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Authentication Failed", description: err?.message });
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
            toast({ variant: "destructive", title: "Error", description: err?.message });
        } finally { setLoading(false); }
    };

    if (authLoading || redirecting) {
        return <PlatformLoader message="Authorizing Session" subtext="Security Node Validation" />;
    }

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-primary-600/10 overflow-hidden">
            {/* Left Side: Visual/Branding */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-slate-900 h-screen">
                <img
                    src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&q=80"
                    alt="Platform Infrastructure"
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                <div className="relative z-10 p-12 lg:p-20 flex flex-col justify-between h-full">
                    <Link to="/" className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="h-12 w-auto brightness-0 invert" />
                        <span className="text-xl lg:text-2xl font-bold text-white tracking-tight">{PLATFORM_CONFIG.name}</span>
                    </Link>

                    <div className="space-y-6 max-w-lg">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
                            Powering the next generation of <br />
                            <span className="text-primary-400">digital enterprises.</span>
                        </h2>
                        <p className="text-lg lg:text-xl text-slate-300 leading-relaxed font-medium">
                            A unified ecosystem for modern businesses to build, manage, and scale their digital core with industrial precision.
                        </p>
                    </div>

                    <div className="flex items-center gap-12 text-white">
                        <div className="space-y-1">
                            <p className="text-2xl lg:text-3xl font-bold">99.9%</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Uptime</p>
                        </div>
                        <div className="w-px h-10 bg-slate-700" />
                        <div className="space-y-1">
                            <p className="text-2xl lg:text-3xl font-bold">Secure</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Tier-1 Encryption</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 lg:p-16 xl:p-24 bg-white relative h-screen overflow-y-auto">
                <div className="w-full max-w-sm flex flex-col h-full justify-center">
                    <div className="mb-8">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary-600 transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </Link>
                    </div>
                    <div className="lg:hidden mb-12">
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Logo" className="h-10 w-auto" />
                            <span className="text-xl font-bold text-gray-900">{PLATFORM_CONFIG.name}</span>
                        </Link>
                    </div>

                    <div className="space-y-10 my-auto py-8">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                                {mode === 'login' ? 'Continue to Platform' : 'Reset Password'}
                            </h1>
                            <p className="text-gray-500 font-medium">
                                {mode === 'login'
                                    ? 'Enter your credentials to access your business dashboard.'
                                    : 'We will send a reset link to your registered email address.'}
                            </p>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={mode}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="space-y-8"
                            >
                                <form onSubmit={mode === 'login' ? handleLogin : handleForgotPassword} className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Business Email</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-600 transition-colors" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="name@company.com"
                                                required
                                                className="h-14 pl-12 rounded-xl border-gray-200 bg-slate-50/50 focus:bg-white transition-all font-medium"
                                            />
                                        </div>
                                    </div>

                                    {mode === 'login' && (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between mx-1">
                                                <Label htmlFor="password" className="text-xs font-bold text-gray-400 uppercase tracking-widest">Password</Label>
                                                <button
                                                    type="button"
                                                    onClick={() => setMode('forgot-password')}
                                                    className="text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline transition-all"
                                                >
                                                    Forgot?
                                                </button>
                                            </div>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-600 transition-colors" />
                                                <Input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    placeholder="••••••••••••"
                                                    required
                                                    className="h-14 pl-12 pr-12 rounded-xl border-gray-200 bg-slate-50/50 focus:bg-white transition-all font-medium"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-14 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-md shadow-lg shadow-primary-600/10 transition-all flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <span className="animate-pulse">Authenticating...</span>
                                        ) : (
                                            <>
                                                {mode === 'login' ? 'Login Now' : 'Send Reset Link'}
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </Button>
                                </form>

                                <div className="relative flex items-center py-2">
                                    <div className="flex-1 h-px bg-gray-100" />
                                    <span className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Secure Enterprise Access</span>
                                    <div className="flex-1 h-px bg-gray-100" />
                                </div>

                                <div className="text-center space-y-4">
                                    {mode === 'forgot-password' ? (
                                        <button
                                            onClick={() => setMode('login')}
                                            className="text-sm font-bold text-gray-500 hover:text-primary-600 transition-colors"
                                        >
                                            Back to Login
                                        </button>
                                    ) : (
                                        <Link
                                            to={`/onboarding${window.location.search}`}
                                            className="inline-flex items-center text-sm font-bold text-gray-700 hover:text-primary-600 transition-colors group"
                                        >
                                            No account yet? <span className="text-primary-600 ml-1.5 group-hover:underline">Start your project setup →</span>
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <div className="mt-auto pt-10 border-t border-gray-100 flex justify-center gap-8 opacity-40 grayscale pb-8">
                        <div className="flex flex-col items-center">
                            <ShieldCheck className="w-6 h-6 mb-1" />
                            <span className="text-xs font-bold uppercase tracking-widest">Encrypted</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <Globe className="w-6 h-6 mb-1" />
                            <span className="text-xs font-bold uppercase tracking-widest">Global</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}
