import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Plus, Pencil, Trash2, Loader2, Search, ExternalLink, Sparkles, Tag, Eye,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    createTemplate, deleteTemplate, listTemplates, updateTemplate,
} from "@/lib/services/storefrontTemplateService";
import type { StorefrontTemplate } from "@/types/storefront";
import { cn } from "@/lib/utils";

type FormState = {
    id?: number;
    slug: string;
    name: string;
    description: string;
    category: string;
    module_id: string;
    entry_path: string;
    thumbnail_url: string;
    preview_url: string;
    tags: string;        // comma-separated in the form
    features: string;    // comma-separated in the form
    pages_json: string;  // JSON array string
    is_active: boolean;
    is_premium: boolean;
    price: string;
    sort_order: string;
    author: string;
    version: string;
};

const PAGES_PLACEHOLDER = `[
  {
    "slug": "home",
    "title": "Home",
    "file": "index.html",
    "icon": "home",
    "is_editable": true,
    "fields": [
      { "key": "hero_title", "label": "Hero Headline", "type": "text" }
    ]
  }
]`;

const EMPTY_FORM: FormState = {
    slug: "",
    name: "",
    description: "",
    category: "ecommerce",
    module_id: "ecommerce",
    entry_path: "",
    thumbnail_url: "",
    preview_url: "",
    tags: "",
    features: "",
    pages_json: "[]",
    is_active: true,
    is_premium: false,
    price: "0",
    sort_order: "0",
    author: "Smartseyali",
    version: "1.0.0",
};

const toForm = (t: StorefrontTemplate): FormState => ({
    id: t.id,
    slug: t.slug,
    name: t.name,
    description: t.description ?? "",
    category: t.category,
    module_id: t.module_id ?? "",
    entry_path: t.entry_path,
    thumbnail_url: t.thumbnail_url ?? "",
    preview_url: t.preview_url ?? "",
    tags: (t.tags ?? []).join(", "),
    features: (t.features ?? []).join(", "),
    pages_json: JSON.stringify(t.pages ?? [], null, 2),
    is_active: t.is_active,
    is_premium: t.is_premium,
    price: String(t.price ?? 0),
    sort_order: String(t.sort_order ?? 0),
    author: t.author ?? "Smartseyali",
    version: t.version ?? "1.0.0",
});

const splitCsv = (v: string): string[] =>
    v.split(",").map((x) => x.trim()).filter(Boolean);

/**
 * Super-admin registry for storefront_templates.
 *
 * Admin uploads static template files manually into
 * /public/templates/<category>/<slug>/ and registers a row here with the
 * matching entry_path (e.g. "/templates/ecommerce/pattikadai/index.html").
 */
export default function SuperAdminTemplates() {
    const [templates, setTemplates] = useState<StorefrontTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [form, setForm] = useState<FormState>(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const rows = await listTemplates({ activeOnly: false });
            setTemplates(rows);
        } catch (err: any) {
            toast.error(err?.message || "Failed to load templates");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { refresh(); }, [refresh]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return templates;
        return templates.filter(
            (t) =>
                t.name.toLowerCase().includes(q) ||
                t.slug.toLowerCase().includes(q) ||
                t.category.toLowerCase().includes(q) ||
                (t.description ?? "").toLowerCase().includes(q),
        );
    }, [templates, query]);

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setDialogOpen(true);
    };

    const openEdit = (t: StorefrontTemplate) => {
        setForm(toForm(t));
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.slug.trim() || !form.name.trim() || !form.entry_path.trim()) {
            toast.error("Slug, name, and entry path are required");
            return;
        }

        let parsedPages: unknown = [];
        try {
            parsedPages = JSON.parse(form.pages_json.trim() || "[]");
            if (!Array.isArray(parsedPages)) throw new Error("Pages must be a JSON array");
        } catch (err: any) {
            toast.error(`Pages JSON is invalid: ${err?.message || err}`);
            return;
        }

        setSaving(true);
        try {
            const payload = {
                slug: form.slug.trim(),
                name: form.name.trim(),
                description: form.description.trim() || null,
                category: form.category.trim() || "ecommerce",
                module_id: form.module_id.trim() || null,
                entry_path: form.entry_path.trim(),
                thumbnail_url: form.thumbnail_url.trim() || null,
                preview_url: form.preview_url.trim() || null,
                tags: splitCsv(form.tags),
                features: splitCsv(form.features),
                config_schema: {},
                pages: parsedPages,
                is_active: form.is_active,
                is_premium: form.is_premium,
                price: Number(form.price) || 0,
                sort_order: Number(form.sort_order) || 0,
                author: form.author.trim() || "Smartseyali",
                version: form.version.trim() || "1.0.0",
            };

            if (form.id) {
                await updateTemplate(form.id, payload as Partial<StorefrontTemplate>);
                toast.success("Template updated");
            } else {
                await createTemplate(payload as Omit<StorefrontTemplate, "id" | "created_at" | "updated_at">);
                toast.success("Template created");
            }
            setDialogOpen(false);
            await refresh();
        } catch (err: any) {
            toast.error(err?.message || "Failed to save template");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (t: StorefrontTemplate) => {
        if (!confirm(`Delete "${t.name}"? Tenants that picked this template will lose their selection.`)) return;
        try {
            await deleteTemplate(t.id);
            toast.success("Template deleted");
            await refresh();
        } catch (err: any) {
            toast.error(err?.message || "Failed to delete template");
        }
    };

    const toggleActive = async (t: StorefrontTemplate) => {
        try {
            await updateTemplate(t.id, { is_active: !t.is_active });
            await refresh();
        } catch (err: any) {
            toast.error(err?.message || "Failed to update");
        }
    };

    return (
        <div className="min-h-full bg-background">
            <div className="sticky top-0 z-30 bg-card border-b border-border">
                <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary" /> Storefront Templates
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Registry for static storefronts under /public/templates/
                        </p>
                    </div>
                    <Button size="sm" onClick={openCreate}>
                        <Plus className="w-3.5 h-3.5" /> New Template
                    </Button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-5 py-5 space-y-4">
                <div className="relative max-w-sm">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <Input
                        placeholder="Search name, slug, category…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-8"
                    />
                </div>

                {loading ? (
                    <div className="py-16 flex justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-16 text-center text-sm text-muted-foreground">
                        No templates yet — click New Template to add one.
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs text-muted-foreground">
                                <tr>
                                    <th className="text-left font-medium px-3 py-2">Template</th>
                                    <th className="text-left font-medium px-3 py-2">Category</th>
                                    <th className="text-left font-medium px-3 py-2">Module</th>
                                    <th className="text-left font-medium px-3 py-2">Pages</th>
                                    <th className="text-left font-medium px-3 py-2">Status</th>
                                    <th className="text-right font-medium px-3 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((t) => (
                                    <tr key={t.id} className="border-t border-border">
                                        <td className="px-3 py-2.5">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="w-10 h-10 rounded-md bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                                                    {t.thumbnail_url ? (
                                                        <img
                                                            src={t.thumbnail_url}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                                                        />
                                                    ) : (
                                                        <Sparkles className="w-4 h-4 text-muted-foreground/50" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-foreground truncate">{t.name}</p>
                                                    <p className="text-[11px] text-muted-foreground truncate">/{t.slug} · {t.entry_path}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <Badge variant="secondary" className="capitalize">{t.category.replace("_", " ")}</Badge>
                                        </td>
                                        <td className="px-3 py-2.5 text-muted-foreground text-xs">{t.module_id || "—"}</td>
                                        <td className="px-3 py-2.5 text-muted-foreground text-xs">
                                            {t.pages?.length ?? 0}
                                        </td>
                                        <td className="px-3 py-2.5">
                                            <button
                                                onClick={() => toggleActive(t)}
                                                className={cn(
                                                    "text-[11px] font-medium px-2 py-0.5 rounded-md border transition-colors",
                                                    t.is_active
                                                        ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/20"
                                                        : "bg-muted text-muted-foreground border-border",
                                                )}
                                            >
                                                {t.is_active ? "Active" : "Hidden"}
                                            </button>
                                            {t.is_premium && (
                                                <span className="ml-1.5 inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-300">
                                                    <Tag className="w-2.5 h-2.5" /> Premium
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2.5 text-right">
                                            <div className="inline-flex items-center gap-1">
                                                <Button size="xs" variant="ghost" asChild title="Preview">
                                                    <a href={t.entry_path} target="_blank" rel="noopener noreferrer">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </a>
                                                </Button>
                                                {t.preview_url && (
                                                    <Button size="xs" variant="ghost" asChild title="External demo">
                                                        <a href={t.preview_url} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    </Button>
                                                )}
                                                <Button size="xs" variant="ghost" onClick={() => openEdit(t)} title="Edit">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button
                                                    size="xs"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(t)}
                                                    title="Delete"
                                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="bg-muted/30 border border-dashed border-border rounded-lg p-4 text-xs text-muted-foreground space-y-1.5">
                    <p className="font-medium text-foreground">How to add a template</p>
                    <ol className="list-decimal list-inside space-y-0.5">
                        <li>Drop the static site files into <code className="px-1 py-0.5 rounded bg-muted text-foreground">/public/templates/&lt;category&gt;/&lt;slug&gt;/</code>.</li>
                        <li>Ensure the template's config script reads <code>company_id</code>, <code>supabase_url</code>, <code>anon_key</code> from <code>window.location.search</code> (see Pattikadai's <code>assets/js/config.js</code>).</li>
                        <li>Click <span className="text-foreground">New Template</span> and set <code>entry_path</code> to <code>/templates/&lt;category&gt;/&lt;slug&gt;/index.html</code>.</li>
                    </ol>
                </div>
            </div>

            {/* Form dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{form.id ? "Edit template" : "New template"}</DialogTitle>
                        <DialogDescription>
                            Register a static storefront. Files must already exist under /public/templates/.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-1 max-h-[65vh] overflow-y-auto pr-1">
                        <Field label="Slug *">
                            <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="pattikadai" disabled={!!form.id} />
                        </Field>
                        <Field label="Name *">
                            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Pattikadai — Retail Storefront" />
                        </Field>
                        <Field label="Category *">
                            <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="ecommerce / education / landing_page" />
                        </Field>
                        <Field label="Module ID">
                            <Input value={form.module_id} onChange={(e) => setForm((f) => ({ ...f, module_id: e.target.value }))} placeholder="ecommerce / website" />
                        </Field>
                        <Field label="Entry path *" className="md:col-span-2">
                            <Input value={form.entry_path} onChange={(e) => setForm((f) => ({ ...f, entry_path: e.target.value }))} placeholder="/templates/ecommerce/pattikadai/index.html" />
                        </Field>
                        <Field label="Thumbnail URL" className="md:col-span-2">
                            <Input value={form.thumbnail_url} onChange={(e) => setForm((f) => ({ ...f, thumbnail_url: e.target.value }))} placeholder="/templates/ecommerce/pattikadai/assets/img/logo/logo.gif" />
                        </Field>
                        <Field label="External preview URL" className="md:col-span-2">
                            <Input value={form.preview_url} onChange={(e) => setForm((f) => ({ ...f, preview_url: e.target.value }))} placeholder="https://demo.pattikadai.com" />
                        </Field>
                        <Field label="Description" className="md:col-span-2">
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                className="w-full min-h-[70px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                            />
                        </Field>
                        <Field label="Tags (comma separated)" className="md:col-span-2">
                            <Input value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} placeholder="retail, f-and-b, whatsapp" />
                        </Field>
                        <Field label="Features (comma separated)" className="md:col-span-2">
                            <Input value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} placeholder="Product Catalog, WhatsApp Checkout, PWA" />
                        </Field>
                        <Field label="Pages (JSON array)" className="md:col-span-2">
                            <textarea
                                value={form.pages_json}
                                onChange={(e) => setForm((f) => ({ ...f, pages_json: e.target.value }))}
                                className="w-full min-h-[180px] rounded-md border border-input bg-background px-3 py-2 text-xs font-mono"
                                placeholder={PAGES_PLACEHOLDER}
                            />
                            <p className="text-[10px] text-muted-foreground mt-1">
                                Each entry: <code>{`{ slug, title, file, icon?, is_editable, fields: [{ key, label, type }] }`}</code>. These rows auto-seed the tenant's Website → Pages on activation.
                            </p>
                        </Field>
                        <Field label="Price (0 = included)">
                            <Input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} />
                        </Field>
                        <Field label="Sort order">
                            <Input type="number" value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} />
                        </Field>
                        <Field label="Author">
                            <Input value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
                        </Field>
                        <Field label="Version">
                            <Input value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} />
                        </Field>
                        <div className="flex items-center gap-4 md:col-span-2 pt-1">
                            <label className="inline-flex items-center gap-1.5 text-xs font-medium">
                                <input
                                    type="checkbox"
                                    checked={form.is_active}
                                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                                />
                                Active (visible to tenants)
                            </label>
                            <label className="inline-flex items-center gap-1.5 text-xs font-medium">
                                <input
                                    type="checkbox"
                                    checked={form.is_premium}
                                    onChange={(e) => setForm((f) => ({ ...f, is_premium: e.target.checked }))}
                                />
                                Premium
                            </label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : (form.id ? "Save" : "Create")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={cn("flex flex-col gap-1", className)}>
            <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</Label>
            {children}
        </div>
    );
}
