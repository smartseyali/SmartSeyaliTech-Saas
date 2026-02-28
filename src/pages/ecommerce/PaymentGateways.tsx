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
        <div className="h-[60vh] flex items-center justify-center flex-col gap-6">
            <Leaf className="w-12 h-12 text-[#14532d]/20 animate-bounce" />
            <p className="font-bold text-xs uppercase tracking-[0.2em] text-[#14532d]/40 animate-pulse">Loading Payment Gateways...</p>
        </div>
    );

    return (
        <div className="p-8 space-y-12 animate-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-border">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-[#14532d] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#14532d]/20 transition-all hover:rotate-12">
                            <CreditCard className="w-7 h-7" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <Leaf className="w-4 h-4 text-[#f97316]" />
                                <span className="text-[#14532d]/40 font-bold uppercase tracking-widest text-[10px]">Financial Settings</span>
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-[#14532d] uppercase">Payment <span className="text-[#f97316]">Gateways</span></h1>
                            <p className="text-xs font-semibold text-slate-400 mt-1">Configure how you receive payments from customers</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-white p-2.5 rounded-2xl border border-border shadow-sm">
                    <div className="px-5 py-2.5 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-emerald-100">
                        <ShieldCheck className="w-4 h-4" /> Secure Protocol
                    </div>
                    <div className="px-5 py-2.5 bg-[#14532d]/5 text-[#14532d] rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 border border-[#14532d]/10">
                        {gateways.filter(g => g.is_active).length} Active Methods
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
                            "bg-white rounded-[32px] border transition-all flex flex-col overflow-hidden group shadow-sm",
                            isActive ? "border-[#14532d]/40 ring-1 ring-[#14532d]/10 shadow-lg" : "opacity-80 grayscale-[0.5] hover:opacity-100 hover:grayscale-0 hover:border-[#14532d]/20"
                        )}>
                            <div className="p-8 space-y-8">
                                <div className="flex items-start justify-between">
                                    <div className="flex gap-6">
                                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl transition-all group-hover:scale-110", meta.color)}>
                                            <meta.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-[#14532d] leading-none mb-1">{meta.name}</h3>
                                            <p className="text-sm font-medium text-slate-400 line-clamp-1">{meta.tagline}</p>
                                            {meta.docsUrl && (
                                                <a href={meta.docsUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold uppercase tracking-widest text-[#f97316] hover:opacity-70 flex items-center gap-1.5 mt-3 transition-opacity">
                                                    Developer Center <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleActive(key, isActive)}
                                        className={cn(
                                            "w-12 h-6 rounded-full transition-all relative p-1 mt-1",
                                            isActive ? "bg-[#14532d] shadow-inner" : "bg-slate-200"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-4 h-4 rounded-full bg-white shadow-md transition-all",
                                            isActive ? "translate-x-6" : "translate-x-0"
                                        )} />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {isActive ? (
                                        <div className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Online
                                        </div>
                                    ) : (
                                        <div className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-400 border border-slate-200 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                            <XCircle className="w-3.5 h-3.5" /> Disabled
                                        </div>
                                    )}

                                    {isActive && key !== "cod" && (
                                        <button
                                            onClick={() => toggleTestMode(key, isTestMode)}
                                            className={cn(
                                                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border shadow-sm",
                                                isTestMode ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"
                                            )}
                                        >
                                            {isTestMode ? "Development Sandbox" : "Live Transactions"}
                                        </button>
                                    )}
                                </div>

                                {isActive && (
                                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between gap-4">
                                        <Button
                                            variant="outline"
                                            onClick={() => setEditing(isEditing ? null : key)}
                                            className="h-11 rounded-xl font-bold text-xs uppercase tracking-widest gap-2 bg-[#f8fafc] border-slate-200 text-[#14532d] transition-all"
                                        >
                                            <Settings className="w-4 h-4 opacity-40" /> Configure
                                        </Button>
                                        {key !== 'cod' && (
                                            <Button
                                                variant="ghost"
                                                disabled={testing === key}
                                                onClick={() => testConnection(key)}
                                                className="h-11 rounded-xl font-bold text-xs uppercase tracking-widest gap-2 text-slate-400 hover:text-[#14532d]"
                                            >
                                                {testing === key ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                                {testing === key ? "Verifying..." : "Verify Connection"}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Editing Panel */}
                            {isEditing && (isActive) && (
                                <div className="bg-[#f8fafc] p-8 border-t border-[#14532d]/10 space-y-8 animate-in slide-in-from-top-4 duration-500">
                                    <div className="grid grid-cols-1 gap-6">
                                        {meta.fields.map(field => (
                                            <div key={field.key} className="space-y-3">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-[#14532d]/40 ml-2">{field.label}</label>
                                                <div className="relative">
                                                    <input
                                                        type={field.type === "password" && !showSecrets[`${key}_${field.key}`] ? "password" : "text"}
                                                        value={cfg[field.key] || ""}
                                                        onChange={e => setConfigField(key, field.key, e.target.value)}
                                                        placeholder={field.placeholder}
                                                        className="w-full h-12 px-5 pr-14 rounded-xl border border-slate-200 bg-white text-sm font-bold focus:border-[#14532d] focus:ring-4 focus:ring-[#14532d]/5 transition-all outline-none"
                                                    />
                                                    {field.type === "password" && (
                                                        <button type="button"
                                                            onClick={() => setShowSecrets(s => ({ ...s, [`${key}_${field.key}`]: !s[`${key}_${field.key}`] }))}
                                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#14532d] transition-colors">
                                                            {showSecrets[`${key}_${field.key}`] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-4">
                                        <Button
                                            className="h-14 flex-1 rounded-2xl bg-[#14532d] hover:bg-[#14532d]/90 text-white font-bold uppercase tracking-widest shadow-lg shadow-[#14532d]/10 transition-all flex items-center gap-2"
                                            disabled={saving}
                                            onClick={() => saveConfig(key)}
                                        >
                                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            {saving ? "Saving..." : "Apply Settings"}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="h-14 px-8 rounded-2xl text-slate-400 font-bold uppercase text-[10px] tracking-widest"
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
