import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Loader2, CheckCircle, ShieldCheck, Zap, HeadphonesIcon } from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";
import { PlatformLoader } from "@/components/PlatformLoader";
import { MFAChallenge } from "@/components/auth/MFAChallenge";
import { needsMfaChallenge } from "@/lib/auth/mfa";

const PRIMARY = "#2563EB";

const TRUST_POINTS = [
  { icon: ShieldCheck, text: "Enterprise-grade security & encryption" },
  { icon: Zap,         text: "Real-time sync across all modules" },
  { icon: HeadphonesIcon, text: "24/7 dedicated support included" },
  { icon: CheckCircle, text: "Trusted by 50+ businesses in India" },
];

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
      const isSuperAdminByEmail =
        user.email?.toLowerCase() === PLATFORM_CONFIG.superAdminEmail.toLowerCase();
      if (isSuperAdminByEmail) { navigate("/super-admin", { replace: true }); return; }

      const { data: localUser } = await supabase
        .from("users").select("is_super_admin").ilike("username", user.email || "").maybeSingle();
      if (localUser?.is_super_admin) { navigate("/super-admin", { replace: true }); return; }

      const { data: profile, error: profileErr } = await supabase
        .from("users").select("email_verified").eq("id", user.id).maybeSingle();
      if (!profileErr && profile && profile.email_verified === false) {
        navigate("/verify-email-pending", { replace: true }); return;
      }

      const [{ data: mappings }, { data: ownedCompanies }] = await Promise.all([
        supabase.from("company_users").select("role").eq("user_id", user.id),
        supabase.from("companies").select("id").eq("user_id", user.id).limit(1),
      ]);
      const hasCompany =
        (mappings && mappings.length > 0) || (ownedCompanies && ownedCompanies.length > 0);
      if (!hasCompany) { navigate(`/onboarding${window.location.search}`, { replace: true }); return; }
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
    <div className="min-h-screen flex">

      {/* ── Left brand panel ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-[40%] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "#EFF6FF" }}
      >
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />

        <div className="relative z-10">
          {/* Logo */}
          <Link to="/" className="inline-block mb-14">
            <img src="/logo.png" alt={PLATFORM_CONFIG.name} className="h-28 w-auto object-contain" />
          </Link>

          <h2 className="text-3xl xl:text-4xl font-bold text-blue-900 leading-tight mb-4">
            One Platform.
            <br />
            Every Department.
          </h2>
          <p className="text-blue-700/70 text-base leading-relaxed mb-12 max-w-sm">
            Sign in to manage your commerce, finance, HR, CRM, and analytics — all from a single,
            beautifully unified dashboard.
          </p>

          <ul className="space-y-4">
            {TRUST_POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-blue-800">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-blue-600" />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10">
          <p className="text-xs text-blue-400">
            &copy; {new Date().getFullYear()} {PLATFORM_CONFIG.name} Tech. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-10">
        <div className="w-full max-w-[420px]">

          {/* Mobile back link */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-8 lg:hidden"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to home
          </Link>

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <img src="/logo.png" alt={PLATFORM_CONFIG.name} className="h-28 w-auto object-contain" />
          </div>

          {/* Desktop back link */}
          <Link
            to="/"
            className="hidden lg:inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to site
          </Link>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === "login" ? "Sign in to your account" : "Reset your password"}
            </h1>
            <p className="text-sm text-gray-500">
              {mode === "login"
                ? "Enter your credentials to access the dashboard."
                : "We'll send a reset link to your email address."}
            </p>
          </div>

          {/* Form card */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <form
              onSubmit={mode === "login" ? handleLogin : handleForgotPassword}
              className="space-y-4"
            >
              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  autoComplete="email"
                  className="h-10 rounded border-gray-200 text-sm focus:border-blue-300"
                />
              </div>

              {/* Password */}
              {mode === "login" && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={() => setMode("forgot-password")}
                      className="text-xs font-medium hover:opacity-80 transition-opacity"
                      style={{ color: PRIMARY }}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className="h-10 rounded border-gray-200 pr-9 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword
                        ? <EyeOff className="w-3.5 h-3.5" />
                        : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded font-semibold text-sm text-white shadow-sm disabled:opacity-60 mt-1"
                style={{ background: PRIMARY }}
              >
                {loading ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                    {mode === "login" ? "Signing in…" : "Sending link…"}
                  </>
                ) : (
                  <>{mode === "login" ? "Sign In" : "Send Reset Link"}
                    <ArrowRight className="w-3.5 h-3.5 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* Below form */}
          <div className="mt-5 text-center">
            {mode === "forgot-password" ? (
              <button
                onClick={() => setMode("login")}
                className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
              >
                ← Back to sign in
              </button>
            ) : (
              <p className="text-xs text-gray-500">
                Don't have an account?{" "}
                <Link
                  to={`/onboarding${window.location.search}`}
                  className="font-semibold hover:opacity-80"
                  style={{ color: PRIMARY }}
                >
                  Get started free
                </Link>
              </p>
            )}
          </div>

          <p className="text-[11px] text-gray-300 text-center mt-8">
            &copy; {new Date().getFullYear()} {PLATFORM_CONFIG.name} Tech. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
