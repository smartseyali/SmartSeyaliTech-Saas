import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
    Loader2, Check, ShieldCheck, Globe2, Send, ClockAlert,
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
import {
    createDeploymentRequest,
    getActiveDeploymentForCompanyModule,
} from "@/lib/services/deploymentRequestService";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    template: StorefrontTemplate | null;
    companyId: number | string | null;
    companyName: string;
    /** Module the request is for — required to key the deployment row. */
    moduleId: string;
    /** Existing overrides on companies.template_config. */
    initialOverrides?: TemplateConfigOverrides;
    /** Existing custom_domain from a prior request (prefill). */
    initialCustomDomain?: string;
    /** Called after the deployment request is recorded. */
    onRequested?: () => void;
};

/**
 * Tenant-side request dialog.
 *
 * The tenant picks template config + a custom domain. We save the choice
 * against their company (active_template_id + template_config) and insert
 * a template_deployments row with status='requested'. The super admin
 * later generates the zip and deploys it externally.
 */
export function TemplateDeployDialog({
    open, onOpenChange, template, companyId, companyName,
    moduleId, initialOverrides, initialCustomDomain, onRequested,
}: Props) {
    const [values, setValues] = useState<TemplateConfigOverrides>({});
    const [customDomain, setCustomDomain] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState<{ id: number; domain: string } | null>(null);

    const schema = useMemo(() => {
        const raw = template?.config_schema;
        if (!raw) return {};
        if (typeof raw === "string") {
            try { return JSON.parse(raw); } catch { return {}; }
        }
        if (typeof raw !== "object") return {};
        return raw as Record<string, any>;
    }, [template?.id]);

    type SchemaField = {
        type?: string;
        label?: string;
        required?: boolean;
        default?: string;
        placeholder?: string;
    };
    const fields = useMemo(
        () =>
            Object.entries(schema)
                .filter(([, f]) => f && typeof f === "object")
                .map(([k, f]) => [k, f as SchemaField] as const),
        [schema],
    );

    useEffect(() => {
        if (!open) {
            setSubmitted(null);
            return;
        }
        const initial: TemplateConfigOverrides = {};
        for (const [key, raw] of Object.entries(schema)) {
            const field = raw as SchemaField;
            const override = initialOverrides?.[key];
            if (override !== undefined && override !== null) {
                initial[key] = override;
            } else if (key === "storeName" && companyName) {
                initial[key] = companyName;
            } else if (field?.default !== undefined) {
                initial[key] = field.default;
            }
        }
        setValues(initial);
        setCustomDomain(initialCustomDomain ?? "");
    }, [open, template?.id, companyName]);

    const domainValid = useMemo(() => {
        const d = customDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
        // quick RFC-1035 host check: label.label with at least one dot
        return /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i.test(d);
    }, [customDomain]);

    const canSubmit = useMemo(() => {
        if (!domainValid) return false;
        for (const [key, field] of fields) {
            if (field?.required && !String(values[key] ?? "").trim()) return false;
        }
        return true;
    }, [values, fields, domainValid]);

    if (!template) return null;

    const handleChange = (key: string, val: string) => {
        setValues((v) => ({ ...v, [key]: val }));
    };

    const handleSubmit = async () => {
        if (!companyId) {
            toast.error("No active company selected");
            return;
        }
        if (!canSubmit) {
            toast.error(domainValid ? "Please fill in all required fields" : "Enter a valid custom domain");
            return;
        }
        const cleanDomain = customDomain.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
        setSubmitting(true);
        try {
            // Prevent overwriting an already-deployed row by the tenant.
            const existing = await getActiveDeploymentForCompanyModule(companyId, moduleId);
            if (existing && existing.status === "deployed") {
                const ok = window.confirm(
                    "Your module is already deployed. Submitting again will replace the current request and require a fresh deployment. Continue?",
                );
                if (!ok) {
                    setSubmitting(false);
                    return;
                }
            }

            await setActiveTemplateForCompany(companyId, template.id, values);
            const req = await createDeploymentRequest({
                companyId,
                moduleId,
                templateId: template.id,
                customDomain: cleanDomain,
                configOverrides: values,
            });
            setSubmitted({ id: req.id, domain: cleanDomain });
            toast.success("Deployment requested. Super admin will deploy shortly.");
            onRequested?.();
        } catch (err: any) {
            toast.error(err?.message || "Failed to submit deployment request");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Send className="w-4 h-4 text-primary" />
                        Request deployment — {template.name}
                    </DialogTitle>
                    <DialogDescription>
                        Pick your custom domain and fill in the template-specific fields. We'll notify
                        the super admin to deploy your site to that domain.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-5 py-1 max-h-[60vh] overflow-y-auto pr-1">
                    {/* Form */}
                    <div className="md:col-span-3 space-y-3">
                        <div className="space-y-1">
                            <Label className="text-xs inline-flex items-center gap-1.5">
                                <Globe2 className="w-3.5 h-3.5" />
                                Custom domain <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                type="text"
                                value={customDomain}
                                onChange={(e) => setCustomDomain(e.target.value)}
                                placeholder="shop.yourcompany.com"
                                autoComplete="off"
                                spellCheck={false}
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Point this domain's DNS A/CNAME record to the super admin's server before the final deployment.
                            </p>
                            {!domainValid && customDomain.length > 0 && (
                                <p className="text-[11px] text-destructive">
                                    Enter a valid domain like <code>shop.example.com</code>
                                </p>
                            )}
                        </div>

                        <div className="h-px bg-border my-3" />

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

                    {/* Right panel */}
                    <div className="md:col-span-2 space-y-3">
                        <div className="bg-muted/40 border border-border rounded-lg p-3 space-y-2">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold inline-flex items-center gap-1.5">
                                <ShieldCheck className="w-3 h-3" /> Auto-configured
                            </p>
                            <dl className="text-xs space-y-1">
                                <Row label="Company" value={`${companyName || `#${companyId}`}`} />
                                <Row label="Module" value={moduleId} />
                                <Row label="Template" value={`${template.slug} v${template.version}`} mono />
                            </dl>
                        </div>

                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1.5">
                            <p className="text-xs font-semibold text-primary-700 dark:text-primary-300 inline-flex items-center gap-1.5">
                                <ClockAlert className="w-3.5 h-3.5" /> What happens next
                            </p>
                            <ol className="text-[11px] text-muted-foreground space-y-0.5 list-decimal list-inside leading-relaxed">
                                <li>Your request enters the super-admin deployment queue.</li>
                                <li>Super admin generates a ZIP bundle with your settings.</li>
                                <li>They deploy it to your custom domain.</li>
                                <li>You'll see the live site in the admin preview.</li>
                            </ol>
                        </div>
                    </div>
                </div>

                {submitted && (
                    <div className="mt-2 rounded-lg border border-success/30 bg-success/10 p-3 text-xs">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                            <Check className="w-4 h-4 text-success" />
                            <span>Request #{submitted.id} submitted</span>
                        </div>
                        <p className="text-muted-foreground mt-1">
                            Target domain: <code className="text-[11px]">{submitted.domain}</code>
                        </p>
                    </div>
                )}

                <DialogFooter className={cn("gap-2", submitted && "flex-wrap")}>
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={submitting}>
                        {submitted ? "Close" : "Cancel"}
                    </Button>
                    {!submitted && (
                        <Button onClick={handleSubmit} disabled={submitting || !canSubmit}>
                            {submitting ? (
                                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting…</>
                            ) : (
                                <><Send className="w-3.5 h-3.5" /> Submit request</>
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
