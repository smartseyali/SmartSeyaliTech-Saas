import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import {
    Zap,
    CheckCircle2,
    ArrowRight,
    Layout,
    Cpu,
    ShieldCheck,
    Smartphone,
    Globe,
    ChevronRight,
    Play,
    Terminal,
    Layers,
    Box
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const ModuleDetail = () => {
    const { slug } = useParams();
    const [module, setModule] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");

    useEffect(() => {
        const fetchModule = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("system_modules")
                .select("*")
                .eq("slug", slug)
                .single();

            if (data) {
                setModule(data);
            }
            setLoading(false);
        };

        if (slug) fetchModule();
    }, [slug]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!module) {
        return (
            <div className="h-screen flex flex-col items-center justify-center text-center space-y-6">
                <h1 className="text-4xl font-black uppercase italic">Engine Not Found</h1>
                <Button asChild>
                    <Link to="/products">Return to Inventory</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Header (Compact) */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-2xl">{module.icon}</span>
                        <h1 className="text-lg font-black uppercase italic tracking-tighter text-slate-900">{module.name}</h1>
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        {["overview", "features", "interface"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-widest transition-colors",
                                    activeTab === tab ? "text-blue-600" : "text-slate-400 hover:text-slate-900"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <Button asChild className="bg-slate-900 hover:bg-black text-white h-10 px-6 rounded-xl font-black uppercase tracking-widest text-[10px]">
                        <Link to="/login">Try it free</Link>
                    </Button>
                </div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden bg-slate-50">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -top-20 -left-20 w-96 h-96 bg-blue-500 rounded-full blur-[100px]" />
                    <div className="absolute top-1/2 -right-20 w-96 h-96 bg-indigo-500 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-20">
                        <div className="flex-1 space-y-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-600 rounded-full"
                            >
                                <Zap className="w-3 h-3" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{module.category} Engine</span>
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-6xl lg:text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-none"
                            >
                                {module.name} <span className="text-blue-600">Magic</span>
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-xl text-slate-500 font-medium italic leading-relaxed"
                            >
                                {module.tagline || module.description}
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap gap-4 pt-4"
                            >
                                <Button asChild size="lg" className="h-16 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-500/20">
                                    <Link to="/login">Start Now — It's Free</Link>
                                </Button>
                                <Button variant="outline" size="lg" className="h-16 px-10 rounded-2xl border-2 border-slate-200 bg-white font-black uppercase tracking-widest text-xs">
                                    <Link to="/contact">Meet an Advisor</Link>
                                </Button>
                            </motion.div>
                        </div>

                        <div className="flex-1 w-full">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                className="relative rounded-[2.5rem] bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-200/60 p-4"
                            >
                                <img
                                    src={module.screenshots?.[0] || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80"}
                                    alt="Interface Preview"
                                    className="rounded-2xl w-full object-cover aspect-video"
                                />
                                <div className="absolute -bottom-6 -left-6 bg-slate-900 text-white p-6 rounded-3xl shadow-2xl flex items-center gap-4">
                                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-bold italic">S</div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Deployed State</p>
                                        <p className="text-sm font-bold italic">AI-Native Optimization</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Showcase Grid (Odoo Style) */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center space-y-4 mb-20">
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter">Engine <span className="text-blue-600">Performance</span></h3>
                        <p className="text-slate-400 font-medium italic">High-precision architecture designed for scaling businesses.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {module.use_cases && Array.isArray(module.use_cases) && module.use_cases.length > 0 ? (
                            module.use_cases.map((useCase: any, i: number) => (
                                <motion.div
                                    key={i}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    initial={{ opacity: 0, y: 20 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="space-y-6 group"
                                >
                                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                        {/* Dynamic Icon Mapping would go here, fallback to Box */}
                                        <Box className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">{useCase.title}</h4>
                                        <p className="text-slate-500 text-sm font-medium italic leading-relaxed">{useCase.description}</p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            // Default Fallback Features
                            [
                                { title: "Automated Logic", desc: "No manual data entry required. AI agents handle the bulk of operations.", icon: Cpu },
                                { title: "Global Sync", desc: "Synchronize data across all nodes in real-time with zero latency.", icon: Globe },
                                { title: "Secure Tier", desc: "Enterprise-grade encryption protecting every byte of business data.", icon: ShieldCheck }
                            ].map((item, i) => (
                                <div key={i} className="space-y-6">
                                    <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400">
                                        <item.icon className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">{item.title}</h4>
                                        <p className="text-slate-500 text-sm font-medium italic leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* In-Depth Content */}
            <section className="py-32 bg-slate-50/50">
                <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-32 items-center">
                    <div className="order-2 lg:order-1">
                        <div className="relative group">
                            <img
                                src={module.screenshots?.[1] || "https://images.unsplash.com/photo-1551288049-bbbda546697a?w=1200&q=80"}
                                alt="Deployed View"
                                className="rounded-[3rem] shadow-2xl relative z-10 w-full"
                            />
                            <div className="absolute -inset-4 bg-blue-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    </div>

                    <div className="order-1 lg:order-2 space-y-10">
                        <div className="space-y-4">
                            <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none">After-Deployment <br /><span className="text-blue-600">Interface</span></h3>
                            <p className="text-xl text-slate-500 font-medium italic leading-relaxed">
                                {module.interface_overview || "Experience a clean, professional dashboard designed specifically for high-frequency operations."}
                            </p>
                        </div>

                        <div className="grid gap-6">
                            {(module.features || []).map((feature: string, i: number) => (
                                <div key={i} className="flex items-start gap-4 p-6 bg-white rounded-3xl border border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold uppercase italic tracking-tight text-slate-900">{feature}</p>
                                        <p className="text-xs font-medium text-slate-400 italic">Advanced optimization including real-time analytic tracking.</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Full Story Section */}
            {module.long_description && (
                <section className="py-32 bg-white">
                    <div className="max-w-4xl mx-auto px-4 text-center space-y-12">
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                            <Terminal className="w-4 h-4 text-blue-400" /> System Blueprint
                        </div>
                        <h3 className="text-5xl font-black uppercase italic tracking-tighter text-slate-900">The Modern <span className="text-blue-600">SaaS Engine</span></h3>
                        <div className="prose prose-slate max-w-none prose-lg italic font-medium text-slate-600 leading-loose">
                            {module.long_description.split('\n').map((para: string, i: number) => (
                                <p key={i} className="mb-6">{para}</p>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Screenshot Gallery */}
            {module.screenshots && module.screenshots.length > 2 && (
                <section className="py-32 overflow-hidden bg-slate-900">
                    <div className="max-w-7xl mx-auto px-4 mb-20 text-center">
                        <h3 className="text-4xl font-black uppercase italic tracking-tighter text-white">Visual <span className="text-blue-500">Inventory</span></h3>
                    </div>
                    <div className="flex gap-8 px-4 animate-scroll-x">
                        {module.screenshots.map((url: string, i: number) => (
                            <div key={i} className="w-[600px] shrink-0 rounded-3xl overflow-hidden shadow-2xl">
                                <img src={url} alt="Screenshot" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Tech Stack */}
            <section className="py-20 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Foundation</p>
                            <h4 className="text-xl font-black uppercase italic">Architectural Stack</h4>
                        </div>
                        <div className="flex flex-wrap gap-8">
                            {(module.technologies || ["React", "Supabase", "PostgreSQL", "Tailwind"]).map((tech: string, i: number) => (
                                <div key={i} className="flex items-center gap-2 group cursor-default">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 group-hover:scale-150 transition-transform" />
                                    <span className="text-sm font-black uppercase italic tracking-tighter text-slate-400 group-hover:text-slate-900 transition-colors">{tech}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-32">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-blue-600 rounded-[4rem] p-16 md:p-24 text-center space-y-12 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] group-hover:scale-125 transition-transform duration-1000" />
                        <div className="space-y-4">
                            <h3 className="text-4xl md:text-6xl font-black uppercase italic text-white tracking-tighter leading-none">Ready to <br className="md:hidden" />Initialize?</h3>
                            <p className="text-blue-100 text-lg md:text-xl font-medium italic opacity-80">Join 500+ enterprises running on {module.name} engines.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Button asChild className="h-20 px-16 rounded-[2rem] bg-white text-blue-600 hover:bg-black hover:text-white font-black uppercase tracking-widest text-sm shadow-2xl transition-all">
                                <Link to="/login">Deploy Now</Link>
                            </Button>
                            <Button asChild variant="outline" className="h-20 px-16 rounded-[2rem] border-white/20 text-white hover:bg-white/10 font-black uppercase tracking-widest text-sm backdrop-blur-sm transition-all">
                                <Link to="/contact">Request Demo</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ModuleDetail;
