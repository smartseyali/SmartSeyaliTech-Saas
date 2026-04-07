import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Scale, MapPin, Plus, Trash2, Save, Search, RefreshCw,
    Settings, Pencil, X, Truck, DollarSign, Zap, Package
} from "lucide-react";

const ZONES = ["TN", "SOUTH", "NE", "REST"];
const ZONE_LABELS: Record<string, string> = { TN: "Tamil Nadu", SOUTH: "South India", NE: "North East", REST: "Rest of India" };
const SLAB_TYPES = [
    { key: "WEIGHT", label: "Weight (g)" },
    { key: "VOLUME", label: "Volume (ml)" },
    { key: "VALUE", label: "Order Value (₹)" },
    { key: "QTY", label: "Quantity" },
];
const SLAB_UNITS: Record<string, string> = { WEIGHT: "g", VOLUME: "ml", VALUE: "₹", QTY: "pcs" };
const CHARGE_TYPES = ["COD", "EXPRESS", "HANDLING", "PACKAGING", "INSURANCE"];
const APPLIES_OPTIONS = [
    { value: "ALL", label: "All Orders" },
    { value: "COD_ONLY", label: "COD Only" },
    { value: "PREPAID_ONLY", label: "Prepaid Only" },
];

const INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
    "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
    "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const DEFAULT_STATE_ZONES: Record<string, string> = {
    "Tamil Nadu": "TN",
    "Andhra Pradesh": "SOUTH", "Karnataka": "SOUTH", "Kerala": "SOUTH", "Puducherry": "SOUTH", "Telangana": "SOUTH",
    "Arunachal Pradesh": "NE", "Assam": "NE", "Manipur": "NE", "Meghalaya": "NE", "Mizoram": "NE", "Nagaland": "NE", "Sikkim": "NE", "Tripura": "NE",
};

export default function ShippingZones() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [tab, setTab] = useState<"slabs" | "states" | "extras" | "settings">("slabs");
    const [loading, setLoading] = useState(true);
    const [slabType, setSlabType] = useState("WEIGHT");

    // Data
    const [tariffs, setTariffs] = useState<any[]>([]);
    const [stateZones, setStateZones] = useState<Record<string, string>>({});
    const [extraCharges, setExtraCharges] = useState<any[]>([]);
    const [stateSearch, setStateSearch] = useState("");

    // Settings
    const [freeAbove, setFreeAbove] = useState(0);
    const [defaultWeight, setDefaultWeight] = useState(500);
    const [shippingPriority, setShippingPriority] = useState("WEIGHT");

    // Modals
    const [showSlabModal, setShowSlabModal] = useState(false);
    const [editingSlab, setEditingSlab] = useState<any>(null);
    const [slabForm, setSlabForm] = useState({ slab_type: "WEIGHT", max_value: "", prices: {} as Record<string, number> });

    const [showExtraModal, setShowExtraModal] = useState(false);
    const [editingExtra, setEditingExtra] = useState<any>(null);
    const [extraForm, setExtraForm] = useState({ charge_type: "COD", charge_name: "", amount: "", is_percentage: false, applies_to: "ALL", min_order_value: "", max_order_value: "" });

    useEffect(() => { if (activeCompany) loadAll(); }, [activeCompany]);

    const loadAll = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const [{ data: t }, { data: s }, { data: e }, { data: st }] = await Promise.all([
            supabase.from("delivery_tariffs").select("*").eq("company_id", activeCompany.id).order("max_value"),
            supabase.from("delivery_states").select("*").eq("company_id", activeCompany.id),
            supabase.from("shipping_extra_charges").select("*").eq("company_id", activeCompany.id).order("charge_type"),
            supabase.from("ecom_settings").select("free_delivery_above, default_item_weight, shipping_priority").eq("company_id", activeCompany.id).maybeSingle(),
        ]);

        setTariffs(t || []);
        setExtraCharges(e || []);
        setFreeAbove(Number(st?.free_delivery_above) || 0);
        setDefaultWeight(Number(st?.default_item_weight) || 500);
        setShippingPriority(st?.shipping_priority || "WEIGHT");

        // Seed states if empty
        const stateData = s || [];
        if (stateData.length === 0) {
            await supabase.from("delivery_states").insert(INDIAN_STATES.map(name => ({ company_id: activeCompany.id, name, zone: DEFAULT_STATE_ZONES[name] || "REST" })));
            const { data: seeded } = await supabase.from("delivery_states").select("*").eq("company_id", activeCompany.id);
            const map: Record<string, string> = {};
            (seeded || []).forEach((r: any) => { map[r.name] = r.zone; });
            setStateZones(map);
        } else {
            const map: Record<string, string> = {};
            stateData.forEach((r: any) => { map[r.name] = r.zone; });
            setStateZones(map);
        }
        setLoading(false);
    };

    // ─── Tariff CRUD ────────────────────────────────────────────────────
    const openAddSlab = () => { setEditingSlab(null); setSlabForm({ slab_type: slabType, max_value: "", prices: {} }); setShowSlabModal(true); };
    const openEditSlab = (t: any) => { setEditingSlab(t); setSlabForm({ slab_type: t.slab_type, max_value: String(t.max_value), prices: { ...t.prices } }); setShowSlabModal(true); };
    const saveSlab = async () => {
        if (!activeCompany || !slabForm.max_value) return;
        const payload = { company_id: activeCompany.id, slab_type: slabForm.slab_type, max_value: Number(slabForm.max_value), prices: slabForm.prices };
        if (editingSlab) { await supabase.from("delivery_tariffs").update(payload).eq("id", editingSlab.id); }
        else { await supabase.from("delivery_tariffs").insert([payload]); }
        toast({ title: editingSlab ? "Slab updated" : "Slab added" });
        setShowSlabModal(false);
        loadAll();
    };
    const deleteSlab = async (id: string) => { if (!confirm("Delete?")) return; await supabase.from("delivery_tariffs").delete().eq("id", id); loadAll(); };

    // ─── Extra Charges CRUD ─────────────────────────────────────────────
    const openAddExtra = () => { setEditingExtra(null); setExtraForm({ charge_type: "COD", charge_name: "", amount: "", is_percentage: false, applies_to: "ALL", min_order_value: "", max_order_value: "" }); setShowExtraModal(true); };
    const openEditExtra = (e: any) => { setEditingExtra(e); setExtraForm({ charge_type: e.charge_type, charge_name: e.charge_name, amount: String(e.amount), is_percentage: e.is_percentage, applies_to: e.applies_to, min_order_value: String(e.min_order_value || ""), max_order_value: String(e.max_order_value || "") }); setShowExtraModal(true); };
    const saveExtra = async () => {
        if (!activeCompany || !extraForm.charge_name) return;
        const payload = { company_id: activeCompany.id, charge_type: extraForm.charge_type, charge_name: extraForm.charge_name, amount: Number(extraForm.amount) || 0, is_percentage: extraForm.is_percentage, applies_to: extraForm.applies_to, min_order_value: Number(extraForm.min_order_value) || 0, max_order_value: Number(extraForm.max_order_value) || 0, is_active: true };
        if (editingExtra) { await supabase.from("shipping_extra_charges").update(payload).eq("id", editingExtra.id); }
        else { await supabase.from("shipping_extra_charges").insert([payload]); }
        toast({ title: editingExtra ? "Charge updated" : "Charge added" });
        setShowExtraModal(false);
        loadAll();
    };
    const deleteExtra = async (id: string) => { await supabase.from("shipping_extra_charges").delete().eq("id", id); loadAll(); };
    const toggleExtra = async (e: any) => { await supabase.from("shipping_extra_charges").update({ is_active: !e.is_active }).eq("id", e.id); loadAll(); };

    // ─── State Zone ─────────────────────────────────────────────────────
    const updateStateZone = async (name: string, zone: string) => {
        if (!activeCompany) return;
        await supabase.from("delivery_states").upsert({ company_id: activeCompany.id, name, zone }, { onConflict: "company_id,name" });
        setStateZones(prev => ({ ...prev, [name]: zone }));
    };

    // ─── Settings ───────────────────────────────────────────────────────
    const saveSettings = async () => {
        if (!activeCompany) return;
        await supabase.from("ecom_settings").upsert({ company_id: activeCompany.id, free_delivery_above: freeAbove, default_item_weight: defaultWeight, shipping_priority: shippingPriority }, { onConflict: "company_id" });
        toast({ title: "Settings saved" });
    };

    const currentSlabs = tariffs.filter(t => t.slab_type === slabType);
    const unit = SLAB_UNITS[slabType];

    if (loading) return (
        <div className="flex items-center justify-center h-[400px] gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600 opacity-40" />
            <span className="text-[13px] text-slate-500">Loading shipping config...</span>
        </div>
    );

    return (
        <div className="p-6 lg:p-8 space-y-6 pb-20 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Logistics Engine</p>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900">Shipping & Delivery</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Configure tariff slabs, zones, extra charges, and shipping rules.</p>
                </div>
                <Button variant="outline" className="h-9 px-4 rounded-lg text-[13px] font-medium gap-2" onClick={loadAll}>
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg w-fit flex-wrap">
                {([
                    { key: "slabs", label: "Tariff Slabs", icon: Scale },
                    { key: "states", label: "State Zones", icon: MapPin },
                    { key: "extras", label: "Extra Charges", icon: DollarSign },
                    { key: "settings", label: "Settings", icon: Settings },
                ] as const).map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={cn("flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-all",
                            tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}>
                        <t.icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                ))}
            </div>

            {/* ═══ TARIFF SLABS ═══ */}
            {tab === "slabs" && (
                <div className="space-y-5">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            {SLAB_TYPES.map(t => (
                                <button key={t.key} onClick={() => setSlabType(t.key)}
                                    className={cn("px-3 py-1.5 rounded-md text-[12px] font-medium transition-all",
                                        slabType === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                                    )}>{t.label}</button>
                            ))}
                        </div>
                        <Button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium gap-2" onClick={openAddSlab}>
                            <Plus className="w-3.5 h-3.5" /> Add Slab
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                            <p className="text-[13px] font-semibold text-slate-700">
                                {SLAB_TYPES.find(s => s.key === slabType)?.label} Tariffs
                            </p>
                            <p className="text-[11px] text-slate-400">Pricing per zone based on {slabType.toLowerCase()} slabs</p>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="px-5 py-3 text-left">Max {unit === "₹" ? "Value" : slabType === "QTY" ? "Qty" : slabType.charAt(0) + slabType.slice(1).toLowerCase()}</th>
                                    {ZONES.map(z => <th key={z} className="px-5 py-3 text-right">{z} Price</th>)}
                                    <th className="px-5 py-3 text-right w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {currentSlabs.map(slab => (
                                    <tr key={slab.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3 text-[13px] font-medium text-slate-900">{slab.max_value.toLocaleString()}{unit}</td>
                                        {ZONES.map(z => <td key={z} className="px-5 py-3 text-right text-[13px] font-medium text-slate-700">₹{slab.prices?.[z] || 0}</td>)}
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button onClick={() => openEditSlab(slab)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => deleteSlab(slab.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {currentSlabs.length === 0 && (
                            <div className="text-center py-16"><Truck className="w-8 h-8 mx-auto mb-3 text-slate-200" /><p className="text-[13px] text-slate-400">No slabs. Click "Add Slab" to create.</p></div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ STATE ZONES ═══ */}
            {tab === "states" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div><p className="text-[13px] font-semibold text-slate-700">Zone Configuration</p><p className="text-[11px] text-slate-400">Assign states to pricing zones</p></div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input value={stateSearch} onChange={e => setStateSearch(e.target.value)} placeholder="Search states..."
                                className="h-9 pl-9 pr-4 w-56 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100"><th className="px-5 py-3 text-left">State</th><th className="px-5 py-3 text-left w-48">Zone</th></tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase())).map(state => (
                                    <tr key={state} className="hover:bg-slate-50/50">
                                        <td className="px-5 py-2.5 text-[13px] font-medium text-slate-800">{state}</td>
                                        <td className="px-5 py-2.5">
                                            <select value={stateZones[state] || "REST"} onChange={e => updateStateZone(state, e.target.value)}
                                                className={cn("h-8 px-3 rounded-md border text-[12px] font-semibold uppercase tracking-wider outline-none cursor-pointer",
                                                    stateZones[state] === "TN" ? "border-blue-200 bg-blue-50 text-blue-700" :
                                                    stateZones[state] === "SOUTH" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                                                    stateZones[state] === "NE" ? "border-purple-200 bg-purple-50 text-purple-700" :
                                                    "border-slate-200 bg-slate-50 text-slate-600"
                                                )}>{ZONES.map(z => <option key={z} value={z}>{z}</option>)}</select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ EXTRA CHARGES ═══ */}
            {tab === "extras" && (
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div><p className="text-[13px] font-semibold text-slate-700">Extra Charges</p><p className="text-[11px] text-slate-400">COD fees, express delivery, handling, packaging, insurance</p></div>
                        <Button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium gap-2" onClick={openAddExtra}>
                            <Plus className="w-3.5 h-3.5" /> Add Charge
                        </Button>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                <th className="px-5 py-3 text-left">Type</th><th className="px-5 py-3 text-left">Name</th><th className="px-5 py-3 text-right">Amount</th>
                                <th className="px-5 py-3 text-left">Applies To</th><th className="px-5 py-3 text-center">Active</th><th className="px-5 py-3 text-right w-24">Actions</th>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {extraCharges.map(e => (
                                    <tr key={e.id} className="hover:bg-slate-50/50">
                                        <td className="px-5 py-3"><span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-600">{e.charge_type}</span></td>
                                        <td className="px-5 py-3 text-[13px] font-medium text-slate-800">{e.charge_name}</td>
                                        <td className="px-5 py-3 text-right text-[13px] font-medium text-slate-900">{e.is_percentage ? `${e.amount}%` : `₹${e.amount}`}</td>
                                        <td className="px-5 py-3 text-[12px] text-slate-500">{APPLIES_OPTIONS.find(a => a.value === e.applies_to)?.label}</td>
                                        <td className="px-5 py-3 text-center">
                                            <button onClick={() => toggleExtra(e)} className={cn("w-10 h-5 rounded-full transition-all relative", e.is_active ? "bg-blue-600" : "bg-slate-200")}>
                                                <div className={cn("w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all shadow", e.is_active ? "left-5" : "left-0.5")} />
                                            </button>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button onClick={() => openEditExtra(e)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => deleteExtra(e.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {extraCharges.length === 0 && (
                            <div className="text-center py-16"><DollarSign className="w-8 h-8 mx-auto mb-3 text-slate-200" /><p className="text-[13px] text-slate-400">No extra charges configured yet</p></div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ SETTINGS ═══ */}
            {tab === "settings" && (
                <div className="max-w-lg space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                        <h3 className="text-[13px] font-semibold text-slate-900">Shipping Preferences</h3>
                        <div className="space-y-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Shipping Priority</label>
                            <select value={shippingPriority} onChange={e => setShippingPriority(e.target.value)}
                                className="w-full h-10 px-4 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none">
                                {SLAB_TYPES.map(s => <option key={s.key} value={s.key}>{s.label} — use {s.label.toLowerCase()} as primary basis</option>)}
                            </select>
                            <p className="text-[11px] text-slate-400">Primary method for calculating base shipping. Falls back to highest charge if primary is ₹0.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Free Delivery Above (₹)</label>
                            <input type="number" value={freeAbove} onChange={e => setFreeAbove(Number(e.target.value))}
                                className="w-full h-10 px-4 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" min={0} placeholder="0 = disabled" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Default Item Weight (g)</label>
                            <input type="number" value={defaultWeight} onChange={e => setDefaultWeight(Number(e.target.value))}
                                className="w-full h-10 px-4 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" min={1} />
                            <p className="text-[11px] text-slate-400">Fallback when product has no weight.</p>
                        </div>
                        <Button className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium gap-2" onClick={saveSettings}>
                            <Save className="w-3.5 h-3.5" /> Save Settings
                        </Button>
                    </div>

                    {/* Pipeline Visualization */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
                        <h3 className="text-[13px] font-semibold text-slate-900">Calculation Pipeline</h3>
                        {[
                            { icon: Package, label: "Cart Items", desc: "Extract weight/volume from UoM" },
                            { icon: Scale, label: "Aggregate Totals", desc: `Weight, Volume, Qty, Value` },
                            { icon: Zap, label: "Free Shipping Check", desc: freeAbove > 0 ? `Orders ≥ ₹${freeAbove} = FREE` : "Disabled" },
                            { icon: Scale, label: "Slab Matching", desc: `Priority: ${shippingPriority} → fallback to highest` },
                            { icon: MapPin, label: "Zone Resolution", desc: `State → ${ZONES.join(" / ")}` },
                            { icon: DollarSign, label: "Extra Charges", desc: `${extraCharges.filter(e => e.is_active).length} active (COD, express, etc.)` },
                            { icon: Truck, label: "Final Shipping Cost", desc: "base + extras = total" },
                        ].map((step, i) => (
                            <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50">
                                <div className="w-7 h-7 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <step.icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-semibold text-slate-800">{step.label}</p>
                                    <p className="text-[11px] text-slate-400 truncate">{step.desc}</p>
                                </div>
                                {i < 6 && <span className="text-slate-300 text-[10px]">↓</span>}
                            </div>
                        ))}
                    </div>

                    {/* Zone Summary */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3">
                        <h3 className="text-[13px] font-semibold text-slate-900">Zone Summary</h3>
                        {ZONES.map(z => {
                            const states = Object.entries(stateZones).filter(([_, v]) => v === z).map(([k]) => k);
                            return (
                                <div key={z} className="p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[13px] font-semibold text-slate-800">{z} <span className="text-slate-400 font-normal">— {ZONE_LABELS[z]}</span></span>
                                        <span className="text-[11px] text-slate-500">{states.length} states</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 truncate">{states.join(", ") || "None"}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ═══ Slab Modal ═══ */}
            {showSlabModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSlabModal(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900">{editingSlab ? "Edit" : "Add"} Tariff Slab</h3>
                            <button onClick={() => setShowSlabModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Slab Type</label>
                                <select value={slabForm.slab_type} onChange={e => setSlabForm(f => ({ ...f, slab_type: e.target.value }))}
                                    className="w-full h-10 px-4 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none">
                                    {SLAB_TYPES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Max {SLAB_UNITS[slabForm.slab_type] === "₹" ? "Value (₹)" : slabForm.slab_type === "QTY" ? "Quantity" : slabForm.slab_type.charAt(0) + slabForm.slab_type.slice(1).toLowerCase() + " (" + SLAB_UNITS[slabForm.slab_type] + ")"}</label>
                                <input type="number" value={slabForm.max_value} onChange={e => setSlabForm(f => ({ ...f, max_value: e.target.value }))}
                                    placeholder="e.g. 750" className="w-full h-10 px-4 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" min={1} />
                                <p className="text-[11px] text-slate-400">Prices apply up to this threshold.</p>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Zone Prices (₹)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {ZONES.map(z => (
                                        <div key={z} className="space-y-1">
                                            <label className="text-[11px] font-medium text-slate-500">{z}</label>
                                            <input type="number" value={slabForm.prices[z] || 0}
                                                onChange={e => setSlabForm(f => ({ ...f, prices: { ...f.prices, [z]: Number(e.target.value) || 0 } }))}
                                                className="w-full h-9 px-3 rounded-md border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" min={0} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 h-10 rounded-lg text-[13px] font-medium" onClick={() => setShowSlabModal(false)}>Cancel</Button>
                            <Button className="flex-1 h-10 rounded-lg bg-blue-600 text-white text-[13px] font-medium" onClick={saveSlab}>{editingSlab ? "Update" : "Add"} Slab</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══ Extra Charge Modal ═══ */}
            {showExtraModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowExtraModal(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900">{editingExtra ? "Edit" : "Add"} Extra Charge</h3>
                            <button onClick={() => setShowExtraModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Type</label>
                                    <select value={extraForm.charge_type} onChange={e => setExtraForm(f => ({ ...f, charge_type: e.target.value }))}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none">
                                        {CHARGE_TYPES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Name</label>
                                    <input value={extraForm.charge_name} onChange={e => setExtraForm(f => ({ ...f, charge_name: e.target.value }))}
                                        placeholder="e.g. COD Fee" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Amount</label>
                                    <input type="number" value={extraForm.amount} onChange={e => setExtraForm(f => ({ ...f, amount: e.target.value }))}
                                        placeholder="50" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" min={0} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Type</label>
                                    <select value={extraForm.is_percentage ? "percent" : "flat"} onChange={e => setExtraForm(f => ({ ...f, is_percentage: e.target.value === "percent" }))}
                                        className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none">
                                        <option value="flat">Flat (₹)</option>
                                        <option value="percent">Percentage (%)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Applies To</label>
                                <select value={extraForm.applies_to} onChange={e => setExtraForm(f => ({ ...f, applies_to: e.target.value }))}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none">
                                    {APPLIES_OPTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Min Order (₹)</label>
                                    <input type="number" value={extraForm.min_order_value} onChange={e => setExtraForm(f => ({ ...f, min_order_value: e.target.value }))}
                                        placeholder="0" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" min={0} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Max Order (₹)</label>
                                    <input type="number" value={extraForm.max_order_value} onChange={e => setExtraForm(f => ({ ...f, max_order_value: e.target.value }))}
                                        placeholder="0 = no limit" className="w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" min={0} />
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 h-10 rounded-lg text-[13px] font-medium" onClick={() => setShowExtraModal(false)}>Cancel</Button>
                            <Button className="flex-1 h-10 rounded-lg bg-blue-600 text-white text-[13px] font-medium" onClick={saveExtra}>{editingExtra ? "Update" : "Add"}</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
