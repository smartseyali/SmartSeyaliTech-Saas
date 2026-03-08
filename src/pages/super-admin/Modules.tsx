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
    ShoppingCart,
    BarChart3,
    Search,
    RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PLATFORM_MODULES } from "@/config/modules";

export default function PlatformModules() {
    const { toast } = useToast();
    const [modules, setModules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        id: "",
        slug: "",
        name: "",
        tagline: "",
        description: "",
        icon: "🚀",
        color: "#2563EB",
        color_from: "from-blue-500",
        color_to: "to-blue-700",
        route: "/apps/ecommerce",
        dashboard_route: "/apps/ecommerce",
        category: "commerce",
        status: "live",
        features: "",
        is_core: false,
        is_active: true,
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
            // If empty, we can show local ones or prompt to sync
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
                icon: mod.icon || "🚀",
                color: mod.color || "#000000",
                color_from: mod.color_from || "from-slate-500",
                color_to: mod.color_to || "to-slate-700",
                route: mod.route || "",
                dashboard_route: mod.dashboard_route || "",
                category: mod.category || "commerce",
                status: mod.status || "live",
                features: Array.isArray(mod.features) ? mod.features.join("\n") : "",
                is_core: mod.is_core || false,
                is_active: mod.is_active !== false,
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
                icon: "🚀",
                color: "#2563EB",
                color_from: "from-blue-500",
                color_to: "to-blue-700",
                route: "/apps/",
                dashboard_route: "/apps/",
                category: "commerce",
                status: "live",
                features: "",
                is_core: false,
                is_active: true,
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

        const payload: any = {
            slug: formData.slug,
            name: formData.name,
            tagline: formData.tagline,
            description: formData.description,
            icon: formData.icon,
            color: formData.color,
            color_from: formData.color_from,
            color_to: formData.color_to,
            route: formData.route,
            dashboard_route: formData.dashboard_route,
            category: formData.category,
            status: formData.status,
            features: featuresArray,
            is_core: formData.is_core,
            is_active: formData.is_active,
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

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-10 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                            <Layers className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase italic">Module Marketplace</h1>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60 ml-1">Manage dynamic products and services across the ecosystem</p>
                </div>

                <div className="flex gap-4">
                    <Button variant="outline" onClick={handleSyncFromConfig} className="h-14 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest flex gap-2">
                        <RefreshCw className="w-4 h-4" /> Sync from Config
                    </Button>
                    <Button onClick={() => handleOpenDialog()} className="h-14 bg-black hover:bg-slate-900 text-white font-black px-8 rounded-2xl shadow-xl flex gap-3 transition-transform hover:scale-105 active:scale-95">
                        <Plus className="w-5 h-5" /> Register Module
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-4">
                    <Zap className="w-12 h-12 text-slate-200 animate-pulse" />
                    <span className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Decoding Modules...</span>
                </div>
            ) : modules.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {modules.map((mod) => (
                        <div key={mod.id} className={`group bg-white rounded-[40px] border-2 transition-all duration-500 overflow-hidden ${mod.is_active ? 'border-slate-100 hover:shadow-2xl' : 'border-slate-200 opacity-60'}`}>
                            <div className={`h-32 bg-gradient-to-br ${mod.color_from} ${mod.color_to} p-8 flex items-center justify-between relative`}>
                                <span className="text-5xl drop-shadow-lg">{mod.icon}</span>
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => handleOpenDialog(mod)} className="p-2 bg-white/20 hover:bg-white/40 backdrop-blur rounded-lg text-white transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(mod.id)} className="p-2 bg-red-500/20 hover:bg-red-500/40 backdrop-blur rounded-lg text-white transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-8 space-y-4">
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="font-black text-xl text-slate-900 tracking-tight uppercase italic">{mod.name}</h3>
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${mod.status === 'live' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {mod.status}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{mod.tagline}</p>
                                </div>
                                <p className="text-xs font-medium text-slate-500 line-clamp-2 italic">"{mod.description}"</p>

                                <div className="pt-4 border-t border-slate-50 space-y-2">
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-slate-400">
                                        <span>Slug: {mod.slug}</span>
                                        <span>Core: {mod.is_core ? 'Yes' : 'No'}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-slate-400">
                                        <span>Category: {mod.category}</span>
                                        <span>Sort: {mod.sort_order}</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-slate-400">
                                        <span>Route: {mod.route}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-24 text-center space-y-6">
                    <Grid className="w-16 h-16 text-slate-200 mx-auto" />
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 uppercase italic">No Modules Found in Database</h2>
                        <p className="text-sm font-medium text-slate-500 mt-2 max-w-md mx-auto">Use the sync button to import default modules or register a new custom product/service.</p>
                    </div>
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    className="sm:max-w-[700px] rounded-[40px] max-h-[90vh] overflow-y-auto"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">{editingId ? 'Modify Engine Specs' : 'Register New Engine'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Module Unique Slug</Label>
                                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. ecommerce" className="font-mono text-sm h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Display Name</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. E-Commerce Pro" className="font-bold h-12 rounded-xl" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Short Tagline</Label>
                            <Input value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} placeholder="Short marketing hook" className="font-medium h-12 rounded-xl" />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Description</Label>
                            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Technical details and capabilities" className="min-h-[100px] font-medium text-sm rounded-xl" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Icon Emoji</Label>
                                <Input value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} className="h-12 rounded-xl text-center text-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</Label>
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
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</Label>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Route</Label>
                                <Input value={formData.route} onChange={(e) => setFormData({ ...formData, route: e.target.value })} className="font-mono text-xs h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Dashboard Route</Label>
                                <Input value={formData.dashboard_route} onChange={(e) => setFormData({ ...formData, dashboard_route: e.target.value })} className="font-mono text-xs h-12 rounded-xl" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Brand Color</Label>
                                <Input type="color" value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="h-12 w-full rounded-xl p-1" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gradient From</Label>
                                <Input value={formData.color_from} onChange={(e) => setFormData({ ...formData, color_from: e.target.value })} className="font-mono text-xs h-12 rounded-xl" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gradient To</Label>
                                <Input value={formData.color_to} onChange={(e) => setFormData({ ...formData, color_to: e.target.value })} className="font-mono text-xs h-12 rounded-xl" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Key Features (One per line)</Label>
                            <Textarea value={formData.features} onChange={(e) => setFormData({ ...formData, features: e.target.value })} placeholder="Feature A&#10;Feature B" className="min-h-[100px] font-medium text-sm rounded-xl" />
                        </div>

                        <div className="flex items-center gap-8 pt-2">
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => setFormData({ ...formData, is_core: !formData.is_core })}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.is_core ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_core ? 'left-7' : 'left-1'}`} />
                                </button>
                                <Label className="text-xs font-black uppercase tracking-widest cursor-pointer">Core Module</Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <button type="button" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${formData.is_active ? 'bg-green-600' : 'bg-slate-200'}`}>
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_active ? 'left-7' : 'left-1'}`} />
                                </button>
                                <Label className="text-xs font-black uppercase tracking-widest cursor-pointer">Active Module</Label>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-black uppercase text-[10px] tracking-widest">Abort</Button>
                        <Button onClick={handleSave} disabled={isSubmitting} className="h-14 bg-black text-white hover:bg-slate-900 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                            {isSubmitting ? "Processing..." : "Commit Module"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
