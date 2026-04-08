
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/lib/supabase";
import { Check, ArrowRight, ArrowLeft, Loader2, Rocket, X, Mail, Lock, User as UserIcon, LogOut, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import PLATFORM_CONFIG from "@/config/platform";
import { PLATFORM_MODULES, type PlatformModule } from "@/config/modules";
import { cn } from "@/lib/utils";
import { PlatformLoader } from "@/components/PlatformLoader";

// ── Types ──────────────────────────────────────────────────
interface PlanEntry {
    id: string;
    name: string;
    slug: string;
    price_monthly: number;
    features: string[];
}

// ── Local Fallbacks ────────────────────────────────────────
const LOCAL_PLANS: PlanEntry[] = [
    { id: '1', name: 'Standard', slug: 'standard', price_monthly: 29.00, features: ["Up to 5 Projects", "Basic Analytics", "Standard Templates", "Email Support"] },
    { id: '2', name: 'Professional', slug: 'professional', price_monthly: 99.00, features: ["Up to 20 Projects", "Advanced Analytics", "Premium Templates", "Priority Support", "Custom Domain"] },
    { id: '3', name: 'Enterprise', slug: 'enterprise', price_monthly: 299.00, features: ["Unlimited Projects", "Full White-label", "Custom Integrations", "Dedicated Account Manager", "SLA Guarantee"] }
];

const LOCAL_MODULE_REGISTRY = [
    { id: 'ecommerce', slug: 'ecommerce', name: 'Ecommerce', category: 'commerce', tagline: 'Unified Online Selling Engine', icon: '🛒', is_core: true },
    { id: 'crm', slug: 'crm', name: 'CRM', category: 'commerce', tagline: 'Industrial Relationship Manager', icon: '🤝', is_core: false },
    { id: 'inventory', slug: 'inventory', name: 'Inventory', category: 'operations', tagline: 'Strategic Stock Controller', icon: '📦', is_core: false },
    { id: 'landing-page', slug: 'landing-page', name: 'Website Manager', category: 'commerce', tagline: 'Clinical Content Orchestrator', icon: '🌐', is_core: true }
];

// ─── Step Indicator ────────────────────────────────────────
// ─── Step Indicator ────────────────────────────────────────
function StepDots({ current, steps }: { current: number, steps: string[] }) {
    return (
        <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-1 scrollbar-hide">
            {steps.map((label, i) => {
                const stepNum = i + 1;
                const isActive = stepNum === current;
                const isDone = stepNum < current;
                return (
                    <div key={i} className="flex items-center gap-2 flex-shrink-0">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2",
                            isActive ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/20 scale-110" :
                                isDone ? "bg-emerald-500 border-emerald-500 text-white" :
                                    "bg-white border-slate-100 text-slate-500"
                        )}>
                            {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
                        </div>
                        {isActive && (
                            <span className="text-xs font-bold  tracking-widest text-slate-900 mr-2">
                                {label}
                            </span>
                        )}
                        {i < steps.length - 1 && (
                            <div className={cn(
                                "w-4 h-px",
                                isDone ? "bg-emerald-500" : "bg-slate-100"
                            )} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

export default function Onboarding() {
    const { user, signOut } = useAuth();
    const { isSuperAdmin, loading: pLoading } = usePermissions();
    const { refreshTenant } = useTenant();
    const navigate = useNavigate();

    // If user is already logged in and has a company → skip to app
    // IF Super Admin → skip to super admin panel
    useEffect(() => {
        if (user && !pLoading) {
            if (isSuperAdmin) {
                navigate('/super-admin', { replace: true });
                return;
            }

            supabase.from('companies').select('id').eq('user_id', user.id).limit(1).maybeSingle().then(({ data }) => {
                if (data) {
                    navigate('/apps', { replace: true });
                } else {
                    setIsRedirecting(false);
                }
            }).catch(() => setIsRedirecting(false));
        } else if (!pLoading && !user) {
            setIsRedirecting(false);
        }
    }, [user, isSuperAdmin, pLoading]);

    // ── State ─────────────────────────────────────────────────
    const [step, setStep] = useState(1);
    const [storeName, setStoreName] = useState("");
    const [industryType, setIndustryType] = useState<'retail' | 'education' | 'services'>('retail');
    const [selectedPlan, setSelectedPlan] = useState<string>("");
    const [plans, setPlans] = useState<PlanEntry[]>([]);

    // Step 5 — Account creation fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [availableSystemModules, setAvailableSystemModules] = useState<any[]>([]);

    // Deployment
    const [deploymentStep, setDeploymentStep] = useState(0);
    const [deploymentStatus, setDeploymentStatus] = useState("");
    const [slug, setSlug] = useState("");

    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(!!user); // Assume redirecting if logged in until proven otherwise
    const [error, setError] = useState("");

    // Background Carousel State
    const [bgImageIndex, setBgImageIndex] = useState(0);
    const brandingContent = [
        {
            image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=1600&q=80",
            title: "Launch your digital future today.",
            subtitle: "Join thousands of enterprises building their custom cloud ecosystem.",
            stats: [
                { val: "Instantly", label: "Provisioning" },
                { val: "Secure", label: "Military-Grade" }
            ]
        },
        {
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80",
            title: "Scalable Infrastructure for Growth.",
            subtitle: "Built on high-performance that scales with your business.",
            stats: [
                { val: "99.9%", label: "Uptime" },
                { val: "Global", label: "Edge Network" }
            ]
        },
        {
            image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&q=80",
            title: "Advanced Data Intelligence.",
            subtitle: "Turn raw data into actionable insights with our integrated BI tools.",
            stats: [
                { val: "Real-time", label: "Analytics" },
                { val: "AI-Ready", label: "Processing" }
            ]
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setBgImageIndex((prev) => (prev + 1) % brandingContent.length);
        }, 7000);
        return () => clearInterval(interval);
    }, []);

    const dynamicSteps = ["Business", "Plan", "Account", "Confirm"];

    // ── Data Fetching ─────────────────────────────────────────
    useEffect(() => {
        async function loadContent() {
            try {
                const { data: pData } = await supabase
                    .from("system_plans")
                    .select("*")
                    .eq("is_active", true)
                    .order("sort_order", { ascending: true });

                if (pData && pData.length > 0) {
                    const mapped = pData.map(p => ({
                        id: p.id,
                        name: p.name,
                        slug: p.slug,
                        price_monthly: p.price_monthly,
                        features: typeof p.features === 'string' ? JSON.parse(p.features) : (p.features || [])
                    }));
                    setPlans(mapped);
                    setSelectedPlan(mapped[0].id);
                } else {
                    setPlans(LOCAL_PLANS);
                    setSelectedPlan(LOCAL_PLANS[0].id);
                }

                // Fetch System Modules for selection
                const { data: mData } = await supabase.from('system_modules').select('*').eq('is_active', true);
                const modulesToUse = (mData && mData.length > 0) ? mData : LOCAL_MODULE_REGISTRY;
                setAvailableSystemModules(modulesToUse);

                // Pre-select module from URL if exists
                const params = new URLSearchParams(window.location.search);
                const urlModule = params.get('module');
                if (urlModule) {
                    const mod = modulesToUse.find(m => m.slug === urlModule || m.id.toString() === urlModule);
                    if (mod) {
                        setSelectedModules([mod.id.toString()]);
                        if (mod.category === 'commerce') setIndustryType('retail');
                        else if (mod.category === 'operations') setIndustryType('services');
                        else if (mod.category.includes('people') || mod.category === 'education') setIndustryType('education');
                    }
                }
                // No auto-selection — user must explicitly choose modules
            } catch (err) {
                console.warn("Database sync deficit detected. Operating under Clinical Autonomy Mode (Local Fallbacks).");
                setPlans(LOCAL_PLANS);
                setSelectedPlan(LOCAL_PLANS[0].id);
                setAvailableSystemModules(LOCAL_MODULE_REGISTRY);
                // No auto-selection in fallback mode either
            } finally {
                setTimeout(() => setInitializing(false), 800);
            }
        }
        loadContent();
    }, []);

    // ── Components ─────────────────────────────────────────────
    // Internal legacy loader replaced by clinical PlatformLoader

    // ── Helpers ───────────────────────────────────────────────
    const goNext = () => {
        setError("");
        // Skip step 3 (removed template step) — go from 2 to 4
        if (step === 2) {
            setStep(4);
        } else {
            setStep(s => s + 1);
        }
    };
    const goBack = () => {
        setError("");
        // Skip step 3 (removed template step) — go from 4 back to 2
        if (step === 4) {
            setStep(2);
        } else {
            setStep(s => s - 1);
        }
    };

    // ── Step 5: Create Auth Account + Deploy ──────────────────
    const handleDeploy = async () => {
        setError("");
        if (!fullName.trim()) return setError("Full name is required.");
        if (!email.trim()) return setError("Email is required.");
        if (password.length < 6) return setError("Password must be at least 6 characters.");
        if (password !== confirmPassword) return setError("Passwords do not match.");

        setLoading(true);

        const runProgress = async (val: number, msg: string, delay: number) => {
            setDeploymentStep(val);
            setDeploymentStatus(msg);
            await new Promise(r => setTimeout(r, delay));
        };

        try {
            // If we already have a user from useAuth, skip signUp
            let activeUser = user;

            if (!activeUser) {
                const { data: authData, error: signUpErr } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: fullName } }
                });

                if (signUpErr) {
                    // Check specifically for user already registered
                    if (signUpErr.message.toLowerCase().includes("already registered") || signUpErr.message.toLowerCase().includes("already exists")) {
                        const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
                        if (signInErr) throw new Error("Account already exists with a different password. Please login normally.");
                        activeUser = signInData?.user;
                    } else {
                        throw signUpErr;
                    }
                } else {
                    activeUser = authData?.user;
                }
            }

            if (!activeUser) throw new Error("Account verification failed. Please try again.");

            setStep(5); // Go to deployment screen immediately (was 6)

            await runProgress(10, "Creating Your Account...", 800);

            // Wait for auth session to be fully established
            let retries = 0;
            while (retries < 10) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.access_token) break;
                await new Promise(r => setTimeout(r, 500));
                retries++;
            }

            await runProgress(25, "Saving Your Profile...", 800);

            // 2. Create user profile record (trigger may have already created it)
            try {
                await supabase.from('users').upsert({
                    id: activeUser.id,
                    username: activeUser.email || email,
                    full_name: fullName || activeUser.user_metadata?.full_name || email.split('@')[0],
                    is_super_admin: false
                });
            } catch {
                // Trigger handle_new_user may have already created the row — safe to ignore
            }

            await runProgress(40, "Setting up Your Business...", 1000);

            // 3. Create company
            const newSlug = storeName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000);
            setSlug(newSlug);

            let insertPayload: any = {
                name: storeName,
                subdomain: newSlug,
                contact_email: email || activeUser.email,
                user_id: activeUser.id,
                plan: plans.find(p => p.id === selectedPlan)?.name || 'starter'
            };

            // Try to include new columns if they exist in state/registry
            if (industryType) insertPayload.industry_type = industryType;
            const pSlug = plans.find(p => p.id === selectedPlan)?.slug;
            if (pSlug) insertPayload.plan_slug = pSlug;

            let { data: newCompany, error: cErr } = await supabase
                .from("companies")
                .insert([insertPayload])
                .select()
                .single();

            if (cErr) {
                console.warn("Full company insert failed, attempting legacy fallback...", cErr);
                // Fallback: Try without industry_type and plan_slug if DB isn't updated
                const { data: fallbackCompany, error: fErr } = await supabase
                    .from("companies")
                    .insert([{
                        name: storeName,
                        subdomain: newSlug,
                        contact_email: email || activeUser.email,
                        user_id: activeUser.id
                    }])
                    .select()
                    .single();
                if (fErr) throw fErr;
                newCompany = fallbackCompany;
            }

            await runProgress(60, "Configuring Workspace...", 1200);

            await runProgress(80, "Finalizing Smart Seyali...", 1000);

            // 5. Link user to company
            await supabase.from("company_users").insert([{
                company_id: newCompany.id,
                user_id: activeUser.id,
                role: 'admin'
            }]);

            // 6. Link selected modules to company (Company Modules)
            if (selectedModules.length > 0) {
                const modulesPayload = selectedModules.map(modId => {
                    const mod = availableSystemModules.find(m => m.id.toString() === modId.toString());
                    return {
                        company_id: newCompany.id,
                        module_slug: mod?.slug || modId,
                        is_active: true
                    };
                });
                const { error: mErr } = await supabase.from("company_modules").insert(modulesPayload);
                
                if (mErr) {
                    console.warn("Module slug insert failed, attempting legacy module_id fallback...", mErr);
                    const legacyPayload = selectedModules.map(modId => ({
                        company_id: newCompany.id,
                        module_id: parseInt(modId.toString()) || modId,
                        is_active: true
                    }));
                    await supabase.from("company_modules").insert(legacyPayload);
                }

                // 7. Link selected modules to user (User Modules - New Architecture)
                const userModulesPayload = selectedModules.map(modId => {
                    const mod = availableSystemModules.find(m => m.id.toString() === modId.toString());
                    return {
                        company_id: newCompany.id,
                        user_id: activeUser.id,
                        module_slug: mod?.slug || modId,
                        is_active: true
                    };
                });
                const { error: umErr } = await supabase.from("user_modules").insert(userModulesPayload);
                if (umErr) {
                    console.warn("User modules table induction bypassed (Legacy Environment)", umErr);
                    // Legacy fallback: some systems might use a different mapping, but if it doesn't exist, we move on
                }
            } else {
                // No modules selected — only install the "masters" core module
                await supabase.from("company_modules").insert([{
                    company_id: newCompany.id,
                    module_slug: 'masters',
                    is_active: true
                }]);
                await supabase.from("user_modules").insert([{
                    company_id: newCompany.id,
                    user_id: activeUser.id,
                    module_slug: 'masters',
                    is_active: true
                }]);
            }

            // Sync with ecommerce settings if ecommerce is selected
            if (selectedModules.some(id => {
                const mod = availableSystemModules.find(m => m.id.toString() === id);
                return mod?.slug === 'ecommerce';
            })) {
                await supabase.from("ecom_settings").insert([{
                    company_id: newCompany.id,
                    store_name: storeName,
                    primary_color: "#2563eb" // Default Blue since they might skip theme
                }]);
            }

            await runProgress(100, "Setup Complete!", 800);

            setStep(6); // Success screen (was 7)
        } catch (err: any) {
            setStep(5);
            setError(err.message || "Setup failed. Please try again.");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    // ── UI Styles ──────────────────────────────────────────────
    // ── UI Styles ──────────────────────────────────────────────
    const nextBtnCls = "w-full h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold  tracking-widest text-xs flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-lg shadow-primary-600/10";
    const backBtnCls = "h-14 px-6 border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold  text-xs tracking-widest flex items-center justify-center gap-2 transition-all border shadow-sm";

    // Orchestration Guard: If auth is loading, a redirect is imminent, or system is initializing
    if (initializing || pLoading || isRedirecting) {
        return <PlatformLoader message="Initializing Workspace" subtext="Clinical Resource Orchestration" />;
    }

    return (
        <div className="min-h-screen flex bg-white font-sans selection:bg-primary-600/10 overflow-hidden">

            {/* Left Side: Visual/Branding */}
            <div className="hidden lg:flex w-1/3 relative overflow-hidden bg-slate-900">
                <AnimatePresence mode="popLayout">
                    <motion.img
                        key={brandingContent[bgImageIndex].image}
                        src={brandingContent[bgImageIndex].image}
                        initial={{ opacity: 0, scale: 1.1, x: 20 }}
                        animate={{ opacity: 0.6, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, x: -20 }}
                        transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

                <div className="relative z-10 p-8 lg:p-12 flex flex-col justify-between h-full">
                    <Link to="/" className="flex items-center gap-4">
                        <img src="/logo.png" alt="Logo" className="h-16 lg:h-20 w-auto brightness-0 invert" />
                        <span className="text-lg lg:text-xl font-bold text-white tracking-tight">{PLATFORM_CONFIG.name}</span>
                    </Link>

                    <div className="space-y-4 lg:space-y-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={bgImageIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-4 lg:space-y-6"
                            >
                                <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight tracking-tight">
                                    {brandingContent[bgImageIndex].title.split(' ').map((word, i, arr) => (
                                        i === arr.length - 1 
                                            ? <React.Fragment key={i}><br /><span className="text-primary-400">{word}</span></React.Fragment> 
                                            : <span key={i}>{word} </span>
                                    ))}
                                </h2>
                                <p className="text-base lg:text-lg text-slate-300 max-w-sm leading-relaxed">
                                    {brandingContent[bgImageIndex].subtitle}
                                </p>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={bgImageIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.8 }}
                            className="flex items-center gap-4 lg:gap-8 text-white"
                        >
                            {brandingContent[bgImageIndex].stats.map((stat, i) => (
                                <div key={i} className="flex items-center gap-4 lg:gap-8">
                                    <div className="space-y-1">
                                        <p className="text-xl lg:text-2xl font-bold">{stat.val}</p>
                                        <p className="text-xs font-bold text-slate-500  tracking-widest">{stat.label}</p>
                                    </div>
                                    {i < brandingContent[bgImageIndex].stats.length - 1 && (
                                        <div className="w-px h-8 bg-slate-700" />
                                    )}
                                </div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Right Side: Form */}
            <div className="flex-1 flex flex-col bg-white relative overflow-y-auto">
                {/* Header for mobile or as top nav */}
                <div className="p-2 lg:px-4 lg:py-2 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-50/50">
                    <div className="lg:hidden">
                        <Link to="/" className="flex items-center gap-3">
                            <img src="/logo.png" alt="Logo" className="h-14 w-auto" />
                            <span className="text-lg font-bold text-gray-900">{PLATFORM_CONFIG.name}</span>
                        </Link>
                    </div>
                    <div className="hidden lg:block text-xs font-bold text-slate-500  tracking-widest">
                        Project Configuration Environment
                    </div>
                    <div className="flex items-center gap-4">
                        {user && (
                            <button
                                onClick={async () => { await signOut(); navigate('/login'); }}
                                className="text-xs font-bold  tracking-widest text-red-500 hover:text-red-600 transition-colors"
                            >
                                Sign Out
                            </button>
                        )}
                        <Link to="/login" className="text-xs font-bold  tracking-widest text-primary-600 hover:underline">
                            Login Support →
                        </Link>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-start px-4 lg:px-6 pt-0 pb-6 overflow-x-hidden">
                    <div className={cn(
                        "w-full transition-all duration-500",
                        (step === 2 || step === 3) ? "max-w-[1200px]" : "max-w-[900px]"
                    )}>
                        {/* Step indicator */}
                        {step <= 5 && <StepDots current={step <= 2 ? step : step - 1} steps={dynamicSteps} />}

                        <AnimatePresence mode="wait">

                            {/* ── STEP 1: Project Name ─────────────────────────────── */}
                            {step === 1 && (
                                <motion.div key="s1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
                                    <div className="space-y-1">
                                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Tell us about your project</h1>
                                        <p className="text-gray-500 font-medium">Define your workspace and select the core modules to get started.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-400  tracking-widest ml-1">Business Name</label>
                                            <input
                                                type="text"
                                                value={storeName}
                                                onChange={(e) => setStoreName(e.target.value)}
                                                placeholder="e.g. Nexus Global"
                                                className="w-full h-14 bg-slate-50/50 border-b-2 border-transparent border-t-0 border-x-0 rounded-t-xl px-6 font-bold text-lg text-gray-900 placeholder:text-gray-300 focus:bg-slate-100/50 focus:border-primary-600 transition-all text-sm outline-none"
                                            />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-bold text-gray-400  tracking-widest ml-1">Select Solution Suites</label>
                                                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-3 py-1 rounded-full  tracking-widest">
                                                    {selectedModules.length} Selected
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                                {availableSystemModules.length === 0 ? (
                                                    Array.from({ length: 4 }).map((_, i) => (
                                                        <div key={i} className="h-20 bg-slate-50 border border-gray-100 rounded-2xl animate-pulse" />
                                                    ))
                                                ) : availableSystemModules.map((mod) => {
                                                    const isSelected = selectedModules.includes(mod.id.toString());
                                                    return (
                                                        <div key={mod.id} onClick={() => {
                                                            setSelectedModules(prev =>
                                                                isSelected ? prev.filter(id => id !== mod.id.toString()) : [...prev, mod.id.toString()]
                                                            );
                                                            if (!isSelected && selectedModules.length === 0) {
                                                                if (mod.category === 'commerce') setIndustryType('retail');
                                                                else if (mod.category === 'operations') setIndustryType('services');
                                                                else if (mod.category === 'people' || mod.category === 'education') setIndustryType('education');
                                                            }
                                                        }}
                                                            className={cn(
                                                                "p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 relative group",
                                                                isSelected ? "border-primary-600 bg-primary-50/30 ring-1 ring-primary-600 shadow-md" : "border-gray-100 bg-slate-50/50 hover:border-gray-200"
                                                            )}>
                                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-xl border border-gray-100 group-hover:scale-110 transition-transform">
                                                                {mod.icon || '📦'}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-bold text-[13px] text-gray-900 truncate">{mod.name}</h3>
                                                                <p className="text-[13px] font-bold text-gray-400  tracking-tight truncate">{mod.tagline || 'Essential app'}</p>
                                                            </div>
                                                            {isSelected && (
                                                                <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
                                                                    <Check className="w-3 h-3 text-white stroke-[3]" />
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-4 rounded-xl border border-red-100">{error}</p>}

                                        <Button onClick={() => {
                                            if (!storeName.trim()) return setError("Business name required.");
                                            if (selectedModules.length === 0) return setError("Please select at least one module.");
                                            goNext();
                                        }} className={nextBtnCls}>
                                            Choose Your Plan <ArrowRight className="w-5 h-5 ml-2" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── STEP 2: Plan ─────────────────────────────────────── */}
                            {step === 2 && (
                                <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                    <div className="space-y-2">
                                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Select a plan</h1>
                                        <p className="text-gray-500 font-medium">Scale as you grow. Start with our flexible tier and upgrade anytime.</p>
                                    </div>

                                    {plans.length === 0 ? (
                                        <PlatformLoader fullScreen={false} message="Fetching Tiers" subtext="Economic Node Sync" />
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                                            {plans.map((plan) => (
                                                <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                                                    className={cn(
                                                        "p-6 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col gap-6 relative group",
                                                        selectedPlan === plan.id ? "border-primary-600 bg-primary-50/20 ring-1 ring-primary-600 shadow-xl" : "border-gray-100 bg-slate-50/50 hover:border-gray-200"
                                                    )}>
                                                    {selectedPlan === plan.id && (
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[13px] font-bold px-4 py-1.5 rounded-full  tracking-widest shadow-lg">Most Popular</div>
                                                    )}
                                                    <div className="space-y-1">
                                                        <h3 className="font-bold text-xs  tracking-widest text-slate-500 group-hover:text-primary-600">{plan.name}</h3>
                                                        <p className="text-3xl font-bold text-slate-900 tracking-tight">${plan.price_monthly}<span className="text-sm font-bold text-slate-500 ml-1">/mo</span></p>
                                                    </div>
                                                    <ul className="space-y-3 flex-1">
                                                        {plan.features.slice(0, 5).map((feat, i) => (
                                                            <li key={i} className="flex items-start gap-2.5 text-xs font-medium text-slate-600">
                                                                <Check className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                                {feat}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex gap-4 pt-6">
                                        <button onClick={goBack} className={backBtnCls}>Back</button>
                                        <Button onClick={goNext} className={nextBtnCls}>Continue Design <ArrowRight className="w-5 h-5 ml-2" /></Button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── STEP 3: Create Account ────────────────────────────── */}
                            {step === 4 && (
                                <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
                                    <div className="space-y-3">
                                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Finalize your account</h1>
                                        <p className="text-gray-500 font-medium">Create your administrative credentials to manage your workspace.</p>
                                    </div>

                                    <div className="space-y-5 max-w-2xl">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400  tracking-widest ml-1">Full Name</label>
                                            <div className="relative group">
                                                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-600" />
                                                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Natesh Kumar"
                                                    className="w-full h-14 bg-slate-50/50 border-b-2 border-transparent border-t-0 border-x-0 rounded-t-xl pl-14 pr-4 font-bold text-gray-900 placeholder:text-gray-300 focus:bg-slate-100/50 focus:border-primary-600 transition-all text-sm outline-none" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400  tracking-widest ml-1">Work Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-600" />
                                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@company.com"
                                                    className="w-full h-14 bg-slate-50/50 border-b-2 border-transparent border-t-0 border-x-0 rounded-t-xl pl-14 pr-4 font-bold text-gray-900 placeholder:text-gray-300 focus:bg-slate-100/50 focus:border-primary-600 transition-all text-sm outline-none" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400  tracking-widest ml-1">Password</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-600" />
                                                    <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                                                        className="w-full h-14 bg-slate-50/50 border-b-2 border-transparent border-t-0 border-x-0 rounded-t-xl pl-14 pr-12 font-bold text-gray-900 placeholder:text-gray-300 focus:bg-slate-100/50 focus:border-primary-600 transition-all text-sm outline-none" />
                                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors">
                                                        {showPassword ? <Eye className="w-4 h-4" /> : <X className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-400  tracking-widest ml-1">Confirm</label>
                                                <div className="relative group">
                                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-primary-600" />
                                                    <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
                                                        className="w-full h-14 bg-slate-50/50 border-b-2 border-transparent border-t-0 border-x-0 rounded-t-xl pl-14 pr-4 font-bold text-gray-900 placeholder:text-gray-300 focus:bg-slate-100/50 focus:border-primary-600 transition-all text-sm outline-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-4 rounded-xl border border-red-100">{error}</p>}

                                        <div className="flex gap-4 pt-6">
                                            <button onClick={goBack} className={backBtnCls}>Back</button>
                                            <Button onClick={handleDeploy} disabled={loading} className={nextBtnCls}>
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                                                {loading ? "Launching Enterprise..." : "Deploy Workspace"}
                                            </Button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-400 font-bold  tracking-widest text-center pt-10 border-t border-gray-50 grayscale opacity-50">
                                        Secured by {PLATFORM_CONFIG.name} Identity Protocol
                                    </p>
                                </motion.div>
                            )}

                            {/* ── STEP 5: Progress ──────────────────────── */}
                            {step === 5 && (
                                <motion.div key="s5" 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="fixed inset-0 z-[200]"
                                >
                                    <PlatformLoader 
                                        message={deploymentStatus} 
                                        subtext={`Industrial Provisioning: ${deploymentStep}% Complete`} 
                                    />
                                </motion.div>
                            )}

                            {/* ── STEP 7: Success ───────────────────────────────────── */}
                            {step === 6 && (
                                <motion.div key="s6" initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="text-center space-y-8 py-4">
                                    <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-emerald-100">
                                        <Check className="w-10 h-10 stroke-[4]" />
                                    </div>

                                    <div className="space-y-3">
                                        <h1 className="text-xs font-bold text-emerald-500  tracking-[0.8em]">Deployment Complete</h1>
                                        <h2 className="text-4xl font-bold text-gray-900 tracking-tighter ">
                                            Ready to <span className="text-primary-600">Scale</span>
                                        </h2>
                                        <p className="text-gray-500 font-medium max-w-sm mx-auto">
                                            Your enterprise workspace <b className="text-gray-900">{storeName}</b> has been successfully provisioned.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg mx-auto pt-6">
                                        <Button onClick={() => window.location.href = `/stores/${slug}/index.html`}
                                            className="h-16 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold  tracking-widest text-xs shadow-2xl transition-all">
                                            <Rocket className="w-4 h-4 mr-2" /> View Shop
                                        </Button>
                                        <Button onClick={async () => {
                                            await refreshTenant();
                                            navigate("/apps");
                                        }}
                                            className="h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold  tracking-widest text-xs shadow-2xl shadow-primary-600/20 transition-all">
                                            <Layers className="w-4 h-4 mr-2" /> Launch Console
                                        </Button>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-50 flex justify-center gap-10 opacity-30 grayscale pointer-events-none mt-auto">
                    <div className="flex flex-col items-center">
                        <Check className="w-6 h-6 mb-1" />
                        <span className="text-xs font-bold  tracking-widest">Enterprise</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Lock className="w-6 h-6 mb-1" />
                        <span className="text-xs font-bold  tracking-widest">Encrypted</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <Rocket className="w-6 h-6 mb-1" />
                        <span className="text-xs font-bold  tracking-widest">Global</span>
                    </div>
                </div>
            </div>

        </div>
    );
}

