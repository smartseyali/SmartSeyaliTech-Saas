import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { sendTenantVerificationEmail } from "@/lib/services/emailService";
import { toast } from "sonner";
import { Mail, RefreshCw, Loader2, ArrowLeft, LogOut } from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";

export default function VerifyEmailPending() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [resendCooldown, setResendCooldown] = useState(0);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // If no user → login
    useEffect(() => {
        if (!user) {
            navigate("/login", { replace: true });
            return;
        }
        // Super admin bypass
        const isSuperAdmin = user.email?.toLowerCase() === PLATFORM_CONFIG.superAdminEmail.toLowerCase();
        if (isSuperAdmin) {
            navigate("/apps", { replace: true });
        }
    }, [user]);

    // Poll for email_verified in users table
    useEffect(() => {
        if (!user) return;

        const checkVerification = async () => {
            const { data } = await supabase
                .from("users")
                .select("email_verified")
                .eq("id", user.id)
                .maybeSingle();

            if (data?.email_verified) {
                if (pollRef.current) {
                    clearInterval(pollRef.current);
                    pollRef.current = null;
                }
                toast.success("Email verified successfully!");
                navigate("/apps", { replace: true });
            }
        };

        // Check immediately
        checkVerification();

        // Then poll every 5 seconds
        pollRef.current = setInterval(checkVerification, 5000);

        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [user?.id]);

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown <= 0) return;
        const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleResendEmail = async () => {
        if (resendCooldown > 0 || !user) return;
        try {
            // Generate a new verification token
            const { data, error } = await supabase.rpc("tenant_resend_verification", {
                p_user_id: user.id,
            });
            if (error) throw error;

            if (data?.already_verified) {
                toast.success("Email already verified!");
                navigate("/apps", { replace: true });
                return;
            }

            // Send the verification email
            if (data?.token) {
                const sent = await sendTenantVerificationEmail(
                    data.email || user.email || "",
                    data.full_name || user.user_metadata?.full_name || "",
                    data.token
                );
                if (sent) {
                    toast.success("Verification email sent!");
                } else {
                    toast.error("Failed to send email. Please check platform SMTP configuration.");
                }
            }

            setResendCooldown(60);
        } catch (err: any) {
            toast.error(err.message || "Failed to resend verification email.");
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Header */}
            <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
                <Link to="/" className="flex items-center gap-2">
                    <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
                </Link>
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                </button>
            </header>

            <div className="flex items-start justify-center px-4 pt-12 sm:pt-20">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 sm:p-10 text-center">
                        {/* Email icon */}
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-8 h-8 text-blue-600" />
                        </div>

                        <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                            Verify your email
                        </h2>
                        <p className="text-sm text-slate-500 mb-2">
                            We've sent a verification link to
                        </p>
                        <p className="text-base font-semibold text-slate-800 mb-6">
                            {user?.email}
                        </p>

                        <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6">
                            <p className="text-sm text-blue-700">
                                Please click the link in your email to verify your account.
                                You must verify before you can access the platform.
                            </p>
                        </div>

                        {/* Polling indicator */}
                        <div className="flex items-center justify-center gap-2 text-sm text-slate-400 mb-6">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Waiting for verification...</span>
                        </div>

                        {/* Resend */}
                        <div className="space-y-3">
                            <p className="text-xs text-slate-400">
                                Didn't receive the email? Check your spam folder or
                            </p>
                            <button
                                onClick={handleResendEmail}
                                disabled={resendCooldown > 0}
                                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition"
                            >
                                <RefreshCw className="w-4 h-4" />
                                {resendCooldown > 0
                                    ? `Resend in ${resendCooldown}s`
                                    : "Resend verification email"}
                            </button>
                        </div>

                        {/* Back to login */}
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <button
                                onClick={handleLogout}
                                className="text-sm font-medium text-slate-500 hover:text-slate-700 transition inline-flex items-center gap-1.5"
                            >
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back to login
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
