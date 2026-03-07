
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Check, ArrowRight, ArrowLeft, Loader2, Rocket, Eye, X, Mail, Lock, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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
const STEPS = ['Project', 'Industry', 'Package', 'Theme', 'Account', 'Deploy'];

function StepDots({ current }: { current: number }) {
    return (
        <div className="flex items-center justify-center gap-3 mb-10">
            {STEPS.map((label, i) => {
                const stepNum = i + 1;
                const isActive = stepNum === current;
                const isDone = stepNum < current;
                return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                        <div className={`transition-all duration-500 rounded-full flex items-center justify-center
                            ${isActive ? 'w-8 h-8 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]' :
                                isDone ? 'w-6 h-6 bg-green-500/80' : 'w-5 h-5 bg-white/10'}`}>
                            {isDone
                                ? <Check className="w-3 h-3 text-white stroke-[3]" />
                                : isActive
                                    ? <span className="text-[10px] font-black text-white">{stepNum}</span>
                                    : null}
                        </div>
                        {isActive && <span className="text-[8px] font-black uppercase tracking-widest text-blue-500">{label}</span>}
                    </div>
                );
            })}
        </div>
    );
}

export default function Onboarding() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    // If user is already logged in and has a company → skip to app
    useEffect(() => {
        if (user) {
            supabase.from('companies').select('id').eq('user_id', user.id).limit(1).maybeSingle().then(({ data }) => {
                if (data) navigate('/ecommerce', { replace: true });
            });
        }
    }, [user]);

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

    // Deployment
    const [deploymentStep, setDeploymentStep] = useState(0);
    const [deploymentStatus, setDeploymentStatus] = useState("");
    const [slug, setSlug] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

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
    const goNext = () => { setError(""); setStep(s => s + 1); };
    const goBack = () => { setError(""); setStep(s => s - 1); };

    // ── Step 5: Create Auth Account + Deploy ──────────────────
    const handleDeploy = async () => {
        setError("");
        if (!fullName.trim()) return setError("Full name is required.");
        if (!email.trim()) return setError("Email is required.");
        if (password.length < 6) return setError("Password must be at least 6 characters.");
        if (password !== confirmPassword) return setError("Passwords do not match.");

        setLoading(true);
        setStep(6); // Go to deployment screen immediately

        const runProgress = async (val: number, msg: string, delay: number) => {
            setDeploymentStep(val);
            setDeploymentStatus(msg);
            await new Promise(r => setTimeout(r, delay));
        };

        try {
            await runProgress(10, "Creating Your Account...", 800);

            // 1. Create Supabase Auth account
            const { data: authData, error: signUpErr } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { full_name: fullName } }
            });
            if (signUpErr) throw signUpErr;
            const newUser = authData?.user;
            if (!newUser) throw new Error("Account creation failed. Please try again.");

            await runProgress(25, "Synchronizing Identity...", 800);

            // 2. Create user profile record
            await supabase.from('users').upsert({
                id: newUser.id,
                username: email,
                full_name: fullName,
                is_super_admin: false
            }).select().single();

            await runProgress(40, "Creating Enterprise Environment...", 1000);

            // 3. Create company
            const newSlug = storeName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000);
            setSlug(newSlug);

            const { data: newCompany, error: cErr } = await supabase
                .from("companies")
                .insert([{
                    name: storeName,
                    subdomain: newSlug,
                    contact_email: email,
                    user_id: newUser.id,
                    industry_type: industryType,
                    plan_id: selectedPlan,
                    plan: plans.find(p => p.id === selectedPlan)?.name || 'starter'
                }])
                .select()
                .single();
            if (cErr) throw cErr;

            await runProgress(60, "Configuring Theme Architecture...", 1200);

            // 4. Provision template
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

            await runProgress(80, "Optimizing Server Assets...", 1000);

            // 5. Link user to company
            await supabase.from("company_users").insert([{
                company_id: newCompany.id,
                user_id: newUser.id,
                role: 'admin'
            }]);

            await supabase.from("ecom_settings").insert([{
                company_id: newCompany.id,
                store_name: storeName,
                primary_color: selectedTmpl?.color || "#000000"
            }]);

            await runProgress(100, "Deployment Successful!", 800);

            setStep(7); // Success screen
        } catch (err: any) {
            setStep(5);
            setError(err.message || "Deployment failed. Please try again.");
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    // ── Shared card wrapper ───────────────────────────────────
    const cardCls = "w-full bg-white/10 backdrop-blur-2xl border border-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.5)] relative z-10 rounded-[48px]";
    const backBtnCls = "h-16 px-10 border-white/10 bg-transparent text-white/50 hover:bg-white/5 hover:text-white rounded-[20px] font-black uppercase text-[10px] tracking-widest flex items-center gap-3 transition-all";
    const nextBtnCls = "flex-1 h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 transition-all active:scale-95 shadow-2xl shadow-blue-600/20";

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob" />
                <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-2000" />
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob animation-delay-4000" />
            </div>

            {/* Top nav — always visible on steps 1–5 */}
            {step < 6 && (
                <div className="fixed top-6 left-6 right-6 flex items-center justify-between z-50">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center">
                            <Rocket className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Smartseyali Tech</span>
                    </div>

                    {/* Right side actions */}
                    <div className="flex items-center gap-3">
                        {/* Logout — only if user is already logged in */}
                        {user && (
                            <button
                                onClick={async () => { await signOut(); navigate('/login'); }}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-400/70 hover:text-red-400 transition-colors px-5 py-3 rounded-2xl bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/20"
                                title="Sign out of your account"
                            >
                                <LogOut className="w-4 h-4" /> Sign Out
                            </button>
                        )}
                        {/* Already have account link */}
                        <Link to="/login" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5">
                            Already have an account →
                        </Link>
                    </div>
                </div>
            )}

            <div className="w-full flex flex-col items-center">
                {/* Step indicator — visible for steps 1-5 */}
                {step >= 1 && step <= 5 && <StepDots current={step} />}

                <AnimatePresence mode="wait">

                    {/* ── STEP 1: Project Name ─────────────────────────────── */}
                    {step === 1 && (
                        <motion.div key="s1" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`${cardCls} max-w-xl p-12`}>
                            <div className="flex flex-col items-center mb-12">
                                <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[32px] flex items-center justify-center text-white mb-6 shadow-[0_20px_40px_rgba(37,99,235,0.4)]">
                                    <Rocket className="w-10 h-10" />
                                </div>
                                <h1 className="text-sm font-black text-blue-500 uppercase tracking-[0.6em] mb-3">Smartseyali Tech</h1>
                                <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-[0.9] text-center">
                                    Start Your<br /><span className="text-blue-600">Journey</span>
                                </h2>
                                <p className="text-white/30 text-xs mt-4 text-center font-medium">Set up your SaaS-powered business in minutes. No credit card required.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex flex-col gap-3">
                                    <label className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40 ml-1">Your Business / Project Name</label>
                                    <input
                                        type="text"
                                        value={storeName}
                                        onChange={(e) => setStoreName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && storeName.trim() && goNext()}
                                        placeholder="e.g. Nexus Intelligence Hub"
                                        className="w-full h-20 bg-white/5 border border-white/10 rounded-[24px] px-8 font-black text-xl text-white placeholder:text-white/10 focus:ring-4 focus:ring-blue-600/20 focus:border-blue-600/50 outline-none transition-all"
                                    />
                                    {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center bg-red-500/10 py-2 rounded-xl">{error}</p>}
                                </div>
                                <Button onClick={() => storeName.trim() ? goNext() : setError("Project name is required.")} className={nextBtnCls}>
                                    Next: Choose Industry <ArrowRight className="w-5 h-5 stroke-[3]" />
                                </Button>
                                <p className="text-center text-[9px] font-bold text-white/15 uppercase tracking-widest">Powered by Smartseyali SaaS Engine v4.0</p>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 2: Industry ─────────────────────────────────── */}
                    {step === 2 && (
                        <motion.div key="s2" initial={{ opacity: 0, scale: 0.95, x: 40 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9, x: -40 }} className={`${cardCls} max-w-4xl p-12`}>
                            <h2 className="text-4xl font-black text-center mb-2 tracking-tighter uppercase text-white italic">Business <span className="text-blue-500">Classification</span></h2>
                            <p className="text-white/30 text-center mb-12 text-sm font-bold uppercase tracking-widest">Optimizing Smartseyali Engine for your vertical.</p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                {[
                                    { id: 'retail', title: 'SaaS Platform', desc: 'Multi-tenant applications & cloud software.', icon: '☁️', color: 'from-blue-500/20 to-blue-600/20' },
                                    { id: 'education', title: 'Consulting', desc: 'Professional advisory & client portal services.', icon: '💼', color: 'from-emerald-500/20 to-emerald-600/20' },
                                    { id: 'services', title: 'IT Services', desc: 'Managed infrastructure & complex systems.', icon: '🛰️', color: 'from-purple-500/20 to-purple-600/20' }
                                ].map((ind) => (
                                    <div key={ind.id} onClick={() => setIndustryType(ind.id as any)}
                                        className={`p-10 rounded-[32px] border-2 transition-all duration-500 cursor-pointer flex flex-col items-center text-center gap-6 relative group hover:-translate-y-2 ${industryType === ind.id ? 'border-blue-600 bg-blue-600/10 shadow-[0_20px_60px_rgba(37,99,235,0.2)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${ind.color} flex items-center justify-center text-4xl`}>{ind.icon}</div>
                                        <div>
                                            <h3 className="font-black text-lg uppercase text-white mb-2">{ind.title}</h3>
                                            <p className={`text-xs font-medium ${industryType === ind.id ? 'text-white/70' : 'text-white/30'}`}>{ind.desc}</p>
                                        </div>
                                        {industryType === ind.id && (
                                            <div className="absolute top-4 right-4 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                <Check className="w-5 h-5 text-white stroke-[3]" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-4">
                                <button onClick={goBack} className={backBtnCls}><ArrowLeft className="w-4 h-4" /> Back</button>
                                <Button onClick={goNext} className={nextBtnCls}>Next: Select Package <ArrowRight className="w-5 h-5" /></Button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 3: Plan ─────────────────────────────────────── */}
                    {step === 3 && (
                        <motion.div key="s3" initial={{ opacity: 0, scale: 0.95, x: 40 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9, x: -40 }} className={`${cardCls} max-w-[1280px] p-12`}>
                            <h2 className="text-4xl font-black text-center mb-2 tracking-tighter uppercase text-white italic">Select <span className="text-blue-500">Engine Pack</span></h2>
                            <p className="text-white/30 text-center mb-12 text-sm font-bold uppercase tracking-widest">High-fidelity performance tiers built for enterprise scale.</p>

                            {plans.length === 0 ? (
                                <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                                    {plans.map((plan) => (
                                        <div key={plan.id} onClick={() => setSelectedPlan(plan.id)}
                                            className={`p-8 rounded-[32px] border-2 transition-all duration-500 cursor-pointer flex flex-col gap-8 relative group ${selectedPlan === plan.id ? 'border-blue-600 bg-blue-600/10 shadow-[0_20px_80px_rgba(37,99,235,0.15)]' : 'border-white/5 bg-white/5 hover:border-white/20'}`}>
                                            {selectedPlan === plan.id && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-widest shadow-xl">Selected</div>
                                            )}
                                            <div className="space-y-2">
                                                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-white/40 group-hover:text-blue-500 transition-colors">{plan.name}</h3>
                                                <p className="text-4xl font-black text-white">${plan.price_monthly}<span className="text-sm font-bold opacity-30 ml-1">/mo</span></p>
                                            </div>
                                            <ul className="space-y-4 flex-1">
                                                {plan.features.map((feat, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-[11px] font-bold text-white/60">
                                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />{feat}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="flex gap-4">
                                <button onClick={goBack} className={backBtnCls}><ArrowLeft className="w-4 h-4" /> Back</button>
                                <Button onClick={goNext} className={`${nextBtnCls} bg-white text-black hover:bg-slate-200 shadow-white/10`}>
                                    Next: Choose Theme <ArrowRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 4: Template ─────────────────────────────────── */}
                    {step === 4 && (
                        <motion.div key="s4" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`${cardCls} max-w-[1480px] p-10`}>
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                                <div>
                                    <h1 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.5em] mb-3">Design Intelligence</h1>
                                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">Select <span className="text-blue-500">Theme</span></h2>
                                </div>
                                <div className="flex bg-white/5 p-2 rounded-[24px] border border-white/5">
                                    {['retail', 'education', 'services'].map(t => (
                                        <button key={t} onClick={() => setIndustryType(t as any)}
                                            className={`px-8 py-3.5 rounded-[18px] text-[10px] uppercase font-black tracking-[0.2em] transition-all ${industryType === t ? 'bg-blue-600 text-white' : 'text-white/30 hover:text-white/60'}`}>
                                            {t === 'retail' ? 'SaaS' : t === 'education' ? 'Consulting' : 'IT'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {templatesLoading ? (
                                <div className="flex flex-col items-center py-32 gap-6">
                                    <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Synchronizing Design Core...</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">
                                    {templates.filter(t => t.industry === industryType || !t.industry).map((tmpl) => (
                                        <div key={tmpl.id}
                                            className={`group relative flex flex-col rounded-[32px] overflow-hidden transition-all duration-700 border-2 ${selectedTemplate === tmpl.id ? 'border-blue-600 shadow-[0_0_80px_rgba(37,99,235,0.2)] scale-[1.02]' : 'border-white/5 bg-white/5 hover:border-white/10'}`}>
                                            <div className="aspect-[4/3] bg-white/5 relative overflow-hidden">
                                                <img src={tmpl.preview_image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4">
                                                    <Button onClick={(e) => { e.stopPropagation(); setPreviewingTemplate(tmpl); }} className="h-14 px-8 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 font-black uppercase text-[10px] tracking-widest rounded-2xl">
                                                        <Eye className="w-4 h-4 mr-2" /> Preview
                                                    </Button>
                                                    <Button onClick={() => setSelectedTemplate(tmpl.id)} className="h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl">
                                                        {selectedTemplate === tmpl.id ? '✓ Selected' : 'Select'}
                                                    </Button>
                                                </div>
                                                {selectedTemplate === tmpl.id && (
                                                    <div className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-10">
                                                        <Check className="w-5 h-5 stroke-[3]" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-6">
                                                <h3 className="font-black text-white uppercase tracking-widest text-sm mb-1">{tmpl.name}</h3>
                                                <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">v{tmpl.version || '1.0'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between gap-6 pt-10 border-t border-white/5">
                                <button onClick={goBack} className={backBtnCls}><ArrowLeft className="w-4 h-4" /> Back</button>
                                <Button onClick={() => selectedTemplate ? goNext() : setError("Please select a template first.")}
                                    disabled={!selectedTemplate}
                                    className="h-20 px-16 bg-white text-black hover:bg-slate-200 rounded-[24px] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl flex items-center gap-6 transition-all active:scale-95 disabled:opacity-20">
                                    <Rocket className="w-5 h-5 text-blue-600" /> Create Account & Deploy
                                </Button>
                            </div>
                            {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center mt-4">{error}</p>}
                        </motion.div>
                    )}

                    {/* ── STEP 5: Create Account ────────────────────────────── */}
                    {step === 5 && (
                        <motion.div key="s5" initial={{ opacity: 0, scale: 0.95, x: 40 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`${cardCls} max-w-xl p-12`}>
                            <div className="flex flex-col items-center mb-10">
                                <div className="w-20 h-20 bg-gradient-to-tr from-emerald-500 to-green-600 rounded-[24px] flex items-center justify-center text-white mb-6 shadow-[0_20px_40px_rgba(16,185,129,0.3)]">
                                    <UserIcon className="w-9 h-9" />
                                </div>
                                <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic text-center">Create <span className="text-emerald-400">Account</span></h2>
                                <p className="text-white/30 text-xs mt-3 text-center font-medium max-w-xs">You're almost there! Create your account to deploy <b className="text-white">{storeName}</b>.</p>
                            </div>

                            <div className="space-y-4">
                                {/* Full Name */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40 ml-1">Full Name</label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Smartseyali"
                                            className="w-full h-16 bg-white/5 border border-white/10 rounded-[20px] pl-14 pr-6 font-bold text-white placeholder:text-white/10 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all" />
                                    </div>
                                </div>
                                {/* Email */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"
                                            className="w-full h-16 bg-white/5 border border-white/10 rounded-[20px] pl-14 pr-6 font-bold text-white placeholder:text-white/10 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all" />
                                    </div>
                                </div>
                                {/* Password */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40 ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                                            className="w-full h-16 bg-white/5 border border-white/10 rounded-[20px] pl-14 pr-14 font-bold text-white placeholder:text-white/10 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors">
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                {/* Confirm Password */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] uppercase font-black tracking-[0.3em] text-white/40 ml-1">Confirm Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password"
                                            className="w-full h-16 bg-white/5 border border-white/10 rounded-[20px] pl-14 pr-6 font-bold text-white placeholder:text-white/10 focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all" />
                                    </div>
                                </div>

                                {error && <p className="text-red-400 text-[10px] font-black uppercase tracking-widest text-center bg-red-500/10 py-3 rounded-xl">{error}</p>}

                                <div className="flex gap-4 pt-2">
                                    <button onClick={goBack} className={backBtnCls}><ArrowLeft className="w-4 h-4" /> Back</button>
                                    <Button onClick={handleDeploy} disabled={loading}
                                        className="flex-1 h-16 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white rounded-[20px] font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-emerald-600/20">
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                                        {loading ? "Deploying..." : "Deploy My Project"}
                                    </Button>
                                </div>
                                <p className="text-center text-[9px] font-bold text-white/15 uppercase tracking-widest">By creating an account you agree to Smartseyali's Terms of Service</p>
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 6: Deployment Progress ──────────────────────── */}
                    {step === 6 && (
                        <motion.div key="s6" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                            className="max-w-2xl w-full bg-white/10 backdrop-blur-2xl p-16 rounded-[64px] shadow-2xl border border-white/10 text-center relative z-10 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-white/5 overflow-hidden">
                                <motion.div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600"
                                    initial={{ width: "0%" }} animate={{ width: `${deploymentStep}%` }} transition={{ duration: 0.5 }} />
                            </div>

                            <div className="mb-12 relative inline-flex items-center justify-center">
                                <div className="w-32 h-32 border-8 border-white/5 border-t-blue-600 rounded-[40px] animate-spin shadow-2xl" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-black text-white">{deploymentStep}%</span>
                                </div>
                            </div>

                            <h2 className="text-sm font-black text-blue-500 uppercase tracking-[0.8em] mb-4 animate-pulse">Smartseyali Deployment</h2>
                            <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">{deploymentStatus}</h3>
                            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-12">Synchronizing with global cloud infrastructure.</p>

                            <div className="flex flex-col gap-4 max-w-xs mx-auto text-left">
                                {[
                                    { val: 10, label: "Account Created" },
                                    { val: 40, label: "Enterprise Environment Ready" },
                                    { val: 60, label: "Theme Architecture Configured" },
                                    { val: 80, label: "Server Assets Optimized" },
                                    { val: 100, label: "Deployment Complete" }
                                ].map((s, i) => (
                                    <div key={i} className={`flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${deploymentStep >= s.val ? 'text-blue-500' : 'text-white/10'}`}>
                                        <div className={`w-2 h-2 rounded-full ${deploymentStep >= s.val ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]' : 'bg-white/5'}`} />
                                        {s.label}
                                        {deploymentStep >= s.val && <Check className="w-3 h-3 ml-auto" />}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── STEP 7: Success ───────────────────────────────────── */}
                    {step === 7 && (
                        <motion.div key="s7" initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="max-w-2xl w-full bg-white/10 backdrop-blur-2xl p-16 rounded-[64px] shadow-[0_40px_120px_rgba(0,0,0,0.6)] border border-white/10 text-center relative z-10 overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600" />

                            <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-[40px] flex items-center justify-center mx-auto mb-10 shadow-[0_20px_60px_rgba(16,185,129,0.3)] hover:rotate-0 transition-transform duration-700 rotate-12">
                                <Check className="w-16 h-16 stroke-[4]" />
                            </div>

                            <h1 className="text-sm font-black text-green-500 uppercase tracking-[0.6em] mb-4">Deployment Succeeded</h1>
                            <h2 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase italic leading-none">
                                System <span className="text-blue-500">Live</span>
                            </h2>
                            <p className="text-white/40 font-medium text-lg leading-relaxed mb-12 max-w-md mx-auto">
                                The <b className="text-white">{storeName}</b> enterprise ecosystem is now fully active on the Smartseyali cloud. Check your email to verify your account.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Button onClick={() => window.location.href = `/stores/${slug}/index.html`}
                                    className="h-20 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black uppercase tracking-widest text-xs py-6 shadow-2xl shadow-blue-600/20 active:scale-95 transition-all">
                                    <Rocket className="w-5 h-5 mr-3" /> Launch Website
                                </Button>
                                <Button onClick={() => navigate("/login")}
                                    className="h-20 bg-white text-black hover:bg-slate-200 rounded-[24px] font-black uppercase tracking-widest text-xs py-6 shadow-2xl active:scale-95 transition-all">
                                    <Check className="w-5 h-5 mr-3" /> Sign In to Dashboard
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
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 md:p-12">
                        <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
                            className="bg-white/10 backdrop-blur-3xl w-full max-w-[1400px] h-full max-h-[90vh] rounded-[48px] border border-white/20 flex flex-col md:flex-row overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.8)]">
                            {/* Image side */}
                            <div className="flex-1 bg-black/40 relative flex flex-col p-8 lg:p-12 gap-6">
                                <div className="flex-1 rounded-[32px] overflow-hidden shadow-2xl border border-white/10">
                                    <img src={previewingTemplate.preview_image} className="w-full h-full object-cover" />
                                </div>
                                {/* Thumbnails */}
                                <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x">
                                    {(previewingTemplate.gallery_images || []).map((img, idx) => (
                                        <div key={idx}
                                            className={`min-w-[160px] aspect-video rounded-2xl overflow-hidden border-2 cursor-pointer snap-start transition-all hover:scale-105 ${previewingTemplate.preview_image === img ? 'border-blue-600' : 'border-white/10 hover:border-white/30'}`}
                                            onClick={() => setPreviewingTemplate({ ...previewingTemplate, preview_image: img })}>
                                            <img src={img} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute top-12 left-12 text-white p-5 rounded-3xl bg-black/30 backdrop-blur-sm border border-white/5">
                                    <h3 className="text-5xl font-black tracking-tighter uppercase italic">{previewingTemplate.name}</h3>
                                    <p className="text-blue-500 text-sm font-black mt-1 tracking-[0.4em] uppercase">v{previewingTemplate.version || '1.0'}</p>
                                </div>
                            </div>
                            {/* Info side */}
                            <div className="w-full md:w-[440px] bg-white/5 p-12 flex flex-col border-l border-white/10">
                                <button onClick={() => setPreviewingTemplate(null)} className="self-end w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all hover:rotate-90">
                                    <X className="w-6 h-6" />
                                </button>
                                <div className="mt-8 space-y-8 flex-1">
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-4">Description</h4>
                                        <p className="text-white/60 leading-relaxed italic border-l-4 border-blue-600/30 pl-6">"{previewingTemplate.description}"</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 bg-white/5 rounded-[20px] border border-white/5">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Vertical</p>
                                            <p className="text-sm font-bold text-white uppercase">{previewingTemplate.industry}</p>
                                        </div>
                                        <div className="p-5 bg-white/5 rounded-[20px] border border-white/5">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/20 mb-1">Components</p>
                                            <p className="text-sm font-bold text-white">{previewingTemplate.component_count || 12}+ Modules</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {(previewingTemplate.tags || []).map(tag => (
                                            <span key={tag} className="px-4 py-2 bg-blue-600/10 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-600/20">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="mt-auto pt-10 border-t border-white/10 space-y-4">
                                    <Button onClick={() => { setSelectedTemplate(previewingTemplate.id); setPreviewingTemplate(null); }}
                                        className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[20px] font-black uppercase tracking-[0.3em] text-[10px] active:scale-95 transition-all">
                                        Select This Theme
                                    </Button>
                                    <p className="text-center text-[9px] font-black text-white/15 uppercase tracking-[0.3em]">Fully Proprietary Deployment</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
