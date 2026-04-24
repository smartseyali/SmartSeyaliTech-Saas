import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    Eye, EyeOff, FileText, Loader2, Pencil, Plus, Search, Sparkles, ExternalLink, RefreshCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { getTemplateById, seedWebPagesForTenant } from "@/lib/services/storefrontTemplateService";
import type { PageField, StorefrontTemplate } from "@/types/storefront";
import { cn } from "@/lib/utils";

type WebPage = {
    id: string;
    company_id: number | string;
    title: string;
    slug: string;
    content: string | null;
    meta_title: string | null;
    meta_description: string | null;
    template: string | null;
    template_id: number | null;
    status: string | null;
    is_published: boolean | null;
    published_at: string | null;
    sort_order: number | null;
    custom_fields: Record<string, unknown> | null;
    updated_at: string;
};

type EditForm = {
    id: string;
    title: string;
    slug: string;
    meta_title: string;
    meta_description: string;
    is_published: boolean;
    content: string;
    custom_fields: Record<string, string>;
};

export default function WebPages() {
    const { activeCompany } = useTenant();
    const [pages, setPages] = useState<WebPage[]>([]);
    const [template, setTemplate] = useState<StorefrontTemplate | null>(null);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [editing, setEditing] = useState<EditForm | null>(null);
    const [saving, setSaving] = useState(false);
    const [reseeding, setReseeding] = useState(false);

    const refresh = useCallback(async () => {
        if (!activeCompany?.id) return;
        setLoading(true);
        try {
            const { data: rows, error } = await supabase
                .from("web_pages")
                .select("id, company_id, title, slug, content, meta_title, meta_description, template, template_id, status, is_published, published_at, sort_order, custom_fields, updated_at")
                .eq("company_id", activeCompany.id)
                .order("sort_order", { ascending: true })
                .order("title", { ascending: true });
            if (error) throw error;
            setPages((rows as WebPage[]) ?? []);

            const templateId = (activeCompany as any)?.active_template_id;
            if (templateId) {
                const tpl = await getTemplateById(Number(templateId));
                setTemplate(tpl);
            } else {
                setTemplate(null);
            }
        } catch (err: any) {
            toast.error(err?.message || "Failed to load pages");
        } finally {
            setLoading(false);
        }
    }, [activeCompany?.id]);

    useEffect(() => { refresh(); }, [refresh]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return pages;
        return pages.filter(
            (p) =>
                p.title.toLowerCase().includes(q) ||
                p.slug.toLowerCase().includes(q) ||
                (p.template ?? "").toLowerCase().includes(q),
        );
    }, [pages, query]);

    const pageFields = useMemo((): PageField[] => {
        if (!template || !editing) return [];
        const manifest = template.pages.find((p) => p.slug === editing.slug);
        return manifest?.fields ?? [];
    }, [template, editing?.slug]);

    const openEdit = (p: WebPage) => {
        const cf = (p.custom_fields ?? {}) as Record<string, unknown>;
        const customStrings: Record<string, string> = {};
        Object.entries(cf).forEach(([k, v]) => {
            if (k === "template_file") return;
            customStrings[k] = v == null ? "" : typeof v === "string" ? v : JSON.stringify(v);
        });
        setEditing({
            id: p.id,
            title: p.title,
            slug: p.slug,
            meta_title: p.meta_title ?? "",
            meta_description: p.meta_description ?? "",
            is_published: !!p.is_published,
            content: p.content ?? "",
            custom_fields: customStrings,
        });
    };

    const handleSave = async () => {
        if (!editing) return;
        setSaving(true);
        try {
            const mergedFields: Record<string, unknown> = { ...editing.custom_fields };
            // Preserve template_file (non-editable)
            const original = pages.find((p) => p.id === editing.id);
            if (original?.custom_fields?.template_file) {
                mergedFields.template_file = original.custom_fields.template_file;
            }
            // Parse JSON fields back to objects if they look parseable
            for (const field of pageFields) {
                if (field.type === "json" && typeof mergedFields[field.key] === "string") {
                    try {
                        mergedFields[field.key] = JSON.parse(mergedFields[field.key] as string);
                    } catch {
                        // leave as string — admin can fix on next save
                    }
                }
            }

            const { error } = await supabase
                .from("web_pages")
                .update({
                    title: editing.title.trim(),
                    slug: editing.slug.trim(),
                    meta_title: editing.meta_title.trim() || null,
                    meta_description: editing.meta_description.trim() || null,
                    content: editing.content,
                    custom_fields: mergedFields,
                    is_published: editing.is_published,
                    status: editing.is_published ? "published" : "draft",
                    published_at: editing.is_published ? new Date().toISOString() : null,
                })
                .eq("id", editing.id);
            if (error) throw error;
            toast.success("Page saved");
            setEditing(null);
            await refresh();
        } catch (err: any) {
            toast.error(err?.message || "Failed to save page");
        } finally {
            setSaving(false);
        }
    };

    const togglePublish = async (p: WebPage) => {
        try {
            const next = !p.is_published;
            const { error } = await supabase
                .from("web_pages")
                .update({
                    is_published: next,
                    status: next ? "published" : "draft",
                    published_at: next ? new Date().toISOString() : null,
                })
                .eq("id", p.id);
            if (error) throw error;
            await refresh();
        } catch (err: any) {
            toast.error(err?.message || "Failed to toggle publish");
        }
    };

    const handleReseed = async () => {
        if (!template || !activeCompany?.id) return;
        if (!confirm("Re-seed pages from the active template? Existing page content is preserved; only missing pages are added.")) return;
        setReseeding(true);
        try {
            await seedWebPagesForTenant(activeCompany.id, template);
            toast.success("Pages synced from template");
            await refresh();
        } catch (err: any) {
            toast.error(err?.message || "Failed to re-seed");
        } finally {
            setReseeding(false);
        }
    };

    if (!activeCompany) {
        return (
            <div className="min-h-full flex items-center justify-center p-8">
                <p className="text-sm text-muted-foreground">Please select a company to manage its pages.</p>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-background">
            <div className="sticky top-0 z-30 bg-card border-b border-border">
                <div className="max-w-6xl mx-auto px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" /> Website Pages
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            {template
                                ? <>Active template: <span className="text-foreground font-medium">{template.name}</span> · {pages.length} page{pages.length === 1 ? "" : "s"}</>
                                : "No active template — pick one from Storefront to seed pages."}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {template && (
                            <Button variant="outline" size="sm" onClick={handleReseed} disabled={reseeding}>
                                {reseeding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCcw className="w-3.5 h-3.5" />}
                                Sync from template
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-5 py-5 space-y-4">
                <div className="relative max-w-sm">
                    <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <Input
                        placeholder="Search pages…"
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
                    <div className="py-16 text-center space-y-2">
                        <Sparkles className="w-8 h-8 mx-auto text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                            {pages.length === 0 ? "No pages yet." : "No pages match your search."}
                        </p>
                        {pages.length === 0 && (
                            <p className="text-xs text-muted-foreground">
                                Activate a template from <strong>Storefront</strong> to auto-seed its pages here.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs text-muted-foreground">
                                <tr>
                                    <th className="text-left font-medium px-3 py-2">Page</th>
                                    <th className="text-left font-medium px-3 py-2">Slug</th>
                                    <th className="text-left font-medium px-3 py-2">Status</th>
                                    <th className="text-left font-medium px-3 py-2">Updated</th>
                                    <th className="text-right font-medium px-3 py-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((p) => {
                                    const templateFile = (p.custom_fields as any)?.template_file as string | undefined;
                                    const manifestPage = template?.pages.find((pg) => pg.slug === p.slug);
                                    const isEditable = manifestPage?.is_editable ?? true;

                                    return (
                                        <tr key={p.id} className="border-t border-border">
                                            <td className="px-3 py-2.5">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-foreground truncate">{p.title}</p>
                                                        {templateFile && (
                                                            <p className="text-[11px] text-muted-foreground truncate">
                                                                {templateFile}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-3 py-2.5 text-muted-foreground font-mono text-xs">/{p.slug}</td>
                                            <td className="px-3 py-2.5">
                                                <button onClick={() => togglePublish(p)}>
                                                    <Badge variant={p.is_published ? "success" : "secondary"}>
                                                        {p.is_published ? "Published" : "Draft"}
                                                    </Badge>
                                                </button>
                                            </td>
                                            <td className="px-3 py-2.5 text-xs text-muted-foreground">
                                                {p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "—"}
                                            </td>
                                            <td className="px-3 py-2.5 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    {activeCompany.subdomain && (
                                                        <Button size="xs" variant="ghost" asChild title="View live">
                                                            <a
                                                                href={`/store/${activeCompany.subdomain}${p.slug === "home" ? "" : `?preview_page=${p.slug}`}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    <Button size="xs" variant="ghost" onClick={() => togglePublish(p)} title={p.is_published ? "Unpublish" : "Publish"}>
                                                        {p.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                    </Button>
                                                    <Button
                                                        size="xs"
                                                        variant="ghost"
                                                        onClick={() => openEdit(p)}
                                                        title={isEditable ? "Edit page" : "Edit meta only"}
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Edit dialog */}
            <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null); }}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit page</DialogTitle>
                        <DialogDescription>
                            Content edits are stored per-page in <code className="text-[11px]">custom_fields</code> and loaded by the template at runtime.
                        </DialogDescription>
                    </DialogHeader>
                    {editing && (
                        <div className="space-y-3 py-1 max-h-[65vh] overflow-y-auto pr-1">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field label="Title">
                                    <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                                </Field>
                                <Field label="Slug">
                                    <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
                                </Field>
                                <Field label="Meta title">
                                    <Input value={editing.meta_title} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} />
                                </Field>
                                <Field label="Meta description">
                                    <Input value={editing.meta_description} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} />
                                </Field>
                            </div>

                            {pageFields.length > 0 && (
                                <div className="space-y-2 pt-2 border-t border-border">
                                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">Page content</p>
                                    {pageFields.map((f) => (
                                        <Field key={f.key} label={f.label}>
                                            {f.type === "textarea" || f.type === "markdown" || f.type === "json" ? (
                                                <textarea
                                                    value={editing.custom_fields[f.key] ?? ""}
                                                    onChange={(e) => setEditing({ ...editing, custom_fields: { ...editing.custom_fields, [f.key]: e.target.value } })}
                                                    className={cn(
                                                        "w-full min-h-[90px] rounded-md border border-input bg-background px-3 py-2 text-sm",
                                                        f.type === "json" && "font-mono text-xs",
                                                    )}
                                                    placeholder={f.placeholder}
                                                />
                                            ) : (
                                                <Input
                                                    type={f.type === "number" ? "number" : f.type === "url" ? "url" : "text"}
                                                    value={editing.custom_fields[f.key] ?? ""}
                                                    onChange={(e) => setEditing({ ...editing, custom_fields: { ...editing.custom_fields, [f.key]: e.target.value } })}
                                                    placeholder={f.placeholder}
                                                />
                                            )}
                                        </Field>
                                    ))}
                                </div>
                            )}

                            <div className="pt-2 border-t border-border">
                                <label className="inline-flex items-center gap-2 text-xs font-medium">
                                    <input
                                        type="checkbox"
                                        checked={editing.is_published}
                                        onChange={(e) => setEditing({ ...editing, is_published: e.target.checked })}
                                    />
                                    Published (visible on the storefront)
                                </label>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setEditing(null)} disabled={saving}>Cancel</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : "Save"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <Label className="text-xs">{label}</Label>
            {children}
        </div>
    );
}
