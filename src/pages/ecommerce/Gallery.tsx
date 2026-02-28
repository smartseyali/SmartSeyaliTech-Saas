import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Image, Film, Layout, Plus, Pencil, Trash2, ToggleLeft, ToggleRight,
    ExternalLink, MoveUp, MoveDown, Clock, Eye, EyeOff, Search,
    Copy, Tag, X, Youtube, Upload, Link as LinkIcon, FileImage
} from "lucide-react";
import { MediaUpload } from "@/components/common/MediaUpload";

// ─── Types ────────────────────────────────────────────────────
type Tab = "images" | "videos";

const BANNER_POSITIONS = [
    { key: "hero", label: "Hero / Full Width", desc: "Top of homepage, maximum impact" },
    { key: "mid_page", label: "Mid Page", desc: "Between product sections" },
    { key: "bottom", label: "Bottom Banner", desc: "Footer area of homepage" },
    { key: "popup", label: "Popup / Interstitial", desc: "Appears as overlay popup" },
    { key: "sidebar", label: "Sidebar", desc: "Side panel placement" },
];

const IMAGE_CATEGORIES = ["general", "product", "category", "promotional", "blog"];
const VIDEO_TYPES = ["youtube", "vimeo", "mp4", "instagram"];
const VIDEO_CATEGORIES = ["promotional", "product_demo", "tutorial", "testimonial"];

const EMPTY_BANNER = {
    title: "", subtitle: "", image_url: "", button_text: "", button_link: "",
    position: "hero", display_order: 0, overlay_opacity: 40,
    text_color: "white", badge_text: "", is_active: true, starts_at: "", ends_at: "",
};
const EMPTY_IMAGE = {
    name: "", alt_text: "", url: "", thumbnail_url: "",
    category: "general", tags: "", is_active: true,
};
const EMPTY_VIDEO = {
    title: "", description: "", type: "youtube", video_url: "",
    embed_id: "", thumbnail_url: "", duration: "", category: "promotional", is_active: true,
};

// ─── Helpers ──────────────────────────────────────────────────
function extractYouTubeId(url: string) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? match[1] : null;
}
function extractVimeoId(url: string) {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
}
function getEmbedUrl(type: string, id: string) {
    if (type === "youtube") return `https://www.youtube.com/embed/${id}`;
    if (type === "vimeo") return `https://player.vimeo.com/video/${id}`;
    return "";
}
function getYTThumbnail(id: string) {
    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

// ─── Sub-components ───────────────────────────────────────────
function TabBtn({ active, onClick, icon: Icon, label, count }: any) {
    return (
        <button onClick={onClick}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground hover:border-primary/30"
                }`}>
            <Icon className="w-4 h-4" />
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>{count}</span>
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════
// BANNERS TAB
// ═══════════════════════════════════════════════════════════════
function BannersTab({ companyId }: { companyId: number }) {
    const { toast } = useToast();
    const [banners, setBanners] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [form, setForm] = useState({ ...EMPTY_BANNER });
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from("ecom_banners").select("*")
            .eq("company_id", companyId).order("display_order").order("created_at", { ascending: false });
        setBanners(data || []);
        setLoading(false);
    };

    const openNew = () => { setEditing(null); setForm({ ...EMPTY_BANNER }); setOpen(true); };
    const openEdit = (b: any) => {
        setEditing(b);
        setForm({
            title: b.title || "", subtitle: b.subtitle || "", image_url: b.image_url,
            button_text: b.button_text || "", button_link: b.button_link || "",
            position: b.position, display_order: b.display_order, overlay_opacity: b.overlay_opacity ?? 40,
            text_color: b.text_color || "white", badge_text: b.badge_text || "",
            is_active: b.is_active, starts_at: b.starts_at?.slice(0, 16) || "", ends_at: b.ends_at?.slice(0, 16) || "",
        });
        setOpen(true);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.image_url) { toast({ variant: "destructive", title: "Image URL is required" }); return; }
        setSaving(true);
        try {
            const payload = { company_id: companyId, ...form, display_order: Number(form.display_order), overlay_opacity: Number(form.overlay_opacity), starts_at: form.starts_at || null, ends_at: form.ends_at || null };
            if (editing) {
                await supabase.from("ecom_banners").update(payload).eq("id", editing.id);
                toast({ title: "Banner updated" });
            } else {
                await supabase.from("ecom_banners").insert([payload]);
                toast({ title: "Banner created ✅" });
            }
            setOpen(false); load();
        } finally { setSaving(false); }
    };

    const toggle = async (b: any) => { await supabase.from("ecom_banners").update({ is_active: !b.is_active }).eq("id", b.id); load(); };
    const reorder = async (b: any, dir: -1 | 1) => { await supabase.from("ecom_banners").update({ display_order: b.display_order + dir }).eq("id", b.id); load(); };
    const remove = async (b: any) => { if (!confirm("Delete this banner?")) return; await supabase.from("ecom_banners").delete().eq("id", b.id); load(); };
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const posConf = (key: string) => BANNER_POSITIONS.find(p => p.key === key) || BANNER_POSITIONS[0];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{banners.length} banners · {banners.filter(b => b.is_active).length} active</p>
                <Button onClick={openNew} className="rounded-xl gap-2" size="sm"><Plus className="w-4 h-4" /> Add Banner</Button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading banners...</div>
            ) : banners.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border/50 text-center py-14">
                    <Layout className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="font-semibold text-sm">No banners yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add hero banners, mid-page promos, or popup banners</p>
                    <Button className="mt-4 rounded-xl" size="sm" onClick={openNew}>Add First Banner</Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {banners.map(b => {
                        const pos = posConf(b.position);
                        const isExpired = b.ends_at && new Date(b.ends_at) < new Date();
                        return (
                            <div key={b.id} className={`bg-card rounded-2xl border-2 overflow-hidden shadow-sm transition-all ${b.is_active && !isExpired ? "border-border/50" : "border-border/30 opacity-60"}`}>
                                <div className="flex gap-0">
                                    {/* Banner Preview Thumbnail */}
                                    <div className="w-52 h-32 shrink-0 relative overflow-hidden bg-secondary">
                                        {b.image_url ? (
                                            <>
                                                <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                                <div className="absolute inset-0 flex flex-col justify-end p-2" style={{ background: `rgba(0,0,0,${(b.overlay_opacity || 40) / 100})` }}>
                                                    {b.badge_text && <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded w-fit mb-1">{b.badge_text}</span>}
                                                    {b.title && <p className="text-white text-[11px] font-bold leading-tight line-clamp-1">{b.title}</p>}
                                                    {b.subtitle && <p className="text-white/70 text-[9px] line-clamp-1">{b.subtitle}</p>}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                                        )}
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 p-4 flex items-start justify-between min-w-0">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">{pos.label}</span>
                                                {isExpired && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">Expired</span>}
                                                {!b.is_active && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary text-muted-foreground">Inactive</span>}
                                            </div>
                                            <p className="font-bold mt-1">{b.title || <span className="text-muted-foreground font-normal italic">No title</span>}</p>
                                            {b.subtitle && <p className="text-xs text-muted-foreground mt-0.5 truncate">{b.subtitle}</p>}
                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                                                {b.button_text && <span className="flex items-center gap-1"><LinkIcon className="w-3 h-3" />{b.button_text}</span>}
                                                <span>Order: {b.display_order}</span>
                                                {b.ends_at && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Until {new Date(b.ends_at).toLocaleDateString("en-IN")}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0 ml-4">
                                            <button onClick={() => reorder(b, -1)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"><MoveUp className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => reorder(b, 1)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"><MoveDown className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => toggle(b)} className="text-muted-foreground hover:text-foreground transition-colors">
                                                {b.is_active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6" />}
                                            </button>
                                            <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => remove(b)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-muted-foreground transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Banner Modal */}
            {open && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-3xl rounded-3xl border border-border/50 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                        <div className="bg-primary/5 p-6 border-b border-primary/10 flex items-center justify-between">
                            <h2 className="text-xl font-bold tracking-tight">{editing ? "Edit Banner" : "Create New Banner"}</h2>
                            <button onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-secondary text-muted-foreground transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="overflow-y-auto flex-1">
                            <form onSubmit={save} className="p-6 space-y-6">
                                {/* Live Preview */}
                                {form.image_url && (
                                    <div className="relative w-full h-44 rounded-2xl overflow-hidden ring-4 ring-primary/5 shadow-inner bg-secondary">
                                        <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex flex-col justify-end p-6" style={{ background: `rgba(0,0,0,${(form.overlay_opacity || 40) / 100})` }}>
                                            {form.badge_text && <span className="px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg w-fit mb-2 shadow-sm uppercase tracking-wider">{form.badge_text}</span>}
                                            {form.title && <p className={`font-bold text-lg text-${form.text_color || "white"} drop-shadow-md`}>{form.title}</p>}
                                            {form.subtitle && <p className="text-white/80 text-sm drop-shadow-sm">{form.subtitle}</p>}
                                            {form.button_text && <span className="mt-3 bg-white text-black text-[11px] px-4 py-1.5 rounded-full w-fit font-bold shadow-sm uppercase tracking-tight">{form.button_text}</span>}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                    <div className="md:col-span-2">
                                        <MediaUpload
                                            value={form.image_url}
                                            onChange={val => set("image_url", val)}
                                            label="Banner Image *"
                                            folder="banners"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Title</label>
                                        <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Summer Essentials Sale"
                                            className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Badge Label</label>
                                        <input value={form.badge_text} onChange={e => set("badge_text", e.target.value)} placeholder="e.g. 50% OFF, NEW"
                                            className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                    </div>

                                    <div className="md:col-span-2 space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Subtitle</label>
                                        <textarea value={form.subtitle} onChange={e => set("subtitle", e.target.value)} placeholder="Limited time offer on all collections..."
                                            className="w-full h-20 px-4 py-3 rounded-xl border border-input bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all hover:border-primary/30" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Button Text</label>
                                        <input value={form.button_text} onChange={e => set("button_text", e.target.value)} placeholder="Shop Now"
                                            className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Button Link</label>
                                        <input value={form.button_link} onChange={e => set("button_link", e.target.value)} placeholder="/sales/featured"
                                            className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:border-primary/30" />
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Banner Placement Position</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {BANNER_POSITIONS.map(p => (
                                            <button key={p.key} type="button" onClick={() => set("position", p.key)}
                                                className={`flex flex-col p-3 rounded-2xl border-2 text-left transition-all ${form.position === p.key ? "border-primary bg-primary/5 ring-4 ring-primary/5" : "border-border/60 hover:border-primary/30 hover:bg-secondary/10"}`}>
                                                <p className={`font-bold text-xs ${form.position === p.key ? "text-primary" : "text-foreground"}`}>{p.label}</p>
                                                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{p.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 flex justify-between">
                                            <span>Overlay Opacity</span>
                                            <span className="text-primary font-bold">{form.overlay_opacity}%</span>
                                        </label>
                                        <input type="range" min={0} max={90} value={form.overlay_opacity} onChange={e => set("overlay_opacity", Number(e.target.value))}
                                            className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Display Order</label>
                                        <input type="number" min={0} value={form.display_order} onChange={e => set("display_order", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Text Theme</label>
                                        <select value={form.text_color} onChange={e => set("text_color", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25em_1.25em] bg-[right_1rem_center] bg-no-repeat">
                                            <option value="white">Light (White)</option>
                                            <option value="black">Dark (Black)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Scheduling: Starts At</label>
                                        <input type="datetime-local" value={form.starts_at} onChange={e => set("starts_at", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Scheduling: Ends At</label>
                                        <input type="datetime-local" value={form.ends_at} onChange={e => set("ends_at", e.target.value)}
                                            className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-10 h-6 rounded-full relative transition-colors ${form.is_active ? "bg-primary" : "bg-secondary"}`}>
                                            <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="sr-only" />
                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${form.is_active ? "translate-x-4" : ""}`} />
                                        </div>
                                        <span className="text-sm font-semibold text-muted-foreground group-hover:text-foreground">Set Active for Storefront</span>
                                    </label>
                                </div>
                            </form>
                        </div>

                        <div className="bg-secondary/40 p-5 border-t border-border flex gap-3">
                            <Button type="button" variant="ghost" className="flex-1 rounded-2xl h-11 font-bold" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button type="submit" onClick={save} className="flex-1 rounded-2xl h-11 font-bold shadow-lg shadow-primary/20" disabled={saving}>
                                {saving ? "Saving..." : editing ? "Update Banner" : "Create Banner"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// IMAGES TAB
// ═══════════════════════════════════════════════════════════════
function ImagesTab({ companyId }: { companyId: number }) {
    const { toast } = useToast();
    const [images, setImages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [form, setForm] = useState({ ...EMPTY_IMAGE });
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("all");
    const [selected, setSelected] = useState<number[]>([]);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from("ecom_gallery_images").select("*")
            .eq("company_id", companyId).order("created_at", { ascending: false });
        setImages(data || []);
        setLoading(false);
    };

    const openNew = () => { setEditing(null); setForm({ ...EMPTY_IMAGE }); setOpen(true); };
    const openEdit = (img: any) => {
        setEditing(img);
        setForm({ name: img.name || "", alt_text: img.alt_text || "", url: img.url, thumbnail_url: img.thumbnail_url || "", category: img.category, tags: img.tags || "", is_active: img.is_active });
        setOpen(true);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.url) { toast({ variant: "destructive", title: "Image URL required" }); return; }
        setSaving(true);
        try {
            const payload = { company_id: companyId, ...form };
            if (editing) { await supabase.from("ecom_gallery_images").update(payload).eq("id", editing.id); toast({ title: "Image updated" }); }
            else { await supabase.from("ecom_gallery_images").insert([payload]); toast({ title: "Image added ✅" }); }
            setOpen(false); load();
        } finally { setSaving(false); }
    };

    const remove = async (id: number) => {
        if (!confirm("Delete this image?")) return;
        await supabase.from("ecom_gallery_images").delete().eq("id", id);
        load();
    };

    const bulkDelete = async () => {
        if (!confirm(`Delete ${selected.length} images?`)) return;
        await supabase.from("ecom_gallery_images").delete().in("id", selected);
        setSelected([]);
        load();
    };

    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const filtered = images.filter(img => {
        const matchCat = catFilter === "all" || img.category === catFilter;
        const matchSearch = !search || img.name?.toLowerCase().includes(search.toLowerCase()) || img.tags?.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2 flex-wrap">
                    {["all", ...IMAGE_CATEGORIES].map(c => (
                        <button key={c} onClick={() => setCatFilter(c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${catFilter === c ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card"}`}>
                            {c} ({c === "all" ? images.length : images.filter(i => i.category === c).length})
                        </button>
                    ))}
                </div>
                <div className="flex gap-2">
                    {selected.length > 0 && (
                        <Button variant="outline" size="sm" className="rounded-xl gap-2 text-red-600 border-red-200" onClick={bulkDelete}>
                            <Trash2 className="w-3.5 h-3.5" /> Delete ({selected.length})
                        </Button>
                    )}
                    <Button onClick={openNew} className="rounded-xl gap-2" size="sm"><Plus className="w-4 h-4" /> Add Image</Button>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or tag..."
                    className="w-full h-10 pl-10 pr-3 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading images...</div>
            ) : filtered.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border/50 text-center py-14">
                    <Image className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-semibold">No images found</p>
                    <Button className="mt-4 rounded-xl" size="sm" onClick={openNew}>Add First Image</Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {filtered.map(img => {
                        const isSel = selected.includes(img.id);
                        return (
                            <div key={img.id} className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${isSel ? "border-primary ring-2 ring-primary/30" : "border-border/50 hover:border-primary/30"}`}
                                onClick={() => setSelected(prev => isSel ? prev.filter(id => id !== img.id) : [...prev, img.id])}>
                                <div className="aspect-square bg-secondary">
                                    <img src={img.url} alt={img.alt_text || img.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3C/svg%3E"; }} />
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                    <button onClick={e => { e.stopPropagation(); openEdit(img); }}
                                        className="p-1.5 rounded-lg bg-white/90 text-gray-800 hover:bg-white transition-colors"><Pencil className="w-3 h-3" /></button>
                                    <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(img.url); toast({ title: "URL copied!" }); }}
                                        className="p-1.5 rounded-lg bg-white/90 text-gray-800 hover:bg-white transition-colors"><Copy className="w-3 h-3" /></button>
                                    <button onClick={e => { e.stopPropagation(); remove(img.id); }}
                                        className="p-1.5 rounded-lg bg-red-500/90 text-white hover:bg-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                </div>
                                {isSel && (
                                    <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                        <X className="w-3 h-3 text-white" />
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                                    <p className="text-white text-[10px] truncate">{img.name || img.alt_text || "Untitled"}</p>
                                    <span className={`text-[9px] px-1 rounded-full capitalize ${img.is_active ? "text-green-400" : "text-red-400"}`}>
                                        {img.category}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-lg rounded-2xl border border-border/50 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">{editing ? "Edit Image" : "Add Image"}</h2>
                            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={save} className="space-y-4">
                            {form.url && (
                                <div className="w-full h-32 rounded-xl overflow-hidden bg-secondary">
                                    <img src={form.url} className="w-full h-full object-contain" onError={() => { }} />
                                </div>
                            )}
                            <div className="space-y-4">
                                <MediaUpload
                                    value={form.url}
                                    onChange={val => set("url", val)}
                                    label="Image Content *"
                                    folder="gallery"
                                />

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1">Image Name</label>
                                    <input value={form.name} onChange={e => set("name", e.target.value)} required placeholder="Product Shoot - Summer 2024"
                                        className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/30 transition-all font-bold" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1">Alt Text</label>
                                        <input value={form.alt_text} onChange={e => set("alt_text", e.target.value)} placeholder="SEO Description"
                                            className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/30" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 ml-1">Tags</label>
                                        <input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="summer, sale"
                                            className="w-full h-11 px-4 rounded-xl border border-input bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/30" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Category</label>
                                <select value={form.category} onChange={e => set("category", e.target.value)}
                                    className="w-full h-10 px-3 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none capitalize focus:ring-2 focus:ring-primary/20">
                                    {IMAGE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="w-4 h-4 rounded" />
                                <span className="text-sm font-medium">Active</span>
                            </label>
                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1 rounded-xl" disabled={saving}>{saving ? "Saving..." : editing ? "Update" : "Add Image"}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// VIDEOS TAB
// ═══════════════════════════════════════════════════════════════
function VideosTab({ companyId }: { companyId: number }) {
    const { toast } = useToast();
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any | null>(null);
    const [form, setForm] = useState({ ...EMPTY_VIDEO });
    const [saving, setSaving] = useState(false);
    const [playing, setPlaying] = useState<number | null>(null);
    const [catFilter, setCatFilter] = useState("all");

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from("ecom_gallery_videos").select("*")
            .eq("company_id", companyId).order("created_at", { ascending: false });
        setVideos(data || []);
        setLoading(false);
    };

    const openNew = () => { setEditing(null); setForm({ ...EMPTY_VIDEO }); setOpen(true); };
    const openEdit = (v: any) => {
        setEditing(v);
        setForm({ title: v.title || "", description: v.description || "", type: v.type, video_url: v.video_url, embed_id: v.embed_id || "", thumbnail_url: v.thumbnail_url || "", duration: v.duration || "", category: v.category, is_active: v.is_active });
        setOpen(true);
    };

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            let embedId = form.embed_id;
            let thumbUrl = form.thumbnail_url;
            if (form.type === "youtube" && form.video_url && !embedId) {
                embedId = extractYouTubeId(form.video_url) || "";
                if (embedId && !thumbUrl) thumbUrl = getYTThumbnail(embedId);
            } else if (form.type === "vimeo" && form.video_url && !embedId) {
                embedId = extractVimeoId(form.video_url) || "";
            }
            const payload = { company_id: companyId, ...form, embed_id: embedId, thumbnail_url: thumbUrl };
            if (editing) { await supabase.from("ecom_gallery_videos").update(payload).eq("id", editing.id); toast({ title: "Video updated" }); }
            else { await supabase.from("ecom_gallery_videos").insert([payload]); toast({ title: "Video added ✅" }); }
            setOpen(false); load();
        } finally { setSaving(false); }
    };

    const toggle = async (v: any) => { await supabase.from("ecom_gallery_videos").update({ is_active: !v.is_active }).eq("id", v.id); load(); };
    const remove = async (v: any) => { if (!confirm("Delete this video?")) return; await supabase.from("ecom_gallery_videos").delete().eq("id", v.id); load(); };
    const set = (k: string, val: any) => setForm(f => ({ ...f, [k]: val }));

    const filtered = catFilter === "all" ? videos : videos.filter(v => v.category === catFilter);

    const getThumb = (v: any) => {
        if (v.thumbnail_url) return v.thumbnail_url;
        if (v.type === "youtube" && v.embed_id) return getYTThumbnail(v.embed_id);
        return null;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex gap-2 flex-wrap">
                    {["all", ...VIDEO_CATEGORIES].map(c => (
                        <button key={c} onClick={() => setCatFilter(c)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all capitalize ${catFilter === c ? "bg-primary text-primary-foreground border-primary" : "border-border bg-card"}`}>
                            {c.replace(/_/g, " ")} ({c === "all" ? videos.length : videos.filter(v => v.category === c).length})
                        </button>
                    ))}
                </div>
                <Button onClick={openNew} className="rounded-xl gap-2" size="sm"><Plus className="w-4 h-4" /> Add Video</Button>
            </div>

            {loading ? (
                <div className="text-center py-12 text-muted-foreground">Loading videos...</div>
            ) : filtered.length === 0 ? (
                <div className="bg-card rounded-2xl border border-border/50 text-center py-14">
                    <Film className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-semibold">No videos yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Add YouTube, Vimeo or direct MP4 videos</p>
                    <Button className="mt-4 rounded-xl" size="sm" onClick={openNew}>Add First Video</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(v => {
                        const thumb = getThumb(v);
                        const embedUrl = (v.embed_id && (v.type === "youtube" || v.type === "vimeo")) ? getEmbedUrl(v.type, v.embed_id) : null;
                        const isPlaying = playing === v.id;
                        return (
                            <div key={v.id} className={`bg-card rounded-2xl border-2 overflow-hidden shadow-sm transition-all ${v.is_active ? "border-border/50" : "border-border/30 opacity-60"}`}>
                                {/* Embed / Thumbnail */}
                                <div className="aspect-video bg-secondary relative">
                                    {isPlaying && embedUrl ? (
                                        <iframe src={`${embedUrl}?autoplay=1`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                                    ) : (
                                        <>
                                            {thumb ? (
                                                <img src={thumb} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <Film className="w-10 h-10 opacity-30" />
                                                </div>
                                            )}
                                            {(embedUrl || v.type === "mp4") && (
                                                <button onClick={() => setPlaying(isPlaying ? null : v.id)}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                                                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl">
                                                        <div className="w-0 h-0 border-t-[10px] border-b-[10px] border-l-[16px] border-t-transparent border-b-transparent border-l-primary ml-1" />
                                                    </div>
                                                </button>
                                            )}
                                            <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${v.type === "youtube" ? "bg-red-600" : v.type === "vimeo" ? "bg-blue-600" : v.type === "instagram" ? "bg-pink-600" : "bg-gray-700"}`}>
                                                {v.type.toUpperCase()}
                                            </span>
                                            {v.duration && <span className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded font-mono">{v.duration}</span>}
                                        </>
                                    )}
                                </div>

                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="font-semibold text-sm truncate">{v.title || "Untitled Video"}</p>
                                            {v.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{v.description}</p>}
                                            <span className="mt-1.5 inline-block px-2 py-0.5 bg-secondary rounded-full text-[10px] capitalize">{v.category?.replace(/_/g, " ")}</span>
                                        </div>
                                        <div className="flex gap-1.5 shrink-0">
                                            <button onClick={() => toggle(v)} className="text-muted-foreground">
                                                {v.is_active ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5" />}
                                            </button>
                                            <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => remove(v)} className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-muted-foreground transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {open && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-lg rounded-2xl border border-border/50 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-lg font-bold">{editing ? "Edit Video" : "Add Video"}</h2>
                            <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><X className="w-4 h-4" /></button>
                        </div>
                        <form onSubmit={save} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Video Type</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {VIDEO_TYPES.map(t => (
                                        <button key={t} type="button" onClick={() => set("type", t)}
                                            className={`py-2 rounded-xl border-2 text-xs font-semibold capitalize transition-all ${form.type === t ? "border-primary bg-primary/5 text-primary" : "border-border"}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                {form.type === "mp4" ? (
                                    <MediaUpload
                                        type="video"
                                        accept="video/*"
                                        value={form.video_url}
                                        onChange={val => set("video_url", val)}
                                        label="Upload Video Content (MP4) *"
                                        folder="videos"
                                    />
                                ) : (
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            {form.type === "youtube" ? "YouTube URL or Video ID" :
                                                form.type === "vimeo" ? "Vimeo URL or Video ID" : "Instagram Reel URL"} *
                                        </label>
                                        <input value={form.video_url} onChange={e => set("video_url", e.target.value)} required
                                            placeholder={form.type === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://..."}
                                            className="w-full h-10 px-3 rounded-xl border border-input bg-secondary/30 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                )}
                                {(form.type === "youtube" || form.type === "vimeo") && (
                                    <p className="text-[11px] text-muted-foreground opacity-60">Embed ID and thumbnail will be extracted automatically</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Title</label>
                                <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Video title"
                                    className="w-full h-10 px-3 rounded-xl border border-input bg-secondary/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Description</label>
                                <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief description..." rows={2}
                                    className="w-full px-3 py-2 rounded-xl border border-input bg-secondary/30 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Duration (e.g. 2:30)</label>
                                    <input value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="2:30"
                                        className="w-full h-10 px-3 rounded-xl border border-input bg-secondary/30 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Category</label>
                                    <select value={form.category} onChange={e => set("category", e.target.value)}
                                        className="w-full h-10 px-3 rounded-xl border border-input bg-secondary/30 text-sm capitalize focus:outline-none focus:ring-2 focus:ring-primary/20">
                                        {VIDEO_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <MediaUpload
                                    value={form.thumbnail_url}
                                    onChange={val => set("thumbnail_url", val)}
                                    label="Custom Thumbnail URL"
                                    folder="video_thumbs"
                                    className="min-h-[120px]"
                                />
                            </div>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input type="checkbox" checked={form.is_active} onChange={e => set("is_active", e.target.checked)} className="w-4 h-4 rounded" />
                                <span className="text-sm font-medium">Active</span>
                            </label>

                            <div className="flex gap-3 pt-2">
                                <Button type="button" variant="outline" className="flex-1 rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1 rounded-xl" disabled={saving}>{saving ? "Saving..." : editing ? "Update Video" : "Add Video"}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN GALLERY PAGE
// ═══════════════════════════════════════════════════════════════
export default function Gallery() {
    const { activeCompany } = useTenant();
    const [tab, setTab] = useState<Tab>("images");
    const [counts, setCounts] = useState({ images: 0, videos: 0 });

    useEffect(() => { if (activeCompany) loadCounts(); }, [activeCompany]);

    const loadCounts = async () => {
        if (!activeCompany) return;
        const [{ count: b }, { count: i }, { count: v }] = await Promise.all([
            supabase.from("ecom_banners").select("id", { count: "exact", head: true }).eq("company_id", activeCompany.id),
            supabase.from("ecom_gallery_images").select("id", { count: "exact", head: true }).eq("company_id", activeCompany.id),
            supabase.from("ecom_gallery_videos").select("id", { count: "exact", head: true }).eq("company_id", activeCompany.id),
        ]);
        setCounts({ images: i || 0, videos: v || 0 });
    };

    if (!activeCompany) return <div className="text-center py-16 text-muted-foreground">No company selected</div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Gallery</h1>
                <p className="text-sm text-muted-foreground mt-1">Manage storefront banners, images, and videos</p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-3 flex-wrap">
                <TabBtn active={tab === "images"} onClick={() => setTab("images")} icon={Image} label="Images" count={counts.images} />
                <TabBtn active={tab === "videos"} onClick={() => setTab("videos")} icon={Film} label="Videos" count={counts.videos} />
            </div>

            {/* Tab Content */}
            <div>
                {tab === "images" && <ImagesTab companyId={activeCompany.id} />}
                {tab === "videos" && <VideosTab companyId={activeCompany.id} />}
            </div>
        </div>
    );
}

