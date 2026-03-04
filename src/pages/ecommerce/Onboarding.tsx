
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/lib/supabase";
import { Check, ArrowRight, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

// ── Template registry type ──────────────────────────────────
interface TemplateEntry {
    id: string;
    name: string;
    desc?: string;
    description?: string;
    color?: string;
    preview_image?: string;
    preview?: string;
    tags?: string[];
    folder: string;
    version?: string;
    is_active?: boolean;
}

// No hardcoded templates — loaded from /templates/templates-registry.json

export default function Onboarding() {
    const { user } = useAuth();
    const { refreshTenant, needsOnboarding, loading: loadingTenant } = useTenant();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [storeName, setStoreName] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [templates, setTemplates] = useState<TemplateEntry[]>([]);
    const [templatesLoading, setTemplatesLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialChecking, setInitialChecking] = useState(true);
    const [error, setError] = useState("");
    const [slug, setSlug] = useState("");
    const [industryType, setIndustryType] = useState<'retail' | 'education' | 'services'>('retail');

    // ── Load templates from ecom_templates (Supabase DB) ──────
    useEffect(() => {
        async function loadTemplates() {
            setTemplatesLoading(true);
            try {
                const { data, error } = await supabase
                    .from("ecom_templates")
                    .select("folder, name, description, version, preview_image, color, tags")
                    .eq("is_active", true)
                    .order("sort_order", { ascending: true });

                if (error) throw error;

                const mapped: TemplateEntry[] = (data || []).map(row => ({
                    id: row.folder,
                    folder: row.folder,
                    name: row.name,
                    description: row.description,
                    version: row.version,
                    preview_image: row.preview_image,
                    color: row.color,
                    tags: row.tags || [],
                }));

                setTemplates(mapped);
                if (mapped.length > 0) setSelectedTemplate(mapped[0].id);
            } catch (err) {
                console.error("Failed to load templates from ecom_templates:", err);
                setTemplates([]);
            } finally {
                setTemplatesLoading(false);
            }
        }
        loadTemplates();
    }, []);


    // ── Check if merchant already has a store ─────────────────
    useEffect(() => {
        if (!loadingTenant && !needsOnboarding) {
            navigate("/ecommerce");
        }
        if (!loadingTenant) {
            setInitialChecking(false);
        }
    }, [needsOnboarding, loadingTenant, navigate]);

    if (initialChecking) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    const handleCreateStore = async () => {
        if (!storeName.trim()) { setError("Please name your store"); return; }
        if (!selectedTemplate) { setError("Please choose a template"); return; }

        setLoading(true);
        setError("");

        const selectedTmpl = templates.find(t => t.id === selectedTemplate);

        try {
            const newSlug = storeName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000);
            setSlug(newSlug);

            // 1. Create company record in Supabase
            const { data: newCompany, error: cErr } = await supabase
                .from("companies")
                .insert([{
                    name: storeName,
                    subdomain: newSlug,
                    contact_email: user?.email,
                    user_id: user?.id,
                    industry_type: industryType,
                    plan: 'starter'
                }])
                .select()
                .single();

            if (cErr) throw cErr;

            // 2. Call Provisioning API to generate physical store folder
            try {
                const response = await fetch("http://localhost:8000/api/provision", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        store_name: newSlug,
                        company_id: newCompany.id,
                        template: selectedTmpl?.folder || selectedTemplate
                    })
                });
                if (!response.ok) console.warn("Provisioning API returned non-OK.");
            } catch (e) {
                console.warn("Provisioning server unreachable — run: node provision_store.cjs", newSlug, newCompany.id, selectedTmpl?.folder);
            }

            // 3. User role + ecom settings
            await supabase.from("company_users").insert([{
                company_id: newCompany.id,
                user_id: user?.id,
                role: 'admin'
            }]);

            await supabase.from("ecom_settings").insert([{
                company_id: newCompany.id,
                store_name: storeName,
                primary_color: selectedTmpl?.color || "#14532d"
            }]);

            // 4. Finalize
            await refreshTenant();
            setStep(4);
            setTimeout(() => {
                window.location.href = `${window.location.origin}/stores/${newSlug}/index.html`;
            }, 3000);

        } catch (err: any) {
            setError(err.message || "Failed to create store. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-200">

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-white"
                    >
                        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl mx-auto transform -rotate-6">
                            <Rocket className="w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-black text-center mb-2 tracking-tight">Launch Your Store</h2>
                        <p className="text-slate-400 text-center mb-10 text-sm">Give your brand a name to begin your journey.</p>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Store Name</label>
                                <input
                                    type="text"
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                    placeholder="e.g. Natesh Organics"
                                    className="w-full h-14 bg-slate-50 border-none rounded-xl px-4 font-bold focus:ring-2 focus:ring-black outline-none transition-all"
                                />
                                {error && <p className="text-red-500 text-xs font-bold mt-1 text-center">{error}</p>}
                            </div>

                            <Button
                                onClick={() => storeName.trim() ? setStep(2) : setError("Store name required")}
                                className="w-full h-14 bg-black hover:bg-black/90 text-white rounded-xl font-bold flex items-center justify-center gap-4 transition-all"
                            >
                                Next Step <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="max-w-2xl w-full bg-white p-10 rounded-3xl shadow-2xl border border-white"
                    >
                        <h2 className="text-3xl font-black text-center mb-2 tracking-tight">Define Your Industry</h2>
                        <p className="text-slate-400 text-center mb-10 text-sm">This optimizes your Command Center with the right business engines.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {[
                                { id: 'retail', title: 'E-commerce Retail', desc: 'Sell physical products, manage stock & shipping', icon: '🛍️' },
                                { id: 'education', title: 'Education / LMS', desc: 'Manage courses, students & enrollments', icon: '🎓' },
                                { id: 'services', title: 'Professional Services', desc: 'Book appointments & professional services', icon: '🛠️' }
                            ].map((ind) => (
                                <div
                                    key={ind.id}
                                    onClick={() => setIndustryType(ind.id as any)}
                                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-4 ${industryType === ind.id
                                        ? 'border-black bg-black text-white shadow-xl scale-105'
                                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-900'
                                        }`}
                                >
                                    <span className="text-4xl">{ind.icon}</span>
                                    <div>
                                        <h3 className="font-bold text-sm uppercase mb-1">{ind.title}</h3>
                                        <p className={`text-[10px] font-medium leading-relaxed ${industryType === ind.id ? 'text-white/60' : 'text-slate-400'}`}>
                                            {ind.desc}
                                        </p>
                                    </div>
                                    {industryType === ind.id && <Check className="w-5 h-5 text-green-400" />}
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setStep(1)}
                                className="h-14 px-8 border-slate-200 rounded-xl font-bold"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={() => setStep(3)}
                                className="flex-1 h-14 bg-black hover:bg-black/90 text-white rounded-xl font-bold flex items-center justify-center gap-4 transition-all"
                            >
                                Select Theme <ArrowRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 3 && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-4xl w-full bg-white p-10 rounded-3xl shadow-2xl border border-white"
                    >
                        <h2 className="text-3xl font-black mb-2 tracking-tight">Choose Your Theme</h2>
                        <p className="text-slate-400 mb-10 text-sm">Select a starting template for your storefront.</p>

                        {templatesLoading ? (
                            <div className="flex items-center justify-center py-16 mb-10">
                                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                                <span className="ml-3 text-slate-400 text-sm">Loading templates…</span>
                            </div>
                        ) : templates.length === 0 ? (
                            <div className="text-center py-16 mb-10 text-slate-400">
                                <p className="font-semibold">No templates found.</p>
                                <p className="text-xs mt-1">Add entries to <code className="bg-slate-100 px-1 rounded">/templates/templates-registry.json</code></p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                {templates.map((tmpl) => (
                                    <div
                                        key={tmpl.id}
                                        onClick={() => setSelectedTemplate(tmpl.id)}
                                        className={`relative cursor-pointer transition-all duration-300 group rounded-2xl overflow-hidden border-2 ${selectedTemplate === tmpl.id
                                            ? 'border-black ring-4 ring-black/10 scale-105'
                                            : 'border-transparent hover:border-slate-200'
                                            }`}
                                    >
                                        <div className="aspect-[4/3] overflow-hidden bg-slate-100 shadow-md">
                                            <img
                                                src={tmpl.preview_image || tmpl.preview || ''}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                alt={tmpl.name}
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="space-y-1 p-3 bg-white">
                                            <h3 className="font-bold flex items-center gap-2">
                                                {tmpl.name}
                                                {tmpl.version && <span className="text-[10px] text-slate-400 font-normal">v{tmpl.version}</span>}
                                                {selectedTemplate === tmpl.id && <Check className="w-4 h-4 text-green-500 ml-auto" />}
                                            </h3>
                                            <div className="flex gap-1 flex-wrap">
                                                {(tmpl.tags || []).map(tag => (
                                                    <span key={tag} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-semibold uppercase">{tag}</span>
                                                ))}
                                            </div>
                                            <p className="text-xs text-slate-400 leading-tight">{tmpl.desc || tmpl.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                onClick={() => setStep(2)}
                                className="h-14 px-8 border-slate-200 rounded-xl font-bold"
                            >
                                Back
                            </Button>
                            <Button
                                onClick={handleCreateStore}
                                disabled={loading}
                                className="flex-1 h-14 bg-black hover:bg-black/90 text-white rounded-xl font-bold flex items-center justify-center gap-4"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5" />}
                                {loading ? "Creating Store..." : "Finalize & Launch"}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {step === 4 && (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-white text-center"
                    >
                        <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl animate-bounce">
                            <Check className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl font-black mb-2 tracking-tight">Success!</h2>
                        <p className="text-slate-400 mb-10 text-sm">Your store <b>{storeName}</b> is ready. Redirecting to your live storefront...</p>

                        <div className="space-y-4">
                            <Button
                                onClick={() => window.location.href = `/stores/${slug}/index.html`}
                                className="w-full h-14 bg-black hover:bg-black/90 text-white rounded-xl font-bold"
                            >
                                View My Store
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate("/ecommerce")}
                                className="w-full h-14 text-slate-500 font-bold"
                            >
                                Enter Merchant Hub
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
