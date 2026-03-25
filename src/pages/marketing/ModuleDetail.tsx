
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    ArrowLeft,
    CheckCircle2,
    ChevronRight,
    Shield,
    Zap,
    Globe,
    Box,
    Cpu,
    Layers,
    Activity,
    ArrowRight,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const ModuleDetail = () => {
    const { slug } = useParams();
    const [module, setModule] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchModuleDetail = async () => {
            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from("system_modules")
                    .select("*")
                    .eq("slug", slug)
                    .single();

                if (error) throw error;
                setModule(data);
            } catch (err) {
                console.error("Error fetching module detail:", err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchModuleDetail();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!module) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-6">
                <div className="text-center space-y-6">
                    <Info className="w-16 h-16 text-gray-200 mx-auto" />
                    <h1 className="text-3xl font-bold text-gray-900">Module Not Found</h1>
                    <p className="text-gray-500">The module you are looking for does not exist in our current inventory.</p>
                    <Button asChild className="bg-primary-600 hover:bg-primary-700 rounded-xl px-8 h-12">
                        <Link to="/products">Back to Inventory</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-primary-600 selection:text-white">
            {/* Dynamic Header */}
            <section className="relative pt-32 pb-24 overflow-hidden bg-slate-50 border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <Link
                        to="/products"
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary-600 transition-colors mb-12 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> BACK TO ALL PRODUCTS
                    </Link>

                    <div className="grid lg:grid-cols-[1.3fr,0.7fr] gap-16 items-center">
                        <div className="space-y-8 animate-fade-in">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary-100 p-1.5 rounded-lg">
                                        <Cpu className="w-3.5 h-3.5 text-primary-600" />
                                    </div>
                                    <span className="text-xs font-bold text-primary-600 uppercase tracking-widest">{module.category || 'Platform'} Category</span>
                                </div>
                                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 tracking-tight leading-tight">
                                    {module.name} <br />
                                    <span className="text-primary-600">Overview</span>
                                </h1>
                                <p className="text-lg text-gray-500 font-medium  leading-relaxed max-w-xl">
                                    "{module.tagline || 'Experience high-performance enterprise management logic.'}"
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <Button asChild size="lg" className="h-14 px-8 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-md shadow-lg shadow-primary-600/10">
                                    <Link to="/contact">Initialize</Link>
                                </Button>
                                <Button asChild size="lg" variant="outline" className="h-14 px-8 rounded-xl border-gray-200 hover:bg-white text-gray-700 font-bold text-md">
                                    <Link to="/login">Login</Link>
                                </Button>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotate: 1 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            className="relative lg:justify-self-end w-full max-w-md"
                        >
                            <div className="absolute -inset-6 bg-primary-600/5 blur-[80px] rounded-full" />
                            <div className="bg-white rounded-2xl p-2 shadow-xl relative z-10 border border-white">
                                <img
                                    src={module.screenshots?.[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'}
                                    alt={module.name}
                                    className="rounded-xl w-full object-cover aspect-video"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Specifications Grid */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2 space-y-16">
                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-primary-600 pl-4">Core Capabilities</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {(module.features || ["Automated Workflows", "Real-time Analytics", "Seamless Integration", "Cloud Deployment"]).map((feature: string, i: number) => (
                                        <div key={i} className="flex items-start gap-4 p-6 rounded-2xl bg-slate-50 border border-gray-50 hover:bg-white hover:border-primary-100 hover:shadow-lg transition-all duration-300 group">
                                            <div className="bg-white p-2 rounded-lg shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                                <CheckCircle2 className="w-4 h-4 text-primary-600 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-md">{feature}</p>
                                                <p className="text-gray-400 text-xs mt-1  leading-relaxed">Industrial grade capability for high-scale operations.</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-8">
                                <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-primary-600 pl-4">Industrial Specification</h2>
                                <div className="bg-slate-50 rounded-2xl p-8 border border-gray-100">
                                    <p className="text-lg text-gray-600 leading-relaxed ">
                                        "{module.description || module.long_description || 'Detailed technical analysis and module behavior specifications are available upon request through our lead architects.'}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <Card className="rounded-2xl border border-gray-100 shadow-lg p-8 bg-white sticky top-32">
                                <CardContent className="p-0 space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold text-gray-900">Technical Stack</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {(module.technologies || ["React", "PostgreSQL", "Node.js", "Redis"]).map((tech: string) => (
                                                <span key={tech} className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-500 border border-gray-100 uppercase tracking-widest">{tech}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-8 border-t border-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Shield className="w-4 h-4 text-primary-600" />
                                                <span className="font-bold text-gray-900 text-sm">Security Grade</span>
                                            </div>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">Tier-1</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Globe className="w-4 h-4 text-primary-600" />
                                                <span className="font-bold text-gray-900 text-sm">Network Type</span>
                                            </div>
                                            <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">Global</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Zap className="w-4 h-4 text-primary-600" />
                                                <span className="font-bold text-gray-900 text-sm">Architecture</span>
                                            </div>
                                            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">Modular</span>
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button asChild className="w-full h-14 rounded-xl bg-gray-900 hover:bg-primary-600 text-white font-bold text-sm transition-all cursor-pointer">
                                            <Link to="/contact" className="flex items-center justify-center">
                                                Initialize <ArrowRight className="ml-2 w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-24 border-t border-gray-100">
                <div className="max-w-5xl mx-auto px-6 text-center">
                    <div className="bg-primary-600 rounded-[3rem] p-16 md:p-24 text-white space-y-8 relative overflow-hidden shadow-2xl">
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">Ready to Upgrade?</h2>
                        <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                            Deployment takes less than 5 minutes. Connect with our architects to configure your custom instance.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                            <Button asChild size="lg" className="h-16 px-12 rounded-xl bg-white text-primary-600 hover:bg-gray-100 font-bold text-lg">
                                <Link to="/contact">Initialize Project</Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-xl border-white/20 text-white hover:bg-white/10 font-bold text-lg backdrop-blur-sm">
                                <Link to="/login">Login Access</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ModuleDetail;
