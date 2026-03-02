
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/lib/supabase";
import {
    Layout, ShoppingBag, Utensils, Zap, Check, ArrowRight,
    Loader2, Rocket, Store, Globe, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const TEMPLATES = [
    {
        id: "viewfront",
        name: "Elite Viewfront",
        desc: "Precision built, luxury minimalist design for premium brands.",
        color: "#020617",
        icon: Layout,
        preview: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
    },
    {
        id: "tech-cipher",
        name: "Tech Cipher",
        desc: "Cyberpunk, dark aesthetic for high-performance electronics.",
        color: "#00ff41",
        icon: Zap,
        preview: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800"
    },
    {
        id: "minimal-luxe",
        name: "Minimal Luxe",
        desc: "Elegant, whitespace-heavy design for high-end fashion & decor.",
        color: "#fdfbf7",
        icon: ShoppingBag,
        preview: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800"
    },
    {
        id: "organic",
        name: "Organic Store",
        desc: "Fresh, clean, and nature-inspired for health brands.",
        color: "#14532d",
        icon: ShoppingBag,
        preview: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800"
    },
    {
        id: "waggy",
        name: "Waggy Pets",
        desc: "Playful, colorful, and fun for pet shops.",
        color: "#d97706",
        icon: Store,
        preview: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=800"
    },
    {
        id: "ecom",
        name: "Ecom Fit",
        desc: "High-performance athletic aesthetic with bold typography.",
        color: "#0066FF",
        icon: Rocket,
        preview: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"
    },
    {
        id: "foodmart",
        name: "Food Mart",
        desc: "Fast, appetizing, and bold for restaurants.",
        color: "#ef4444",
        icon: Utensils,
        preview: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800"
    }
];

export default function Onboarding() {
    const { user } = useAuth();
    const { refreshTenant } = useTenant();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [storeName, setStoreName] = useState("");
    const [selectedTemplate, setSelectedTemplate] = useState("organic");
    const [loading, setLoading] = useState(false);
    const [initialChecking, setInitialChecking] = useState(true);
    const [error, setError] = useState("");
    const [slug, setSlug] = useState("");

    useEffect(() => {
        const checkExistingStore = async () => {
            if (!user) return;

            try {
                const { data, error } = await supabase
                    .from("companies")
                    .select("subdomain")
                    .eq("user_id", user.id)
                    .maybeSingle();

                if (data) {
                    // Merchant already has a store
                    navigate("/ecommerce");
                }
            } catch (err) {
                console.error("Store check failed:", err);
            } finally {
                setInitialChecking(false);
            }
        };
        checkExistingStore();
    }, [user, navigate]);

    if (initialChecking) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        );
    }

    const handleCreateStore = async () => {
        if (!storeName.trim()) {
            setError("Please name your store");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const newSlug = storeName.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(1000 + Math.random() * 9000);
            setSlug(newSlug);

            // 1. Create in Supabase (Database Registration)
            const { data: newCompany, error: cErr } = await supabase
                .from("companies")
                .insert([{
                    name: storeName,
                    subdomain: newSlug,
                    contact_email: user?.email,
                    user_id: user?.id,
                    plan: 'starter'
                }])
                .select()
                .single();

            if (cErr) throw cErr;

            // 2. Call Provisioning API (Folder Creation)
            // Note: In real setup, you'd replace 'localhost:8000' with your server URL
            try {
                const response = await fetch("http://localhost:8000/api/provision", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        merchant_slug: newSlug,
                        template: selectedTemplate
                    })
                });

                if (!response.ok) {
                    console.error("Local folder provisioning failed, but DB record created.");
                }
            } catch (e) {
                console.warn("Provisioning server not reachable - database record only.");
            }

            // 3. User Mapping & Default Settings in DB
            await supabase.from("company_users").insert([{
                company_id: newCompany.id,
                user_id: user?.id,
                role: 'admin'
            }]);

            await supabase.from("ecom_settings").insert([{
                company_id: newCompany.id,
                store_name: storeName,
                primary_color: TEMPLATES.find(t => t.id === selectedTemplate)?.color || "#14532d"
            }]);

            // 4. Finalize
            await refreshTenant();
            setStep(3); // Success Screen

            // Auto-redirect after 3 seconds
            setTimeout(() => {
                const storeUrl = `${window.location.origin}/stores/${newSlug}/index.html`;
                window.location.href = storeUrl;
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
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="max-w-4xl w-full bg-white p-10 rounded-3xl shadow-2xl border border-white"
                    >
                        <h2 className="text-3xl font-black mb-2 tracking-tight">Choose Your Theme</h2>
                        <p className="text-slate-400 mb-10 text-sm">Select a starting template for your storefront.</p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                            {TEMPLATES.map((tmpl) => (
                                <div
                                    key={tmpl.id}
                                    onClick={() => setSelectedTemplate(tmpl.id)}
                                    className={`relative cursor-pointer transition-all duration-300 group ${selectedTemplate === tmpl.id ? 'ring-4 ring-black scale-105' : 'hover:scale-102'}`}
                                >
                                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 mb-4 shadow-md">
                                        <img src={tmpl.preview} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={tmpl.name} />
                                    </div>
                                    <div className="space-y-1 p-2">
                                        <h3 className="font-bold flex items-center gap-2">
                                            {tmpl.name}
                                            {selectedTemplate === tmpl.id && <Check className="w-4 h-4 text-green-500" />}
                                        </h3>
                                        <p className="text-xs text-slate-400 leading-tight">{tmpl.desc}</p>
                                    </div>
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

                {step === 3 && (
                    <motion.div
                        key="step3"
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
