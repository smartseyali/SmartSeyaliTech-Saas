import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Scale, MapPin, Plus, Trash2, Save, Search, RefreshCw,
    Settings, Pencil, X, Truck
} from "lucide-react";

const ZONES = ["TN", "SOUTH", "NE", "REST"];

const ZONE_LABELS: Record<string, string> = {
    TN: "Tamil Nadu",
    SOUTH: "South India",
    NE: "North East",
    REST: "Rest of India",
};

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
    "Arunachal Pradesh": "NE", "Assam": "NE", "Manipur": "NE", "Meghalaya": "NE",
    "Mizoram": "NE", "Nagaland": "NE", "Sikkim": "NE", "Tripura": "NE",
};

export default function ShippingZones() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<"slabs" | "states" | "settings">("slabs");
    const [loading, setLoading] = useState(true);
    const [slabType, setSlabType] = useState<"WEIGHT" | "VOLUME">("WEIGHT");

    // Data
    const [tariffs, setTariffs] = useState<any[]>([]);
    const [stateZones, setStateZones] = useState<Record<string, string>>({});
    const [stateSearch, setStateSearch] = useState("");

    // Settings
    const [freeAbove, setFreeAbove] = useState(0);
    const [defaultWeight, setDefaultWeight] = useState(500);

    // Modal
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({
        tariff_type: "WEIGHT" as string,
        max_weight: "",
        prices: { TN: 0, SOUTH: 0, NE: 0, REST: 0 } as Record<string, number>,
    });

    useEffect(() => { if (activeCompany) loadAll(); }, [activeCompany]);

    const loadAll = async () => {
        if (!activeCompany) return;
        setLoading(true);

        const [{ data: t }, { data: s }, { data: settings }] = await Promise.all([
            supabase.from("delivery_tariffs").select("*").eq("company_id", activeCompany.id).order("max_weight"),
            supabase.from("delivery_states").select("*").eq("company_id", activeCompany.id),
            supabase.from("ecom_settings").select("free_delivery_above, default_item_weight").eq("company_id", activeCompany.id).maybeSingle(),
        ]);

        setTariffs(t || []);

        // Build state map, seed defaults if empty
        const stateData = s || [];
        if (stateData.length === 0) {
            const seedPayload = INDIAN_STATES.map(name => ({
                company_id: activeCompany.id,
                name,
                zone: DEFAULT_STATE_ZONES[name] || "REST",
            }));
            await supabase.from("delivery_states").insert(seedPayload);
            const { data: seeded } = await supabase.from("delivery_states").select("*").eq("company_id", activeCompany.id);
            const map: Record<string, string> = {};
            (seeded || []).forEach((st: any) => { map[st.name] = st.zone; });
            setStateZones(map);
        } else {
            const map: Record<string, string> = {};
            stateData.forEach((st: any) => { map[st.name] = st.zone; });
            setStateZones(map);
        }

        setFreeAbove(Number(settings?.free_delivery_above) || 0);
        setDefaultWeight(Number(settings?.default_item_weight) || 500);
        setLoading(false);
    };

    // ─── Tariff CRUD ────────────────────────────────────────────────────

    const openAddModal = () => {
        setEditing(null);
        setForm({ tariff_type: slabType, max_weight: "", prices: { TN: 0, SOUTH: 0, NE: 0, REST: 0 } });
        setShowModal(true);
    };

    const openEditModal = (tariff: any) => {
        setEditing(tariff);
        setForm({
            tariff_type: tariff.tariff_type,
            max_weight: String(tariff.max_weight),
            prices: { TN: 0, SOUTH: 0, NE: 0, REST: 0, ...tariff.prices },
        });
        setShowModal(true);
    };

    const saveTariff = async () => {
        if (!activeCompany || !form.max_weight) return;
        const payload = {
            company_id: activeCompany.id,
            tariff_type: form.tariff_type,
            max_weight: Number(form.max_weight),
            prices: form.prices,
        };

        if (editing) {
            await supabase.from("delivery_tariffs").update(payload).eq("id", editing.id);
            toast({ title: "Tariff slab updated" });
        } else {
            await supabase.from("delivery_tariffs").insert([payload]);
            toast({ title: "Tariff slab added" });
        }
        setShowModal(false);
        loadAll();
    };

    const deleteTariff = async (id: string) => {
        if (!confirm("Delete this tariff slab?")) return;
        await supabase.from("delivery_tariffs").delete().eq("id", id);
        toast({ title: "Tariff deleted" });
        loadAll();
    };

    // ─── State Zone ─────────────────────────────────────────────────────

    const updateStateZone = async (stateName: string, zone: string) => {
        if (!activeCompany) return;
        await supabase.from("delivery_states").upsert({
            company_id: activeCompany.id,
            name: stateName,
            zone,
        }, { onConflict: "company_id,name" });
        setStateZones(prev => ({ ...prev, [stateName]: zone }));
    };

    // ─── Settings ───────────────────────────────────────────────────────

    const saveSettings = async () => {
        if (!activeCompany) return;
        await supabase.from("ecom_settings").upsert({
            company_id: activeCompany.id,
            free_delivery_above: freeAbove,
            default_item_weight: defaultWeight,
        }, { onConflict: "company_id" });
        toast({ title: "Settings saved" });
    };

    // ─── Derived ────────────────────────────────────────────────────────

    const currentSlabs = tariffs.filter(t => t.tariff_type === slabType);
    const unit = slabType === "WEIGHT" ? "g" : "ml";

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
                    <p className="text-[13px] text-slate-500 mt-1">Configure delivery tariffs and state zone mapping.</p>
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
                <div className="space-y-5">
                    <div className="flex items-center justify-between">
                        {/* Weight / Volume toggle */}
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            {(["WEIGHT", "VOLUME"] as const).map(t => (
                                <button key={t} onClick={() => setSlabType(t)}
                                    className={cn("px-4 py-1.5 rounded-md text-[13px] font-medium transition-all",
                                        slabType === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                                    )}>
                                    {t === "WEIGHT" ? "Weight (Grams)" : "Volume (ML)"}
                                </button>
                            ))}
                        </div>
                        <Button className="h-9 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium gap-2" onClick={openAddModal}>
                            <Plus className="w-3.5 h-3.5" /> Add Tariff Slab
                        </Button>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                            <h3 className="text-[13px] font-semibold text-slate-700">Delivery Tariffs</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Define pricing based on {slabType === "WEIGHT" ? "weight" : "volume"} and zones</p>
                        </div>
                        <table className="w-full">
                            <thead>
                                <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="px-5 py-3 text-left">Max {slabType === "WEIGHT" ? "Weight (g)" : "Volume (ml)"}</th>
                                    {ZONES.map(z => (
                                        <th key={z} className="px-5 py-3 text-right">{z} Price</th>
                                    ))}
                                    <th className="px-5 py-3 text-right w-24">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {currentSlabs.map(slab => (
                                    <tr key={slab.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-3 text-[13px] font-medium text-slate-900">
                                            {slab.max_weight}{unit}
                                        </td>
                                        {ZONES.map(z => (
                                            <td key={z} className="px-5 py-3 text-right text-[13px] font-medium text-slate-700">
                                                ₹{slab.prices?.[z] || 0}
                                            </td>
                                        ))}
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center gap-1 justify-end">
                                                <button onClick={() => openEditModal(slab)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                                                    <Pencil className="w-3.5 h-3.5" />
                                                </button>
                                                <button onClick={() => deleteTariff(slab.id)} className="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {currentSlabs.length === 0 && (
                            <div className="text-center py-16 text-slate-400">
                                <Truck className="w-8 h-8 mx-auto mb-3 opacity-30" />
                                <p className="text-[13px] font-medium">No {slabType.toLowerCase()} tariff slabs yet</p>
                                <p className="text-[11px] text-slate-300 mt-1">Click "Add Tariff Slab" to create one</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══ TAB: State Zones ═══ */}
            {activeTab === "states" && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-[13px] font-semibold text-slate-700">Zone Configuration</h3>
                            <p className="text-[11px] text-slate-400 mt-0.5">Assign states to specific pricing zones</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input value={stateSearch} onChange={e => setStateSearch(e.target.value)}
                                placeholder="Search states..." className="h-9 pl-9 pr-4 w-56 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                                    <th className="px-5 py-3 text-left">State Name</th>
                                    <th className="px-5 py-3 text-left w-48">Zone Assignment</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase())).map(state => (
                                    <tr key={state} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-5 py-2.5 text-[13px] font-medium text-slate-800">{state}</td>
                                        <td className="px-5 py-2.5">
                                            <select
                                                value={stateZones[state] || "REST"}
                                                onChange={e => updateStateZone(state, e.target.value)}
                                                className={cn(
                                                    "h-8 px-3 rounded-md border text-[12px] font-semibold uppercase tracking-wider outline-none transition-all cursor-pointer",
                                                    stateZones[state] === "TN" ? "border-blue-200 bg-blue-50 text-blue-700" :
                                                    stateZones[state] === "SOUTH" ? "border-emerald-200 bg-emerald-50 text-emerald-700" :
                                                    stateZones[state] === "NE" ? "border-purple-200 bg-purple-50 text-purple-700" :
                                                    "border-slate-200 bg-slate-50 text-slate-600"
                                                )}>
                                                {ZONES.map(z => (
                                                    <option key={z} value={z}>{z}</option>
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
                                className="w-full h-10 px-4 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" placeholder="e.g. 500 (0 = disabled)" min={0} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Default Item Weight (grams)</label>
                            <input type="number" value={defaultWeight} onChange={e => setDefaultWeight(Number(e.target.value))}
                                className="w-full h-10 px-4 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" placeholder="e.g. 500" min={1} />
                            <p className="text-[11px] text-slate-400">Fallback weight when product has no weight specified.</p>
                        </div>
                        <Button className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium gap-2" onClick={saveSettings}>
                            <Save className="w-3.5 h-3.5" /> Save Settings
                        </Button>
                    </div>

                    {/* Zone summary */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
                        <h3 className="text-[13px] font-semibold text-slate-900">Zone Overview</h3>
                        {ZONES.map(z => {
                            const states = Object.entries(stateZones).filter(([_, v]) => v === z).map(([k]) => k);
                            const wSlabs = tariffs.filter(t => t.tariff_type === "WEIGHT" && (t.prices?.[z] || 0) > 0).length;
                            const vSlabs = tariffs.filter(t => t.tariff_type === "VOLUME" && (t.prices?.[z] || 0) > 0).length;
                            return (
                                <div key={z} className="p-3 bg-slate-50 rounded-lg">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[13px] font-semibold text-slate-800">{z} <span className="text-slate-400 font-normal">— {ZONE_LABELS[z]}</span></span>
                                        <span className="text-[11px] text-slate-500">{states.length} states · {wSlabs}W / {vSlabs}V slabs</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 truncate">{states.join(", ") || "No states assigned"}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ═══ Add/Edit Tariff Modal ═══ */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-5 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-900">{editing ? "Edit" : "Add"} Tariff Slab</h3>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tariff Type</label>
                                <select value={form.tariff_type} onChange={e => setForm(f => ({ ...f, tariff_type: e.target.value }))}
                                    className="w-full h-10 px-4 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none">
                                    <option value="WEIGHT">Weight (Grams)</option>
                                    <option value="VOLUME">Volume (ML)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                    Max {form.tariff_type === "WEIGHT" ? "Weight (g)" : "Volume (ml)"}
                                </label>
                                <input type="number" value={form.max_weight} onChange={e => setForm(f => ({ ...f, max_weight: e.target.value }))}
                                    placeholder="e.g. 750" className="w-full h-10 px-4 rounded-lg border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" min={1} />
                                <p className="text-[11px] text-slate-400">Prices apply for {form.tariff_type === "WEIGHT" ? "weights" : "volumes"} up to this amount.</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Zone Prices (₹)</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {ZONES.map(z => (
                                        <div key={z} className="space-y-1">
                                            <label className="text-[11px] font-medium text-slate-500">{z} Zone</label>
                                            <input type="number" value={form.prices[z] || 0}
                                                onChange={e => setForm(f => ({ ...f, prices: { ...f.prices, [z]: Number(e.target.value) || 0 } }))}
                                                className="w-full h-9 px-3 rounded-md border border-slate-200 text-[13px] font-medium focus:border-blue-500 outline-none" min={0} step="0.01" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Button variant="outline" className="flex-1 h-10 rounded-lg text-[13px] font-medium" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium" onClick={saveTariff}>{editing ? "Update" : "Add"} Slab</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
