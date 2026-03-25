import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    Plus,
    Trash2,
    Edit,
    Grid,
    Layers,
    Zap,
    Shield,
    Smartphone,
    Search,
    RefreshCw,
    ExternalLink,
    Image,
    Layout,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PLATFORM_MODULES } from "@/config/modules";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export default function PlatformModules() {
    const { toast } = useToast();
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        id: "",
        slug: "",
        name: "",
        tagline: "",
        description: "",
        long_description: "",
        icon: "🚀",
        color: "#2563EB",
        color_from: "from-blue-500",
        color_to: "to-blue-700",
        route: "/apps/ecommerce",
        dashboard_route: "/apps/ecommerce",
        category: "commerce",
        status: "live",
        features: "",
        use_cases: "", // JSON string for form
        screenshots: "", // Comma separated URLs
        interface_overview: "",
        technologies: "React, Supabase, PostgreSQL",
        included_in_plans: "standard, professional, enterprise, custom",
        is_core: false,
        is_active: true,
        needs_template: false,
        sort_order: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('system_modules')
            .select('*')
            .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
            setModules(data);
        } else {
            console.error("Modules load error or empty:", error);
            setModules([]);
        }
        setLoading(false);
    };

    const handleSyncFromConfig = async () => {
        if (!confirm("This will import all modules from config/modules.ts into the database. Existing records with same IDs will be updated. Continue?")) return;

        setIsSubmitting(true);
        try {
            for (const mod of PLATFORM_MODULES) {
                const payload = {
                    slug: mod.id,
                    name: mod.name,
                    tagline: mod.tagline,
                    description: mod.description,
                    icon: mod.icon,
                    color: mod.color,
                    color_from: mod.colorFrom,
                    color_to: mod.colorTo,
                    route: mod.route,
                    dashboard_route: mod.dashboardRoute,
                    category: mod.category,
                    status: mod.status,
                    features: mod.features,
                    included_in_plans: mod.includedInPlans,
                    needs_template: mod.needsTemplate,
                    is_core: mod.isCore,
                    is_active: true,
                    sort_order: PLATFORM_MODULES.indexOf(mod)
                };

                const { error } = await supabase.from('system_modules').upsert([payload], { onConflict: 'slug' });
                if (error) console.error(`Error syncing ${mod.name}:`, error);
            }
            toast({ title: "Synchronization Complete", description: "Platform modules have been imported from the local config." });
            loadData();
        } catch (err: any) {
            toast({ title: "Sync Failed", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenDialog = (mod?: any) => {
        if (mod) {
            setEditingId(mod.id);
            setFormData({
                id: mod.id,
                slug: mod.slug || mod.id,
                name: mod.name,
                tagline: mod.tagline,
                description: mod.description || "",
                long_description: mod.long_description || "",
                icon: mod.icon || "🚀",
                color: mod.color || "#000000",
                color_from: mod.color_from || "from-slate-500",
                color_to: mod.color_to || "to-slate-700",
                route: mod.route || "",
                dashboard_route: mod.dashboard_route || "",
                category: mod.category || "commerce",
                status: mod.status || "live",
                features: Array.isArray(mod.features) ? mod.features.join("\n") : "",
                use_cases: Array.isArray(mod.use_cases) ? JSON.stringify(mod.use_cases, null, 2) : "[]",
                screenshots: Array.isArray(mod.screenshots) ? mod.screenshots.join("\n") : "",
                interface_overview: mod.interface_overview || "",
                technologies: Array.isArray(mod.technologies) ? mod.technologies.join(", ") : (mod.technologies || "React, Supabase, PostgreSQL"),
                included_in_plans: Array.isArray(mod.included_in_plans) ? mod.included_in_plans.join(", ") : (mod.included_in_plans || ""),
                is_core: mod.is_core || false,
                is_active: mod.is_active !== false,
                needs_template: mod.needs_template || false,
                sort_order: mod.sort_order || 0
            });
        } else {
            setEditingId(null);
            setFormData({
                id: "",
                slug: "",
                name: "",
                tagline: "",
                description: "",
                long_description: "",
                icon: "🚀",
                color: "#2563EB",
                color_from: "from-blue-500",
                color_to: "to-blue-700",
                route: "/apps/",
                dashboard_route: "/apps/",
                category: "commerce",
                status: "live",
                features: "",
                use_cases: "[]",
                screenshots: "",
                interface_overview: "",
                technologies: "React, Supabase, PostgreSQL",
                included_in_plans: "standard, professional, enterprise, custom",
                is_core: false,
                is_active: true,
                needs_template: false,
                sort_order: modules.length
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.slug || !formData.name) {
            toast({ title: "Validation Error", description: "Slug and Name are required.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        const featuresArray = formData.features.split('\n').map(f => f.trim()).filter(Boolean);
        let useCasesArray = [];
        try {
            useCasesArray = JSON.parse(formData.use_cases);
        } catch (e) {
            toast({ title: "Invalid JSON", description: "Use Cases must be valid JSON.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        const payload: any = {
            slug: formData.slug,
            name: formData.name,
            tagline: formData.tagline,
            description: formData.description,
            long_description: formData.long_description,
            icon: formData.icon,
            color: formData.color,
            color_from: formData.color_from,
            color_to: formData.color_to,
            route: formData.route,
            dashboard_route: formData.dashboard_route,
            category: formData.category,
            status: formData.status,
            features: featuresArray,
            use_cases: useCasesArray,
            screenshots: formData.screenshots.split('\n').map(s => s.trim()).filter(Boolean),
            interface_overview: formData.interface_overview,
            technologies: formData.technologies.split(',').map(t => t.trim()).filter(Boolean),
            included_in_plans: formData.included_in_plans.split(',').map(p => p.trim()).filter(Boolean),
            is_core: formData.is_core,
            is_active: formData.is_active,
            needs_template: formData.needs_template,
            sort_order: formData.sort_order
        };

        if (editingId) payload.id = editingId;

        try {
            const { error } = await supabase.from('system_modules').upsert([payload]);
            if (error) throw error;
            toast({ title: editingId ? "Module Updated" : "Module Registered", description: "The platform module configuration has been synchronized with the database." });
            setIsDialogOpen(false);
            loadData();
        } catch (err: any) {
            toast({ title: "Failed to Save", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this module from the platform registry? This won't delete the code, just the listing.")) return;
        const { error } = await supabase.from('system_modules').delete().eq('id', id);
        if (error) toast({ title: "Delete Failed", variant: "destructive" });
        else loadData();
    };

    const filteredModules = modules.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-12 bg-slate-50/50 min-h-screen">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-center justify-between gap-8"
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ rotate: 180 }}
                            className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20"
                        >
                            <Layers className="w-6 h-6" />
                        </motion.div>
                        <h1 className="text-4xl font-bold tracking-tight   text-slate-900 leading-none">
                            Ecosystem <span className="text-blue-600">Hub</span>
                        </h1>
                    </div>
                    <p className="text-[10px] font-bold  tracking-widest text-slate-400 ml-1">Universal Registry of SaaS Engines & Logic Packs</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 sm:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find Engine..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-14 pl-12 pr-6 w-full rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:outline-none font-bold text-sm transition-all"
                        />
                    </div>
                    <div className="flex gap-4">
                        <Button variant="outline" onClick={handleSyncFromConfig} className="h-14 px-6 rounded-2xl font-bold  text-[10px] tracking-widest bg-white hover:bg-slate-50 transition-all border-slate-200">
                            <RefreshCw className="w-4 h-4 mr-2" /> Sync Engine
                        </Button>
                        <Button onClick={() => handleOpenDialog()} className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 rounded-2xl shadow-2xl shadow-blue-500/20 flex gap-3 transition-all hover:scale-105 active:scale-95 group">
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" /> Initialize New
                        </Button>
                    </div>
                </div>
            </motion.div>

            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-6">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360],
                            borderRadius: ["20%", "50%", "20%"]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 bg-blue-600/10 flex items-center justify-center"
                    >
                        <Zap className="w-8 h-8 text-blue-600" />
                    </motion.div>
                    <span className="text-[10px] font-bold text-blue-600  tracking-[0.5em] animate-pulse">Scanning Platform Cores</span>
                </div>
            ) : filteredModules.length > 0 ? (
                <motion.div
                    layout
                    initial="hidden"
                    animate="show"
                    variants={{
                        show: { transition: { staggerChildren: 0.1 } }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredModules.map((mod) => (
                            <motion.div
                                layout
                                key={mod.id}
                                variants={{
                                    hidden: { opacity: 0, scale: 0.9, y: 20 },
                                    show: { opacity: 1, scale: 1, y: 0 }
                                }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                className={cn(
                                    "group relative bg-white rounded-[3rem] border border-slate-200/60 p-2 transition-all duration-500 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.15)]",
                                    !mod.is_active && "opacity-60 grayscale"
                                )}
                            >
                                <div className="bg-white rounded-[2.5rem] overflow-hidden">
                                    <div className="h-44 relative flex items-center justify-center overflow-hidden">
                                        <div className={cn(
                                            "absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-20 transition-opacity duration-700",
                                            mod.color_from || "from-blue-500",
                                            mod.color_to || "to-indigo-600"
                                        )} />

                                        <motion.span
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="text-7xl drop-shadow-2xl relative z-10"
                                        >
                                            {mod.icon || "⚙️"}
                                        </motion.span>

                                        <div className="absolute top-6 left-6 flex gap-2">
                                            <Link to={`/products/${mod.slug}`} target="_blank" className="w-10 h-10 rounded-xl bg-white/80 backdrop-blur-md shadow-sm flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors border border-slate-100">
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                        </div>

                                        <div className="absolute top-6 right-6 flex gap-2">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleOpenDialog(mod)}
                                                className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors border border-slate-100"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </motion.button>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleDelete(mod.id)}
                                                className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors border border-slate-100"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </motion.button>
                                        </div>

                                        <div className="absolute bottom-6 left-6">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-xl text-[10px] font-bold  tracking-widest border backdrop-blur-md",
                                                mod.status === 'live' ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                                            )}>
                                                {mod.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 tracking-tight   group-hover:text-blue-600 transition-colors duration-500">
                                                {mod.name}
                                            </h3>
                                            <p className="text-[10px] font-bold text-slate-400  tracking-widest mt-1">{mod.tagline || "Engine Interface Core"}</p>
                                        </div>

                                        <div className="h-12 overflow-hidden">
                                            <p className="text-xs font-semibold text-slate-500 leading-relaxed line-clamp-2  opacity-80">
                                                {mod.description ? `"${mod.description}"` : "Architectural logic ready for deployment."}
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-50">
                                            {[
                                                { label: "Engine ID", value: mod.slug },
                                                { label: "Category", value: mod.category },
                                                { label: "Core Pack", value: mod.is_core ? "YES" : "NO" },
                                                { label: "Template", value: mod.needs_template ? "REQ" : "OPT" }
                                            ].map((spec, i) => (
                                                <div key={i} className="space-y-1">
                                                    <p className="text-[8px] font-bold text-slate-300  tracking-widest">{spec.label}</p>
                                                    <p className="text-[10px] font-bold text-slate-600 truncate">{spec.value}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Auto-scrolling Features Marquee */}
                                        <div className="relative overflow-hidden h-8 flex items-center">
                                            <motion.div
                                                animate={{ x: ["0%", "-50%"] }}
                                                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                                className="flex gap-2 whitespace-nowrap"
                                            >
                                                {[...(Array.isArray(mod.features) ? mod.features : []), ...(Array.isArray(mod.features) ? mod.features : [])].map((feat: string, i: number) => (
                                                    <span key={i} className="text-[8px] font-bold  bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5">
                                                        <Zap className="w-2.5 h-2.5 text-blue-500" /> {feat}
                                                    </span>
                                                ))}
                                                {(!mod.features || mod.features.length === 0) && (
                                                    <span className="text-[8px] font-bold  bg-slate-50 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-100 flex items-center gap-1.5">
                                                        <Zap className="w-2.5 h-2.5 text-blue-500" /> Standard Logic
                                                    </span>
                                                )}
                                            </motion.div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                            <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400  tracking-widest leading-none">
                                                <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                                                <span className="truncate">{mod.route}</span>
                                            </div>
                                            {(mod.screenshots?.length > 0 || mod.long_description) && (
                                                <div title="Rich Content Available" className="w-4 h-4 rounded-full bg-green-500/10 flex items-center justify-center">
                                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            onClick={() => handleOpenDialog(mod)}
                                            className="w-full h-14 rounded-[1.5rem] bg-slate-900 hover:bg-black text-white font-bold  tracking-widest text-[10px] shadow-2xl shadow-black/10 transition-all opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 duration-500"
                                        >
                                            Modify Specifications
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white border-4 border-dashed border-slate-100 rounded-[4rem] p-32 text-center space-y-8"
                >
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                        <Grid className="w-10 h-10 text-slate-200" />
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                        <h2 className="text-3xl font-bold text-slate-900   tracking-tighter leading-none">Registry Null</h2>
                        <p className="text-sm font-semibold text-slate-400 leading-relaxed">No SaaS engines detected in the primary database tier. Initialize the system from configuration.</p>
                    </div>
                    <Button onClick={handleSyncFromConfig} className="bg-black text-white h-16 px-10 rounded-[2rem] font-bold  text-xs tracking-widest shadow-2xl">
                        Boot from Master Config
                    </Button>
                </motion.div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    className="sm:max-w-[1000px] rounded-[40px] max-h-[90vh] overflow-y-auto"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold   tracking-tighter">{editingId ? 'Modify Engine Specs' : 'Register New Engine'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-6">
                        {/* Column 1: Core Info */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold  tracking-widest text-slate-400">Unique Slug</Label>
                                    <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. ecommerce" className="font-mono text-sm h-12 rounded-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold  tracking-widest text-slate-400">Display Name</Label>
                                    <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. E-Commerce Pro" className="font-bold h-12 rounded-xl" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold  tracking-widest text-slate-400">Short Tagline</Label>
                                <Input value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} placeholder="Short marketing hook" className="font-medium h-12 rounded-xl" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold  tracking-widest text-slate-400">Base Description</Label>
                                <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Technical summary" className="min-h-[80px] font-medium text-sm rounded-xl" />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold  tracking-widest text-slate-400">Icon Emoji</Label>
                                    <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="h-12 rounded-xl text-center text-xl" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold  tracking-widest text-slate-400">Category</Label>
                                    <select
                                        className="h-12 w-full rounded-xl border-2 px-3 font-bold text-sm bg-white"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="commerce">Commerce</option>
                                        <option value="finance">Finance</option>
                                        <option value="operations">Operations</option>
                                        <option value="people">People</option>
                                        <option value="customer">Customer</option>
                                        <option value="analytics">Analytics</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-bold  tracking-widest text-slate-400">Status</Label>
                                    <select
                                        className="h-12 w-full rounded-xl border-2 px-3 font-bold text-sm bg-white"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="live">Live</option>
                                        <option value="beta">Beta</option>
                                        <option value="coming-soon">Coming Soon</option>
                                        <option value="planned">Planned</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold  tracking-widest text-slate-400">Key Features (One per line)</Label>
                                <Textarea value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} placeholder="Feature A&#10;Feature B" className="min-h-[100px] font-medium text-sm rounded-xl" />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold  tracking-widest text-slate-400 text-blue-600">Technologies (Comma separated)</Label>
                                <Input value={formData.technologies} onChange={(e) => setFormData({ ...formData, technologies: e.target.value })} placeholder="React, Node.js, etc" className="font-bold h-12 rounded-xl" />
                            </div>
                        </div>

                        {/* Column 2: Rich Content (The "Detail Page" stuff) */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Layout className="w-4 h-4 text-blue-600" />
                                    <Label className="text-[10px] font-bold  tracking-widest text-blue-600">Detailed Overview (Elaborate Use Case)</Label>
                                </div>
                                <Textarea value={formData.long_description} onChange={(e) => setFormData({ ...formData, long_description: e.target.value })} placeholder="Tell the full story of this module..." className="min-h-[150px] font-medium text-sm rounded-xl border-blue-100 focus:border-blue-500" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-blue-600" />
                                    <Label className="text-[10px] font-bold  tracking-widest text-blue-600">Post-Deployment Interface Overview</Label>
                                </div>
                                <Textarea value={formData.interface_overview} onChange={(e) => setFormData({ ...formData, interface_overview: e.target.value })} placeholder="Explain how it looks after deployment..." className="min-h-[100px] font-medium text-sm rounded-xl border-blue-100 focus:border-blue-500" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Image className="w-4 h-4 text-blue-600" />
                                    <Label className="text-[10px] font-bold  tracking-widest text-blue-600">Screenshots (One URL per line)</Label>
                                </div>
                                <Textarea value={formData.screenshots} onChange={(e) => setFormData({ ...formData, screenshots: e.target.value })} placeholder="https://example.com/img1.png&#10;https://example.com/img2.png" className="min-h-[100px] font-mono text-xs rounded-xl border-blue-100 focus:border-blue-500" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Plus className="w-4 h-4 text-blue-600" />
                                    <Label className="text-[10px] font-bold  tracking-widest text-blue-600">Use Cases (JSON List)</Label>
                                </div>
                                <Textarea value={formData.use_cases} onChange={(e) => setFormData({ ...formData, use_cases: e.target.value })} placeholder='[{"title": "Retail", "description": "Manage shops", "icon": "store"}]' className="min-h-[100px] font-mono text-xs rounded-xl border-blue-100 focus:border-blue-500" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8 px-6 pb-6">
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setFormData({ ...formData, is_core: !formData.is_core })}
                                className={cn("w-12 h-6 rounded-full relative transition-colors", formData.is_core ? 'bg-indigo-600' : 'bg-slate-200')}>
                                <span className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", formData.is_core ? 'left-7' : 'left-1')} />
                            </button>
                            <Label className="text-xs font-bold  tracking-widest cursor-pointer">Core Module</Label>
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                className={cn("w-12 h-6 rounded-full relative transition-colors", formData.is_active ? 'bg-green-600' : 'bg-slate-200')}>
                                <span className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", formData.is_active ? 'left-7' : 'left-1')} />
                            </button>
                            <Label className="text-xs font-bold  tracking-widest cursor-pointer">Active Module</Label>
                        </div>
                    </div>

                    <DialogFooter className="bg-slate-50 p-6 rounded-b-[40px]">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-bold  text-[10px] tracking-widest">Abort</Button>
                        <Button onClick={handleSave} disabled={isSubmitting} className="h-14 bg-black text-white hover:bg-slate-900 px-10 rounded-2xl font-bold  text-[10px] tracking-widest shadow-2xl">
                            {isSubmitting ? "Syncing Platform..." : "Commit Engine Build"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
