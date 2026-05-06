import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
    Globe, Globe2, CheckCircle2, Clock, XCircle, ExternalLink, Copy,
    Loader2, ShoppingBag, ArrowRight, Check, AlertTriangle, RefreshCw,
    Search, Sparkles, Server, BadgeCheck, Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTenant } from "@/contexts/TenantContext";
import {
    checkDomainAvailability, purchaseDomain, listCompanyDomains,
    configureStoreDns, type DomainAvailability, type HostingerDomain,
} from "@/lib/services/hostingerService";
import {
    getActiveDeploymentForCompanyModule,
    type TemplateDeploymentWithJoins,
} from "@/lib/services/deploymentRequestService";

// ── helpers ───────────────────────────────────────────────────────────────────

function copy(text: string) {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied"));
}

const TLD_OPTIONS = [".com", ".in", ".net", ".org", ".co.in", ".store", ".shop"];

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusChip({ status }: { status: string }) {
    const map: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
        active:    { label: "Live",            cls: "bg-emerald-50 text-emerald-600 border-emerald-200", Icon: CheckCircle2 },
        pending:   { label: "Pending",         cls: "bg-amber-50  text-amber-600  border-amber-200",    Icon: Clock        },
        failed:    { label: "Failed",          cls: "bg-red-50    text-red-500    border-red-200",      Icon: XCircle      },
        cancelled: { label: "Cancelled",       cls: "bg-slate-100 text-slate-500  border-slate-200",   Icon: XCircle      },
        none:      { label: "Not configured",  cls: "bg-slate-100 text-slate-500  border-slate-200",   Icon: XCircle      },
    };
    const s = map[status] ?? map.none;
    return (
        <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border", s.cls)}>
            <s.Icon className="w-3.5 h-3.5" /> {s.label}
        </span>
    );
}

// ── Domain result card ────────────────────────────────────────────────────────

function DomainCard({
    result, purchasing, onPurchase,
}: {
    result: DomainAvailability;
    purchasing: boolean;
    onPurchase: (d: DomainAvailability) => void;
}) {
    return (
        <div className={cn(
            "flex items-center justify-between px-5 py-3.5 rounded-xl border transition-all",
            result.available
                ? "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"
                : "bg-slate-50 border-slate-100 opacity-60",
        )}>
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center",
                    result.available ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400",
                )}>
                    {result.available ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-800">{result.domain}</p>
                    <p className="text-xs text-slate-400">{result.available ? "Available" : "Taken"}</p>
                </div>
            </div>
            {result.available && (
                <div className="flex items-center gap-3">
                    {result.price != null && (
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">
                                {result.currency === "USD" ? "$" : "₹"}{result.price}
                            </p>
                            <p className="text-[10px] text-slate-400">/year</p>
                        </div>
                    )}
                    <Button
                        size="sm"
                        disabled={purchasing}
                        onClick={() => onPurchase(result)}
                        className="h-8 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5"
                    >
                        {purchasing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                        {purchasing ? "Buying…" : "Get domain"}
                    </Button>
                </div>
            )}
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DomainHosting() {
    const { activeCompany } = useTenant();

    // State
    const [ownedDomains, setOwnedDomains]     = useState<HostingerDomain[]>([]);
    const [deployment, setDeployment]          = useState<TemplateDeploymentWithJoins | null>(null);
    const [loading, setLoading]                = useState(true);
    const [searchQuery, setSearchQuery]        = useState("");
    const [searching, setSearching]            = useState(false);
    const [results, setResults]                = useState<DomainAvailability[]>([]);
    const [selectedTlds, setSelectedTlds]      = useState([".com", ".in", ".store"]);
    const [purchasing, setPurchasing]          = useState<string | null>(null);
    const [freeUrl, setFreeUrl]                = useState("");
    const debounceRef = useRef<ReturnType<typeof setTimeout>>();

    // Load company data on mount
    useEffect(() => {
        if (!activeCompany) return;
        setLoading(true);
        const baseDomain = (import.meta.env.VITE_PLATFORM_BASE_DOMAIN as string) || "smartseyali.com";
        const subdomain = (activeCompany as any).subdomain || String(activeCompany.id);
        Promise.all([
            listCompanyDomains(activeCompany.id),
            getActiveDeploymentForCompanyModule(activeCompany.id, "ecommerce"),
        ]).then(([domains, dep]) => {
            setOwnedDomains(domains);
            setDeployment(dep);
            // Free URL: subdomain.smartseyali.com (no /store/ prefix)
            setFreeUrl(`https://${subdomain}.${baseDomain}`);
        }).catch(console.error)
          .finally(() => setLoading(false));
    }, [activeCompany?.id]);

    // TLD toggle
    const toggleTld = (tld: string) =>
        setSelectedTlds(prev =>
            prev.includes(tld)
                ? prev.length > 1 ? prev.filter(t => t !== tld) : prev
                : [...prev, tld],
        );

    // Debounced domain search
    const handleSearch = useCallback(() => {
        const q = searchQuery.trim();
        if (!q || q.length < 2) { setResults([]); return; }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await checkDomainAvailability(q, selectedTlds);
                setResults(res);
            } catch (err: any) {
                toast.error(err.message || "Search failed");
            } finally {
                setSearching(false);
            }
        }, 600);
    }, [searchQuery, selectedTlds]);

    useEffect(() => { handleSearch(); }, [handleSearch]);

    // Purchase
    const handlePurchase = async (result: DomainAvailability) => {
        if (!activeCompany) return;
        setPurchasing(result.domain);
        try {
            await purchaseDomain(result.domain, activeCompany.id);
            toast.success(`${result.domain} purchased!`);

            // Auto-configure DNS to point to SmartSeyali
            try {
                await configureStoreDns(result.domain);
                toast.success("DNS configured automatically — your store will be live shortly.");
            } catch {
                toast("Domain purchased. Please configure DNS manually.", { icon: "⚠️" });
            }

            // Refresh owned list
            const updated = await listCompanyDomains(activeCompany.id);
            setOwnedDomains(updated);
            setResults(prev => prev.filter(r => r.domain !== result.domain));
        } catch (err: any) {
            toast.error(err.message || "Purchase failed");
        } finally {
            setPurchasing(null);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────

    if (loading) return (
        <div className="p-8 flex items-center justify-center h-64 gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 opacity-40" />
            <span className="text-sm text-slate-500">Loading domain info…</span>
        </div>
    );

    return (
        <div className="p-8 pb-24 space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">

            {/* ── Header ─────────────────────────────────────────────── */}
            <div className="pb-6 border-b border-slate-100">
                <p className="text-xs font-bold tracking-widest text-slate-400 mb-1">PUBLISHING</p>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <Globe className="w-6 h-6 text-blue-600" /> Domain & Hosting
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Search, buy and publish your store — all from here. No external sign-ups needed.
                </p>
            </div>

            {/* ── Active domains ─────────────────────────────────────── */}
            {ownedDomains.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-bold tracking-widest text-slate-400">YOUR DOMAINS</p>
                        <button
                            onClick={async () => {
                                if (!activeCompany) return;
                                const d = await listCompanyDomains(activeCompany.id);
                                setOwnedDomains(d);
                            }}
                            className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Refresh
                        </button>
                    </div>
                    <div className="space-y-2">
                        {ownedDomains.map(d => (
                            <div key={d.domain} className={cn(
                                "flex items-center justify-between px-5 py-4 rounded-2xl border",
                                d.status === "active" ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200",
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-xl flex items-center justify-center",
                                        d.status === "active" ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400",
                                    )}>
                                        <Globe2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-slate-900">{d.domain}</p>
                                            {d.dns_configured && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                                                    <Wifi className="w-3 h-3" /> DNS Live
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            {d.expires_at
                                                ? `Expires ${new Date(d.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`
                                                : `Purchased ${d.purchased_at ? new Date(d.purchased_at).toLocaleDateString("en-IN") : "—"}`}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <StatusChip status={d.status} />
                                    <button onClick={() => copy(`https://${d.domain}`)} className="p-2 rounded-lg hover:bg-white text-slate-400 transition-colors">
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => window.open(`https://${d.domain}`, "_blank")} className="p-2 rounded-lg hover:bg-white text-slate-400 transition-colors">
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Free preview URL ───────────────────────────────────── */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                    <p className="text-xs font-bold tracking-widest text-slate-500">FREE PREVIEW LINK</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5">
                    <code className="text-xs font-mono text-blue-600 flex-1 break-all">{freeUrl}</code>
                    <button onClick={() => copy(freeUrl)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
                        <Copy className="w-3.5 h-3.5" />
                    </button>
                </div>
                <p className="text-xs text-slate-400">Share this link any time — always works, no domain needed.</p>
            </div>

            {/* ── Domain search ──────────────────────────────────────── */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-blue-500" />
                        <p className="text-sm font-bold text-slate-800">Find your perfect domain</p>
                    </div>
                    <p className="text-xs text-slate-400 ml-6">
                        Search and buy a domain instantly — it gets hosted on our platform automatically.
                    </p>
                </div>

                {/* Search input */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSearch()}
                        placeholder="Type your store name… e.g. myshop"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/8 outline-none transition-all"
                    />
                    {searching && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />}
                </div>

                {/* TLD selector */}
                <div className="flex flex-wrap gap-2">
                    <span className="text-xs font-bold text-slate-400 self-center mr-1">Extensions:</span>
                    {TLD_OPTIONS.map(tld => (
                        <button
                            key={tld}
                            onClick={() => toggleTld(tld)}
                            className={cn(
                                "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all",
                                selectedTlds.includes(tld)
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300",
                            )}
                        >
                            {tld}
                        </button>
                    ))}
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div className="space-y-2">
                        {/* Available first */}
                        {results.filter(r => r.available).map(r => (
                            <DomainCard
                                key={r.domain}
                                result={r}
                                purchasing={purchasing === r.domain}
                                onPurchase={handlePurchase}
                            />
                        ))}
                        {/* Taken */}
                        {results.filter(r => !r.available).map(r => (
                            <DomainCard
                                key={r.domain}
                                result={r}
                                purchasing={false}
                                onPurchase={() => {}}
                            />
                        ))}
                    </div>
                )}

                {searchQuery.length > 1 && !searching && results.length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4">
                        No results yet — try a different name or add more extensions above.
                    </p>
                )}
            </div>

            {/* ── What happens when you buy ─────────────────────────── */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-bold text-blue-800">What happens after purchase</p>
                </div>
                <ol className="space-y-3">
                    {[
                        ["Domain is registered",         "The domain is added to our hosting account on Hostinger instantly."],
                        ["DNS is auto-configured",       "We automatically point the domain to your store — no manual DNS editing."],
                        ["SSL certificate is issued",    "HTTPS is enabled automatically within a few minutes."],
                        ["Store goes live",              "Your store is accessible at your new domain, fully powered by SmartSeyali."],
                    ].map(([title, desc], i) => (
                        <li key={i} className="flex gap-3">
                            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                {i + 1}
                            </span>
                            <div>
                                <p className="text-sm font-bold text-blue-800">{title}</p>
                                <p className="text-xs text-blue-600 mt-0.5">{desc}</p>
                            </div>
                        </li>
                    ))}
                </ol>
            </div>

            {/* ── No template warning ────────────────────────────────── */}
            {!deployment && (
                <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-800">Choose a store template first</p>
                        <p className="text-xs text-amber-700 mt-1">
                            You need to select a storefront design during onboarding before your domain can be fully activated.
                            Contact support or re-run the setup wizard if you skipped this step.
                        </p>
                    </div>
                </div>
            )}

        </div>
    );
}
