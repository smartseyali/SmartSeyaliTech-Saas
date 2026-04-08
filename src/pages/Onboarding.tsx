import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/lib/supabase";
import { PLATFORM_MODULES, type PlatformModule } from "@/config/modules";
import { toast } from "sonner";
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
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-300 ${
                  done
                    ? "bg-blue-600 text-white"
                    : active
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : step}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  active
                    ? "text-slate-700"
                    : done
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div
                className={`w-6 h-px ${done ? "bg-blue-400" : "bg-slate-200"}`}
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
}: {
  mod: PlatformModule;
  selected: boolean;
  onInstall: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      className={`relative bg-white rounded-xl border transition-all duration-200 overflow-hidden flex flex-col ${
        selected
          ? "border-blue-400 shadow-md ring-1 ring-blue-100"
          : "border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300"
      }`}
    >
      {selected && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-blue-600 text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
          <Check className="w-3 h-3" />
          Selected
        </div>
      )}
      {mod.status === "beta" && (
        <div className="absolute top-3 left-3 text-[10px] font-medium bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
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
                onClick={onRemove}
                className="text-xs text-red-500 hover:text-red-600 font-medium transition"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={onInstall}
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

// ══════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════
export default function Onboarding() {
  const { user } = useAuth();
  const { refreshTenant } = useTenant();
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

  // Step 3 fields (App Store)
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Step 5 fields (Setup)
  const [setupIndex, setSetupIndex] = useState(0);
  const [setupDone, setSetupDone] = useState(false);
  const [createdCompanyName, setCreatedCompanyName] = useState("");
  const [firstRoute, setFirstRoute] = useState("/apps");

  // Global
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill if user is already logged in
  useEffect(() => {
    if (user) {
      setLoginEmail(user.email || "");
      setFullName(user.user_metadata?.full_name || "");
    }
  }, [user]);

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

      // Check if session exists (email was confirmed)
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          toast.success("Email verified successfully!");
          setStep(3);
        } else {
          // Session not ready yet, might need a moment
          setTimeout(async () => {
            const { data: retry } = await supabase.auth.getSession();
            if (retry.session) {
              toast.success("Email verified successfully!");
              setStep(3);
            } else {
              toast.error("Verification failed. Please try again.");
              setStep(1);
            }
          }, 2000);
        }
      });
    }
  }, []);

  // ── Polling for email verification (Step 2) ─────────────────
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
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          toast.success("Email verified successfully!");
          setStep(3);
        }
      } catch {}
    }, 4000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [step]);

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

    // If user is already logged in (returning user with no company), skip to step 3
    if (user) {
      setStep(3);
      return;
    }

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

      // If Supabase returned a session immediately (email confirmation disabled), skip verification
      if (authData.session) {
        toast.success("Account created successfully!");
        setStep(3);
      } else {
        // Email confirmation required — go to verification screen
        setResendCooldown(60);
        setStep(2);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Resend verification email ───────────────────────────────
  async function handleResendEmail() {
    if (resendCooldown > 0) return;
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: loginEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/onboarding?step=verified`,
        },
      });
      if (error) throw error;
      setResendCooldown(60);
      toast.success("Verification email sent again!");
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
    if (hasNonFreeApps) {
      setStep(4);
    } else {
      handleDeploy();
    }
  }

  const [launchMode, setLaunchMode] = useState<"trial" | "live" | null>(null);

  function handleStep4Next() {
    if (launchMode === "live") {
      toast.success("Payment integration coming soon. Starting as trial.");
    }
    handleDeploy();
  }

  // ── Deploy ──────────────────────────────────────────────────
  async function handleDeploy() {
    setError("");
    setStep(5);
    setSetupIndex(0);
    setSetupDone(false);
    setLoading(true);

    try {
      // Use the already-authenticated user
      const activeUser = user;
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

      // ── Progress: Installing apps ───────────────────────────
      setSetupIndex(1);
      await delay(800);

      const allModuleSlugs = [...new Set([...selectedModules, "masters"])];

      const companyModulesPayload = allModuleSlugs.map((s) => ({
        company_id: newCompany.id,
        module_slug: s,
        is_active: true,
        installed_at: new Date().toISOString(),
      }));

      const { error: cmErr } = await supabase
        .from("company_modules")
        .insert(companyModulesPayload);

      if (cmErr) {
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

  // ── Input class helper ──────────────────────────────────────
  const inputClass =
    "w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";

  // ══════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
        </div>
        {step <= 4 && <StepIndicator current={step} />}
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

            {/* Right — Branding area */}
            <div className="hidden lg:flex lg:col-span-2 items-start">
              <div className="w-full rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white min-h-[480px] flex flex-col justify-between">
                <div>
                  <div className="text-3xl font-bold mb-2 tracking-tight">Smartseyali</div>
                  <p className="text-blue-100 text-sm leading-relaxed">
                    Your all-in-one business platform. Manage sales, inventory, HR, accounting, and more from a single workspace.
                  </p>
                </div>
                <div className="space-y-4">
                  {[
                    { emoji: "🚀", title: "Ready in seconds", desc: "Set up your workspace instantly" },
                    { emoji: "🔒", title: "Multi-tenant secure", desc: "Your data is isolated and protected" },
                    { emoji: "📦", title: "Install only what you need", desc: "Pay per app, scale as you grow" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">{item.emoji}</div>
                      <div>
                        <div className="text-sm font-medium">{item.title}</div>
                        <div className="text-xs text-blue-200">{item.desc}</div>
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

      {/* ─── Step 3: App Store ────────────────────────────────── */}
      {step === 3 && (
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
              <ModuleCard key={mod.id} mod={mod} selected={selectedModules.includes(mod.id)} onInstall={() => toggleModule(mod.id)} onRemove={() => toggleModule(mod.id)} />
            ))}
          </div>

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
              <p className="text-sm text-amber-700 mb-4">
                You will be charged ₹{monthlyTotal.toLocaleString("en-IN")} now for the first month.
              </p>
              <div className="bg-white border border-amber-200 rounded-lg p-4">
                <p className="text-xs text-slate-500 font-medium">Payment gateway integration coming soon. Your workspace will start as a trial and our team will contact you for payment setup.</p>
              </div>
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
              disabled={!launchMode}
              className="flex-1 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition flex items-center justify-center gap-2"
            >
              {launchMode === "live" ? "Pay & Launch" : launchMode === "trial" ? "Start Free Trial" : "Select an option above"}
              <ArrowRight className="w-4 h-4" />
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
    </div>
  );
}
