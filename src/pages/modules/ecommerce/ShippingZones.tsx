import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Scale, MapPin, Plus, Trash2, Save, RefreshCw, Settings, Pencil, X,
    Truck, DollarSign, Zap, Package, FlaskConical, Globe, ChevronDown
} from "lucide-react";

const SHIPPING_TYPES = [
    { value: "WEIGHT", label: "Weight-Based", uom: "kg" },
    { value: "QTY", label: "Quantity-Based", uom: "units" },
    { value: "VALUE", label: "Value-Based", uom: "₹" },
    { value: "VOLUME", label: "Volume-Based", uom: "cm³" },
];
const ROUNDING_RULES = [{ value: "ROUND_UP", label: "Round Up" }, { value: "ROUND_DOWN", label: "Round Down" }, { value: "ROUND_NEAREST", label: "Round Nearest" }];
const FREE_CONDITIONS = [{ value: "VALUE", label: "Order Value (₹)" }, { value: "WEIGHT", label: "Weight" }, { value: "QTY", label: "Quantity" }];
const CHARGE_TYPES_LIST = ["COD", "EXPRESS", "HANDLING", "PACKAGING", "INSURANCE"];
const APPLIES_OPTS = [{ value: "ALL", label: "All Orders" }, { value: "COD_ONLY", label: "COD Only" }, { value: "PREPAID_ONLY", label: "Prepaid Only" }];

const inputCls = "w-full h-10 px-3 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none transition-all";
const labelCls = "text-[11px] font-semibold uppercase tracking-wider text-slate-500";

export default function ShippingZones() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [tab, setTab] = useState<"tariff" | "zones" | "slabs" | "extras" | "free" | "test">("tariff");
    const [loading, setLoading] = useState(true);

    // Tariff
    const [tariff, setTariff] = useState<any>(null);
    const [tariffForm, setTariffForm] = useState({ tariff_name: "Standard Shipping", shipping_type: "WEIGHT", primary_uom: "kg", priority: 1, is_active: true, rounding_rule: "ROUND_UP", conflict_resolution: "HIGHEST_PRIORITY", free_shipping_enabled: false, free_shipping_condition: "VALUE", free_shipping_min: 0 });

    // Zones
    const [zones, setZones] = useState<any[]>([]);
    const [showZoneModal, setShowZoneModal] = useState(false);
    const [editingZone, setEditingZone] = useState<any>(null);
    const [zoneForm, setZoneForm] = useState({ zone_name: "", country: "India", states: "", pincode_from: "", pincode_to: "", charge_type: "VARIABLE", flat_charge: 0 });

    // Slabs
    const [slabs, setSlabs] = useState<any[]>([]);
    const [showSlabModal, setShowSlabModal] = useState(false);
    const [editingSlab, setEditingSlab] = useState<any>(null);
    const [slabForm, setSlabForm] = useState({ range_from: "", range_to: "", base_charge: "", extra_charge_per_unit: "", has_per_unit: false, zone_id: "" });

    // Extras
    const [extras, setExtras] = useState<any[]>([]);
    const [showExtraModal, setShowExtraModal] = useState(false);
    const [editingExtra, setEditingExtra] = useState<any>(null);
    const [extraForm, setExtraForm] = useState({ charge_type: "COD", charge_name: "", amount: "", is_percentage: false, applies_to: "ALL", min_order_value: "", max_order_value: "" });

    // Test
    const [testForm, setTestForm] = useState({ state: "", pincode: "", weight: "2.5", qty: "1", value: "750", volume: "0", payment: "prepaid" });
    const [testResult, setTestResult] = useState<any>(null);
    const [testing, setTesting] = useState(false);

    useEffect(() => { if (activeCompany) loadAll(); }, [activeCompany]);

    const loadAll = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const [{ data: t }, { data: z }, { data: s }, { data: e }] = await Promise.all([
            supabase.from("shipping_tariffs").select("*").eq("company_id", activeCompany.id).order("priority").limit(1).maybeSingle(),
            supabase.from("shipping_zones_v2").select("*").eq("company_id", activeCompany.id).order("display_order"),
            supabase.from("shipping_slabs").select("*").eq("company_id", activeCompany.id).order("range_from"),
            supabase.from("shipping_extra_charges").select("*").eq("company_id", activeCompany.id).order("charge_type"),
        ]);
        if (t) {
            setTariff(t);
            setTariffForm({ tariff_name: t.tariff_name, shipping_type: t.shipping_type, primary_uom: t.primary_uom, priority: t.priority, is_active: t.is_active, rounding_rule: t.rounding_rule, conflict_resolution: t.conflict_resolution, free_shipping_enabled: t.free_shipping_enabled, free_shipping_condition: t.free_shipping_condition, free_shipping_min: Number(t.free_shipping_min) || 0 });
        }
        setZones(z || []);
        setSlabs(s || []);
        setExtras(e || []);
        setLoading(false);
    };

    // ─── Tariff Save ────────────────────────────────────────────────────
    const saveTariff = async () => {
        if (!activeCompany) return;
        const payload = { ...tariffForm, company_id: activeCompany.id, updated_at: new Date().toISOString() };
        if (tariff?.id) {
            await supabase.from("shipping_tariffs").update(payload).eq("id", tariff.id);
        } else {
            const { data } = await supabase.from("shipping_tariffs").insert([payload]).select().single();
            setTariff(data);
        }
        toast({ title: "Tariff saved" });
        loadAll();
    };

    // ─── Zone CRUD ──────────────────────────────────────────────────────
    const openAddZone = () => { setEditingZone(null); setZoneForm({ zone_name: "", country: "India", states: "", pincode_from: "", pincode_to: "", charge_type: "VARIABLE", flat_charge: 0 }); setShowZoneModal(true); };
    const openEditZone = (z: any) => { setEditingZone(z); setZoneForm({ zone_name: z.zone_name, country: z.country, states: (z.states || []).join(", "), pincode_from: z.pincode_from || "", pincode_to: z.pincode_to || "", charge_type: z.charge_type, flat_charge: Number(z.flat_charge) || 0 }); setShowZoneModal(true); };
    const saveZone = async () => {
        if (!activeCompany || !tariff?.id || !zoneForm.zone_name) return;
        const payload = { company_id: activeCompany.id, tariff_id: tariff.id, zone_name: zoneForm.zone_name, country: zoneForm.country, states: zoneForm.states ? zoneForm.states.split(",").map((s: string) => s.trim()).filter(Boolean) : [], pincode_from: zoneForm.pincode_from || null, pincode_to: zoneForm.pincode_to || null, charge_type: zoneForm.charge_type, flat_charge: zoneForm.flat_charge, display_order: zones.length };
        if (editingZone) { await supabase.from("shipping_zones_v2").update(payload).eq("id", editingZone.id); }
        else { await supabase.from("shipping_zones_v2").insert([payload]); }
        toast({ title: editingZone ? "Zone updated" : "Zone added" });
        setShowZoneModal(false); loadAll();
    };
    const deleteZone = async (id: string) => { if (!confirm("Delete zone?")) return; await supabase.from("shipping_zones_v2").delete().eq("id", id); loadAll(); };

    // ─── Slab CRUD ──────────────────────────────────────────────────────
    const openAddSlab = () => { setEditingSlab(null); setSlabForm({ range_from: "", range_to: "", base_charge: "", extra_charge_per_unit: "", has_per_unit: false, zone_id: "" }); setShowSlabModal(true); };
    const openEditSlab = (s: any) => { setEditingSlab(s); setSlabForm({ range_from: String(s.range_from), range_to: s.range_to ? String(s.range_to) : "", base_charge: String(s.base_charge), extra_charge_per_unit: String(s.extra_charge_per_unit || ""), has_per_unit: s.has_per_unit, zone_id: s.zone_id || "" }); setShowSlabModal(true); };
    const saveSlab = async () => {
        if (!activeCompany || !tariff?.id) return;
        const payload = { company_id: activeCompany.id, tariff_id: tariff.id, range_from: Number(slabForm.range_from) || 0, range_to: slabForm.range_to ? Number(slabForm.range_to) : null, base_charge: Number(slabForm.base_charge) || 0, extra_charge_per_unit: Number(slabForm.extra_charge_per_unit) || 0, has_per_unit: slabForm.has_per_unit, zone_id: slabForm.zone_id || null, display_order: slabs.length };
        if (editingSlab) { await supabase.from("shipping_slabs").update(payload).eq("id", editingSlab.id); }
        else { await supabase.from("shipping_slabs").insert([payload]); }
        toast({ title: editingSlab ? "Slab updated" : "Slab added" });
        setShowSlabModal(false); loadAll();
    };
    const deleteSlab = async (id: string) => { await supabase.from("shipping_slabs").delete().eq("id", id); loadAll(); };

    // ─── Extra CRUD ─────────────────────────────────────────────────────
    const openAddExtra = () => { setEditingExtra(null); setExtraForm({ charge_type: "COD", charge_name: "", amount: "", is_percentage: false, applies_to: "ALL", min_order_value: "", max_order_value: "" }); setShowExtraModal(true); };
    const openEditExtra = (e: any) => { setEditingExtra(e); setExtraForm({ charge_type: e.charge_type, charge_name: e.charge_name, amount: String(e.amount), is_percentage: e.is_percentage, applies_to: e.applies_to, min_order_value: String(e.min_order_value || ""), max_order_value: String(e.max_order_value || "") }); setShowExtraModal(true); };
    const saveExtra = async () => {
        if (!activeCompany) return;
        const payload = { company_id: activeCompany.id, tariff_id: tariff?.id, charge_type: extraForm.charge_type, charge_name: extraForm.charge_name, amount: Number(extraForm.amount) || 0, is_percentage: extraForm.is_percentage, applies_to: extraForm.applies_to, min_order_value: Number(extraForm.min_order_value) || 0, max_order_value: Number(extraForm.max_order_value) || 0, is_active: true };
        if (editingExtra) { await supabase.from("shipping_extra_charges").update(payload).eq("id", editingExtra.id); }
        else { await supabase.from("shipping_extra_charges").insert([payload]); }
        toast({ title: editingExtra ? "Updated" : "Added" });
        setShowExtraModal(false); loadAll();
    };
    const deleteExtra = async (id: string) => { await supabase.from("shipping_extra_charges").delete().eq("id", id); loadAll(); };
    const toggleExtra = async (e: any) => { await supabase.from("shipping_extra_charges").update({ is_active: !e.is_active }).eq("id", e.id); loadAll(); };

    // ─── Test Simulation ────────────────────────────────────────────────
    const runTest = async () => {
        if (!activeCompany) return;
        setTesting(true);
        const { data, error } = await supabase.rpc("calc_shipping", {
            p_company_id: activeCompany.id,
            p_state: testForm.state,
            p_pincode: testForm.pincode,
            p_weight_kg: Number(testForm.weight) || 0,
            p_qty: Number(testForm.qty) || 1,
            p_order_value: Number(testForm.value) || 0,
            p_volume_cm3: Number(testForm.volume) || 0,
            p_payment_method: testForm.payment,
        });
        setTestResult(error ? { error: error.message } : data);
        setTesting(false);
    };

    const uom = SHIPPING_TYPES.find(t => t.value === tariffForm.shipping_type)?.uom || "kg";

    if (loading) return (<div className="flex items-center justify-center h-[400px] gap-3"><RefreshCw className="w-5 h-5 animate-spin text-blue-600 opacity-40" /><span className="text-[13px] text-slate-500">Loading...</span></div>);

    return (
        <div className="p-6 lg:p-8 space-y-6 pb-20 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Logistics Engine</p>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900">Shipping Configuration</h1>
                </div>
                <Button variant="outline" className="h-9 px-4 rounded-lg text-[13px] font-medium gap-2" onClick={loadAll}><RefreshCw className="w-3.5 h-3.5" /> Refresh</Button>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg w-fit flex-wrap gap-0.5">
                {([
                    { key: "tariff", label: "Tariff Config", icon: Settings },
                    { key: "zones", label: "Zones", icon: Globe },
                    { key: "slabs", label: "Slabs", icon: Scale },
                    { key: "extras", label: "Extra Charges", icon: DollarSign },
                    { key: "test", label: "Test Simulation", icon: FlaskConical },
                ] as const).map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} className={cn("flex items-center gap-1.5 px-3 py-2 rounded-md text-[12px] font-medium transition-all", tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}>
                        <t.icon className="w-3.5 h-3.5" /> {t.label}
                    </button>
                ))}
            </div>

            {/* ═══ TARIFF CONFIG ═══ */}
            {tab === "tariff" && (
                <div className="max-w-2xl space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                        <h3 className="text-[13px] font-semibold text-slate-900">Basic Info</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-1.5"><label className={labelCls}>Tariff Name</label><input value={tariffForm.tariff_name} onChange={e => setTariffForm(f => ({ ...f, tariff_name: e.target.value }))} className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Shipping Type</label><select value={tariffForm.shipping_type} onChange={e => { const t = SHIPPING_TYPES.find(s => s.value === e.target.value); setTariffForm(f => ({ ...f, shipping_type: e.target.value, primary_uom: t?.uom || "kg" })); }} className={inputCls}>{SHIPPING_TYPES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
                            <div className="space-y-1.5"><label className={labelCls}>Primary UoM</label><input value={tariffForm.primary_uom} onChange={e => setTariffForm(f => ({ ...f, primary_uom: e.target.value }))} className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Priority</label><input type="number" value={tariffForm.priority} onChange={e => setTariffForm(f => ({ ...f, priority: Number(e.target.value) }))} className={inputCls} min={1} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Rounding</label><select value={tariffForm.rounding_rule} onChange={e => setTariffForm(f => ({ ...f, rounding_rule: e.target.value }))} className={inputCls}>{ROUNDING_RULES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select></div>
                            <div className="col-span-2 flex items-center gap-3"><input type="checkbox" checked={tariffForm.is_active} onChange={e => setTariffForm(f => ({ ...f, is_active: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-blue-600" /><span className="text-[13px] font-medium text-slate-700">Active</span></div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                        <h3 className="text-[13px] font-semibold text-slate-900">Free Shipping Rules</h3>
                        <div className="flex items-center gap-3 mb-2"><input type="checkbox" checked={tariffForm.free_shipping_enabled} onChange={e => setTariffForm(f => ({ ...f, free_shipping_enabled: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-blue-600" /><span className="text-[13px] font-medium text-slate-700">Enable Free Shipping</span></div>
                        {tariffForm.free_shipping_enabled && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5"><label className={labelCls}>Condition</label><select value={tariffForm.free_shipping_condition} onChange={e => setTariffForm(f => ({ ...f, free_shipping_condition: e.target.value }))} className={inputCls}>{FREE_CONDITIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select></div>
                                <div className="space-y-1.5"><label className={labelCls}>Minimum Value</label><input type="number" value={tariffForm.free_shipping_min} onChange={e => setTariffForm(f => ({ ...f, free_shipping_min: Number(e.target.value) }))} className={inputCls} min={0} /></div>
                            </div>
                        )}
                    </div>
                    <Button className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium gap-2" onClick={saveTariff}><Save className="w-3.5 h-3.5" /> Save Tariff</Button>
                </div>
            )}

            {/* ═══ ZONES ═══ */}
            {tab === "zones" && (
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div><p className="text-[13px] font-semibold text-slate-700">Zone Configuration</p><p className="text-[11px] text-slate-400">Define delivery regions by state or pincode range</p></div>
                        <Button className="h-9 px-4 rounded-lg bg-blue-600 text-white text-[13px] font-medium gap-2" onClick={openAddZone} disabled={!tariff}><Plus className="w-3.5 h-3.5" /> Add Zone</Button>
                    </div>
                    {!tariff && <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-[13px] text-amber-700">Save a tariff config first before adding zones.</div>}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100"><th className="px-5 py-3 text-left">Zone</th><th className="px-5 py-3 text-left">Country</th><th className="px-5 py-3 text-left">States</th><th className="px-5 py-3 text-left">Pincode Range</th><th className="px-5 py-3 text-left">Type</th><th className="px-5 py-3 text-right w-24">Actions</th></tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {zones.map(z => (
                                    <tr key={z.id} className="hover:bg-slate-50/50">
                                        <td className="px-5 py-3 text-[13px] font-semibold text-slate-900">{z.zone_name}</td>
                                        <td className="px-5 py-3 text-[13px] text-slate-600">{z.country}</td>
                                        <td className="px-5 py-3 text-[12px] text-slate-500 max-w-[200px] truncate">{(z.states || []).join(", ") || "All"}</td>
                                        <td className="px-5 py-3 text-[12px] font-mono text-slate-500">{z.pincode_from && z.pincode_to ? `${z.pincode_from}–${z.pincode_to}` : "—"}</td>
                                        <td className="px-5 py-3"><span className={cn("text-[11px] font-semibold px-2 py-1 rounded", z.charge_type === "FLAT" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700")}>{z.charge_type}{z.charge_type === "FLAT" ? ` ₹${z.flat_charge}` : ""}</span></td>
                                        <td className="px-5 py-3 text-right"><div className="flex items-center gap-1 justify-end"><button onClick={() => openEditZone(z)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => deleteZone(z.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {zones.length === 0 && <div className="text-center py-16"><Globe className="w-8 h-8 mx-auto mb-3 text-slate-200" /><p className="text-[13px] text-slate-400">No zones. Add zones like Local, Regional, National.</p></div>}
                    </div>
                </div>
            )}

            {/* ═══ SLABS ═══ */}
            {tab === "slabs" && (
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div><p className="text-[13px] font-semibold text-slate-700">Slab Configuration</p><p className="text-[11px] text-slate-400">Range-based pricing — {tariffForm.shipping_type.toLowerCase()} in {uom}</p></div>
                        <Button className="h-9 px-4 rounded-lg bg-blue-600 text-white text-[13px] font-medium gap-2" onClick={openAddSlab} disabled={!tariff}><Plus className="w-3.5 h-3.5" /> Add Slab</Button>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100"><th className="px-5 py-3 text-left">From</th><th className="px-5 py-3 text-left">To</th><th className="px-5 py-3 text-right">Base Charge</th><th className="px-5 py-3 text-right">Extra/Unit</th><th className="px-5 py-3 text-left">Per Unit</th><th className="px-5 py-3 text-left">Zone</th><th className="px-5 py-3 text-right w-24">Actions</th></tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {slabs.map(s => (
                                    <tr key={s.id} className="hover:bg-slate-50/50">
                                        <td className="px-5 py-3 text-[13px] font-medium text-slate-900">{s.range_from} {uom}</td>
                                        <td className="px-5 py-3 text-[13px] font-medium text-slate-900">{s.range_to ? `${s.range_to} ${uom}` : "∞"}</td>
                                        <td className="px-5 py-3 text-right text-[13px] font-semibold text-slate-900">₹{s.base_charge}</td>
                                        <td className="px-5 py-3 text-right text-[13px] text-slate-600">{s.has_per_unit ? `₹${s.extra_charge_per_unit}/${uom}` : "—"}</td>
                                        <td className="px-5 py-3">{s.has_per_unit ? <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700">Yes</span> : <span className="text-[11px] text-slate-400">No</span>}</td>
                                        <td className="px-5 py-3 text-[12px] text-slate-500">{zones.find(z => z.id === s.zone_id)?.zone_name || "All Zones"}</td>
                                        <td className="px-5 py-3 text-right"><div className="flex items-center gap-1 justify-end"><button onClick={() => openEditSlab(s)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => deleteSlab(s.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {slabs.length === 0 && <div className="text-center py-16"><Scale className="w-8 h-8 mx-auto mb-3 text-slate-200" /><p className="text-[13px] text-slate-400">No slabs configured yet</p></div>}
                    </div>
                </div>
            )}

            {/* ═══ EXTRA CHARGES ═══ */}
            {tab === "extras" && (
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        <div><p className="text-[13px] font-semibold text-slate-700">Additional Charges</p><p className="text-[11px] text-slate-400">COD fees, express delivery, handling, packaging</p></div>
                        <Button className="h-9 px-4 rounded-lg bg-blue-600 text-white text-[13px] font-medium gap-2" onClick={openAddExtra}><Plus className="w-3.5 h-3.5" /> Add Charge</Button>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100"><th className="px-5 py-3 text-left">Type</th><th className="px-5 py-3 text-left">Name</th><th className="px-5 py-3 text-right">Amount</th><th className="px-5 py-3 text-left">Applies To</th><th className="px-5 py-3 text-center">Active</th><th className="px-5 py-3 text-right w-24">Actions</th></tr></thead>
                            <tbody className="divide-y divide-slate-50">
                                {extras.map(e => (
                                    <tr key={e.id} className={cn("hover:bg-slate-50/50", !e.is_active && "opacity-50")}>
                                        <td className="px-5 py-3"><span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-600">{e.charge_type}</span></td>
                                        <td className="px-5 py-3 text-[13px] font-medium text-slate-800">{e.charge_name}</td>
                                        <td className="px-5 py-3 text-right text-[13px] font-semibold text-slate-900">{e.is_percentage ? `${e.amount}%` : `₹${e.amount}`}</td>
                                        <td className="px-5 py-3 text-[12px] text-slate-500">{APPLIES_OPTS.find(a => a.value === e.applies_to)?.label}</td>
                                        <td className="px-5 py-3 text-center"><button onClick={() => toggleExtra(e)} className={cn("w-10 h-5 rounded-full transition-all relative", e.is_active ? "bg-blue-600" : "bg-slate-200")}><div className={cn("w-4 h-4 rounded-full bg-white absolute top-0.5 shadow transition-all", e.is_active ? "left-5" : "left-0.5")} /></button></td>
                                        <td className="px-5 py-3 text-right"><div className="flex items-center gap-1 justify-end"><button onClick={() => openEditExtra(e)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => deleteExtra(e.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {extras.length === 0 && <div className="text-center py-16"><DollarSign className="w-8 h-8 mx-auto mb-3 text-slate-200" /><p className="text-[13px] text-slate-400">No extra charges configured</p></div>}
                    </div>
                </div>
            )}

            {/* ═══ TEST SIMULATION ═══ */}
            {tab === "test" && (
                <div className="max-w-2xl space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                        <h3 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2"><FlaskConical className="w-4 h-4 text-blue-600" /> Test Shipping Calculation</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5"><label className={labelCls}>State</label><input value={testForm.state} onChange={e => setTestForm(f => ({ ...f, state: e.target.value }))} className={inputCls} placeholder="e.g. Tamil Nadu" /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Pincode</label><input value={testForm.pincode} onChange={e => setTestForm(f => ({ ...f, pincode: e.target.value }))} className={inputCls} placeholder="e.g. 641001" /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Weight (kg)</label><input type="number" value={testForm.weight} onChange={e => setTestForm(f => ({ ...f, weight: e.target.value }))} className={inputCls} step="0.1" /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Quantity</label><input type="number" value={testForm.qty} onChange={e => setTestForm(f => ({ ...f, qty: e.target.value }))} className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Order Value (₹)</label><input type="number" value={testForm.value} onChange={e => setTestForm(f => ({ ...f, value: e.target.value }))} className={inputCls} /></div>
                            <div className="space-y-1.5"><label className={labelCls}>Payment</label><select value={testForm.payment} onChange={e => setTestForm(f => ({ ...f, payment: e.target.value }))} className={inputCls}><option value="prepaid">Prepaid</option><option value="cod">COD</option></select></div>
                        </div>
                        <Button className="h-10 px-6 rounded-lg bg-blue-600 text-white text-[13px] font-medium gap-2" onClick={runTest} disabled={testing}>
                            {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />} Calculate
                        </Button>
                    </div>

                    {testResult && !testResult.error && (
                        <div className="bg-white rounded-xl border border-blue-200 p-6 space-y-4">
                            <h3 className="text-[13px] font-semibold text-blue-700 flex items-center gap-2"><Package className="w-4 h-4" /> Result</h3>
                            <div className="space-y-2 text-[13px]">
                                <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">Tariff</span><span className="font-medium text-slate-900">{testResult.tariff}</span></div>
                                <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">Zone</span><span className="font-medium text-slate-900">{testResult.zone}</span></div>
                                <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">Method</span><span className="font-medium text-slate-900">{testResult.method}</span></div>
                                <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">Base Charge</span><span className="font-medium text-slate-900">₹{testResult.breakdown?.base || 0}</span></div>
                                {(testResult.breakdown?.extra_items || []).map((ex: any, i: number) => (
                                    <div key={i} className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">{ex.name}</span><span className="font-medium text-slate-900">₹{ex.amount}</span></div>
                                ))}
                                {testResult.free_shipping && <div className="flex justify-between py-2 border-b border-emerald-100 bg-emerald-50 px-3 rounded-lg"><span className="text-emerald-700 font-semibold">FREE SHIPPING</span><span className="font-bold text-emerald-700">₹0</span></div>}
                                <div className="flex justify-between py-3 bg-slate-900 text-white px-4 rounded-lg mt-2"><span className="font-semibold">Final Shipping</span><span className="text-xl font-bold">₹{testResult.shipping_charge}</span></div>
                            </div>
                        </div>
                    )}
                    {testResult?.error && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-[13px] text-rose-700">{testResult.error}</div>
                    )}
                </div>
            )}

            {/* ═══ Zone Modal ═══ */}
            {showZoneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowZoneModal(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between"><h3 className="text-base font-semibold">{editingZone ? "Edit" : "Add"} Zone</h3><button onClick={() => setShowZoneModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button></div>
                        <div className="space-y-3">
                            <div className="space-y-1.5"><label className={labelCls}>Zone Name</label><input value={zoneForm.zone_name} onChange={e => setZoneForm(f => ({ ...f, zone_name: e.target.value }))} className={inputCls} placeholder="e.g. Local, Regional, National" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><label className={labelCls}>Country</label><input value={zoneForm.country} onChange={e => setZoneForm(f => ({ ...f, country: e.target.value }))} className={inputCls} /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Charge Type</label><select value={zoneForm.charge_type} onChange={e => setZoneForm(f => ({ ...f, charge_type: e.target.value }))} className={inputCls}><option value="VARIABLE">Variable (Slab)</option><option value="FLAT">Flat Rate</option></select></div>
                            </div>
                            <div className="space-y-1.5"><label className={labelCls}>States (comma separated)</label><input value={zoneForm.states} onChange={e => setZoneForm(f => ({ ...f, states: e.target.value }))} className={inputCls} placeholder="Tamil Nadu, Karnataka, Kerala" /></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><label className={labelCls}>Pincode From</label><input value={zoneForm.pincode_from} onChange={e => setZoneForm(f => ({ ...f, pincode_from: e.target.value }))} className={inputCls} placeholder="600000" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Pincode To</label><input value={zoneForm.pincode_to} onChange={e => setZoneForm(f => ({ ...f, pincode_to: e.target.value }))} className={inputCls} placeholder="699999" /></div>
                            </div>
                            {zoneForm.charge_type === "FLAT" && <div className="space-y-1.5"><label className={labelCls}>Flat Charge (₹)</label><input type="number" value={zoneForm.flat_charge} onChange={e => setZoneForm(f => ({ ...f, flat_charge: Number(e.target.value) }))} className={inputCls} /></div>}
                        </div>
                        <div className="flex gap-3"><Button variant="outline" className="flex-1 h-10 rounded-lg text-[13px] font-medium" onClick={() => setShowZoneModal(false)}>Cancel</Button><Button className="flex-1 h-10 rounded-lg bg-blue-600 text-white text-[13px] font-medium" onClick={saveZone}>{editingZone ? "Update" : "Add"}</Button></div>
                    </div>
                </div>
            )}

            {/* ═══ Slab Modal ═══ */}
            {showSlabModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowSlabModal(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between"><h3 className="text-base font-semibold">{editingSlab ? "Edit" : "Add"} Slab</h3><button onClick={() => setShowSlabModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button></div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><label className={labelCls}>From ({uom})</label><input type="number" value={slabForm.range_from} onChange={e => setSlabForm(f => ({ ...f, range_from: e.target.value }))} className={inputCls} placeholder="0" min={0} /></div>
                                <div className="space-y-1.5"><label className={labelCls}>To ({uom}) — empty = ∞</label><input type="number" value={slabForm.range_to} onChange={e => setSlabForm(f => ({ ...f, range_to: e.target.value }))} className={inputCls} placeholder="∞" /></div>
                            </div>
                            <div className="space-y-1.5"><label className={labelCls}>Base Charge (₹)</label><input type="number" value={slabForm.base_charge} onChange={e => setSlabForm(f => ({ ...f, base_charge: e.target.value }))} className={inputCls} placeholder="50" min={0} /></div>
                            <div className="flex items-center gap-3"><input type="checkbox" checked={slabForm.has_per_unit} onChange={e => setSlabForm(f => ({ ...f, has_per_unit: e.target.checked }))} className="w-4 h-4 rounded border-slate-300 text-blue-600" /><span className="text-[13px] font-medium text-slate-700">Enable per-unit extra charge (e.g. ₹20/kg beyond threshold)</span></div>
                            {slabForm.has_per_unit && <div className="space-y-1.5"><label className={labelCls}>Extra Charge Per {uom}</label><input type="number" value={slabForm.extra_charge_per_unit} onChange={e => setSlabForm(f => ({ ...f, extra_charge_per_unit: e.target.value }))} className={inputCls} placeholder="20" min={0} step="0.01" /></div>}
                            <div className="space-y-1.5"><label className={labelCls}>Zone (optional — empty = all zones)</label><select value={slabForm.zone_id} onChange={e => setSlabForm(f => ({ ...f, zone_id: e.target.value }))} className={inputCls}><option value="">All Zones</option>{zones.map(z => <option key={z.id} value={z.id}>{z.zone_name}</option>)}</select></div>
                        </div>
                        <div className="flex gap-3"><Button variant="outline" className="flex-1 h-10 rounded-lg text-[13px] font-medium" onClick={() => setShowSlabModal(false)}>Cancel</Button><Button className="flex-1 h-10 rounded-lg bg-blue-600 text-white text-[13px] font-medium" onClick={saveSlab}>{editingSlab ? "Update" : "Add"}</Button></div>
                    </div>
                </div>
            )}

            {/* ═══ Extra Modal ═══ */}
            {showExtraModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowExtraModal(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between"><h3 className="text-base font-semibold">{editingExtra ? "Edit" : "Add"} Extra Charge</h3><button onClick={() => setShowExtraModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button></div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><label className={labelCls}>Type</label><select value={extraForm.charge_type} onChange={e => setExtraForm(f => ({ ...f, charge_type: e.target.value }))} className={inputCls}>{CHARGE_TYPES_LIST.map(c => <option key={c}>{c}</option>)}</select></div>
                                <div className="space-y-1.5"><label className={labelCls}>Name</label><input value={extraForm.charge_name} onChange={e => setExtraForm(f => ({ ...f, charge_name: e.target.value }))} className={inputCls} placeholder="COD Fee" /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><label className={labelCls}>Amount</label><input type="number" value={extraForm.amount} onChange={e => setExtraForm(f => ({ ...f, amount: e.target.value }))} className={inputCls} min={0} /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Amount Type</label><select value={extraForm.is_percentage ? "pct" : "flat"} onChange={e => setExtraForm(f => ({ ...f, is_percentage: e.target.value === "pct" }))} className={inputCls}><option value="flat">Flat (₹)</option><option value="pct">Percentage (%)</option></select></div>
                            </div>
                            <div className="space-y-1.5"><label className={labelCls}>Applies To</label><select value={extraForm.applies_to} onChange={e => setExtraForm(f => ({ ...f, applies_to: e.target.value }))} className={inputCls}>{APPLIES_OPTS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}</select></div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5"><label className={labelCls}>Min Order (₹)</label><input type="number" value={extraForm.min_order_value} onChange={e => setExtraForm(f => ({ ...f, min_order_value: e.target.value }))} className={inputCls} placeholder="0" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Max Order (₹)</label><input type="number" value={extraForm.max_order_value} onChange={e => setExtraForm(f => ({ ...f, max_order_value: e.target.value }))} className={inputCls} placeholder="0 = no limit" /></div>
                            </div>
                        </div>
                        <div className="flex gap-3"><Button variant="outline" className="flex-1 h-10 rounded-lg text-[13px] font-medium" onClick={() => setShowExtraModal(false)}>Cancel</Button><Button className="flex-1 h-10 rounded-lg bg-blue-600 text-white text-[13px] font-medium" onClick={saveExtra}>{editingExtra ? "Update" : "Add"}</Button></div>
                    </div>
                </div>
            )}
        </div>
    );
}
