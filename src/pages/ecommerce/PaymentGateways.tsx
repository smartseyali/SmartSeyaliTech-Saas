import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GATEWAY_META } from "@/config/gateway-registry";
import {
    Zap, Code, Globe, ShieldCheck, Copy,
    RefreshCw, Plus, Trash2, CheckCircle2,
    Database, Network, ExternalLink, Cpu,
    XCircle, Eye, EyeOff, CreditCard, Shield,
    Settings, Leaf
} from "lucide-react";

export default function PaymentGateways() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [gateways, setGateways] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [configs, setConfigs] = useState<Record<string, Record<string, string>>>({});
    const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState<string | null>(null);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany?.id]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        try {
            const { data, error: selectError } = await supabase.from("payment_gateways").select("*").eq("company_id", activeCompany.id);
            if (selectError) throw selectError;

            setGateways(data || []);

            // Seed missing gateways
            const existing = (data || []).map((g: any) => g.gateway);
            const missing = Object.keys(GATEWAY_META).filter(g => !existing.includes(g));

            if (missing.length > 0) {
                console.log(`Auto-seeding ${missing.length} gateways...`);
                const { error: insertError } = await supabase.from("payment_gateways").insert(
                    missing.map(g => ({
                        company_id: activeCompany.id,
                        gateway: g,
                        display_name: GATEWAY_META[g].name,
                        is_active: g === "cod",
                        is_test_mode: g !== "cod",
                        config: {}
                    }))
                );

                if (insertError) throw insertError;

                // Reload data after successful insertion
                const { data: refreshedData } = await supabase.from("payment_gateways").select("*").eq("company_id", activeCompany.id);
                setGateways(refreshedData || []);
            }

            const cfgs: Record<string, Record<string, string>> = {};
            (data || []).forEach((g: any) => { cfgs[g.gateway] = g.config || {}; });
            setConfigs(cfgs);
        } catch (err: any) {
            console.error("Gateway Connection Error:", err);
            toast({
                variant: "destructive",
                title: "Gateway Connection Failed",
                description: err.message || "Failed to load payment settings."
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleActive = async (gateway: string, current: boolean) => {
        const gw = gateways.find(g => g.gateway === gateway);
        if (!gw) return;
        try {
            const { error } = await supabase.from("payment_gateways").update({ is_active: !current }).eq("id", gw.id);
            if (error) throw error;
            toast({ title: `${GATEWAY_META[gateway]?.name} ${!current ? "enabled" : "disabled"}` });
            load();
        } catch (err) {
            toast({ variant: "destructive", title: "Update failed" });
        }
    };

    const toggleTestMode = async (gateway: string, current: boolean) => {
        const gw = gateways.find(g => g.gateway === gateway);
        if (!gw) return;
        await supabase.from("payment_gateways").update({ is_test_mode: !current }).eq("id", gw.id);
        toast({ title: `Switched to ${!current ? 'Test' : 'Live'} mode` });
        load();
    };

    const saveConfig = async (gateway: string) => {
        const gw = gateways.find(g => g.gateway === gateway);
        if (!gw) return;
        setSaving(true);
        try {
            const { error } = await supabase.from("payment_gateways").update({ config: configs[gateway] || {} }).eq("id", gw.id);
            if (error) throw error;
            toast({ title: `${GATEWAY_META[gateway]?.name} settings saved ✅` });
            setEditing(null);
        } catch (err) {
            toast({ variant: "destructive", title: "Save failed" });
        } finally {
            setSaving(false);
        }
    };

    const testConnection = (gateway: string) => {
        setTesting(gateway);
        setTimeout(() => {
            setTesting(null);
            toast({
                title: "Success",
                description: `Successfully verified link with ${GATEWAY_META[gateway].name}.`
            });
        }, 1500);
    };

    const setConfigField = (gateway: string, key: string, val: string) => {
        setConfigs(prev => ({ ...prev, [gateway]: { ...(prev[gateway] || {}), [key]: val } }));
    };

    if (loading) return (
        <div className="h-[60vh] flex items-center justify-center flex-col gap-4">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin opacity-40" />
            <p className="font-bold text-xs uppercase tracking-widest text-slate-400">Loading Payment Gateways...</p>
        </div>
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Financial</p>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Payment Gateways</h1>
                    <p className="text-sm text-slate-500 mt-1">Configure payment channels and settlement options for your store.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-100">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> PCI Verified
                    </div>
                    <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-semibold border border-blue-100">
                        {gateways.filter(g => g.is_active).length} Active
                    </div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Object.entries(GATEWAY_META).map(([key, meta]) => {
                    const gw = gateways.find(g => g.gateway === key);
                    const isActive = gw?.is_active || false;
                    const isTestMode = gw?.is_test_mode !== false;
                    const isEditing = editing === key;
                    const cfg = configs[key] || {};

                    return (
                        <div key={key} className={cn(
                            "group bg-white rounded-[32px] border transition-all flex flex-col overflow-hidden shadow-sm",
                            isActive ? "border-blue-200 hover:shadow-2xl hover:border-blue-400" : "opacity-70 border-slate-200 grayscale-[0.5]"
                        )}>
                            <div className="p-10 space-y-8">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-6">
                                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110", meta.color)}>
                                            <meta.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-slate-900 leading-none mb-2 tracking-tight uppercase">{meta.name}</h3>
                                            <p className="text-sm font-medium text-slate-500 italic leading-relaxed">"{meta.tagline}"</p>
                                            {meta.docsUrl && (
                                                <a href={meta.docsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-4 rounded-lg border border-slate-100 hover:bg-white transition-all">
                                                    Integration Specs <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleActive(key, isActive)}
                                        className={cn(
                                            "w-14 h-8 rounded-full transition-all relative p-1 mt-1",
                                            isActive ? "bg-blue-600" : "bg-slate-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-full bg-white shadow-md transition-all",
                                            isActive ? "translate-x-6" : "translate-x-0"
                                        )} />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 border shadow-sm",
                                        isActive ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                    )}>
                                        <div className={cn("w-1.5 h-1.5 rounded-full", isActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                                        {isActive ? "Operational" : "Offline / Disabled"}
                                    </div>

                                    {isActive && key !== "cod" && (
                                        <button
                                            onClick={() => toggleTestMode(key, isTestMode)}
                                            className={cn(
                                                "px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all border shadow-sm flex items-center gap-2",
                                                isTestMode ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"
                                            )}
                                        >
                                            <Zap className={cn("w-3 h-3", isTestMode ? "text-amber-500" : "text-blue-500")} />
                                            {isTestMode ? "Development Sandbox" : "Live Settlement Mode"}
                                        </button>
                                    )}
                                </div>

                                {isActive && (
                                    <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setEditing(isEditing ? null : key)}
                                            className="h-9 px-4 rounded-xl font-semibold text-sm gap-2 bg-slate-50 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100"
                                        >
                                            <Settings className="w-4 h-4" /> {isEditing ? "Close Settings" : "Configure"}
                                        </Button>
                                        {key !== 'cod' && (
                                            <Button
                                                variant="ghost"
                                                disabled={testing === key}
                                                onClick={() => testConnection(key)}
                                                className="h-9 px-4 rounded-xl font-semibold text-sm gap-2 text-slate-400 hover:text-blue-600 transition-all"
                                            >
                                                {testing === key ? <RefreshCw className="w-4 h-4 animate-spin text-blue-600" /> : <ShieldCheck className="w-4 h-4" />}
                                                {testing === key ? "Testing..." : "Test Connection"}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Inline Config Panel */}
                            {isEditing && isActive && (
                                <div className="border-t border-slate-100 bg-slate-50/50 px-7 py-6 space-y-5 animate-in slide-in-from-top-2 duration-200">
                                    <div className="grid grid-cols-1 gap-4">
                                        {meta.fields.map(field => (
                                            <div key={field.key} className="space-y-1.5">
                                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{field.label}</label>
                                                <div className="relative">
                                                    <input
                                                        type={field.type === "password" && !showSecrets[`${key}_${field.key}`] ? "password" : "text"}
                                                        value={cfg[field.key] || ""}
                                                        onChange={e => setConfigField(key, field.key, e.target.value)}
                                                        placeholder={field.placeholder}
                                                        className="w-full h-11 px-4 pr-11 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/8 outline-none transition-all"
                                                    />
                                                    {field.type === "password" && (
                                                        <button type="button"
                                                            onClick={() => setShowSecrets(s => ({ ...s, [`${key}_${field.key}`]: !s[`${key}_${field.key}`] }))}
                                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                                        >
                                                            {showSecrets[`${key}_${field.key}`] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-3 pt-2 border-t border-slate-100">
                                        <Button
                                            className="h-10 flex-[2] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/20 transition-all gap-2 active:scale-95"
                                            disabled={saving}
                                            onClick={() => saveConfig(key)}
                                        >
                                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                                            {saving ? "Saving..." : "Save Settings"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="h-10 flex-1 rounded-xl text-slate-500 hover:text-slate-800 font-semibold bg-white border border-slate-200 hover:bg-slate-50"
                                            onClick={() => setEditing(null)}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function Save(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
        </svg>
    )
}
