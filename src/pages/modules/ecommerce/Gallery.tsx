import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Image, Film, Layout, Plus, Pencil, Trash2,
    MoveUp, MoveDown, Clock, Search, Copy, X, Link as LinkIcon, RefreshCw,
    Image as ImageIcon, Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { MediaUpload } from "@/components/common/MediaUpload";

// ─── Types ────────────────────────────────────────────────────
type Tab = "banners" | "images" | "videos";

const BANNER_POSITIONS = [
    { key: "hero", label: "Hero — Full Width", desc: "Top of homepage, maximum impact" },
    { key: "mid_page", label: "Mid Page", desc: "Between product sections" },
    { key: "bottom", label: "Bottom Banner", desc: "Footer area of homepage" },
    { key: "popup", label: "Popup / Interstitial", desc: "Overlay popup" },
    { key: "sidebar", label: "Sidebar", desc: "Side panel placement" },
];
const IMAGE_CATEGORIES = ["general", "product", "category", "promotional", "blog"];
const VIDEO_CATEGORIES = ["promotional", "product_demo", "tutorial", "testimonial"];

const EMPTY_BANNER = {
    title: "", subtitle: "", image_url: "", button_text: "", button_link: "",
    position: "hero", display_order: 0, overlay_opacity: 40,
    text_color: "white", badge_text: "", is_active: true, starts_at: "", ends_at: "",
};
const EMPTY_IMAGE = { name: "", alt_text: "", url: "", thumbnail_url: "", category: "general", tags: "", is_active: true };
const EMPTY_VIDEO = {
    title: "", description: "", type: "youtube", video_url: "",
    embed_id: "", thumbnail_url: "", duration: "", category: "promotional", is_active: true,
};

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
function getYTThumbnail(id: string) { return `https://img.youtube.com/vi/${id}/hqdefault.jpg`; }

// ─── Shared Modal Shell ───────────────────────────────────────
function ModalShell({ open, onClose, title, subtitle, onSave, saving, saveLabel, children }: any) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-6 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-3xl rounded-[28px] border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">{title}</h2>
                        <p className="text-[10px] font-bold  tracking-widest text-slate-400 mt-0.5">{subtitle}</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all active:scale-90">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="overflow-y-auto flex-1 p-8 space-y-8">{children}</div>
                <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/60 shrink-0">
                    <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl font-semibold text-slate-500 hover:bg-white" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={onSave} className="flex-[2] h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-600/20 active:scale-95" disabled={saving}>
                        {saving ? "Saving..." : saveLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-0.5">{label}</label>
            {children}
        </div>
    );
}

const inputCls = "w-full h-12 px-4 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none transition-all";
const textareaCls = "w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none transition-all resize-none";

// ─── Sub-tab Button ───────────────────────────────────────────
function TabBtn({ active, onClick, icon: Icon, label, count }: any) {
    return (
        <button onClick={onClick} className={cn(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all",
            active ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
        )}>
            <Icon className="w-4 h-4" />
            {label}
            <span className={cn("px-2 py-0.5 rounded-md text-xs font-bold", active ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400")}>{count}</span>
        </button>
    );
}

// ─── Toggle Switch ────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button type="button" onClick={() => onChange(!checked)} className={cn("relative w-12 h-7 rounded-full transition-colors duration-300 focus:outline-none", checked ? "bg-blue-600" : "bg-slate-200")}>
            <div className={cn("absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300", checked ? "translate-x-5" : "")} />
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
            position: b.position, display_order: b.display_order,
            overlay_opacity: b.overlay_opacity ?? 40, text_color: b.text_color || "white",
            badge_text: b.badge_text || "", is_active: b.is_active,
            starts_at: b.starts_at?.slice(0, 16) || "", ends_at: b.ends_at?.slice(0, 16) || "",
        });
        setOpen(true);
    };

    const save = async () => {
        if (!form.image_url) { toast({ variant: "destructive", title: "Image is required" }); return; }
        setSaving(true);
        try {
            const payload = { company_id: companyId, ...form, display_order: Number(form.display_order), overlay_opacity: Number(form.overlay_opacity), starts_at: form.starts_at || null, ends_at: form.ends_at || null };
            if (editing) { await supabase.from("ecom_banners").update(payload).eq("id", editing.id); toast({ title: "Banner updated" }); }
            else { await supabase.from("ecom_banners").insert([payload]); toast({ title: "Banner created" }); }
            setOpen(false); load();
        } finally { setSaving(false); }
    };

    const toggle = async (b: any) => { await supabase.from("ecom_banners").update({ is_active: !b.is_active }).eq("id", b.id); load(); };
    const reorder = async (b: any, dir: -1 | 1) => { await supabase.from("ecom_banners").update({ display_order: b.display_order + dir }).eq("id", b.id); load(); };
    const remove = async (b: any) => { if (!confirm("Delete this banner?")) return; await supabase.from("ecom_banners").delete().eq("id", b.id); load(); };
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
    const posConf = (key: string) => BANNER_POSITIONS.find(p => p.key === key) || BANNER_POSITIONS[0];

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-slate-700">{banners.length} banners · <span className="text-blue-600 font-bold">{banners.filter(b => b.is_active).length} active</span></p>
                </div>
                <Button onClick={openNew} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/20 gap-2 active:scale-95">
                    <Plus className="w-4 h-4" /> Add Banner
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24 gap-3">
                    <RefreshCw className="w-6 h-6 text-blue-500 animate-spin opacity-40" />
                    <span className="text-sm font-medium text-slate-400">Loading banners...</span>
                </div>
            ) : banners.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-24">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <Layout className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">No banners yet</h3>
                    <p className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">Create hero banners and promotional visuals for your storefront.</p>
                    <Button onClick={openNew} className="h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2">
                        <Plus className="w-4 h-4" /> Create First Banner
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {banners.map(b => {
                        const pos = posConf(b.position);
                        const isExpired = b.ends_at && new Date(b.ends_at) < new Date();
                        return (
                            <div key={b.id} className={cn(
                                "group bg-white rounded-2xl border overflow-hidden flex flex-col sm:flex-row transition-all hover:shadow-lg",
                                b.is_active && !isExpired ? "border-slate-200 hover:border-blue-200" : "border-slate-100 opacity-60"
                            )}>
                                <div className="w-full sm:w-72 h-48 shrink-0 relative bg-slate-100 overflow-hidden">
                                    {b.image_url ? (
                                        <>
                                            <img src={b.image_url} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent flex flex-col justify-end p-5">
                                                {b.badge_text && <span className="px-2.5 py-1 bg-blue-600 text-white text-[9px] font-bold rounded-lg w-fit mb-2  tracking-wide">{b.badge_text}</span>}
                                                {b.title && <p className="text-white text-lg font-bold leading-tight">{b.title}</p>}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                            <ImageIcon className="w-10 h-10" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 p-6 flex items-start justify-between gap-4">
                                    <div className="space-y-3 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500  tracking-wide">{pos.label}</span>
                                            {isExpired && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-rose-50 text-rose-500 ">Expired</span>}
                                            {!b.is_active && <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-amber-50 text-amber-500 ">Inactive</span>}
                                        </div>
                                        <h4 className="text-base font-bold text-slate-900 truncate">{b.title || "Untitled Banner"}</h4>
                                        {b.subtitle && <p className="text-sm text-slate-400 line-clamp-1">{b.subtitle}</p>}
                                        <div className="flex items-center gap-5 text-xs text-slate-400 font-medium">
                                            {b.button_text && <span className="flex items-center gap-1.5"><LinkIcon className="w-3.5 h-3.5" />{b.button_text}</span>}
                                            <span className="flex items-center gap-1.5"><MoveDown className="w-3.5 h-3.5" />Order: {b.display_order}</span>
                                            {b.ends_at && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Ends {new Date(b.ends_at).toLocaleDateString("en-IN")}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="flex flex-col gap-1">
                                            <button onClick={() => reorder(b, -1)} className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all"><MoveUp className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => reorder(b, 1)} className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-all"><MoveDown className="w-3.5 h-3.5" /></button>
                                        </div>
                                        <div className="w-px h-10 bg-slate-100" />
                                        <Toggle checked={b.is_active} onChange={() => toggle(b)} />
                                        <button onClick={() => openEdit(b)} className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-slate-400 transition-all border border-slate-100"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={() => remove(b)} className="w-9 h-9 rounded-xl bg-rose-50 hover:bg-rose-500 hover:text-white flex items-center justify-center text-rose-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ModalShell open={open} onClose={() => setOpen(false)} title={editing ? "Edit Banner" : "New Banner"} subtitle="Campaign Visualization" onSave={save} saving={saving} saveLabel={editing ? "Update Banner" : "Create Banner"}>
                <Field label="Banner Image *">
                    <div className="rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors">
                        <MediaUpload value={form.image_url} onChange={val => set("image_url", val)} label="Upload banner image (16:9 recommended)" folder="banners" />
                    </div>
                </Field>
                {form.image_url && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden">
                        <img src={form.image_url} className="w-full h-full object-cover" alt="preview" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex flex-col justify-end p-4">
                            {form.badge_text && <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-bold rounded w-fit mb-1 ">{form.badge_text}</span>}
                            {form.title && <p className="text-white font-bold text-sm">{form.title}</p>}
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Heading">
                        <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Summer Sale 2024" className={inputCls} />
                    </Field>
                    <Field label="Badge Label">
                        <input value={form.badge_text} onChange={e => set("badge_text", e.target.value)} placeholder="50% OFF" className={inputCls} />
                    </Field>
                </div>
                <Field label="Subtext">
                    <textarea value={form.subtitle} onChange={e => set("subtitle", e.target.value)} placeholder="Promotional description..." rows={2} className={textareaCls} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="CTA Button Text">
                        <input value={form.button_text} onChange={e => set("button_text", e.target.value)} placeholder="Shop Now" className={inputCls} />
                    </Field>
                    <Field label="Button Link">
                        <input value={form.button_link} onChange={e => set("button_link", e.target.value)} placeholder="/category/sale" className={inputCls} />
                    </Field>
                </div>
                <Field label="Display Position">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {BANNER_POSITIONS.map(p => (
                            <button key={p.key} type="button" onClick={() => set("position", p.key)} className={cn(
                                "flex flex-col p-3 rounded-xl border-2 text-left transition-all",
                                form.position === p.key ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-100 hover:border-slate-200 text-slate-600"
                            )}>
                                <span className="text-xs font-bold">{p.label.split("—").pop()?.trim() || p.label}</span>
                                <span className="text-[10px] text-slate-400 mt-0.5">{p.desc}</span>
                            </button>
                        ))}
                    </div>
                </Field>
                <div className="grid grid-cols-3 gap-4">
                    <Field label={`Overlay (${form.overlay_opacity}%)`}>
                        <div className="h-12 flex items-center px-4 bg-slate-50 rounded-xl border border-slate-200">
                            <input type="range" min={0} max={90} value={form.overlay_opacity} onChange={e => set("overlay_opacity", Number(e.target.value))} className="w-full accent-blue-600" />
                        </div>
                    </Field>
                    <Field label="Display Order">
                        <input type="number" value={form.display_order} onChange={e => set("display_order", e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="Text Color">
                        <select value={form.text_color} onChange={e => set("text_color", e.target.value)} className={inputCls}>
                            <option value="white">White</option>
                            <option value="black">Black</option>
                        </select>
                    </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Start Date">
                        <input type="datetime-local" value={form.starts_at} onChange={e => set("starts_at", e.target.value)} className={inputCls} />
                    </Field>
                    <Field label="End Date">
                        <input type="datetime-local" value={form.ends_at} onChange={e => set("ends_at", e.target.value)} className={inputCls} />
                    </Field>
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Active on Storefront</p>
                        <p className="text-xs text-slate-400 mt-0.5">Show this banner to customers immediately</p>
                    </div>
                    <Toggle checked={form.is_active} onChange={v => set("is_active", v)} />
                </div>
            </ModalShell>
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
    const save = async () => {
        if (!form.url) { toast({ variant: "destructive", title: "Image URL required" }); return; }
        setSaving(true);
        try {
            const payload = { company_id: companyId, ...form };
            if (editing) { await supabase.from("ecom_gallery_images").update(payload).eq("id", editing.id); toast({ title: "Image updated" }); }
            else { await supabase.from("ecom_gallery_images").insert([payload]); toast({ title: "Image added" }); }
            setOpen(false); load();
        } finally { setSaving(false); }
    };
    const remove = async (id: number) => {
        if (!confirm("Delete this image?")) return;
        await supabase.from("ecom_gallery_images").delete().eq("id", id); load();
    };
    const bulkDelete = async () => {
        if (!confirm(`Delete ${selected.length} images?`)) return;
        await supabase.from("ecom_gallery_images").delete().in("id", selected);
        setSelected([]); load();
    };
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
    const filtered = images.filter(img => {
        const matchCat = catFilter === "all" || img.category === catFilter;
        const matchSearch = !search || img.name?.toLowerCase().includes(search.toLowerCase()) || img.tags?.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    return (
        <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {["all", ...IMAGE_CATEGORIES].map(c => (
                        <button key={c} onClick={() => setCatFilter(c)} className={cn(
                            "px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all border",
                            catFilter === c ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        )}>
                            {c === "all" ? `All (${images.length})` : `${c} (${images.filter(i => i.category === c).length})`}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-3">
                    {selected.length > 0 && (
                        <Button variant="ghost" onClick={bulkDelete} className="h-10 px-4 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white font-semibold gap-2">
                            <Trash2 className="w-4 h-4" /> Delete {selected.length}
                        </Button>
                    )}
                    <Button onClick={openNew} className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-md shadow-blue-600/20 active:scale-95">
                        <Plus className="w-4 h-4" /> Upload Image
                    </Button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or tag..." className="w-full h-11 pl-11 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none" />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 gap-3">
                    <RefreshCw className="w-5 h-5 text-blue-500 animate-spin opacity-40" />
                    <span className="text-sm text-slate-400">Loading images...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-20">
                    <Image className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-base font-semibold text-slate-600 mb-1">No images found</p>
                    <p className="text-sm text-slate-400 mb-5">Upload product photos and promotional imagery</p>
                    <Button onClick={openNew} className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2">
                        <Plus className="w-4 h-4" /> Upload First Image
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filtered.map(img => {
                        const isSel = selected.includes(img.id);
                        return (
                            <div key={img.id}
                                onClick={() => setSelected(prev => isSel ? prev.filter(id => id !== img.id) : [...prev, img.id])}
                                className={cn(
                                    "group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all bg-white aspect-square",
                                    isSel ? "border-blue-500 ring-4 ring-blue-500/10" : "border-slate-100 hover:border-blue-200 hover:shadow-lg"
                                )}>
                                <img src={img.url} alt={img.alt_text || img.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={e => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3C/svg%3E"; }} />
                                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-2">
                                    <div className="flex gap-1.5">
                                        <button onClick={e => { e.stopPropagation(); openEdit(img); }} className="w-9 h-9 rounded-xl bg-white text-slate-800 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-md"><Pencil className="w-4 h-4" /></button>
                                        <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(img.url); toast({ title: "URL Copied!" }); }} className="w-9 h-9 rounded-xl bg-white text-slate-800 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all shadow-md"><Copy className="w-4 h-4" /></button>
                                        <button onClick={e => { e.stopPropagation(); remove(img.id); }} className="w-9 h-9 rounded-xl bg-rose-500 text-white hover:bg-red-600 flex items-center justify-center shadow-md"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                                {isSel && (
                                    <div className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg">
                                        <Check className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                <div className="absolute top-2 left-2">
                                    <span className="px-2 py-0.5 bg-white/90 text-slate-700 text-[9px] font-bold rounded-md ">{img.category}</span>
                                </div>
                                <div className="absolute bottom-0 inset-x-0 bg-white px-3 py-2 border-t border-slate-100">
                                    <p className="text-xs font-semibold text-slate-800 truncate">{img.name || "Untitled"}</p>
                                </div>
                                <div className={cn("absolute right-2 bottom-9 w-2 h-2 rounded-full", img.is_active ? "bg-emerald-500" : "bg-slate-300")} />
                            </div>
                        );
                    })}
                </div>
            )}

            <ModalShell open={open} onClose={() => setOpen(false)} title={editing ? "Edit Image" : "Upload Image"} subtitle="Digital Asset Library" onSave={save} saving={saving} saveLabel={editing ? "Update Image" : "Save Image"}>
                <Field label="Image File *">
                    <div className="rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors">
                        <MediaUpload value={form.url} onChange={val => set("url", val)} label="Select image file" folder="gallery" />
                    </div>
                </Field>
                <Field label="Name *">
                    <input value={form.name} onChange={e => set("name", e.target.value)} required placeholder="Product photo - Summer 2024" className={inputCls} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Alt Text (SEO)">
                        <input value={form.alt_text} onChange={e => set("alt_text", e.target.value)} placeholder="Describe the image" className={inputCls} />
                    </Field>
                    <Field label="Tags">
                        <input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="summer, sale" className={inputCls} />
                    </Field>
                </div>
                <Field label="Category">
                    <div className="grid grid-cols-3 gap-2">
                        {IMAGE_CATEGORIES.map(c => (
                            <button key={c} type="button" onClick={() => set("category", c)} className={cn(
                                "h-10 rounded-xl text-xs font-semibold capitalize border-2 transition-all",
                                form.category === c ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-500 bg-white hover:border-slate-200"
                            )}>{c}</button>
                        ))}
                    </div>
                </Field>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Active</p>
                        <p className="text-xs text-slate-400 mt-0.5">Make this image accessible in the store</p>
                    </div>
                    <Toggle checked={form.is_active} onChange={v => set("is_active", v)} />
                </div>
            </ModalShell>
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
    const save = async () => {
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
            else { await supabase.from("ecom_gallery_videos").insert([payload]); toast({ title: "Video added" }); }
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

    const typeColors: Record<string, string> = {
        youtube: "bg-red-600", vimeo: "bg-blue-600", instagram: "bg-rose-600", mp4: "bg-slate-700"
    };

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                    {["all", ...VIDEO_CATEGORIES].map(c => (
                        <button key={c} onClick={() => setCatFilter(c)} className={cn(
                            "px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all border",
                            catFilter === c ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                        )}>
                            {c === "all" ? `All (${videos.length})` : `${c.replace(/_/g, " ")} (${videos.filter(v => v.category === c).length})`}
                        </button>
                    ))}
                </div>
                <Button onClick={openNew} className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2 shadow-md shadow-blue-600/20 active:scale-95">
                    <Plus className="w-4 h-4" /> Add Video
                </Button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20 gap-3">
                    <RefreshCw className="w-5 h-5 text-blue-500 animate-spin opacity-40" />
                    <span className="text-sm text-slate-400">Loading videos...</span>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-slate-200 text-center py-20">
                    <Film className="w-10 h-10 mx-auto mb-3 text-slate-200" />
                    <p className="text-base font-semibold text-slate-600 mb-1">No videos yet</p>
                    <p className="text-sm text-slate-400 mb-5">Add YouTube, Vimeo or direct MP4 videos</p>
                    <Button onClick={openNew} className="h-10 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-2">
                        <Plus className="w-4 h-4" /> Add First Video
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map(v => {
                        const thumb = getThumb(v);
                        const embedUrl = (v.embed_id && (v.type === "youtube" || v.type === "vimeo")) ? getEmbedUrl(v.type, v.embed_id) : null;
                        const isPlaying = playing === v.id;
                        return (
                            <div key={v.id} className={cn(
                                "group bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-lg",
                                v.is_active ? "border-slate-200 hover:border-blue-200" : "border-slate-100 opacity-60"
                            )}>
                                <div className="aspect-video bg-slate-900 relative overflow-hidden">
                                    {isPlaying && embedUrl ? (
                                        <iframe src={`${embedUrl}?autoplay=1`} className="w-full h-full" allow="autoplay; encrypted-media" allowFullScreen />
                                    ) : (
                                        <>
                                            {thumb ? <img src={thumb} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={v.title} /> : <div className="w-full h-full flex items-center justify-center"><Film className="w-10 h-10 text-slate-600 opacity-20" /></div>}
                                            {(embedUrl || v.type === "mp4") && (
                                                <button onClick={() => setPlaying(isPlaying ? null : v.id)}
                                                    className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition-all">
                                                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                                        <svg className="w-6 h-6 text-slate-900 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                    </div>
                                                </button>
                                            )}
                                            <div className="absolute top-3 left-3">
                                                <span className={cn("px-2.5 py-1 rounded-lg text-[9px] font-bold text-white  tracking-wide", typeColors[v.type] || "bg-slate-700")}>{v.type}</span>
                                            </div>
                                            {v.duration && <span className="absolute bottom-3 right-3 px-2 py-0.5 bg-black/70 text-white text-xs rounded font-mono">{v.duration}</span>}
                                        </>
                                    )}
                                </div>
                                <div className="p-5 space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-500 ">{v.category?.replace(/_/g, " ")}</span>
                                        {!v.is_active && <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-50 text-amber-600 ">Inactive</span>}
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{v.title || "Untitled Video"}</h4>
                                    {v.description && <p className="text-xs text-slate-400 line-clamp-2">{v.description}</p>}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                        <Toggle checked={v.is_active} onChange={() => toggle(v)} />
                                        <div className="flex gap-2">
                                            <button onClick={() => openEdit(v)} className="w-8 h-8 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center text-slate-400 transition-all border border-slate-100"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => remove(v)} className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-500 hover:text-white flex items-center justify-center text-rose-400 transition-all"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <ModalShell open={open} onClose={() => setOpen(false)} title={editing ? "Edit Video" : "Add Video"} subtitle="Cinematic Asset Library" onSave={save} saving={saving} saveLabel={editing ? "Update Video" : "Add Video"}>
                <Field label="Video Platform">
                    <div className="grid grid-cols-4 gap-2">
                        {["youtube", "vimeo", "instagram", "mp4"].map(t => (
                            <button key={t} type="button" onClick={() => set("type", t)} className={cn(
                                "h-10 rounded-xl text-xs font-bold  border-2 transition-all",
                                form.type === t ? "border-slate-800 bg-slate-800 text-white" : "border-slate-100 text-slate-500 bg-white hover:border-slate-200"
                            )}>{t}</button>
                        ))}
                    </div>
                </Field>
                {form.type === "mp4" ? (
                    <Field label="Video File *">
                        <div className="rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50">
                            <MediaUpload value={form.video_url} onChange={val => set("video_url", val)} label="Upload video file" folder="videos" />
                        </div>
                    </Field>
                ) : (
                    <Field label={`${form.type.charAt(0).toUpperCase() + form.type.slice(1)} URL *`}>
                        <input value={form.video_url} onChange={e => set("video_url", e.target.value)} required
                            placeholder={form.type === "youtube" ? "https://youtube.com/watch?v=..." : "https://..."}
                            className={inputCls} />
                        <p className="text-xs text-slate-400 mt-1">Thumbnail and embed ID will be extracted automatically</p>
                    </Field>
                )}
                <Field label="Title">
                    <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Product demo video" className={inputCls} />
                </Field>
                <Field label="Description">
                    <textarea value={form.description} onChange={e => set("description", e.target.value)} placeholder="Brief description..." rows={2} className={textareaCls} />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                    <Field label="Duration (MM:SS)">
                        <input value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="02:30" className={inputCls} />
                    </Field>
                    <Field label="Category">
                        <select value={form.category} onChange={e => set("category", e.target.value)} className={inputCls}>
                            {VIDEO_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                        </select>
                    </Field>
                </div>
                <Field label="Custom Thumbnail">
                    <div className="rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-slate-50 hover:border-blue-300 transition-colors">
                        <MediaUpload value={form.thumbnail_url} onChange={val => set("thumbnail_url", val)} label="Upload custom cover image" folder="video_thumbs" />
                    </div>
                </Field>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                        <p className="text-sm font-semibold text-slate-800">Active</p>
                        <p className="text-xs text-slate-400 mt-0.5">Show this video on the storefront</p>
                    </div>
                    <Toggle checked={form.is_active} onChange={v => set("is_active", v)} />
                </div>
            </ModalShell>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// MAIN GALLERY PAGE
// ═══════════════════════════════════════════════════════════════
export default function Gallery() {
    const { activeCompany } = useTenant();
    const [tab, setTab] = useState<Tab>("images");
    const [counts, setCounts] = useState({ banners: 0, images: 0, videos: 0 });

    useEffect(() => { if (activeCompany) loadCounts(); }, [activeCompany]);

    const loadCounts = async () => {
        if (!activeCompany) return;
        const [{ count: b }, { count: i }, { count: v }] = await Promise.all([
            supabase.from("ecom_banners").select("id", { count: "exact", head: true }).eq("company_id", activeCompany.id),
            supabase.from("ecom_gallery_images").select("id", { count: "exact", head: true }).eq("company_id", activeCompany.id),
            supabase.from("ecom_gallery_videos").select("id", { count: "exact", head: true }).eq("company_id", activeCompany.id),
        ]);
        setCounts({ banners: b || 0, images: i || 0, videos: v || 0 });
    };

    if (!activeCompany) return <div className="text-center py-20 text-slate-400 font-medium">No company selected</div>;

    return (
        <div className="p-8 pb-20 space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-slate-100">
                <div>
                    <p className="text-xs font-bold  tracking-widest text-slate-400 mb-1">Content & Digital Assets</p>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Media Vault</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage storefront banners, product images, and video content</p>
                </div>
                {/* Stat pills */}
                <div className="flex items-center gap-3">
                    <div className="px-5 py-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center min-w-[80px]">
                        <p className="text-xl font-bold text-slate-900">{counts.banners}</p>
                        <p className="text-[10px] font-semibold  tracking-widest text-slate-400 mt-0.5">Banners</p>
                    </div>
                    <div className="px-5 py-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center min-w-[80px]">
                        <p className="text-xl font-bold text-slate-900">{counts.images}</p>
                        <p className="text-[10px] font-semibold  tracking-widest text-slate-400 mt-0.5">Images</p>
                    </div>
                    <div className="px-5 py-3 bg-white rounded-xl border border-slate-200 shadow-sm text-center min-w-[80px]">
                        <p className="text-xl font-bold text-slate-900">{counts.videos}</p>
                        <p className="text-[10px] font-semibold  tracking-widest text-slate-400 mt-0.5">Videos</p>
                    </div>
                </div>
            </div>

            {/* Tab Bar */}
            <div className="flex items-center gap-1 p-1.5 bg-slate-100 rounded-2xl w-fit">
                <TabBtn active={tab === "banners"} onClick={() => setTab("banners")} icon={Layout} label="Banners" count={counts.banners} />
                <TabBtn active={tab === "images"} onClick={() => setTab("images")} icon={Image} label="Photography" count={counts.images} />
                <TabBtn active={tab === "videos"} onClick={() => setTab("videos")} icon={Film} label="Videos" count={counts.videos} />
            </div>

            {/* Tab Content */}
            <div>
                {tab === "banners" && <BannersTab companyId={activeCompany.id} />}
                {tab === "images" && <ImagesTab companyId={activeCompany.id} />}
                {tab === "videos" && <VideosTab companyId={activeCompany.id} />}
            </div>
        </div>
    );
}
