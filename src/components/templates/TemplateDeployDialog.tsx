import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    Download, Loader2, Check, ShieldCheck, ServerCog, FileArchive, FolderOpen, Globe2,
} from "lucide-react";

import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { StorefrontTemplate, TemplateConfigOverrides } from "@/types/storefront";
import { setActiveTemplateForCompany } from "@/lib/services/storefrontTemplateService";
import { downloadDeployBundle } from "@/lib/services/templateDeployService";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: StorefrontTemplate | null;
    companyId: number | string | null;
    companyName: string;
    /** Existing overrides on companies.template_config. */
    initialOverrides?: TemplateConfigOverrides;
    /** Called after activation + download completes. */
    onDeployed?: () => void;
};

/**
 * Post-selection dialog: lets the tenant fill in template-specific fields
 * (name, phone, WhatsApp, Razorpay key, …), activates the template against
 * their company, and downloads a ready-to-upload Hostinger ZIP with the
 * values baked into config.js.
 */
export function TemplateDeployDialog({
    open, onOpenChange, template, companyId, companyName,
    initialOverrides, onDeployed,
}: Props) {
    const [values, setValues] = useState<TemplateConfigOverrides>({});
    const [building, setBuilding] = useState(false);
    const [deployed, setDeployed] = useState<{ fileName: string; sizeBytes: number } | null>(null);

    const schema = useMemo(() => {
        const raw = template?.config_schema;
        if (!raw) return {};
        if (typeof raw === "string") {
            try { return JSON.parse(raw); } catch { return {}; }
        }
        if (typeof raw !== "object") return {};
        return raw as Record<string, any>;
    }, [template?.id]);
    const fields = useMemo(
        () => Object.entries(schema).filter(([, f]) => f && typeof f === "object"),
        [schema],
    );

    useEffect(() => {
        if (!open) {
            setDeployed(null);
            return;
        }
        const initial: TemplateConfigOverrides = {};
        for (const [key, field] of Object.entries(schema)) {
            const override = initialOverrides?.[key];
            if (override !== undefined && override !== null) {
                initial[key] = override;
            } else if (key === "storeName" && companyName) {
                initial[key] = companyName;
            } else if (field.default !== undefined) {
                initial[key] = field.default;
            }
        }
        setValues(initial);
    }, [open, template?.id, companyName]);

    const canDownload = useMemo(() => {
        for (const [key, field] of fields) {
            if (field?.required && !String(values[key] ?? "").trim()) return false;
        }
        return true;
    }, [values, fields]);

    if (!template) return null;

    const handleChange = (key: string, val: string) => {
        setValues((v) => ({ ...v, [key]: val }));
    };

    const handleDeploy = async () => {
        if (!companyId) {
            toast.error("No active company selected");
            return;
        }
        if (!canDownload) {
            toast.error("Please fill in all required fields");
            return;
        }
        setBuilding(true);
        try {
            await setActiveTemplateForCompany(companyId, template.id, values);
            const result = await downloadDeployBundle({
                template,
                companyId,
                companyName,
                overrides: values,
            });
            setDeployed(result);
            toast.success(`${template.name} bundle downloaded`);
            onDeployed?.();
        } catch (err: any) {
            toast.error(err?.message || "Failed to generate deploy bundle");
        } finally {
            setBuilding(false);
        }
    };

    const handleReDownload = async () => {
        if (!companyId) return;
        setBuilding(true);
        try {
            const result = await downloadDeployBundle({
                template,
                companyId,
                companyName,
                overrides: values,
            });
            setDeployed(result);
        } catch (err: any) {
            toast.error(err?.message || "Failed to regenerate bundle");
        } finally {
            setBuilding(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileArchive className="w-4 h-4 text-primary" />
                        Deploy {template.name}
                    </DialogTitle>
                    <DialogDescription>
                        Fill in your storefront details. We'll package a Hostinger-ready ZIP with your
                        Supabase credentials and company ID pre-configured.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-5 py-1 max-h-[60vh] overflow-y-auto pr-1">
                    {/* Form */}
                    <div className="md:col-span-3 space-y-3">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">
                            Template configuration
                        </p>
                        {fields.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                                This template has no configurable fields. Defaults will apply.
                            </p>
                        ) : (
                            fields.map(([key, field]) => (
                                <div key={key} className="space-y-1">
                                    <Label className="text-xs">
                                        {field.label} {field.required && <span className="text-destructive">*</span>}
                                    </Label>
                                    <Input
                                        type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : field.type === "url" ? "url" : "text"}
                                        value={String(values[key] ?? "")}
                                        onChange={(e) => handleChange(key, e.target.value)}
                                        placeholder={field.placeholder}
                                    />
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right panel — baked-in values + Hostinger steps */}
                    <div className="md:col-span-2 space-y-3">
                        <div className="bg-muted/40 border border-border rounded-lg p-3 space-y-2">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold inline-flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3" /> Auto-configured
                            </p>
                            <dl className="text-xs space-y-1">
                                <Row label="Company ID" value={String(companyId ?? "—")} />
                                <Row label="Company Name" value={companyName || "—"} />
                                <Row label="Supabase URL" value="(baked from env)" mono />
                                <Row label="Anon key" value="(baked from env)" mono />
                                <Row label="Template" value={`${template.slug} v${template.version}`} mono />
                            </dl>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1.5">
                            <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 inline-flex items-center gap-1.5">
                                <ServerCog className="w-3.5 h-3.5" /> Hostinger deployment
                            </p>
                            <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal list-inside leading-relaxed">
                                <li>Download the ZIP</li>
                                <li>hPanel → <strong>File Manager</strong> → open <code className="text-[10px]">public_html</code></li>
                                <li>Upload &amp; <strong>Extract</strong> the ZIP there</li>
                                <li>hPanel → <strong>Security</strong> → enable Force HTTPS</li>
                                <li>Open your domain — done 🎉</li>
                            </ol>
                            <p className="text-[11px] text-muted-foreground pt-1">
                                Full guide is inside the ZIP as <code className="text-[10px]">deploy-info.md</code>.
                            </p>
                        </div>
                    </div>
                </div>

                {deployed && (
                    <div className="mt-2 rounded-lg border border-success/30 bg-success/10 p-3 text-xs">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <Check className="w-4 h-4 text-success" />
                            <span>Bundle generated</span>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            <code className="text-[11px]">{deployed.fileName}</code>
                            <span className="ml-2">({(deployed.sizeBytes / 1024).toFixed(0)} KB)</span>
                        </p>
                        <p className="text-muted-foreground mt-1 inline-flex items-center gap-1.5">
                            <FolderOpen className="w-3 h-3" />
                            Check your browser's Downloads folder and follow the steps above.
                        </p>
                    </div>
                )}

                <DialogFooter className={cn("gap-2", deployed && "flex-wrap")}>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={building}>
                        Close
                    </Button>
                    {deployed ? (
                        <Button onClick={handleReDownload} disabled={building}>
                            {building ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Building…</> : <><Download className="w-3.5 h-3.5" /> Re-download</>}
                        </Button>
                    ) : (
                        <Button onClick={handleDeploy} disabled={building || !canDownload}>
                            {building ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Building bundle…</>
                            ) : (
                                <><Globe2 className="w-3.5 h-3.5" /> Activate &amp; Download ZIP</>
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className={cn("truncate max-w-[60%] text-foreground", mono && "font-mono text-[10px]")}>{value}</dd>
        </div>
    );
}
