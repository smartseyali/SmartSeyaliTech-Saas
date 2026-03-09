
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/lib/supabase";
import { Check, ArrowRight, ArrowLeft, Loader2, Rocket, Eye, X, Mail, Lock, User as UserIcon, LogOut, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import PLATFORM_CONFIG from "@/config/platform";
import { PLATFORM_MODULES, type PlatformModule } from "@/config/modules";

// ── Types ──────────────────────────────────────────────────
interface TemplateEntry {
    id: string;
    name: string;
    description: string;
    industry?: string;
    color?: string;
    preview_image: string;
    gallery_images: string[];
    tags: string[];
    folder: string;
    version?: string;
    component_count?: number;
    is_active?: boolean;
}

interface PlanEntry {
    id: string;
    name: string;
    slug: string;
    price_monthly: number;
    features: string[];
}

// ── Local Fallbacks ────────────────────────────────────────
const LOCAL_REGISTRY: TemplateEntry[] = [
    {
        id: 'amazon-style',
        folder: 'amazon-style',
        name: 'Amazon Style',
        description: 'A robust, multi-category layout inspired by the world\'s largest e-commerce platform. Best for megastores.',
        version: '1.0.1',
        preview_image: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=900',
        gallery_images: [
            'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=900',
            'https://images.unsplash.com/photo-1550009158-9ebf69173e03?q=80&w=900',
            'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=900'
        ],
        color: '#f97316',
        tags: ['megastore', 'retail', 'amazon'],
    },
    {
        id: 'fruitables',
        folder: 'fruitables',
        name: 'Fruitables Organic',
        description: 'Vibrant, fresh design perfect for organic groceries, fruit shops, and healthy food stores.',
        version: '1.0.1',
        preview_image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=900',
        gallery_images: [
            'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=900',
            'https://images.unsplash.com/photo-1466632311177-a3d1433f95e8?q=80&w=900',
            'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=900'
        ],
        color: '#81c408',
        tags: ['groceries', 'fresh', 'organic'],
    },
    {
        id: 'modern-shop',
        folder: 'modern-shop',
        name: 'Modern Shop',
        description: 'A sleek, minimalist design suitable for fashion, electronics, and dropshipping brands.',
        version: '1.0.0',
        preview_image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=900',
        gallery_images: [
            'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=900',
            'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=900',
            'https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=900'
        ],
        color: '#000000',
        tags: ['fashion', 'electronics', 'modern'],
    }
];

// ─── Step Indicator ────────────────────────────────────────
function StepDots({ current, steps }: { current: number, steps: string[] }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((label, i) => {
                const stepNum = i + 1;
                const isActive = stepNum === current;
                const isDone = stepNum < current;
                return (
                    <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`transition-all duration-500 rounded-full flex items-center justify-center
                            ${isActive ? 'w-6 h-6 bg-primary-600 shadow-[0_0_15px_rgba(0,155,176,0.3)]' :
                                isDone ? 'w-4 h-4 bg-emerald-500/80' : 'w-3 h-3 bg-white/10'}`}>
                            {isDone
                                ? <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                                : isActive
                                    ? <span className="text-[9px] font-black text-white">{stepNum}</span>
                                    : null}
                        </div>
                        {isActive && <span className="text-[7px] font-black uppercase tracking-widest text-blue-500">{label}</span>}
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
                if (data) navigate('/apps', { replace: true });
            });
        }
    }, [user, isSuperAdmin, pLoading]);

    // ── State ─────────────────────────────────────────────────
    const [step, setStep] = useState(1);
    const [storeName, setStoreName] = useState("");
    const [industryType, setIndustryType] = useState<'retail' | 'education' | 'services'>('retail');
    const [selectedPlan, setSelectedPlan] = useState<string>("");
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [plans, setPlans] = useState<PlanEntry[]>([]);
    const [templates, setTemplates] = useState<TemplateEntry[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(true);
    const [previewingTemplate, setPreviewingTemplate] = useState<TemplateEntry | null>(null);

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
    const [error, setError] = useState("");

    // Determine if we need the theme step
    const needsTheme = selectedModules.some(modId => {
        const mod = availableSystemModules.find(m => m.id.toString() === modId);
        // Fallback to true if 'ecommerce' or 'landing-page' slug is present
        if (!mod) return false;
        // Check new property if exists, else fallback to commerce/operations categories
        return mod.needsTemplate !== undefined ? mod.needsTemplate : (mod.slug === 'ecommerce' || mod.slug === 'landing-page');
    });

    const dynamicSteps = needsTheme
        ? ["Business", "Plan", "Theme", "Account", "Confirm"]
        : ["Business", "Plan", "Account", "Confirm"];

    // ── Data Fetching ─────────────────────────────────────────
    useEffect(() => {
        async function loadContent() {
            setTemplatesLoading(true);
            try {
                const { data: tData } = await supabase
                    .from("system_templates")
                    .select("*")
                    .eq("is_active", true)
                    .order("sort_order", { ascending: true });

                const mapped: TemplateEntry[] = (tData || []).map(row => ({
                    id: row.folder,
                    folder: row.folder,
                    name: row.name,
                    description: row.description || "",
                    industry: row.industry || "retail",
                    version: row.version,
                    preview_image: row.preview_image || "",
                    gallery_images: row.gallery_images || [],
                    color: row.color,
                    tags: row.tags || [],
                    component_count: row.component_count
                }));
                setTemplates(mapped.length > 0 ? mapped : LOCAL_REGISTRY);

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
                }

                // Fetch System Modules for selection
                const { data: mData } = await supabase.from('system_modules').select('*').eq('is_active', true);
                if (mData) {
                    setAvailableSystemModules(mData);

                    // Pre-select module from URL if exists
                    const params = new URLSearchParams(window.location.search);
                    const urlModule = params.get('module');
                    if (urlModule) {
                        // Find by slug OR id
                        const mod = mData.find(m => m.slug === urlModule || m.id.toString() === urlModule);
                        if (mod) {
                            setSelectedModules([mod.id.toString()]);
                            // Set industry type based on module category if possible
                            if (mod.category === 'commerce') setIndustryType('retail');
                            else if (mod.category === 'operations') setIndustryType('services');
                            else if (mod.category.includes('people') || mod.category === 'education') setIndustryType('education');
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load onboarding content:", err);
                setTemplates(LOCAL_REGISTRY as any);
            } finally {
                setTemplatesLoading(false);
            }
        }
        loadContent();
    }, []);

    // ── Helpers ───────────────────────────────────────────────
    const goNext = () => {
        setError("");
        if (step === 2 && !needsTheme) {
            setStep(4); // Skip Theme (Step 3)
        } else {
            setStep(s => s + 1);
        }
    };
    const goBack = () => {
        setError("");
        if (step === 4 && !needsTheme) {
            setStep(2); // Back to Plan (Skip Step 3)
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
            await runProgress(25, "Saving Your Profile...", 800);

            // 2. Create user profile record
            await supabase.from('users').upsert({
                id: activeUser.id,
                username: activeUser.email || email,
                full_name: fullName || activeUser.user_metadata?.full_name || email.split('@')[0],
                is_super_admin: false
            });

            await runProgress(40, "Setting up Your Business...", 1000);

            // 3. Create company
            const newSlug = storeName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000);
            setSlug(newSlug);

            const { data: newCompany, error: cErr } = await supabase
                .from("companies")
                .insert([{
                    name: storeName,
                    subdomain: newSlug,
                    contact_email: email || activeUser.email,
                    user_id: activeUser.id,
                    industry_type: industryType,
                    plan: plans.find(p => p.id === selectedPlan)?.name || 'starter'
                }])
                .select()
                .single();
            if (cErr) throw cErr;

            await runProgress(60, needsTheme ? "Loading Your Theme..." : "Configuring Workspace...", 1200);

            // 4. Provision template (ONLY if needed)
            if (needsTheme && selectedTemplate) {
                const selectedTmpl = templates.find(t => t.id === selectedTemplate);
                const folderToUse = selectedTmpl?.folder || selectedTemplate;
                try {
                    await fetch("http://localhost:8000/api/provision", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ store_name: newSlug, company_id: newCompany.id, template: folderToUse })
                    });
                } catch {
                    console.warn("Provisioning bypass (local simulation)");
                }
            }

            await runProgress(80, "Finalizing Smart Seyali...", 1000);

            // 5. Link user to company
            await supabase.from("company_users").insert([{
                company_id: newCompany.id,
                user_id: activeUser.id,
                role: 'admin'
            }]);

            // 6. Link selected modules to company (Company Modules)
            if (selectedModules.length > 0) {
                const modulesPayload = selectedModules.map(modId => ({
                    company_id: newCompany.id,
                    module_id: modId,
                    is_active: true
                }));
                await supabase.from("company_modules").insert(modulesPayload);

                // 7. Link selected modules to user (User Modules)
                const userModulesPayload = selectedModules.map(modId => ({
                    company_id: newCompany.id,
                    user_id: activeUser.id,
                    module_id: modId,
                    is_active: true
                }));
                await supabase.from("user_modules").insert(userModulesPayload);
            } else {
                // If nothing selected, enable ecommerce by default
                const ecommerceMod = availableSystemModules.find(m => m.slug === 'ecommerce');
                const defaultModId = ecommerceMod?.id || 'ecommerce';

                await supabase.from("company_modules").insert([{
                    company_id: newCompany.id,
                    module_id: defaultModId,
                    is_active: true
                }]);

                await supabase.from("user_modules").insert([{
                    company_id: newCompany.id,
                    user_id: activeUser.id,
                    module_id: defaultModId,
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
    const cardCls = "w-full bg-white border border-slate-100 shadow-2xl relative z-10 rounded-2xl";
    const backBtnCls = "h-11 px-6 border-slate-100 bg-white text-slate-400 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-bold uppercase text-[9px] tracking-widest flex items-center gap-2 transition-all border shadow-sm";
    const nextBtnCls = "flex-1 h-11 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-bold uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-lg shadow-primary-600/10";

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.4] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]" />

            {/* Background blobs */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 -left-4 w-[800px] h-[800px] bg-primary-100 rounded-full blur-[200px] opacity-40 animate-blob" />
                <div className="absolute top-0 -right-4 w-[800px] h-[800px] bg-teal-100 rounded-full blur-[200px] opacity-30 animate-blob animation-delay-2000" />
            </div>

            {/* Top nav — always visible on steps 1–5 */}
            {step < 6 && (
                <div className="fixed top-8 left-8 right-8 flex items-center justify-between z-50">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-primary-600 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <Rocket className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] block leading-none mb-1">{PLATFORM_CONFIG.name}</span>
                            <span className="text-[8px] font-bold text-primary-600 uppercase tracking-widest block leading-none">{PLATFORM_CONFIG.tagline}</span>
                        </div>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-3">
                        {user && (
                            <button
                                onClick={async () => { await signOut(); navigate('/login'); }}
                                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg transition-all border border-slate-100 bg-white"
                            >
                                <LogOut className="w-3.5 h-3.5" /> Sign Out
                            </button>
                        )}
                        <Link to="/login" className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors px-6 py-3 rounded-lg bg-white border border-slate-200 shadow-sm">
                            Login Support →
                        </Link>
                    </div>
                </div>
            )}

            <div className="w-full flex flex-col items-center">
                {/* Step indicator — visible for steps 1-5 */}
                {step >= 1 && step <= 5 && <StepDots current={step <= 2 ? step : (needsTheme ? step : step - 1)} steps={dynamicSteps} />}

                <AnimatePresence mode="wait">

                    {/* ── STEP 1: Project Name ─────────────────────────────── */}
                    {step === 1 && (
                        <motion.div key="s1" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`${cardCls} max-w-2xl p-8`}>
                            <div className="flex flex-col items-center mb-8">
                                <div className="w-16 h-16 bg-gradient-to-tr from-primary-600 to-teal-600 rounded-2xl flex items-center justify-center text-white mb-5 shadow-xl shadow-primary-500/30">
                                    <Rocket className="w-7 h-7" />
                                </div>
                                <h1 className="text-[9px] font-black text-primary-600 uppercase tracking-[0.5em] mb-2 font-outfit">Store Setup</h1>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic leading-none text-center font-outfit">
                                    Launch Your <br /><span className="text-primary-600">Business</span>
                                </h2>
                            </div>

                            <div className="space-y-8">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-slate-500 ml-1">Business Name</label>
                                    <input
                                        type="text"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        placeholder="e.g. Nexus Global"
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-5 font-bold text-lg text-slate-900 placeholder:text-slate-200 focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-inner"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[9px] uppercase font-bold tracking-[0.4em] text-slate-500 ml-1">Select Your Solution Suites</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {availableSystemModules.map((mod) => {
                                            const isSelected = selectedModules.includes(mod.id.toString());
                                            return (
                                                <div key={mod.id} onClick={() => {
                                                    setSelectedModules(prev =>
                                                        isSelected ? prev.filter(id => id !== mod.id.toString()) : [...prev, mod.id.toString()]
                                                    );
                                                    // Auto-set industry if it's the first selection
                                                    if (!isSelected && selectedModules.length === 0) {
                                                        if (mod.category === 'commerce') setIndustryType('retail');
                                                        else if (mod.category === 'operations') setIndustryType('services');
                                                        else if (mod.category === 'people' || mod.category === 'education') setIndustryType('education');
                                                    }
                                                }}
                                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 relative ${isSelected ? 'border-primary-600 bg-primary-50/50 shadow-md' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200'}`}>
                                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                                        <span className="text-xl">{mod.icon || '📦'}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-black text-[10px] uppercase text-slate-900 tracking-tight">{mod.name}</h3>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{mod.tagline || 'Essential app'}</p>
                                                    </div>
                                                    {isSelected && <div className="ml-auto w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center shadow-lg"><Check className="w-3 h-3 text-white" /></div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center bg-red-50 py-3 rounded-lg border border-red-100">{error}</p>}

                                <Button onClick={() => {
                                    if (!storeName.trim()) return setError("Business name required.");
                                    if (selectedModules.length === 0) return setError("Please select at least one module to continue.");
                                    goNext();
                                }} className={nextBtnCls}>
                                    Check Plans <ArrowRight className="w-5 h-5 stroke-[3]" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 3: Plan ─────────────────────────────────────── */}
                    {step === 2 && (
                        <motion.div key="s2" initial={{ opacity: 0, scale: 0.95, x: 40 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9, x: -40 }} className={`${cardCls} max-w-4xl p-8`}>
                            <h2 className="text-2xl font-black text-center mb-1 tracking-tighter uppercase text-slate-900 italic leading-none font-outfit">Select <span className="text-primary-600">Plan</span></h2>
                            <p className="text-slate-500 text-center mb-8 text-[9px] font-black uppercase tracking-[0.4em]">Choose a plan that fits your business.</p>

                            {plans.length === 0 ? (
                                <div className="flex justify-center py-10"><Loader2 className="w-10 h-10 animate-spin text-primary-600" /></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                    {plans.map((plan) => (
                                        <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                                            className={`p-5 rounded-2xl border transition-all duration-500 cursor-pointer flex flex-col gap-4 relative group ${selectedPlan === plan.id ? 'border-primary-600 bg-primary-50/50 shadow-xl' : 'border-slate-50 bg-slate-50/30 hover:border-slate-100'}`}>
                                            {selectedPlan === plan.id && (
                                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[7px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Selected</div>
                                            )}
                                            <div className="space-y-0.5">
                                                <h3 className="font-black text-[8px] uppercase tracking-[0.3em] text-slate-400 group-hover:text-primary-600 transition-colors">{plan.name}</h3>
                                                <p className="text-2xl font-black text-slate-900 tracking-tighter">${plan.price_monthly}<span className="text-[9px] font-bold text-slate-300 ml-1">/mo</span></p>
                                            </div>
                                            <ul className="space-y-2 flex-1">
                                                {plan.features.slice(0, 4).map((feat, i) => (
                                                    <li key={i} className="flex items-start gap-1.5 text-[9px] font-bold text-slate-500 uppercase tracking-tight leading-none">
                                                        <Check className="w-2.5 h-2.5 text-primary-600 mt-0.5" />
                                                        {feat}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}


                            <div className="flex gap-6 mt-10">
                                <button onClick={goBack} className={backBtnCls}><ArrowLeft className="w-5 h-5" /> Back</button>
                                <Button onClick={goNext} className={nextBtnCls}>Continue <ArrowRight className="w-5 h-5" /></Button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 4: Template ─────────────────────────────────── */}
                    {step === 3 && (
                        <motion.div key="s3" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`${cardCls} max-w-4xl p-8`}>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
                                <div>
                                    <h1 className="text-[9px] font-black text-primary-600 uppercase tracking-[0.4em] mb-1 font-outfit">Theme Design</h1>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic font-outfit">Select <span className="text-primary-600">Theme</span></h2>
                                </div>
                                <div className="flex bg-slate-100 p-1 rounded-xl">
                                    {['retail', 'education', 'services'].map(t => (
                                        <button key={t} onClick={() => setIndustryType(t as any)}
                                            className={`px-4 py-1.5 rounded-lg text-[8px] uppercase font-black tracking-[0.2em] transition-all ${industryType === t ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-600'}`}>
                                            {t === 'retail' ? 'Stores' : t === 'education' ? 'Consult' : 'Tech'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {templatesLoading ? (
                                <div className="flex flex-col items-center py-10 gap-3">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
                                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-500">Loading Themes...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                    {templates.filter(t => t.industry === industryType || !t.industry).slice(0, 6).map((tmpl) => (
                                        <div key={tmpl.id}
                                            className={`group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-500 border ${selectedTemplate === tmpl.id ? 'border-primary-600 shadow-xl scale-[1.02]' : 'border-slate-50 bg-slate-50/30'}`}>
                                            <div className="aspect-[4/3] relative overflow-hidden">
                                                <img src={tmpl.preview_image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                                                    <Button onClick={() => setPreviewingTemplate(tmpl)} variant="outline" className="h-8 px-4 bg-white/20 backdrop-blur-md border-white/30 text-white font-bold text-[8px] uppercase tracking-widest rounded-lg">Preview</Button>
                                                    <Button onClick={() => setSelectedTemplate(tmpl.id)} className="h-8 px-4 bg-primary-600 text-white font-bold text-[8px] uppercase tracking-widest rounded-lg">{selectedTemplate === tmpl.id ? 'Selected' : 'Select'}</Button>
                                                </div>
                                            </div>
                                            <div className="p-4 border-t border-slate-50">
                                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">{tmpl.name}</h3>
                                                <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">v{tmpl.version || '1.0'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-4 pt-8 border-t border-slate-50">
                                <button onClick={goBack} className={backBtnCls}><ArrowLeft className="w-4 h-4" /> Back</button>
                                <Button onClick={() => selectedTemplate ? goNext() : setError("Select a theme first.")}
                                    disabled={!selectedTemplate}
                                    className={nextBtnCls}>
                                    Account Setup <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 5: Create Account ────────────────────────────── */}
                    {step === 4 && (
                        <motion.div key="s4" initial={{ opacity: 0, scale: 0.95, x: 40 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`${cardCls} max-w-md p-8`}>
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-tr from-primary-600 to-teal-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-xl shadow-primary-500/30">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic text-center font-outfit">Finalize <span className="text-primary-600">Setup</span></h2>
                                <p className="text-slate-500 text-[9px] mt-1.5 text-center font-bold max-w-xs uppercase tracking-widest">Connect your business account.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[8px] uppercase font-bold tracking-[0.3em] text-slate-500 ml-1">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full name"
                                            className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] uppercase font-bold tracking-[0.3em] text-slate-500 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email"
                                            className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] uppercase font-bold tracking-[0.3em] text-slate-500 ml-1">Secure Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                                        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••"
                                            className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-11 font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-sm" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] uppercase font-bold tracking-[0.3em] text-slate-500 ml-1">Confirm</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                                        <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••"
                                            className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl pl-11 pr-4 font-bold text-slate-900 placeholder:text-slate-300 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-sm" />
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-[9px] font-bold text-center bg-red-50 py-2 rounded-lg border border-red-100">{error}</p>}

                                <div className="flex gap-4 pt-4">
                                    <button onClick={goBack} className={backBtnCls}><ArrowLeft className="w-4 h-4" /></button>
                                    <Button onClick={handleDeploy} disabled={loading} className={nextBtnCls}>
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                                        {loading ? "Launching..." : "Deploy Store"}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 6: Progress ──────────────────────── */}
                    {step === 5 && (
                        <motion.div key="s5" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="max-w-md w-full bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 text-center relative z-10 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 overflow-hidden">
                                <motion.div className="h-full bg-primary-600"
                                    initial={{ width: "0%" }} animate={{ width: `${deploymentStep}%` }} transition={{ duration: 0.5 }} />
                            </div>

                            <div className="mb-4 relative inline-flex items-center justify-center pt-6">
                                <div className="w-20 h-20 border-6 border-slate-50 border-t-primary-600 rounded-full animate-spin shadow-inner" />
                                <div className="absolute inset-0 flex items-center justify-center pt-6">
                                    <span className="text-xl font-black text-slate-900 tracking-tighter">{deploymentStep}%</span>
                                </div>
                            </div>

                            <h2 className="text-[9px] font-black text-primary-600 uppercase tracking-[0.8em] mb-1 font-outfit">Provisioning</h2>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic mb-6 font-outfit">{deploymentStatus}</h3>

                            <div className="flex flex-col gap-3 max-w-xs mx-auto text-left py-5 border-t border-slate-50">
                                {[
                                    { val: 10, label: "Account Setup" },
                                    { val: 25, label: "Profile Cache" },
                                    { val: 40, label: "Environment" },
                                    { val: 60, label: "Asset Loading" },
                                    { val: 80, label: "Optimization" },
                                    { val: 100, label: "Deployment Ready" }
                                ].map((s, i) => (
                                    <div key={i} className={`flex items-center gap-3 text-[8px] font-black uppercase tracking-[0.3em] transition-all duration-700 ${deploymentStep >= s.val ? 'text-primary-600' : 'text-slate-500'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${deploymentStep >= s.val ? 'bg-primary-600 shadow-lg shadow-primary-500/20' : 'bg-slate-100'}`} />
                                        {s.label}
                                        {deploymentStep >= s.val && <Check className="w-2.5 h-2.5 ml-auto stroke-[4]" />}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 7: Success ───────────────────────────────────── */}
                    {step === 6 && (
                        <motion.div key="s6" initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-2xl border border-slate-100 text-center relative z-10 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-600 to-teal-600" />

                            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-primary-100">
                                <Check className="w-8 h-8 stroke-[4]" />
                            </div>

                            <h1 className="text-[9px] font-black text-primary-600 uppercase tracking-[0.8em] mb-3 font-outfit">Live Now</h1>
                            <h2 className="text-2xl font-black text-slate-900 mb-5 tracking-tighter uppercase italic leading-none font-outfit">
                                Ready to <span className="text-primary-600">Grow</span>
                            </h2>
                            <p className="text-slate-500 font-bold text-xs leading-relaxed mb-8 max-w-xs mx-auto uppercase tracking-wide">
                                Congratulations! Your <b className="text-slate-900">{storeName}</b> store is ready.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Button onClick={() => window.location.href = `/stores/${slug}/index.html`}
                                    className="h-14 bg-slate-900 hover:bg-black text-white rounded-xl font-bold uppercase tracking-[0.3em] text-[10px] shadow-xl transition-all">
                                    <Rocket className="w-3.5 h-3.5 mr-2" /> View Shop
                                </Button>
                                <Button onClick={async () => {
                                    await refreshTenant();
                                    navigate("/apps");
                                }}
                                    className="h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-primary-600/20 transition-all font-outfit">
                                    <Check className="w-3.5 h-3.5 mr-2" /> Manage
                                </Button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            {/* ── Template Preview Modal ─────────────────────────── */}
            <AnimatePresence>
                {previewingTemplate && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 md:p-10">
                        <motion.div initial={{ scale: 0.9, y: 60 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 60 }}
                            className="bg-white w-full max-w-6xl h-full max-h-[85vh] rounded-[40px] border border-slate-100 flex flex-col md:flex-row overflow-hidden shadow-2xl">

                            {/* Image side */}
                            <div className="flex-1 bg-slate-50 relative flex flex-col p-8 lg:p-12 gap-6">
                                <div className="flex-1 rounded-3xl overflow-hidden shadow-xl border border-white">
                                    <img src={previewingTemplate.preview_image} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x pb-2">
                                    {(previewingTemplate.gallery_images || []).map((img, idx) => (
                                        <div key={idx}
                                            className={`min-w-[120px] aspect-video rounded-2xl overflow-hidden border-2 cursor-pointer snap-start transition-all hover:scale-105 ${previewingTemplate.preview_image === img ? 'border-primary-600' : 'border-white hover:border-slate-200'}`}
                                            onClick={() => setPreviewingTemplate({ ...previewingTemplate, preview_image: img })}>
                                            <img src={img} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute top-12 left-12 text-slate-900 p-6 rounded-2xl bg-white/80 backdrop-blur-md border border-slate-100 shadow-xl">
                                    <h3 className="text-2xl font-black tracking-tighter uppercase italic leading-none">{previewingTemplate.name}</h3>
                                    <p className="text-primary-600 text-[9px] font-black mt-1 tracking-[0.3em] uppercase">Enterprise Theme</p>
                                </div>
                            </div>

                            {/* Info side */}
                            <div className="w-full md:w-[380px] bg-white p-12 flex flex-col border-l border-slate-50 relative">
                                <button onClick={() => setPreviewingTemplate(null)} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-all hover:rotate-90">
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="mt-8 space-y-10 flex-1">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-600 mb-4">About Theme</h4>
                                        <p className="text-slate-500 font-bold text-xs leading-relaxed border-l-4 border-slate-100 pl-6 uppercase tracking-wide">{previewingTemplate.description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 mb-1">Industry</p>
                                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{previewingTemplate.industry}</p>
                                        </div>
                                        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-300 mb-1">Architecture</p>
                                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{previewingTemplate.component_count || 12}+ Standard Modules</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-8 border-t border-slate-50 space-y-4">
                                    <Button onClick={() => { setSelectedTemplate(previewingTemplate.id); setPreviewingTemplate(null); }}
                                        className="w-full h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold uppercase tracking-[0.3em] text-[10px] shadow-xl shadow-primary-600/10 transition-all">
                                        Use This Theme
                                    </Button>
                                    <p className="text-center text-[8px] font-black text-slate-200 uppercase tracking-[0.3em]">{PLATFORM_CONFIG.name} Proprietary Design</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

