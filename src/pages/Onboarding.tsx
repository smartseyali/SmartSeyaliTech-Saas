import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/lib/supabase";
import { PLATFORM_MODULES, type PlatformModule } from "@/config/modules";
import { toast } from "sonner";
import { sendTenantVerificationEmail } from "@/lib/services/emailService";
import { initiateRazorpayPayment } from "@/lib/services/paymentService";
import PLATFORM_CONFIG from "@/config/platform";
import { listTemplates } from "@/lib/services/storefrontTemplateService";
import { createDeploymentRequest } from "@/lib/services/deploymentRequestService";
import type { StorefrontTemplate } from "@/types/storefront";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Eye,
  EyeOff,
  Search,
  X,
  Mail,
  RefreshCw,
  AlertCircle,
  LogOut,
  CreditCard,
  Globe2,
  Sparkles,
  ExternalLink,
} from "lucide-react";

// ── Constants ─────────────────────────────────────────────────
const INDUSTRIES = [
  "Retail",
  "Education",
  "Healthcare",
  "Services",
  "Manufacturing",
  "Technology",
  "Real Estate",
  "Food & Beverage",
  "Other",
] as const;

type Industry = (typeof INDUSTRIES)[number];

const SETUP_MESSAGES = [
  "Setting up workspace",
  "Installing apps",
  "Configuring defaults",
  "Done",
];

const LOCALSTORAGE_KEY = "smartseyali_onboarding_draft";

// ── Helpers ───────────────────────────────────────────────────
function generateSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "") +
    Math.random().toString(36).slice(2, 6)
  );
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function getTrialEndDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ── Save/Restore form data ───────────────────────────────────
interface OnboardingDraft {
  companyName: string;
  industry: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  fullName: string;
  companyEmail: string;
  loginEmail: string;
  phone: string;
  mobile: string;
  gstNo: string;
}

function saveDraft(data: OnboardingDraft) {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function loadDraft(): OnboardingDraft | null {
  try {
    const raw = localStorage.getItem(LOCALSTORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function clearDraft() {
  try {
    localStorage.removeItem(LOCALSTORAGE_KEY);
  } catch {}
}

// ── Step Indicator ────────────────────────────────────────────
const STEP_LABELS = ["Details", "Verify", "App store", "Payment", "Setup"];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2">
      {STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <React.Fragment key={i}>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium transition-all duration-200 ${
                  done
                    ? "bg-primary text-white"
                    : active
                    ? "bg-primary text-white ring-4 ring-primary-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : step}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  active
                    ? "text-gray-800 dark:text-foreground"
                    : done
                    ? "text-gray-500"
                    : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`w-6 h-px ${done ? "bg-primary-300" : "bg-gray-200"}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Module Card (App Store style) ─────────────────────────────
function ModuleCard({
  mod,
  selected,
  onInstall,
  onRemove,
  onViewDetails,
}: {
  mod: PlatformModule;
  selected: boolean;
  onInstall: () => void;
  onRemove: () => void;
  onViewDetails: () => void;
}) {
  return (
    <div
      className={`relative bg-white rounded-xl border transition-all duration-200 overflow-hidden flex flex-col cursor-pointer ${
        selected
          ? "border-blue-400 shadow-md ring-1 ring-blue-100"
          : "border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
      }`}
      onClick={onViewDetails}
    >
      {selected && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-blue-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-full z-10">
          <Check className="w-3 h-3" />
          Selected
        </div>
      )}
      {mod.status === "beta" && (
        <div className="absolute top-3 left-3 text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded z-10">
          Beta
        </div>
      )}
      <div className="px-5 pt-5 pb-3">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-gradient-to-br ${mod.colorFrom} ${mod.colorTo} shadow-sm`}
        >
          {mod.icon}
        </div>
      </div>
      <div className="px-5 pb-4 flex-1 flex flex-col">
        <h3 className="text-base font-semibold text-slate-800 mb-0.5">
          {mod.name}
        </h3>
        <p className="text-sm text-slate-500 mb-3 leading-snug">
          {mod.tagline}
        </p>
        <ul className="space-y-1.5 mb-4 flex-1">
          {mod.features.slice(0, 4).map((f, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-slate-600"
            >
              <span className="text-slate-300 mt-0.5">&#8226;</span>
              {f}
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div>
            {mod.isFree ? (
              <span className="text-sm font-semibold text-emerald-600">
                Free
              </span>
            ) : (
              <>
                <span className="text-sm font-semibold text-blue-600">
                  ₹{mod.priceMonthly}/mo
                </span>
                {mod.trialDays > 0 && (
                  <span className="block text-[11px] text-slate-400">
                    {mod.trialDays}-day free trial
                  </span>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selected ? (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="text-xs text-red-500 hover:text-red-600 font-medium transition"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={(e) => { e.stopPropagation(); onInstall(); }}
                className="px-3.5 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Install
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App Detail Panel (slide-over) ────────────────────────────
function AppDetailPanel({
  mod,
  selected,
  onInstall,
  onRemove,
  onClose,
}: {
  mod: PlatformModule;
  selected: boolean;
  onInstall: () => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hero gradient */}
        <div className={`h-36 bg-gradient-to-br ${mod.colorFrom} ${mod.colorTo} relative`}>
          <div className="absolute inset-0 bg-black/10" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 pb-8 -mt-10 relative">
          {/* Icon + name */}
          <div className="flex items-end gap-4 mb-5">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl bg-white shadow-lg border border-slate-100 shrink-0">
              {mod.icon}
            </div>
            <div className="pb-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-slate-900">{mod.name}</h2>
                {mod.status === "beta" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">Beta</span>
                )}
                {selected && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 inline-flex items-center gap-1">
                    <Check className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{mod.tagline}</p>
            </div>
          </div>

          {/* Pricing + Action */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-6 flex items-center justify-between">
            <div>
              {mod.isFree ? (
                <span className="text-lg font-bold text-emerald-600">Free</span>
              ) : (
                <div>
                  <span className="text-lg font-bold text-slate-900">₹{mod.priceMonthly}</span>
                  <span className="text-sm text-slate-500">/month</span>
                  {mod.trialDays > 0 && (
                    <p className="text-xs text-blue-600 font-medium mt-0.5">{mod.trialDays}-day free trial</p>
                  )}
                </div>
              )}
            </div>
            {selected ? (
              <button
                onClick={onRemove}
                className="px-5 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={onInstall}
                className="px-5 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                Add to Workspace
              </button>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-2">About this app</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{mod.description}</p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Features & Capabilities</h3>
            <div className="space-y-2">
              {mod.features.map((f, i) => (
                <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-600" />
                  </div>
                  <span className="text-sm text-slate-700">{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Specs */}
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Specifications</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div>
                <dt className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Category</dt>
                <dd className="text-slate-800 font-medium mt-0.5 capitalize">{mod.category}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Status</dt>
                <dd className="text-slate-800 font-medium mt-0.5 capitalize">{mod.status}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">License</dt>
                <dd className="text-slate-800 font-medium mt-0.5">{mod.isFree ? "Free" : "Subscription"}</dd>
              </div>
              {mod.trialDays > 0 && (
                <div>
                  <dt className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Trial Period</dt>
                  <dd className="text-slate-800 font-medium mt-0.5">{mod.trialDays} days</dd>
                </div>
              )}
              <div>
                <dt className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Requires</dt>
                <dd className="text-slate-800 font-medium mt-0.5">Master Data Hub</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function Onboarding() {
  const { user, signOut } = useAuth();
  const { refreshTenant, needsOnboarding, companies, loading: tenantLoading } = useTenant();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Step state ──────────────────────────────────────────────
  const [step, setStep] = useState(1);

  // Step 1 fields
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState<Industry>("Retail");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("India");
  const [fullName, setFullName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [gstNo, setGstNo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 (verification) fields
  const [resendCooldown, setResendCooldown] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Fallback when SMTP delivery fails: stash the verification link so the user
  // can click it directly from the UI to finish signup. Cleared on success.
  const [pendingVerifyUrl, setPendingVerifyUrl] = useState<string | null>(null);
  const [emailSendError, setEmailSendError] = useState<string | null>(null);

  // Step 3 fields (App Store)
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [detailModule, setDetailModule] = useState<PlatformModule | null>(null);

  // Step 3b: Template + custom-domain picker for modules with needsTemplate=true.
  // Active only while onTemplateModuleIdx !== null; null means we're on the app-store view.
  const [onTemplateModuleIdx, setOnTemplateModuleIdx] = useState<number | null>(null);
  const [templateChoices, setTemplateChoices] = useState<
    Record<string, { templateId: number; customDomain: string }>
  >({});
  const [availableTemplates, setAvailableTemplates] = useState<StorefrontTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<StorefrontTemplate | null>(null);
  const modulesNeedingTemplates = selectedModules.filter(
    (id) => PLATFORM_MODULES.find((m) => m.id === id)?.needsTemplate,
  );
  const currentTemplateModuleId =
    onTemplateModuleIdx !== null ? modulesNeedingTemplates[onTemplateModuleIdx] : null;
  const currentTemplateChoice = currentTemplateModuleId
    ? templateChoices[currentTemplateModuleId]
    : undefined;

  // Step 4 fields (Payment)
  const [platformSettings, setPlatformSettings] = useState<{
    razorpay_key_id: string | null;
    currency: string;
    currency_symbol: string;
  } | null>(null);

  // Step 5 fields (Setup)
  const [setupIndex, setSetupIndex] = useState(0);
  const [setupDone, setSetupDone] = useState(false);
  const [createdCompanyName, setCreatedCompanyName] = useState("");
  const [firstRoute, setFirstRoute] = useState("/apps");

  // Global
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Ref to prevent useEffect from overriding step during active signup
  const isSigningUp = useRef(false);

  // ── Redirect logic for logged-in users ───────────────────────
  useEffect(() => {
    if (!user || tenantLoading) return;

    // Pre-fill fields from user profile
    setLoginEmail(user.email || "");
    setFullName(user.user_metadata?.full_name || "");

    // If user already has a company → redirect to installed apps
    if (!needsOnboarding && companies.length > 0) {
      navigate("/apps", { replace: true });
      return;
    }

    // Don't auto-advance if signup is in progress (handleStep1Next controls the flow)
    if (isSigningUp.current) return;

    // User is logged in but has no company → check email verification before advancing
    if (step === 1 && searchParams.get("step") !== "verified") {
      supabase
        .from("users")
        .select("email_verified")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          // Only advance if signup isn't in progress (could have started while query ran)
          if (isSigningUp.current) return;
          if (data?.email_verified) {
            setStep(3); // Verified → app store
          } else if (data && data.email_verified === false) {
            // User exists but not verified → show verification step
            generateAndSendVerification(user.id, user.email || "", user.user_metadata?.full_name || "")
              .catch((verifyErr: any) => {
                toast.error(
                  verifyErr?.message
                    ? `Couldn't send verification email: ${verifyErr.message}`
                    : "Couldn't send verification email. You can resend from the next screen."
                );
              });
            setResendCooldown(60);
            setStep(2);
          }
          // If data is null (user not in public.users yet), stay on step 1
        });
    }
  }, [user?.id, tenantLoading, needsOnboarding, companies.length]);

  // ── Detect redirect from email verification link ────────────
  useEffect(() => {
    const stepParam = searchParams.get("step");
    if (stepParam === "verified") {
      // Remove the query param
      searchParams.delete("step");
      setSearchParams(searchParams, { replace: true });

      // Restore draft data
      const draft = loadDraft();
      if (draft) {
        setCompanyName(draft.companyName);
        setIndustry(draft.industry as Industry);
        setAddressLine1(draft.addressLine1);
        setAddressLine2(draft.addressLine2);
        setCity(draft.city);
        setState(draft.state);
        setPincode(draft.pincode);
        setCountry(draft.country);
        setFullName(draft.fullName);
        setCompanyEmail(draft.companyEmail);
        setLoginEmail(draft.loginEmail);
        setPhone(draft.phone);
        setMobile(draft.mobile);
        setGstNo(draft.gstNo);
      }

      // Check if user is verified (from our users table)
      const checkVerified = async () => {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          const { data: profile } = await supabase
            .from("users")
            .select("email_verified")
            .eq("id", sessionData.session.user.id)
            .maybeSingle();

          if (profile?.email_verified) {
            toast.success("Email verified successfully!");
            setStep(3);
            return;
          }
        }
        // Not verified yet — show verification step
        setStep(2);
      };
      checkVerified();
    }
  }, []);

  // ── Polling for email verification (Step 2) ─────────────────
  // Polls the users table for email_verified = true (set by tenant_verify_email RPC)
  useEffect(() => {
    if (step !== 2) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        if (!user) return;
        const { data } = await supabase
          .from("users")
          .select("email_verified")
          .eq("id", user.id)
          .maybeSingle();

        if (data?.email_verified) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          toast.success("Email verified successfully!");
          setStep(3);
        }
      } catch {}
    }, 5000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [step, user?.id]);

  // ── Resend cooldown timer ───────────────────────────────────
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // ── Modules data ────────────────────────────────────────────
  const selectableModules = PLATFORM_MODULES.filter(
    (m) => m.id !== "masters" && (m.status === "live" || m.status === "beta")
  );

  const filteredModules = searchQuery.trim()
    ? selectableModules.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.features.some((f) =>
            f.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    : selectableModules;

  const monthlyTotal = selectedModules.reduce((sum, id) => {
    const mod = PLATFORM_MODULES.find((m) => m.id === id);
    return sum + (mod?.priceMonthly || 0);
  }, 0);

  // Fetch platform settings (Razorpay key) when reaching app store or payment step
  useEffect(() => {
    if (step >= 3 && !platformSettings) {
      supabase
        .from("platform_settings")
        .select("razorpay_key_id, currency, currency_symbol")
        .eq("id", 1)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setPlatformSettings(data);
        });
    }
  }, [step]);

  const hasNonFreeApps = selectedModules.some((id) => {
    const mod = PLATFORM_MODULES.find((m) => m.id === id);
    return mod && !mod.isFree;
  });

  // ── Toggle module ───────────────────────────────────────────
  function toggleModule(id: string) {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  // ── Validation ──────────────────────────────────────────────
  function validateStep1(): boolean {
    if (!companyName.trim()) {
      setError("Company name is required.");
      return false;
    }
    if (!fullName.trim()) {
      setError("Contact person name is required.");
      return false;
    }
    if (!loginEmail.trim()) {
      setError("Login email is required.");
      return false;
    }
    if (!phone.trim()) {
      setError("Phone number is required.");
      return false;
    }
    if (!user && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    return true;
  }

  // ── Step 1 → Sign Up & go to verification ──────────────────
  async function handleStep1Next() {
    setError("");
    if (!validateStep1()) return;

    // If user is already logged in (returning user with no company), check verification
    if (user) {
      isSigningUp.current = true;
      try {
        const { data: profile } = await supabase
          .from("users")
          .select("email_verified")
          .eq("id", user.id)
          .maybeSingle();

        if (profile?.email_verified) {
          setStep(3);
        } else {
          // Need to verify — generate token & send email
          try {
            await generateAndSendVerification(user.id, user.email || loginEmail, fullName);
            toast.success("Verification email sent. Check your inbox.");
          } catch (verifyErr: any) {
            toast.error(
              verifyErr?.message
                ? `Couldn't send verification email: ${verifyErr.message}`
                : "Couldn't send verification email. You can resend from the next screen."
            );
          }
          setResendCooldown(60);
          setStep(2);
        }
      } finally {
        isSigningUp.current = false;
      }
      return;
    }

    isSigningUp.current = true;
    setLoading(true);
    try {
      // Save form data to localStorage (for cross-tab redirect recovery)
      saveDraft({
        companyName, industry, addressLine1, addressLine2,
        city, state, pincode, country, fullName,
        companyEmail, loginEmail, phone, mobile, gstNo,
      });

      const { data: authData, error: signUpErr } = await supabase.auth.signUp({
        email: loginEmail,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/onboarding?step=verified`,
        },
      });

      if (signUpErr) {
        // User already exists
        if (
          signUpErr.message.toLowerCase().includes("already registered") ||
          signUpErr.message.toLowerCase().includes("already exists")
        ) {
          setError(
            "An account with this email already exists. Please log in instead."
          );
          setLoading(false);
          return;
        }
        throw signUpErr;
      }

      // Ensure user profile exists in public.users (with email_verified = false)
      const signedUpUser = authData.session?.user || authData.user;
      if (!signedUpUser) {
        throw new Error("Sign-up returned no user. Please try again.");
      }

      const { error: upsertErr } = await supabase.from("users").upsert({
        id: signedUpUser.id,
        username: loginEmail,
        full_name: fullName || loginEmail.split("@")[0],
        is_super_admin: false,
        email_verified: false,
      }, { onConflict: "id" });
      if (upsertErr) {
        // Typically RLS failure when Supabase email-confirm is ON and no session was returned.
        // The handle_new_user trigger should have already created the row, so this is best-effort.
        console.warn("users upsert blocked (expected if no session yet):", upsertErr.message);
      }

      // Generate verification token & send email — surface any failure so the user knows what broke
      try {
        await generateAndSendVerification(signedUpUser.id, loginEmail, fullName);
        toast.success("Verification email sent. Check your inbox.");
      } catch (verifyErr: any) {
        toast.error(
          verifyErr?.message
            ? `Couldn't send verification email: ${verifyErr.message}`
            : "Couldn't send verification email. You can resend from the next screen."
        );
      }

      // Always go to verification step — regardless of session/confirm-email setting
      setResendCooldown(60);
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      isSigningUp.current = false;
      setLoading(false);
    }
  }

  // ── Generate verification token & send email ────────────────
  // Throws on failure so the caller can surface the specific reason to the user.
  // Always stashes the resulting verify URL in state so the UI can offer a
  // "click to verify" fallback when SMTP delivery is down.
  async function generateAndSendVerification(userId: string, email: string, name: string) {
    const { data, error } = await supabase.rpc("tenant_generate_verification", {
      p_user_id: userId,
    });
    if (error) {
      // "permission denied" here usually means Supabase email-confirm is ON and no session exists yet.
      throw new Error(`Verification setup failed: ${error.message}`);
    }
    if (data?.already_verified) {
      setPendingVerifyUrl(null);
      setEmailSendError(null);
      return;
    }
    if (!data?.token) {
      throw new Error("Verification token was not returned. Check that tenant_email_verification.sql has been run.");
    }

    const verifyUrl = `${window.location.origin}/verify-tenant-email?token=${data.token}`;
    setPendingVerifyUrl(verifyUrl);

    try {
      await sendTenantVerificationEmail(email, name || email.split("@")[0], data.token);
      setEmailSendError(null);
    } catch (sendErr: any) {
      setEmailSendError(sendErr?.message || "Email could not be sent");
      throw sendErr;
    }
  }

  // ── Resend verification email ───────────────────────────────
  async function handleResendEmail() {
    if (resendCooldown > 0) return;
    try {
      const activeUser = user;
      if (!activeUser) {
        toast.error("Please sign in first.");
        return;
      }

      const { data, error } = await supabase.rpc("tenant_resend_verification", {
        p_user_id: activeUser.id,
      });
      if (error) throw error;

      if (data?.already_verified) {
        toast.success("Email already verified!");
        setStep(3);
        return;
      }

      if (data?.token) {
        const verifyUrl = `${window.location.origin}/verify-tenant-email?token=${data.token}`;
        setPendingVerifyUrl(verifyUrl);
        try {
          await sendTenantVerificationEmail(
            data.email || loginEmail,
            data.full_name || fullName || loginEmail.split("@")[0],
            data.token
          );
          setEmailSendError(null);
          toast.success("Verification email sent again!");
        } catch (sendErr: any) {
          const msg = sendErr?.message || "Failed to send email. Please check platform SMTP settings.";
          setEmailSendError(msg);
          toast.error(msg);
        }
      }

      setResendCooldown(60);
    } catch (err: any) {
      if (err.message?.includes("rate")) {
        toast.error("Please wait before requesting another email.");
      } else {
        toast.error(err.message || "Failed to resend email.");
      }
    }
  }

  // ── Step 3 → Module selection done ──────────────────────────
  function handleStep3Next() {
    if (selectedModules.length === 0) {
      toast.error("Select at least one app to continue.");
      return;
    }
    // If any selected module needs a template + domain, collect those first.
    if (modulesNeedingTemplates.length > 0) {
      loadTemplatesForModule(modulesNeedingTemplates[0]);
      setOnTemplateModuleIdx(0);
      return;
    }
    if (hasNonFreeApps) {
      setStep(4);
    } else {
      handleDeploy();
    }
  }

  async function loadTemplatesForModule(moduleId: string) {
    setTemplatesLoading(true);
    try {
      const rows = await listTemplates({ moduleId });
      setAvailableTemplates(rows);
    } catch (err: any) {
      toast.error(err?.message || "Failed to load templates");
      setAvailableTemplates([]);
    } finally {
      setTemplatesLoading(false);
    }
  }

  function setTemplateChoice(moduleId: string, patch: Partial<{ templateId: number; customDomain: string }>) {
    setTemplateChoices((prev) => ({
      ...prev,
      [moduleId]: {
        templateId: patch.templateId ?? prev[moduleId]?.templateId ?? 0,
        customDomain: patch.customDomain ?? prev[moduleId]?.customDomain ?? "",
      },
    }));
  }

  function isDomainValid(d: string): boolean {
    const clean = d.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
    return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(clean);
  }

  async function handleTemplateStepNext() {
    if (onTemplateModuleIdx === null || !currentTemplateModuleId) return;
    const choice = templateChoices[currentTemplateModuleId];
    if (!choice?.templateId) {
      toast.error("Pick a template to continue.");
      return;
    }
    if (!isDomainValid(choice.customDomain || "")) {
      toast.error("Enter a valid custom domain (e.g. shop.example.com).");
      return;
    }
    const nextIdx = onTemplateModuleIdx + 1;
    if (nextIdx < modulesNeedingTemplates.length) {
      loadTemplatesForModule(modulesNeedingTemplates[nextIdx]);
      setOnTemplateModuleIdx(nextIdx);
      return;
    }
    // All templates picked → proceed to payment or deploy.
    setOnTemplateModuleIdx(null);
    if (hasNonFreeApps) {
      setStep(4);
    } else {
      handleDeploy();
    }
  }

  function handleTemplateStepBack() {
    if (onTemplateModuleIdx === null) return;
    if (onTemplateModuleIdx === 0) {
      setOnTemplateModuleIdx(null);
      return;
    }
    const prevIdx = onTemplateModuleIdx - 1;
    loadTemplatesForModule(modulesNeedingTemplates[prevIdx]);
    setOnTemplateModuleIdx(prevIdx);
  }

  const [launchMode, setLaunchMode] = useState<"trial" | "live" | null>(null);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  async function handleStep4Next() {
    if (launchMode === "trial") {
      handleDeploy();
      return;
    }

    // "Go Live" — process Razorpay payment
    const keyId = platformSettings?.razorpay_key_id;
    if (!keyId) {
      toast.error("Payment gateway is not configured. Please contact support.");
      return;
    }

    setPaymentProcessing(true);
    const orderNumber = `ONBOARD-${Date.now()}`;

    try {
      const result = await initiateRazorpayPayment({
        keyId,
        amount: monthlyTotal,
        currency: platformSettings?.currency || "INR",
        orderNumber,
        customerName: fullName || user?.user_metadata?.full_name || "",
        customerEmail: loginEmail || user?.email || "",
        customerPhone: phone || "",
        businessName: PLATFORM_CONFIG.name,
        description: `${companyName} — Monthly subscription`,
      });

      // Payment succeeded — store payment info for deploy step
      toast.success("Payment successful!");
      handleDeploy();
    } catch (err: any) {
      if (err.message?.includes("cancelled")) {
        toast.info("Payment cancelled. You can try again or start a free trial.");
      } else {
        toast.error(err.message || "Payment failed. Please try again.");
      }
    } finally {
      setPaymentProcessing(false);
    }
  }

  // ── Deploy ──────────────────────────────────────────────────
  async function handleDeploy() {
    setError("");
    setStep(5);
    setSetupIndex(0);
    setSetupDone(false);
    setLoading(true);

    try {
      // Prefer the context user; if it hasn't populated yet, read from Supabase directly
      // so a transient context race doesn't nuke the whole deploy.
      let activeUser = user;
      if (!activeUser) {
        const { data, error: getUserErr } = await supabase.auth.getUser();
        if (getUserErr) {
          console.warn("getUser() during deploy failed:", getUserErr.message);
        }
        activeUser = data?.user ?? null;
      }
      if (!activeUser) {
        throw new Error("You must be signed in to complete setup. Please refresh and try again.");
      }

      // ── Progress: Setting up workspace ──────────────────────
      setSetupIndex(0);
      await delay(600);

      // Upsert user profile
      await supabase.from("users").upsert({
        id: activeUser.id,
        username: activeUser.email || loginEmail,
        full_name:
          fullName ||
          activeUser.user_metadata?.full_name ||
          loginEmail.split("@")[0],
        is_super_admin: false,
      });

      const slug = generateSlug(companyName);
      const fullAddress = [addressLine1, addressLine2].filter(Boolean).join(", ");

      let insertPayload: Record<string, any> = {
        name: companyName,
        subdomain: slug,
        contact_email: companyEmail || loginEmail || activeUser.email,
        contact_phone: phone,
        address: fullAddress || null,
        city: city || null,
        state: state || null,
        country: country || null,
        pincode: pincode || null,
        gst_no: gstNo || null,
        industry_type: industry.toLowerCase(),
        user_id: activeUser.id,
      };

      let { data: newCompany, error: cErr } = await supabase
        .from("companies")
        .insert([insertPayload])
        .select()
        .single();

      if (cErr) {
        const { data: fallback, error: fErr } = await supabase
          .from("companies")
          .insert([
            {
              name: companyName,
              subdomain: slug,
              contact_email: companyEmail || loginEmail || activeUser.email,
              user_id: activeUser.id,
            },
          ])
          .select()
          .single();
        if (fErr) throw fErr;
        newCompany = fallback;
      }

      // Link user to company
      await supabase.from("company_users").insert([
        {
          company_id: newCompany.id,
          user_id: activeUser.id,
          role: "admin",
        },
      ]);

      // ── Template deployment requests ────────────────────────
      // For each selected module with needsTemplate, create a request row so the
      // super admin sees it in /super-admin/deployments.
      for (const moduleId of modulesNeedingTemplates) {
        const choice = templateChoices[moduleId];
        if (!choice?.templateId || !choice.customDomain) continue;
        try {
          await createDeploymentRequest({
            companyId: newCompany.id,
            moduleId,
            templateId: choice.templateId,
            customDomain: choice.customDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, ""),
            configOverrides: {},
          });
        } catch (err) {
          // Non-blocking — tenant can still redo from /apps/:moduleId/setup/template
          console.warn(`Template request for ${moduleId} failed:`, err);
        }
      }

      // ── Progress: Installing apps ───────────────────────────
      setSetupIndex(1);
      await delay(800);

      const allModuleSlugs = [...new Set([...selectedModules, "masters"])];

      // Compute trial_ends_at + billing_status per module.
      // - Core/free modules → "active", no trial.
      // - Paid modules on "trial" launch mode → "trial" + trial_ends_at = now + trialDays.
      // - Paid modules on "live" launch mode (already paid) → "active", no trial.
      const nowMs = Date.now();
      const buildModuleRow = (slug: string) => {
        const cfg = PLATFORM_MODULES.find((m) => m.id === slug);
        const isPaid = !!cfg && !cfg.isCore && !cfg.isFree;
        const startsTrial = isPaid && launchMode !== "live" && (cfg?.trialDays ?? 0) > 0;
        return {
          company_id: newCompany.id,
          module_slug: slug,
          is_active: true,
          installed_at: new Date(nowMs).toISOString(),
          billing_status: startsTrial ? "trial" : "active",
          trial_ends_at: startsTrial
            ? new Date(nowMs + (cfg!.trialDays * 86400000)).toISOString()
            : null,
        };
      };

      const companyModulesPayload = allModuleSlugs.map(buildModuleRow);

      const { error: cmErr } = await supabase
        .from("company_modules")
        .insert(companyModulesPayload);

      if (cmErr) {
        // Fallback for older schemas that don't have trial_ends_at / billing_status columns
        await supabase.from("company_modules").insert(
          allModuleSlugs.map((s) => ({
            company_id: newCompany.id,
            module_slug: s,
            is_active: true,
          }))
        );
      }

      // Insert user_modules
      const userModulesPayload = allModuleSlugs.map((s) => ({
        company_id: newCompany.id,
        user_id: activeUser.id,
        module_slug: s,
        is_active: true,
      }));

      const { error: umErr } = await supabase
        .from("user_modules")
        .insert(userModulesPayload);
      if (umErr) {
        console.warn("user_modules insert skipped:", umErr.message);
      }

      // ── Progress: Configuring defaults ──────────────────────
      setSetupIndex(2);
      await delay(800);

      // Sync ecommerce settings if ecommerce selected
      if (allModuleSlugs.includes("ecommerce")) {
        await supabase.from("ecom_settings").insert([
          {
            company_id: newCompany.id,
            store_name: companyName,
            primary_color: "#2563eb",
          },
        ]);
      }

      // ── Progress: Done ──────────────────────────────────────
      setSetupIndex(3);
      await delay(600);

      // Refresh tenant context
      await refreshTenant();

      // Clear draft data
      clearDraft();

      // Determine first route
      const firstMod = PLATFORM_MODULES.find(
        (m) => selectedModules.includes(m.id) && m.id !== "masters"
      );
      setFirstRoute(firstMod?.dashboardRoute || "/apps");
      setCreatedCompanyName(companyName);
      setSetupDone(true);
    } catch (err: any) {
      console.error("Onboarding error:", err);
      setError(err.message || "Setup failed. Please try again.");
      setStep(3);
      toast.error(err.message || "Setup failed.");
    } finally {
      setLoading(false);
    }
  }

  // ── Input class helper — ERPNext v16 style ──────────────────
  const inputClass =
    "w-full px-2.5 h-8 rounded-md border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors";

  // ══════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-16 w-auto" />
        </div>
        <div className="flex items-center gap-4">
          {step <= 4 && <StepIndicator current={step} />}
          <button
            onClick={async () => {
              clearDraft();
              await signOut();
              navigate("/login", { replace: true });
            }}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* ─── Step 1: Company Registration ─────────────────────── */}
      {step === 1 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 sm:pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left — Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <h1 className="text-2xl font-semibold text-slate-800 mb-1">
                  Register your company
                </h1>
                <p className="text-sm text-slate-500 mb-6">
                  Tell us about your business to get started.
                </p>

                <div className="space-y-5">
                  {/* Company Name + Industry */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Company name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Acme Inc."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Industry
                      </label>
                      <select
                        value={industry}
                        onChange={(e) =>
                          setIndustry(e.target.value as Industry)
                        }
                        className={`${inputClass} bg-white appearance-none`}
                      >
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Address Line 1
                      </label>
                      <input type="text" value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Building, street" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Address Line 2
                      </label>
                      <input type="text" value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Area, landmark" className={inputClass} />
                    </div>
                  </div>

                  {/* City, State, Pincode, Country */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">City</label>
                      <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Mumbai" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                      <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="Maharashtra" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Pincode</label>
                      <input type="text" value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="400001" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
                      <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
                    </div>
                  </div>

                  <div className="border-t border-slate-100" />

                  {/* Contact Person */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Contact Person <span className="text-red-400">*</span>
                    </label>
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jane Smith" className={inputClass} />
                  </div>

                  {/* Emails */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Company Email</label>
                      <input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="info@company.com" className={inputClass} />
                      <p className="text-xs text-slate-400 mt-1">Public contact email for your business</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Login Email <span className="text-red-400">*</span>
                      </label>
                      <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@email.com" disabled={!!user} className={`${inputClass} disabled:bg-slate-50 disabled:text-slate-500`} />
                      <p className="text-xs text-slate-400 mt-1">Used to sign in to your account</p>
                    </div>
                  </div>

                  {/* Phone + Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Phone <span className="text-red-400">*</span>
                      </label>
                      <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Mobile</label>
                      <input type="text" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 98765 43210" className={inputClass} />
                    </div>
                  </div>

                  {/* GST */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">GST number</label>
                    <input type="text" value={gstNo} onChange={(e) => setGstNo(e.target.value)} placeholder="22AAAAA0000A1Z5" className={`${inputClass} sm:max-w-xs`} />
                  </div>

                  {/* Password (only if not logged in) */}
                  {!user && (
                    <>
                      <div className="border-t border-slate-100" />
                      <div className="sm:max-w-xs">
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          Password <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 6 characters"
                            className={`${inputClass} pr-10`}
                          />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {error && (
                    <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={handleStep1Next}
                    disabled={loading}
                    className="w-full sm:w-auto mt-1 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-400 mt-6">
                  By continuing you agree to our Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>

            {/* Right — Summary aside (ERPNext v16 style) */}
            <div className="hidden lg:flex lg:col-span-2 items-start">
              <div className="w-full rounded-lg bg-card border border-gray-200 p-6 min-h-[480px] flex flex-col justify-between dark:border-border">
                <div>
                  <div className="text-lg font-semibold text-gray-900 mb-1 dark:text-foreground">{PLATFORM_CONFIG.name}</div>
                  <p className="text-gray-500 text-xs leading-relaxed">
                    All-in-one business platform. Sales, inventory, HR, accounting — a single workspace.
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    { title: "Ready in seconds", desc: "Workspace provisioned instantly" },
                    { title: "Multi-tenant secure", desc: "Your data is isolated and encrypted" },
                    { title: "Install only what you need", desc: "Pay per app, scale as you grow" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-success-700" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-800 dark:text-foreground">{item.title}</div>
                        <div className="text-[11px] text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 2: Email Verification ──────────────────────── */}
      {step === 2 && (
        <div className="flex items-start justify-center px-4 pt-12 sm:pt-20">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 sm:p-10 text-center">
              {/* Email icon */}
              <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>

              <h2 className="text-2xl font-semibold text-slate-800 mb-2">
                Check your email
              </h2>
              <p className="text-sm text-slate-500 mb-2">
                We've sent a verification link to
              </p>
              <p className="text-base font-semibold text-slate-800 mb-6">
                {loginEmail}
              </p>

              <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 mb-6">
                <p className="text-sm text-blue-700">
                  Click the link in your email to verify your account and continue setting up your workspace.
                </p>
              </div>

              {/* Email-send failure fallback — show the verification link directly so the user can finish signup */}
              {emailSendError && pendingVerifyUrl && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6 text-left">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-800">
                        Email could not be sent
                      </p>
                      <p className="text-xs text-amber-700 mt-1 break-words">
                        {emailSendError}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-amber-700 mb-2">
                    You can verify directly using the link below while we look into the email setup:
                  </p>
                  <a
                    href={pendingVerifyUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Verify my email
                  </a>
                  <p className="text-[10px] text-amber-600 mt-2 break-all font-mono">
                    {pendingVerifyUrl}
                  </p>
                </div>
              )}

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
                  <RefreshCw className={`w-4 h-4 ${resendCooldown > 0 ? "" : "group-hover:rotate-180 transition-transform"}`} />
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend verification email"}
                </button>
              </div>

              {/* Change email / back */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <button
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                  className="text-sm font-medium text-slate-500 hover:text-slate-700 transition inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Use a different email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 3b: Template + custom domain picker (shown for modules with needsTemplate=true) ─── */}
      {step === 3 && onTemplateModuleIdx !== null && currentTemplateModuleId && (() => {
        const mod = PLATFORM_MODULES.find((m) => m.id === currentTemplateModuleId);
        const cleanDomain = (currentTemplateChoice?.customDomain ?? "").trim();
        const domainOk = isDomainValid(cleanDomain);
        return (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-32">
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-500">
              <span>Step {onTemplateModuleIdx + 1} of {modulesNeedingTemplates.length}</span>
              <span>·</span>
              <span className="capitalize">{mod?.name || currentTemplateModuleId}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h1 className="text-2xl font-semibold text-slate-800 mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Choose a template for {mod?.name || currentTemplateModuleId}
                </h1>
                <p className="text-sm text-slate-500">
                  Pick a storefront design and enter the custom domain where it will live.
                </p>
              </div>
            </div>

            {/* Custom domain */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6 max-w-xl">
              <label className="text-xs font-medium text-slate-700 inline-flex items-center gap-1.5 mb-1">
                <Globe2 className="w-3.5 h-3.5" /> Custom domain <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cleanDomain}
                onChange={(e) =>
                  setTemplateChoice(currentTemplateModuleId, { customDomain: e.target.value })
                }
                placeholder="shop.yourcompany.com"
                className={inputClass}
                spellCheck={false}
                autoComplete="off"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Point this domain's DNS to our deployment server before launch. No http:// prefix.
              </p>
              {!domainOk && cleanDomain.length > 0 && (
                <p className="text-[11px] text-red-600 mt-1">Enter a valid domain like <code>shop.example.com</code>.</p>
              )}
            </div>

            {/* Template grid */}
            {templatesLoading ? (
              <div className="py-24 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : availableTemplates.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-500">
                No templates available for this module yet. Contact support.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableTemplates.map((t) => {
                  const selected = currentTemplateChoice?.templateId === t.id;
                  return (
                    <div
                      key={t.id}
                      className={`group bg-white rounded-xl border overflow-hidden transition-all ${
                        selected
                          ? "border-primary ring-2 ring-primary/30 shadow-md"
                          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      {/* Thumbnail — clicking it previews */}
                      <button
                        type="button"
                        onClick={() => setPreviewTemplate(t)}
                        className="block w-full aspect-[16/10] bg-slate-100 relative overflow-hidden cursor-zoom-in"
                        title="Preview template"
                      >
                        {t.thumbnail_url ? (
                          <img
                            src={t.thumbnail_url}
                            alt={t.name}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-slate-300" />
                          </div>
                        )}
                        {selected && (
                          <div className="absolute top-2 right-2 h-7 px-2.5 rounded-full bg-primary text-white text-xs font-semibold inline-flex items-center gap-1 shadow-sm">
                            <Check className="w-3 h-3" /> Selected
                          </div>
                        )}
                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors flex items-end justify-center pb-2 opacity-0 group-hover:opacity-100">
                          <span className="h-7 px-2.5 rounded-full bg-white/95 text-slate-700 text-[11px] font-semibold inline-flex items-center gap-1 shadow-sm">
                            <Eye className="w-3 h-3" /> Preview
                          </span>
                        </div>
                      </button>

                      <div className="p-3 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-semibold text-slate-800">{t.name}</h3>
                        </div>
                        {t.description && (
                          <p className="text-xs text-slate-500 leading-snug line-clamp-2">{t.description}</p>
                        )}
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => setPreviewTemplate(t)}
                            className="flex-1 h-8 px-3 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition inline-flex items-center justify-center gap-1.5"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setTemplateChoice(currentTemplateModuleId, { templateId: t.id })
                            }
                            className={`flex-1 h-8 px-3 text-xs font-semibold rounded-md transition inline-flex items-center justify-center gap-1.5 ${
                              selected
                                ? "bg-primary/10 text-primary border border-primary/30"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {selected ? (
                              <><Check className="w-3.5 h-3.5" /> Selected</>
                            ) : (
                              "Select"
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bottom bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-50">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                <button
                  onClick={handleTemplateStepBack}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleTemplateStepNext}
                  disabled={!currentTemplateChoice?.templateId || !domainOk}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
                >
                  {onTemplateModuleIdx + 1 < modulesNeedingTemplates.length
                    ? "Next module"
                    : hasNonFreeApps
                      ? "Continue to payment"
                      : "Continue"}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── Step 3: App Store ────────────────────────────────── */}
      {step === 3 && onTemplateModuleIdx === null && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-32">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800 mb-1">
                Choose apps for your business
              </h1>
              <p className="text-sm text-slate-500">
                Install the modules you need. You can always add more later.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search apps..."
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Core module notice */}
          <div className="mb-6 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm bg-gradient-to-br from-slate-700 to-slate-900">🗄️</div>
            <div className="flex-1">
              <span className="text-sm font-medium text-slate-700">Master Data Hub</span>
              <span className="text-sm text-slate-500 ml-2">— always included with every workspace</span>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">Included</span>
          </div>

          {/* Module grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredModules.map((mod) => (
              <ModuleCard key={mod.id} mod={mod} selected={selectedModules.includes(mod.id)} onInstall={() => toggleModule(mod.id)} onRemove={() => toggleModule(mod.id)} onViewDetails={() => setDetailModule(mod)} />
            ))}
          </div>

          {/* App Detail Panel */}
          {detailModule && (
            <AppDetailPanel
              mod={detailModule}
              selected={selectedModules.includes(detailModule.id)}
              onInstall={() => { toggleModule(detailModule.id); }}
              onRemove={() => { toggleModule(detailModule.id); }}
              onClose={() => setDetailModule(null)}
            />
          )}

          {filteredModules.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-slate-500">No apps match your search.</p>
            </div>
          )}

          {/* Sticky bottom bar */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
              <button
                onClick={() => { setStep(user ? 1 : 2); setError(""); }}
                className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>

              <div className="hidden sm:flex items-center gap-4 text-sm text-slate-600">
                <span>
                  Selected: <span className="font-semibold text-slate-800">{selectedModules.length} app{selectedModules.length !== 1 ? "s" : ""}</span>
                </span>
                <span className="text-slate-300">|</span>
                <span>
                  Monthly: <span className="font-semibold text-blue-600">{monthlyTotal === 0 ? "Free" : `₹${monthlyTotal.toLocaleString("en-IN")}/mo`}</span>
                </span>
                {hasNonFreeApps && (
                  <>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs text-slate-400">14-day free trial</span>
                  </>
                )}
              </div>

              <button
                onClick={handleStep3Next}
                disabled={selectedModules.length === 0}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
              >
                {hasNonFreeApps ? "Continue to payment" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Step 4: Choose Trial or Go Live ────────────────── */}
      {step === 4 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
          <h1 className="text-2xl font-semibold text-slate-800 mb-1">How would you like to start?</h1>
          <p className="text-sm text-slate-500 mb-8">Choose your launch mode. You can upgrade anytime.</p>

          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <button
              onClick={() => setLaunchMode("trial")}
              className={`text-left p-6 rounded-xl border-2 transition-all ${
                launchMode === "trial"
                  ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-100"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🧪</span>
                {launchMode === "trial" && (
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Start Free Trial</h3>
              <p className="text-sm text-slate-500 mb-3">Try all selected apps free for 14 days. No payment required now.</p>
              <div className="bg-emerald-50 text-emerald-700 text-xs font-medium px-3 py-1.5 rounded-md inline-block">14 days free — No credit card needed</div>
            </button>

            <button
              onClick={() => setLaunchMode("live")}
              className={`text-left p-6 rounded-xl border-2 transition-all ${
                launchMode === "live"
                  ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-100"
                  : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🚀</span>
                {launchMode === "live" && (
                  <span className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-1">Go Live Now</h3>
              <p className="text-sm text-slate-500 mb-3">Pay now and activate all apps immediately with full features.</p>
              <div className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-md inline-block">₹{monthlyTotal.toLocaleString("en-IN")}/month — Instant activation</div>
            </button>
          </div>

          {/* Order summary */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700">Selected Apps</h3>
            </div>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-slate-100">
                  <td className="px-4 py-2.5 text-slate-600 flex items-center gap-2">
                    <span className="w-6 h-6 rounded flex items-center justify-center text-[10px] bg-gradient-to-br from-slate-700 to-slate-900">🗄️</span>
                    Masters
                  </td>
                  <td className="px-4 py-2.5 text-right text-slate-400 text-xs">Included</td>
                </tr>
                {selectedModules.map((id) => {
                  const mod = PLATFORM_MODULES.find((m) => m.id === id);
                  if (!mod) return null;
                  return (
                    <tr key={id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-2.5 text-slate-600 flex items-center gap-2">
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] bg-gradient-to-br ${mod.colorFrom} ${mod.colorTo}`}>{mod.icon}</span>
                        {mod.name}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-700 text-xs">
                        {mod.isFree ? "Free" : `₹${mod.priceMonthly.toLocaleString("en-IN")}/mo`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t border-slate-200">
                  <td className="px-4 py-3 font-semibold text-slate-800 text-sm">Monthly Total</td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800 text-sm">₹{monthlyTotal.toLocaleString("en-IN")}/mo</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {launchMode === "live" && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-amber-800 mb-2">Payment Required</h3>
              <p className="text-sm text-amber-700 mb-2">
                You will be charged {platformSettings?.currency_symbol || "₹"}{monthlyTotal.toLocaleString("en-IN")} now for the first month.
              </p>
              {platformSettings?.razorpay_key_id ? (
                <div className="bg-white border border-amber-200 rounded-lg p-4 flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-xs text-slate-600 font-medium">Secure payment via Razorpay. You'll be redirected to complete the payment when you click "Pay & Launch".</p>
                </div>
              ) : (
                <div className="bg-white border border-amber-200 rounded-lg p-4">
                  <p className="text-xs text-slate-500 font-medium">Payment gateway is not configured. Please contact the administrator or start with a free trial.</p>
                </div>
              )}
            </div>
          )}

          {launchMode === "trial" && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 mb-6 space-y-1">
              <p className="text-sm text-blue-800">
                Your 14-day free trial starts today. No charges until <span className="font-semibold">{getTrialEndDate()}</span>.
              </p>
              <p className="text-xs text-blue-600">You can upgrade to a paid plan anytime from Settings.</p>
            </div>
          )}

          <div className="flex items-center gap-3 pb-12">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleStep4Next}
              disabled={!launchMode || paymentProcessing}
              className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              {paymentProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  {launchMode === "live" ? "Pay & Launch" : launchMode === "trial" ? "Start Free Trial" : "Select an option above"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Step 5: Setting Up / Success ─────────────────────── */}
      {step === 5 && (
        <div className="flex items-start justify-center px-4 pt-16 sm:pt-24">
          <div className="w-full max-w-[440px]">
            {!setupDone ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                <div className="mb-8">
                  <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold text-slate-800 mb-1">Setting things up</h2>
                  <p className="text-sm text-slate-500">This will only take a moment.</p>
                </div>
                <div className="space-y-3 text-left">
                  {SETUP_MESSAGES.map((msg, i) => {
                    const done = i < setupIndex;
                    const active = i === setupIndex;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                          done ? "bg-emerald-50" : active ? "bg-blue-50" : "bg-slate-50"
                        }`}
                      >
                        {done ? (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        ) : active ? (
                          <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-slate-200 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${done ? "text-emerald-700" : active ? "text-blue-700 font-medium" : "text-slate-400"}`}>
                          {msg}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-5">
                  <Check className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-1">You're all set</h2>
                <p className="text-sm text-slate-500 mb-8">
                  <span className="font-medium text-slate-700">{createdCompanyName}</span> is ready to go.
                </p>
                <button
                  onClick={() => navigate(firstRoute, { replace: true })}
                  className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
                >
                  Open dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {error && step === 5 && (
              <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Template preview modal (onboarding step 3b) ─────── */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="h-12 px-4 border-b border-slate-200 flex items-center gap-3 shrink-0">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-800 truncate inline-flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  {previewTemplate.name}
                  <span className="text-[11px] font-normal text-slate-400">· preview</span>
                </h3>
              </div>
              <a
                href={previewTemplate.entry_path}
                target="_blank"
                rel="noreferrer"
                className="h-8 px-3 text-xs font-medium rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50 transition inline-flex items-center gap-1.5"
                title="Open in new tab"
              >
                Open <ExternalLink className="w-3 h-3" />
              </a>
              {currentTemplateModuleId && (
                <button
                  type="button"
                  onClick={() => {
                    setTemplateChoice(currentTemplateModuleId, { templateId: previewTemplate.id });
                    setPreviewTemplate(null);
                  }}
                  className="h-8 px-3 text-xs font-semibold rounded-md bg-blue-600 hover:bg-blue-700 text-white transition inline-flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" /> Use this
                </button>
              )}
              <button
                type="button"
                onClick={() => setPreviewTemplate(null)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Iframe */}
            <div className="flex-1 bg-slate-50 relative">
              {previewTemplate.entry_path ? (
                <iframe
                  src={previewTemplate.entry_path}
                  title={`${previewTemplate.name} preview`}
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  loading="eager"
                  onError={() => {
                    console.warn("Template preview iframe failed:", previewTemplate.entry_path);
                  }}
                />
              ) : (
                <div className="h-full flex items-center justify-center text-center p-6">
                  <div className="max-w-md space-y-2">
                    <p className="text-sm font-semibold text-slate-800">Preview unavailable</p>
                    <p className="text-xs text-slate-500">
                      This template has no <code>entry_path</code> set in the database. Seed
                      <code className="mx-1">database/create_storefront_templates.sql</code>
                      (and optionally <code>seed_more_templates.sql</code>) against your Supabase
                      project so the preview can load.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
