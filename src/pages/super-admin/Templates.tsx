import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Copy, Plus, Upload, Server, Code2, Play, CreditCard, Box, Eye, Trash2, LayoutTemplate, Edit, Check, X } from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PlatformTemplates() {
    const { toast } = useToast();
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // CRUD State
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        folder: "",
        name: "",
        description: "",
        industry: "retail",
        version: "1.0.0",
        component_count: 12,
        preview_image: "",
        gallery_images: "",
        color: "#000000",
        tags: "",
        is_active: true
    });

    useEffect(() => {
        loadData();
    }, []);

    const LOCAL_REGISTRY = [
        {
            id: 'amazon-style',
            folder: 'amazon-style',
            name: 'Amazon Style',
            description: 'A robust, multi-category layout inspired by the world\'s largest e-commerce platform. Best for megastores.',
            version: '1.0.1',
            industry: 'retail',
            component_count: 24,
            preview_image: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?q=80&w=900',
            gallery_images: [],
            color: '#f97316',
            tags: ['megastore', 'retail', 'amazon'],
            is_active: true
        }
    ];

    const loadData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('system_templates')
            .select('*')
            .order('sort_order', { ascending: true });

        if (!error && data && data.length > 0) {
            setTemplates(data);
        } else {
            if (error) console.error("Templates load error.", error);
            setTemplates(LOCAL_REGISTRY as any);
        }
        setLoading(false);
    };

    const handleOpenDialog = (template?: any) => {
        if (template) {
            setEditingId(template.id);
            setFormData({
                folder: template.folder,
                name: template.name,
                description: template.description || "",
                industry: template.industry || "retail",
                version: template.version || "1.0.0",
                component_count: template.component_count || 12,
                preview_image: template.preview_image || "",
                gallery_images: Array.isArray(template.gallery_images) ? template.gallery_images.join("\n") : "",
                color: template.color || "#000000",
                tags: template.tags ? template.tags.join(", ") : "",
                is_active: template.is_active
            });
        } else {
            setEditingId(null);
            setFormData({
                folder: "",
                name: "",
                description: "",
                industry: "retail",
                version: "1.0.0",
                component_count: 12,
                preview_image: "",
                gallery_images: "",
                color: "#000000",
                tags: "",
                is_active: true
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.folder) {
            toast({ title: "Validation Error", description: "Folder and Name are required variables.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);

        const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        const galleryArray = formData.gallery_images ? formData.gallery_images.split('\n').map(t => t.trim()).filter(Boolean) : [];

        const payload = {
            folder: formData.folder,
            name: formData.name,
            description: formData.description,
            industry: formData.industry,
            version: formData.version,
            component_count: formData.component_count,
            preview_image: formData.preview_image,
            gallery_images: galleryArray,
            color: formData.color,
            tags: tagsArray,
            is_active: formData.is_active
        };

        try {
            if (editingId) {
                const { error } = await supabase.from('system_templates').update(payload).eq('id', editingId);
                if (error) throw error;
                toast({ title: "Template Updated", description: "The template configuration has been updated successfully." });
            } else {
                const { error } = await supabase.from('system_templates').insert([payload]);
                if (error) throw error;
                toast({ title: "Template Created", description: "A new template record has been registered." });
            }
            setIsDialogOpen(false);
            loadData();
        } catch (err: any) {
            console.error("Save template error:", err);
            toast({ title: "Failed to Save", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this template configuration?")) return;

        const { error } = await supabase.from('system_templates').delete().eq('id', id);
        if (error) {
            toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Template Deleted", description: "The record was removed entirely from the database." });
            loadData();
        }
    };

    const handleToggleActive = async (id: number, currentState: boolean) => {
        const { error } = await supabase.from('system_templates').update({ is_active: !currentState }).eq('id', id);
        if (error) {
            toast({ title: "Update Failed", description: error.message, variant: "destructive" });
        } else {
            loadData();
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Template Engine</h1>
                    <p className="text-sm font-medium text-slate-500 mt-2">Manage the visual DNA of the {PLATFORM_CONFIG.name} SaaS ecosystem.</p>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" onClick={() => loadData()} className="h-14 border-slate-200 text-slate-700 bg-white font-black rounded-2xl px-6">
                        <Server className="w-5 h-5 mr-2" /> Sync Records
                    </Button>
                    <Button onClick={() => handleOpenDialog()} className="h-14 bg-black hover:bg-slate-900 text-white font-black rounded-2xl shadow-xl px-8 flex gap-3 transition-transform hover:scale-105 active:scale-95">
                        <Plus className="w-5 h-5" /> Register Architecture
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-4">
                    <LayoutTemplate className="w-12 h-12 text-slate-200 animate-pulse" />
                    <span className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Decoding Designs...</span>
                </div>
            ) : templates.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {templates.map((tpl) => (
                        <div key={tpl.id} className={`group bg-white rounded-[40px] overflow-hidden border-2 ${tpl.is_active ? 'border-slate-100 shadow-sm hover:shadow-2xl' : 'border-slate-200 opacity-60'} transition-all duration-500`}>
                            <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-700">
                                {tpl.preview_image ? (
                                    <img src={tpl.preview_image} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-blue-50 to-indigo-50">
                                        <Code2 className="w-16 h-16 text-blue-200" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
                                    <Button size="sm" onClick={() => handleOpenDialog(tpl)} className="h-12 rounded-xl bg-white text-slate-900 hover:bg-slate-50 font-black px-8">
                                        <Edit className="w-4 h-4 mr-2" /> Modify
                                    </Button>
                                    <button onClick={() => handleDelete(tpl.id)} className="w-12 h-12 rounded-xl bg-red-600 text-white hover:bg-red-700 font-black flex items-center justify-center transition-colors">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm transition-transform group-hover:scale-110">
                                        {tpl.industry}
                                    </span>
                                    <div className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: tpl.color }} />
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex-1">
                                        <h3 className="font-black text-xl text-slate-900 tracking-tight uppercase leading-tight italic">
                                            {tpl.name}
                                        </h3>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mt-2">Architecture v{tpl.version || '1.0.0'}</p>
                                    </div>
                                    <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 shrink-0">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">{tpl.folder}</span>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-xs font-medium text-slate-500 leading-relaxed line-clamp-2 italic mb-4">"{tpl.description}"</p>
                                    <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest border-t border-slate-50 pt-4">
                                        <span>Status</span>
                                        <button
                                            onClick={() => handleToggleActive(tpl.id, tpl.is_active)}
                                            className={`px-4 py-1.5 rounded-full font-black transition-all ${tpl.is_active ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                        >
                                            {tpl.is_active ? 'Synchronized' : 'Offline'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[32px] p-24 text-center space-y-6">
                    <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center animate-bounce">
                        <Box className="w-10 h-10 text-blue-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-900">No Master Templates Found</h2>
                        <p className="text-sm font-medium text-slate-500 mt-2 max-w-md mx-auto">Create a template record pointing to a local physical folder inside `src/templates`.</p>
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="h-14 px-8 bg-black hover:bg-slate-800 text-white font-bold rounded-2xl shadow-xl hover:scale-105 transition-all w-fit mx-auto mt-4">
                        <Upload className="w-5 h-5 mr-3" /> Register First Template
                    </Button>
                </div>
            )}

            {/* Template CRUD Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto rounded-[40px]"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter">{editingId ? 'Modify Engine Architecture' : 'Initialize New Design'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Public Name</Label>
                                <Input
                                    className="font-bold h-12 rounded-xl"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Flipkart Style"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">System Folder Name</Label>
                                <Input
                                    className="font-mono text-sm h-12 rounded-xl bg-slate-50 border-none"
                                    value={formData.folder}
                                    onChange={(e) => setFormData({ ...formData, folder: e.target.value })}
                                    placeholder="e.g. flipkart-style"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Marketing Pitch / Description</Label>
                            <Input
                                className="font-semibold h-12 rounded-xl"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Short promotional description"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Core Industry</Label>
                                <select
                                    className="h-12 rounded-xl bg-white border-2 font-bold px-3 text-sm focus:border-black outline-none transition-colors"
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                >
                                    <option value="retail">Retail SaaS</option>
                                    <option value="education">Education Portal</option>
                                    <option value="services">IT Infrastructure</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Version Sync</Label>
                                <Input
                                    className="font-bold h-12 rounded-xl"
                                    value={formData.version}
                                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                    placeholder="1.0.0"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Comp. Count</Label>
                                <Input
                                    type="number"
                                    className="font-bold h-12 rounded-xl"
                                    value={formData.component_count}
                                    onChange={(e) => setFormData({ ...formData, component_count: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Branding Color</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        type="color"
                                        className="w-12 h-12 p-1 cursor-pointer rounded-xl border-none"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    />
                                    <Input
                                        className="font-mono text-xs uppercase flex-1 h-12 rounded-xl bg-slate-50 border-none"
                                        value={formData.color}
                                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Global Categories (Comma separated)</Label>
                                <Input
                                    className="font-bold text-sm h-12 rounded-xl"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="SaaS, Enterprise, Dark"
                                />
                            </div>
                        </div>

                        <div className="space-y-4 bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                            <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Primary Feature Image (URL)</Label>
                                <Input
                                    className="font-medium text-xs h-12 rounded-xl bg-white border-none shadow-sm"
                                    value={formData.preview_image}
                                    onChange={(e) => setFormData({ ...formData, preview_image: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gallery Preview Nodes (One URL per line)</Label>
                                <Textarea
                                    className="min-h-[140px] font-medium text-[10px] leading-relaxed rounded-2xl bg-white border-none shadow-sm p-4"
                                    value={formData.gallery_images}
                                    onChange={(e) => setFormData({ ...formData, gallery_images: e.target.value })}
                                    placeholder="https://images.unsplash.com/photo-1... &#10;https://images.unsplash.com/photo-2..."
                                />
                                <span className="text-[9px] font-bold text-slate-400 italic">This powers the multi-image swiper in the onboarding preview.</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-2">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                className={`w-14 h-7 rounded-full transition-all relative ${formData.is_active ? 'bg-blue-600 shadow-lg shadow-blue-500/20' : 'bg-slate-300'}`}
                            >
                                <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${formData.is_active ? 'left-[32px]' : 'left-1'}`} />
                            </button>
                            <Label className="text-xs font-black text-slate-900 uppercase tracking-widest cursor-pointer" onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}>
                                Deploy Architecture Globally
                            </Label>
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} disabled={isSubmitting} className="font-black uppercase text-[10px] tracking-widest px-8">Abort</Button>
                        <Button onClick={handleSave} disabled={isSubmitting} className="h-14 px-10 bg-black text-white hover:bg-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-xl">
                            {isSubmitting ? "Processing..." : "Commit Infrastructure"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
