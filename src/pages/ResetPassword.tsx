import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, Check, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";

export default function ResetPassword() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Supabase recovery link will automatically sign the user in
        // but we should verify we have a session or at least the hash params
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // If no session, they might have manually navigated here or the link expired
                toast({
                    variant: "destructive",
                    title: "Invalid Session",
                    description: "Password reset link is invalid or has expired."
                });
                navigate("/login");
            }
        };
        checkSession();
    }, [navigate, toast]);

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast({ variant: "destructive", title: "Wait", description: "Password must be at least 6 characters." });
            return;
        }

        if (password !== confirmPassword) {
            toast({ variant: "destructive", title: "Error", description: "Passwords do not match." });
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            setSuccess(true);
            toast({ title: "Password Updated", description: "Your password has been changed successfully." });

            // Sign out to force a clean login with new credentials
            await supabase.auth.signOut();

            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err: any) {
            toast({ variant: "destructive", title: "Update Failed", description: err?.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8 relative overflow-hidden font-sans">
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]" />

            {/* Background blobs */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 -left-4 w-[600px] h-[600px] bg-primary-100/50 rounded-full blur-[150px] opacity-40 animate-blob" />
                <div className="absolute bottom-0 -right-4 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[150px] opacity-30 animate-blob animation-delay-2000" />
            </div>

            <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden relative z-10">
                <div className="p-8 md:p-12">
                    {success ? (
                        <div className="text-center space-y-8">
                            <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto shadow-inner">
                                <Check className="w-10 h-10 text-emerald-500 stroke-[3]" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900 uppercase ">Success!</h1>
                                <p className="text-slate-500 mt-2 text-xs font-bold uppercase tracking-widest">
                                    Your password has been reset. <br />Redirecting to login...
                                </p>
                            </div>
                            <div className="w-full bg-slate-50 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-primary-600 h-1.5 rounded-full w-full animate-pulse" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                                    <Sparkles className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <span className="font-bold text-2xl tracking-tight text-primary-600 block leading-none">{PLATFORM_CONFIG.name}</span>
                                    <span className="font-bold text-[13px] text-slate-500 uppercase tracking-widest leading-none">Security Center</span>
                                </div>
                            </div>

                            <div>
                                <h1 className="text-4xl font-bold text-slate-900 tracking-tighter uppercase  leading-none">New <span className="text-primary-600">Password</span></h1>
                                <p className="text-slate-500 text-xs font-bold mt-2 uppercase tracking-widest">Enter a secure new password.</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary-600 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full h-14 pl-14 pr-12 rounded-2xl border border-slate-100 bg-slate-50 text-slate-900 font-bold text-sm focus:outline-none focus:ring-8 focus:ring-primary-600/5 focus:border-primary-600 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary-600 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full h-14 pl-14 pr-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-900 font-bold text-sm focus:outline-none focus:ring-8 focus:ring-primary-600/5 focus:border-primary-600 transition-all"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-16 rounded-2xl bg-slate-900 text-white hover:bg-black font-bold uppercase tracking-widest text-xs shadow-xl transform active:scale-95 transition-all group mt-4 leading-none" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                        <>
                                            Update Password
                                            <ArrowRight className="w-5 h-5 ml-4 group-hover:translate-x-1 transition-transform stroke-[3]" />
                                        </>
                                    )}
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

