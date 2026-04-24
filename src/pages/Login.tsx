import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import {
    Eye, EyeOff, ArrowRight, ArrowLeft, Loader2,
} from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";
import { PlatformLoader } from "@/components/PlatformLoader";
import { MFAChallenge } from "@/components/auth/MFAChallenge";
import { needsMfaChallenge } from "@/lib/auth/mfa";

/**
 * ERPNext v16 Desk login — centered card, logo, minimal decoration.
 */
export default function Login() {
    const { user, loading: authLoading, aal } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [mode, setMode] = useState<"login" | "forgot-password">("login");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [redirecting, setRedirecting] = useState(false);

    const mfaRequired = !!user && needsMfaChallenge(aal);

    useEffect(() => {
        if (user && !authLoading && !mfaRequired) checkRoleAndRedirect();
    }, [user?.id, authLoading, mfaRequired]);

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
                .from("users")
                .select("is_super_admin")
                .ilike("username", user.email || "")
                .maybeSingle();

            if (localUser?.is_super_admin) {
                navigate("/super-admin", { replace: true });
                return;
            }

            const { data: profile, error: profileErr } = await supabase
                .from("users")
                .select("email_verified")
                .eq("id", user.id)
                .maybeSingle();

            // Only gate on verification when the flag is explicitly false.
            // If the column/row is missing or the query errors, fail-open — consistent with PermissionsContext.
            if (!profileErr && profile && profile.email_verified === false) {
                navigate("/verify-email-pending", { replace: true });
                return;
            }

            const [{ data: mappings }, { data: ownedCompanies }] = await Promise.all([
                supabase.from("company_users").select("role").eq("user_id", user.id),
                supabase.from("companies").select("id").eq("user_id", user.id).limit(1),
            ]);
            const hasCompany = (mappings && mappings.length > 0) || (ownedCompanies && ownedCompanies.length > 0);
            if (!hasCompany) {
                navigate(`/onboarding${window.location.search}`, { replace: true });
                return;
            }
            navigate("/apps", { replace: true });
        } catch {
            navigate("/apps", { replace: true });
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            toast({ title: "Welcome back", description: "Signed in successfully." });
        } catch (err: any) {
            toast({ variant: "destructive", title: "Login failed", description: err?.message });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            toast({ title: "Email sent", description: "Password reset link sent to your email." });
            setMode("login");
        } catch (err: any) {
            toast({ variant: "destructive", title: "Error", description: err?.message });
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || redirecting) {
        return <PlatformLoader message="Signing you in" subtext="Please wait" />;
    }

    if (mfaRequired) {
        return <MFAChallenge onVerified={checkRoleAndRedirect} />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-[400px]">
                {/* Back link */}
                <Link
                    to="/"
                    className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors mb-6 dark:hover:text-foreground"
                >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to home
                </Link>

                {/* Logo + brand */}
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center mb-3">
                        <img src="/logo.png" alt="Logo" className="h-7 w-auto brightness-0 invert" />
                    </div>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-foreground">
                        Sign in to {PLATFORM_CONFIG.name}
                    </h1>
                    <p className="text-xs text-gray-500 mt-1">
                        {mode === "login" ? "Enter your email and password" : "We'll email you a reset link"}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-card border border-gray-200 rounded-lg p-5 dark:border-border">
                    <form onSubmit={mode === "login" ? handleLogin : handleForgotPassword} className="space-y-3.5">
                        <div className="space-y-1">
                            <Label htmlFor="email">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        {mode === "login" && (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password">Password</Label>
                                    <button
                                        type="button"
                                        onClick={() => setMode("forgot-password")}
                                        className="text-xs font-medium text-primary hover:text-primary-700"
                                    >
                                        Forgot?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        required
                                        autoComplete="current-password"
                                        className="pr-9"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>
                        )}

                        <Button type="submit" disabled={loading} className="w-full" size="lg">
                            {loading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing in…
                                </>
                            ) : (
                                <>
                                    {mode === "login" ? "Sign In" : "Send Reset Link"}
                                    <ArrowRight className="w-3.5 h-3.5" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Below-card actions */}
                <div className="mt-4 text-center">
                    {mode === "forgot-password" ? (
                        <button
                            onClick={() => setMode("login")}
                            className="text-xs text-gray-500 hover:text-gray-800 transition-colors dark:hover:text-foreground"
                        >
                            ← Back to sign in
                        </button>
                    ) : (
                        <p className="text-xs text-gray-500">
                            Don't have an account?{" "}
                            <Link
                                to={`/onboarding${window.location.search}`}
                                className="font-medium text-primary hover:text-primary-700"
                            >
                                Create one
                            </Link>
                        </p>
                    )}
                </div>

                {/* Footer */}
                <p className="text-[11px] text-gray-400 text-center mt-8">
                    &copy; {new Date().getFullYear()} {PLATFORM_CONFIG.name}. All rights reserved.
                </p>
            </div>
        </div>
    );
}
