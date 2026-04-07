import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Truck, MapPin, Scale, Plus, Trash2, Save, Search,
    RefreshCw, Package, Settings, ChevronDown
} from "lucide-react";

// ─── All Indian states ──────────────────────────────────────────────────────
const INDIAN_STATES = [
    "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
    "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
    "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const DEFAULT_ZONES = [
    { zone_code: "TN", zone_name: "Tamil Nadu", display_order: 1 },
    { zone_code: "SOUTH", zone_name: "South India", display_order: 2 },
    { zone_code: "NE", zone_name: "North East", display_order: 3 },
    { zone_code: "REST", zone_name: "Rest of India", display_order: 4 },
];

export default function ShippingZones() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<"slabs" | "states" | "settings">("slabs");
    const [loading, setLoading] = useState(true);

    // Data
    const [zones, setZones] = useState<any[]>([]);
    const [stateZones, setStateZones] = useState<Record<string, string>>({});
    const [weightSlabs, setWeightSlabs] = useState<any[]>([]);
    const [volumeSlabs, setVolumeSlabs] = useState<any[]>([]);
    const [slabType, setSlabType] = useState<"weight" | "volume">("weight");
    const [stateSearch, setStateSearch] = useState("");

    // New slab form
    const [newSlab, setNewSlab] = useState<any>({ max_value: "", zone_prices: {} });

    // Settings
    const [freeAbove, setFreeAbove] = useState(0);
    const [defaultWeight, setDefaultWeight] = useState(500);

    // New zone form
    const [showAddZone, setShowAddZone] = useState(false);
    const [newZoneCode, setNewZoneCode] = useState("");
    const [newZoneName, setNewZoneName] = useState("");

    useEffect(() => { if (activeCompany) loadAll(); }, [activeCompany]);

    const loadAll = async () => {
        if (!activeCompany) return;
        setLoading(true);

        const [{ data: z }, { data: sz }, { data: ts }, { data: settings }] = await Promise.all([
            supabase.from("delivery_zones").select("*").eq("company_id", activeCompany.id).order("display_order"),
            supabase.from("delivery_state_zones").select("*").eq("company_id", activeCompany.id),
            supabase.from("delivery_tariff_slabs").select("*").eq("company_id", activeCompany.id).order("max_value"),
            supabase.from("ecom_settings").select("free_delivery_above, default_item_weight").eq("company_id", activeCompany.id).maybeSingle(),
        ]);

        let zonesData = z || [];

        // Seed default zones if none exist
        if (zonesData.length === 0) {
            const { data: seeded } = await supabase.from("delivery_zones")
                .insert(DEFAULT_ZONES.map(dz => ({ ...dz, company_id: activeCompany.id })))
                .select();
            zonesData = seeded || DEFAULT_ZONES.map(dz => ({ ...dz, company_id: activeCompany.id }));
        }

        setZones(zonesData);

        // Build state->zone map
        const szMap: Record<string, string> = {};
        (sz || []).forEach((s: any) => { szMap[s.state_name] = s.zone_code; });
        setStateZones(szMap);

        // Split slabs by type
        const allSlabs = ts || [];
        setWeightSlabs(allSlabs.filter((s: any) => s.tariff_type === "weight"));
        setVolumeSlabs(allSlabs.filter((s: any) => s.tariff_type === "volume"));

        setFreeAbove(Number(settings?.free_delivery_above) || 0);
        setDefaultWeight(Number(settings?.default_item_weight) || 500);

        setLoading(false);
    };

    // ─── Zone Management ────────────────────────────────────────────────
    const addZone = async () => {
        if (!activeCompany || !newZoneCode.trim() || !newZoneName.trim()) return;
        const code = newZoneCode.toUpperCase().replace(/[^A-Z0-9_]/g, "");
        await supabase.from("delivery_zones").insert([{
            company_id: activeCompany.id,
            zone_code: code,
            zone_name: newZoneName,
            display_order: zones.length + 1,
        }]);
        toast({ title: `Zone "${code}" added` });
        setNewZoneCode("");
        setNewZoneName("");
        setShowAddZone(false);
        loadAll();
    };

    const deleteZone = async (z: any) => {
        if (!confirm(`Delete zone "${z.zone_name}"? States mapped to this zone will be unmapped.`)) return;
        await supabase.from("delivery_zones").delete().eq("id", z.id);
        await supabase.from("delivery_state_zones").delete().eq("company_id", activeCompany!.id).eq("zone_code", z.zone_code);
        loadAll();
    };

    // ─── State Zone Assignment ──────────────────────────────────────────
    const assignState = async (stateName: string, zoneCode: string) => {
        if (!activeCompany) return;
        if (zoneCode === "") {
            await supabase.from("delivery_state_zones").delete().eq("company_id", activeCompany.id).eq("state_name", stateName);
        } else {
            await supabase.from("delivery_state_zones").upsert({
                company_id: activeCompany.id,
                state_name: stateName,
                zone_code: zoneCode,
            }, { onConflict: "company_id,state_name" });
        }
        setStateZones(prev => ({ ...prev, [stateName]: zoneCode }));
    };

    // ─── Tariff Slab Management ─────────────────────────────────────────
    const addSlab = async () => {
        if (!activeCompany || !newSlab.max_value) return;
        await supabase.from("delivery_tariff_slabs").insert([{
            company_id: activeCompany.id,
            tariff_type: slabType,
            max_value: Number(newSlab.max_value),
            zone_prices: newSlab.zone_prices,
            display_order: (slabType === "weight" ? weightSlabs : volumeSlabs).length + 1,
        }]);
        toast({ title: "Tariff slab added" });
        setNewSlab({ max_value: "", zone_prices: {} });
        loadAll();
    };

    const updateSlabPrice = async (slabId: string, zoneCode: string, price: number, currentPrices: any) => {
        const updated = { ...currentPrices, [zoneCode]: price };
        await supabase.from("delivery_tariff_slabs").update({ zone_prices: updated }).eq("id", slabId);
    };

    const deleteSlab = async (id: string) => {
        await supabase.from("delivery_tariff_slabs").delete().eq("id", id);
        loadAll();
    };

    // ─── Settings Save ──────────────────────────────────────────────────
    const saveSettings = async () => {
        if (!activeCompany) return;
        await supabase.from("ecom_settings").upsert({
            company_id: activeCompany.id,
            free_delivery_above: freeAbove,
            default_item_weight: defaultWeight,
        }, { onConflict: "company_id" });
        toast({ title: "Delivery settings saved" });
    };

    const unit = slabType === "weight" ? "g" : "ml";
    const currentSlabs = slabType === "weight" ? weightSlabs : volumeSlabs;

    if (loading) return (
        <div className="flex items-center justify-center h-[400px] gap-3">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600 opacity-40" />
            <span className="text-[13px] text-slate-500">Loading delivery config...</span>
        </div>
    );

    return (
        <div className="p-6 lg:p-8 space-y-6 pb-20 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Logistics</p>
                    <h1 className="text-xl font-semibold tracking-tight text-slate-900">Delivery & Shipping</h1>
                    <p className="text-[13px] text-slate-500 mt-1">Configure zones, tariff slabs, and delivery pricing.</p>
                </div>
                <Button variant="outline" className="h-9 px-4 rounded-lg text-[13px] font-medium gap-2" onClick={loadAll}>
                    <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                {([
                    { key: "slabs", label: "Tariff Slabs", icon: Scale },
                    { key: "states", label: "State Zones", icon: MapPin },
                    { key: "settings", label: "Settings", icon: Settings },
                ] as const).map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={cn("flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-all",
                            activeTab === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}>
                        <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══ TAB: Tariff Slabs ═══ */}
            {activeTab === "slabs" && (
                <div className="space-y-6">
                    {/* Zone pills + Add zone */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {zones.map(z => (
                            <div key={z.id} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-medium text-slate-700">
                                {z.zone_code} — {z.zone_name}
                                <button onClick={() => deleteZone(z)} className="ml-1 text-slate-300 hover:text-rose-500 transition-colors">
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        {showAddZone ? (
                            <div className="flex items-center gap-2">
                                <input value={newZoneCode} onChange={e => setNewZoneCode(e.target.value.toUpperCase())}
                                    placeholder="Code" className="h-8 w-20 px-2 rounded-md border border-slate-200 text-[12px] font-medium focus:border-blue-500 outline-none" maxLength={10} />
                                <input value={newZoneName} onChange={e => setNewZoneName(e.target.value)}
                                    placeholder="Zone Name" className="h-8 w-32 px-2 rounded-md border border-slate-200 text-[12px] font-medium focus:border-blue-500 outline-none" />
                                <Button className="h-8 px-3 rounded-md bg-blue-600 text-white text-[11px] font-semibold" onClick={addZone}>Add</Button>
                                <button onClick={() => setShowAddZone(false)} className="text-[12px] text-slate-400 hover:text-slate-600">Cancel</button>
                            </div>
                        ) : (
                            <button onClick={() => setShowAddZone(true)} className="flex items-center gap-1 px-3 py-1.5 border border-dashed border-slate-300 rounded-lg text-[12px] font-medium text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-all">
                                <Plus className="w-3 h-3" /> Add Zone
                            </button>
                        )}
                    </div>

                    {/* Weight / Volume toggle */}
                    <div className="flex bg-slate-100 p-1 rounded-lg w-fit">
                        {(["weight", "volume"] as const).map(t => (
                            <button key={t} onClick={() => setSlabType(t)}
                                className={cn("px-4 py-1.5 rounded-md text-[13px] font-medium transition-all",
                                    slabType === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                                )}>
                                {t === "weight" ? "Weight (g)" : "Volume (ml)"}
                            </button>
                        ))}
                    </div>

                    {/* Slabs Table */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="px-4 py-3 text-left">Max {slabType === "weight" ? "Weight" : "Volume"}</th>
                                    {zones.map(z => (
                                        <th key={z.zone_code} className="px-4 py-3 text-right">{z.zone_code}</th>
                                    ))}
                                    <th className="px-4 py-3 text-right w-16">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {currentSlabs.map(slab => (
                                    <tr key={slab.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-3 text-[13px] font-medium text-slate-900">
                                            {slab.max_value}{unit}
                                        </td>
                                        {zones.map(z => (
                                            <td key={z.zone_code} className="px-4 py-3 text-right">
                                                <input
                                                    type="number"
                                                    value={slab.zone_prices?.[z.zone_code] || 0}
                                                    onChange={e => {
                                                        const price = Number(e.target.value) || 0;
                                                        // Optimistic update
                                                        const setter = slabType === "weight" ? setWeightSlabs : setVolumeSlabs;
                                                        setter(prev => prev.map(s => s.id === slab.id ? { ...s, zone_prices: { ...s.zone_prices, [z.zone_code]: price } } : s));
                                                    }}
                                                    onBlur={e => updateSlabPrice(slab.id, z.zone_code, Number(e.target.value) || 0, slab.zone_prices)}
                                                    className="w-20 h-8 px-2 rounded-md border border-slate-200 text-[13px] font-medium text-right focus:border-blue-500 outline-none"
                                                    min={0}
                                                />
                                            </td>
                                        ))}
                                        <td className="px-4 py-3 text-right">
                                            <button onClick={() => deleteSlab(slab.id)} className="text-slate-300 hover:text-rose-500 transition-colors">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {/* Add new slab row */}
                                <tr className="bg-blue-50/30">
                                    <td className="px-4 py-3">
                                        <input type="number" value={newSlab.max_value} onChange={e => setNewSlab((p: any) => ({ ...p, max_value: e.target.value }))}
                                            placeholder={`Max ${unit}`} className="w-24 h-8 px-2 rounded-md border border-blue-200 text-[13px] font-medium focus:border-blue-500 outline-none bg-white" min={1} />
                                    </td>
                                    {zones.map(z => (
                                        <td key={z.zone_code} className="px-4 py-3 text-right">
                                            <input type="number" value={newSlab.zone_prices?.[z.zone_code] || ""}
                                                onChange={e => setNewSlab((p: any) => ({ ...p, zone_prices: { ...p.zone_prices, [z.zone_code]: Number(e.target.value) || 0 } }))}
                                                placeholder="₹0" className="w-20 h-8 px-2 rounded-md border border-blue-200 text-[13px] font-medium text-right focus:border-blue-500 outline-none bg-white" min={0} />
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 text-right">
                                        <Button className="h-8 px-3 rounded-md bg-blue-600 text-white text-[11px] font-semibold gap-1" onClick={addSlab} disabled={!newSlab.max_value}>
                                            <Plus className="w-3 h-3" /> Add
                                        </Button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        {currentSlabs.length === 0 && (
                            <div className="text-center py-12 text-slate-400">
                                <Scale className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                <p className="text-[13px] font-medium">No {slabType} tariff slabs yet. Add one above.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ TAB: State Zones ═══ */}
            {activeTab === "states" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <p className="text-[13px] text-slate-500">Assign each state to a delivery zone for pricing calculation.</p>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input value={stateSearch} onChange={e => setStateSearch(e.target.value)}
                                placeholder="Search states..." className="h-9 pl-9 pr-4 w-56 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="px-4 py-3 text-left">State</th>
                                    <th className="px-4 py-3 text-left w-48">Zone</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase())).map(state => (
                                    <tr key={state} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-2.5 text-[13px] font-medium text-slate-800">{state}</td>
                                        <td className="px-4 py-2.5">
                                            <select
                                                value={stateZones[state] || ""}
                                                onChange={e => assignState(state, e.target.value)}
                                                className={cn(
                                                    "h-8 px-3 rounded-md border text-[12px] font-semibold uppercase tracking-wider outline-none transition-all",
                                                    stateZones[state] ? "border-blue-200 bg-blue-50 text-blue-700" : "border-slate-200 text-slate-400"
                                                )}>
                                                <option value="">— Unassigned —</option>
                                                {zones.map(z => (
                                                    <option key={z.zone_code} value={z.zone_code}>{z.zone_code}</option>
                                                ))}
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ═══ TAB: Settings ═══ */}
            {activeTab === "settings" && (
                <div className="max-w-lg space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                        <h3 className="text-[13px] font-semibold text-slate-900">Delivery Preferences</h3>
                        <div className="space-y-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Free Delivery Above (₹)</label>
                            <input type="number" value={freeAbove} onChange={e => setFreeAbove(Number(e.target.value))}
                                className="w-full h-10 px-4 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" placeholder="e.g. 500 (0 = no free delivery)" min={0} />
                            <p className="text-[11px] text-slate-400">Set to 0 to disable free delivery.</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Default Item Weight (grams)</label>
                            <input type="number" value={defaultWeight} onChange={e => setDefaultWeight(Number(e.target.value))}
                                className="w-full h-10 px-4 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" placeholder="e.g. 500" min={1} />
                            <p className="text-[11px] text-slate-400">Used when a product has no weight specified.</p>
                        </div>
                        <Button className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-semibold gap-2" onClick={saveSettings}>
                            <Save className="w-3.5 h-3.5" /> Save Settings
                        </Button>
                    </div>

                    {/* Zone summary */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                        <h3 className="text-[13px] font-semibold text-slate-900">Active Zones</h3>
                        <div className="space-y-2">
                            {zones.map(z => {
                                const stateCount = Object.values(stateZones).filter(v => v === z.zone_code).length;
                                const slabCount = [...weightSlabs, ...volumeSlabs].filter(s => s.zone_prices?.[z.zone_code] > 0).length;
                                return (
                                    <div key={z.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <div>
                                            <span className="text-[13px] font-semibold text-slate-800">{z.zone_code}</span>
                                            <span className="text-[12px] text-slate-500 ml-2">{z.zone_name}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                                            <span>{stateCount} states</span>
                                            <span>{slabCount} slabs</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
