import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Lock, Eye, EyeOff, Check, ArrowRight, Sparkles } from "lucide-react";

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
        <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-8">
            <div className="absolute top-[-80px] left-[-80px] w-96 h-96 rounded-full opacity-20 blur-3xl"
                style={{ background: "radial-gradient(circle, #6366f1, transparent)" }} />
            <div className="absolute bottom-[-60px] right-[-60px] w-80 h-80 rounded-full opacity-15 blur-3xl"
                style={{ background: "radial-gradient(circle, #8b5cf6, transparent)" }} />

            <div className="w-full max-w-md bg-background rounded-3xl border border-white/10 shadow-2xl overflow-hidden relative z-10">
                <div className="p-8 md:p-12">
                    {success ? (
                        <div className="text-center space-y-6">
                            <div className="w-20 h-20 rounded-3xl bg-green-500/10 flex items-center justify-center mx-auto">
                                <Check className="w-10 h-10 text-green-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Success!</h1>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    Your password has been reset. Redirecting you to login...
                                </p>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                                <div className="bg-primary h-1.5 rounded-full w-full animate-pulse" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <span className="font-bold text-xl tracking-tight">SmartSuite</span>
                            </div>

                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">New password</h1>
                                <p className="text-muted-foreground text-sm mt-1.5">Enter a secure new password for your account</p>
                            </div>

                            <form onSubmit={handleResetPassword} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            minLength={6}
                                            className="w-full h-12 pl-10 pr-12 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="w-full h-12 pl-10 pr-4 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                                        />
                                    </div>
                                </div>

                                <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold group" disabled={loading}>
                                    {loading ? "Updating..." : "Update Password"}
                                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

