import { useEffect, useMemo, useState } from "react";
import { saveAs } from "file-saver";
import { toast } from "sonner";
import {
    CheckCircle2, Clock, Download, ExternalLink, Loader2, Package,
    RefreshCw, Rocket, Search, XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    listAllDeployments,
    markDeployed,
    cancelDeployment,
    buildDeploymentZip,
    type TemplateDeploymentStatus,
    type TemplateDeploymentWithJoins,
} from "@/lib/services/deploymentRequestService";
import { cn } from "@/lib/utils";

const STATUS_FILTERS: { label: string; value: "all" | TemplateDeploymentStatus }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "requested" },
    { label: "Deployed", value: "deployed" },
    { label: "Cancelled", value: "cancelled" },
];

export default function Deployments() {
    const [rows, setRows] = useState<TemplateDeploymentWithJoins[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<"all" | TemplateDeploymentStatus>("all");
    const [q, setQ] = useState("");
    const [generatingId, setGeneratingId] = useState<number | null>(null);
    const [markingFor, setMarkingFor] = useState<TemplateDeploymentWithJoins | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const data = await listAllDeployments(
                statusFilter === "all" ? undefined : { status: statusFilter },
            );
            setRows(data);
        } catch (err: any) {
            toast.error(err?.message || "Failed to load deployment requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [statusFilter]);

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        if (!needle) return rows;
        return rows.filter((r) =>
            r.custom_domain?.toLowerCase().includes(needle) ||
            r.company?.name?.toLowerCase().includes(needle) ||
            r.template?.name?.toLowerCase().includes(needle) ||
            r.template_slug?.toLowerCase().includes(needle) ||
            r.module_id?.toLowerCase().includes(needle),
        );
    }, [rows, q]);

    const handleGenerateZip = async (row: TemplateDeploymentWithJoins) => {
        setGeneratingId(row.id);
        try {
            const { blob, fileName } = await buildDeploymentZip(row);
            saveAs(blob, fileName);
            toast.success(`${fileName} downloaded — deploy it and mark it as deployed.`);
        } catch (err: any) {
            toast.error(err?.message || "Failed to generate zip");
        } finally {
            setGeneratingId(null);
        }
    };

    const handleCancel = async (row: TemplateDeploymentWithJoins) => {
        if (!window.confirm(`Cancel deployment request for ${row.custom_domain}?`)) return;
        try {
            await cancelDeployment(row.id);
            toast.success("Request cancelled");
            load();
        } catch (err: any) {
            toast.error(err?.message || "Failed to cancel");
        }
    };

    return (
        <div className="min-h-full bg-background">
            <div className="sticky top-0 z-20 bg-card border-b border-border">
                <div className="max-w-7xl mx-auto px-5 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <Rocket className="w-4 h-4 text-primary" /> Template deployments
                        </h1>
                        <p className="text-xs text-muted-foreground">
                            Tenant-submitted deployment requests. Generate a zip, deploy it externally, then mark it deployed with the final URL.
                        </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={load} disabled={loading}>
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} /> Refresh
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-5 py-5 space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[220px] max-w-md">
                        <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <Input
                            placeholder="Search by domain, company, template…"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <div className="flex items-center gap-1.5">
                        {STATUS_FILTERS.map((f) => (
                            <button
                                key={f.value}
                                onClick={() => setStatusFilter(f.value)}
                                className={cn(
                                    "h-8 px-3 rounded-md text-xs font-medium border transition-colors",
                                    statusFilter === f.value
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-card text-foreground border-border hover:bg-accent",
                                )}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>#</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Module</TableHead>
                                <TableHead>Template</TableHead>
                                <TableHead>Custom domain</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Requested</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                                        <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Loading…
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                                        No deployment requests {statusFilter !== "all" ? `with status "${statusFilter}"` : "yet"}.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="text-xs font-mono text-muted-foreground">{r.id}</TableCell>
                                        <TableCell className="text-xs">
                                            <div className="font-medium text-foreground">{r.company?.name ?? `#${r.company_id}`}</div>
                                            {r.company?.slug && (
                                                <div className="text-[10px] text-muted-foreground">{r.company.slug}</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs capitalize">{r.module_id}</TableCell>
                                        <TableCell className="text-xs">
                                            {r.template?.name ?? r.template_slug}
                                            {r.template_category && (
                                                <div className="text-[10px] text-muted-foreground">{r.template_category}</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono">{r.custom_domain}</TableCell>
                                        <TableCell>
                                            <StatusBadge status={r.status} />
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {new Date(r.requested_at).toLocaleDateString()}
                                            <div className="text-[10px]">{new Date(r.requested_at).toLocaleTimeString()}</div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                {r.status === "deployed" && r.deployed_url && (
                                                    <Button asChild size="sm" variant="ghost">
                                                        <a href={r.deployed_url} target="_blank" rel="noreferrer">
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                        </a>
                                                    </Button>
                                                )}
                                                {r.status !== "cancelled" && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleGenerateZip(r)}
                                                        disabled={generatingId === r.id}
                                                    >
                                                        {generatingId === r.id ? (
                                                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Building…</>
                                                        ) : (
                                                            <><Download className="w-3.5 h-3.5" /> Zip</>
                                                        )}
                                                    </Button>
                                                )}
                                                {r.status === "requested" && (
                                                    <Button size="sm" onClick={() => setMarkingFor(r)}>
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark deployed
                                                    </Button>
                                                )}
                                                {r.status === "requested" && (
                                                    <Button size="sm" variant="ghost" onClick={() => handleCancel(r)}>
                                                        <XCircle className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <MarkDeployedDialog
                row={markingFor}
                onClose={() => setMarkingFor(null)}
                onDone={() => { setMarkingFor(null); load(); }}
            />
        </div>
    );
}

function StatusBadge({ status }: { status: TemplateDeploymentStatus }) {
    if (status === "deployed") {
        return (
            <Badge className="bg-success/15 text-success border-success/30 hover:bg-success/20 gap-1">
                <CheckCircle2 className="w-3 h-3" /> Deployed
            </Badge>
        );
    }
    if (status === "requested") {
        return (
            <Badge className="bg-primary/15 text-primary border-primary/30 hover:bg-primary/20 gap-1">
                <Clock className="w-3 h-3" /> Pending
            </Badge>
        );
    }
    return (
        <Badge variant="secondary" className="gap-1">
            <XCircle className="w-3 h-3" /> Cancelled
        </Badge>
    );
}

function MarkDeployedDialog({
    row, onClose, onDone,
}: {
    row: TemplateDeploymentWithJoins | null;
    onClose: () => void;
    onDone: () => void;
}) {
    const [url, setUrl] = useState("");
    const [notes, setNotes] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (row) {
            const domain = row.custom_domain.replace(/^https?:\/\//, "");
            setUrl(`https://${domain}`);
            setNotes(row.notes ?? "");
        }
    }, [row?.id]);

    const handleSubmit = async () => {
        if (!row) return;
        if (!url.trim()) {
            toast.error("Deployed URL is required");
            return;
        }
        setSaving(true);
        try {
            await markDeployed(row.id, url.trim(), notes.trim() || undefined);
            toast.success("Marked as deployed");
            onDone();
        } catch (err: any) {
            toast.error(err?.message || "Failed to mark deployed");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={!!row} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" /> Mark deployment as deployed
                    </DialogTitle>
                    <DialogDescription>
                        {row?.company?.name ?? `Company #${row?.company_id}`} · {row?.module_id} · {row?.custom_domain}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                    <div className="space-y-1">
                        <Label className="text-xs">Deployed URL <span className="text-destructive">*</span></Label>
                        <Input
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://shop.tenant.com"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label className="text-xs">Notes (optional)</Label>
                        <Input
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Deployed on VPS 2, SSL enabled, etc."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={saving || !url.trim()}>
                        {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving…</> : "Confirm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
