import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import ERPListView from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import { cn } from "@/lib/utils";
import {
    Settings, Globe, Scale, DollarSign, FlaskConical, RefreshCw, Zap,
    Package, ArrowLeft, Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ────────────────────────────────────────────────────────────────
// SECTION VIEWS — 4 entity sections + 1 test panel
// ────────────────────────────────────────────────────────────────

type Section = "tariffs" | "zones" | "slabs" | "extras" | "test";

export default function ShippingZones() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [section, setSection] = useState<Section>("tariffs");

    // ── entity states
    const [tariffs, setTariffs] = useState<any[]>([]);
    const [zones, setZones] = useState<any[]>([]);
    const [slabs, setSlabs] = useState<any[]>([]);
    const [extras, setExtras] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // ── form view toggle
    const [view, setView] = useState<"list" | "form">("list");
    const [editingItem, setEditingItem] = useState<any>(null);

    // ── test
    const [testForm, setTestForm] = useState({ state: "", pincode: "", weight: "", qty: "", value: "", volume: "", payment: "prepaid" });
    const [testResult, setTestResult] = useState<any>(null);
    const [testing, setTesting] = useState(false);

    // ── search
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => { if (activeCompany) loadAll(); }, [activeCompany]);

    const loadAll = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const [{ data: t }, { data: z }, { data: s }, { data: e }] = await Promise.all([
            supabase.from("shipping_tariffs").select("*").eq("company_id", activeCompany.id).order("priority"),
            supabase.from("shipping_zones_v2").select("*").eq("company_id", activeCompany.id).order("display_order"),
            supabase.from("shipping_slabs").select("*").eq("company_id", activeCompany.id).order("range_from"),
            supabase.from("shipping_extra_charges").select("*").eq("company_id", activeCompany.id).order("charge_type"),
        ]);
        setTariffs(t || []);
        setZones(z || []);
        setSlabs(s || []);
        setExtras(e || []);
        setLoading(false);
    };

    const openNew = () => { setEditingItem(null); setView("form"); };
    const openEdit = (item: any) => { setEditingItem(item); setView("form"); };
    const backToList = () => { setView("list"); setEditingItem(null); setSearchTerm(""); };

    // ════════════════════════════════════════════════════════════
    // TARIFFS
    // ════════════════════════════════════════════════════════════

    const tariffFields = {
        basic: [
            { key: "tariff_name", label: "Tariff Name", type: "text" as const, required: true, ph: "e.g. Standard Shipping" },
            { key: "shipping_type", label: "Shipping Type", type: "select" as const, required: true, options: [
                { value: "UNIFIED", label: "Unified (Weight + Volume → Grams)" },
                { value: "WEIGHT", label: "Weight-Based (kg)" },
                { value: "QTY", label: "Quantity-Based (units)" },
                { value: "VALUE", label: "Value-Based (₹)" },
                { value: "VOLUME", label: "Volume-Based (cm³)" },
            ]},
            { key: "primary_uom", label: "Primary UoM", type: "text" as const, ph: "g / kg / units / ₹ / ml" },
            { key: "ml_to_g_factor", label: "ML → Grams Factor", type: "number" as const, ph: "1.0 (1ml = 1g)" },
            { key: "priority", label: "Priority", type: "number" as const, ph: "1 = highest" },
            { key: "is_active", label: "Active", type: "checkbox" as const },
            { key: "rounding_rule", label: "Rounding Rule", type: "select" as const, options: [
                { value: "ROUND_UP", label: "Round Up" },
                { value: "ROUND_DOWN", label: "Round Down" },
                { value: "ROUND_NEAREST", label: "Round Nearest" },
            ]},
        ],
        config: [
            { key: "free_shipping_enabled", label: "Enable Free Shipping", type: "checkbox" as const },
            { key: "free_shipping_condition", label: "Free Shipping Condition", type: "select" as const, options: [
                { value: "VALUE", label: "Order Value (₹)" },
                { value: "WEIGHT", label: "Weight (kg)" },
                { value: "QTY", label: "Quantity" },
            ]},
            { key: "free_shipping_min", label: "Minimum for Free Shipping", type: "number" as const, ph: "0" },
            { key: "conflict_resolution", label: "Conflict Resolution", type: "select" as const, options: [
                { value: "HIGHEST_PRIORITY", label: "Highest Priority Wins" },
                { value: "LOWEST_CHARGE", label: "Lowest Charge Wins" },
                { value: "HIGHEST_CHARGE", label: "Highest Charge Wins" },
            ]},
        ],
    };

    const saveTariff = async (header: any) => {
        if (!activeCompany) return;
        const payload = {
            company_id: activeCompany.id,
            tariff_name: header.tariff_name || "Standard Shipping",
            shipping_type: header.shipping_type || "UNIFIED",
            primary_uom: header.primary_uom || "g",
            ml_to_g_factor: Number(header.ml_to_g_factor) || 1.0,
            priority: Number(header.priority) || 1,
            is_active: header.is_active ?? true,
            rounding_rule: header.rounding_rule || "ROUND_UP",
            free_shipping_enabled: header.free_shipping_enabled || false,
            free_shipping_condition: header.free_shipping_condition || "VALUE",
            free_shipping_min: Number(header.free_shipping_min) || 0,
            conflict_resolution: header.conflict_resolution || "HIGHEST_PRIORITY",
            updated_at: new Date().toISOString(),
        };
        if (editingItem?.id) {
            const { error } = await supabase.from("shipping_tariffs").update(payload).eq("id", editingItem.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from("shipping_tariffs").insert([payload]);
            if (error) throw error;
        }
        toast({ title: editingItem ? "Tariff updated" : "Tariff created" });
        await loadAll();
        backToList();
    };

    const deleteTariff = async (id: string) => {
        await supabase.from("shipping_tariffs").delete().eq("id", id);
        toast({ title: "Tariff deleted" });
        await loadAll();
        backToList();
    };

    const tariffColumns = [
        { key: "tariff_name", label: "Tariff Name", render: (r: any) => (
            <div className="flex flex-col">
                <span className="font-semibold text-slate-900 text-[13px]">{r.tariff_name}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Priority: {r.priority}</span>
            </div>
        )},
        { key: "shipping_type", label: "Type", render: (r: any) => (
            <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-semibold px-2 py-1 rounded bg-blue-50 text-blue-700">{r.shipping_type} ({r.primary_uom})</span>
                {r.shipping_type === "UNIFIED" && <span className="text-[10px] text-slate-400">1ml = {r.ml_to_g_factor ?? 1}g</span>}
            </div>
        )},
        { key: "rounding_rule", label: "Rounding", render: (r: any) => (
            <span className="text-[12px] text-slate-600">{r.rounding_rule?.replace("ROUND_", "")}</span>
        )},
        { key: "free_shipping_enabled", label: "Free Shipping", render: (r: any) => (
            r.free_shipping_enabled
                ? <span className="text-[11px] font-semibold px-2 py-1 rounded bg-emerald-50 text-emerald-700">Yes — {r.free_shipping_condition} ≥ {r.free_shipping_min}</span>
                : <span className="text-[11px] text-slate-400">Off</span>
        )},
        { key: "is_active", label: "Status", render: (r: any) => (
            <span className={cn("text-[11px] font-semibold px-2 py-1 rounded", r.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{r.is_active ? "Active" : "Inactive"}</span>
        )},
    ];

    // ════════════════════════════════════════════════════════════
    // ZONES
    // ════════════════════════════════════════════════════════════

    const tariffOptions = useMemo(() => tariffs.map(t => ({ value: t.id, label: t.tariff_name })), [tariffs]);

    const zoneFields = {
        basic: [
            { key: "tariff_id", label: "Tariff", type: "select" as const, required: true, options: tariffOptions },
            { key: "zone_name", label: "Zone Name", type: "text" as const, required: true, ph: "e.g. Local, Regional, National, International" },
            { key: "country", label: "Country", type: "text" as const, ph: "India" },
            { key: "states", label: "States (comma separated)", type: "text" as const, ph: "Tamil Nadu, Karnataka, Kerala" },
            { key: "charge_type", label: "Charge Type", type: "select" as const, options: [
                { value: "VARIABLE", label: "Variable (Slab-based)" },
                { value: "FLAT", label: "Flat Rate" },
            ]},
            { key: "flat_charge", label: "Flat Charge (₹)", type: "number" as const, ph: "0" },
        ],
        config: [
            { key: "pincode_from", label: "Pincode From", type: "text" as const, ph: "600000" },
            { key: "pincode_to", label: "Pincode To", type: "text" as const, ph: "699999" },
            { key: "display_order", label: "Display Order", type: "number" as const, ph: "0" },
        ],
    };

    const saveZone = async (header: any) => {
        if (!activeCompany) return;
        const statesArr = header.states ? String(header.states).split(",").map((s: string) => s.trim()).filter(Boolean) : [];
        const payload = {
            company_id: activeCompany.id,
            tariff_id: header.tariff_id || null,
            zone_name: header.zone_name,
            country: header.country || "India",
            states: statesArr,
            pincode_from: header.pincode_from || null,
            pincode_to: header.pincode_to || null,
            charge_type: header.charge_type || "VARIABLE",
            flat_charge: Number(header.flat_charge) || 0,
            display_order: Number(header.display_order) || 0,
        };
        if (editingItem?.id) {
            const { error } = await supabase.from("shipping_zones_v2").update(payload).eq("id", editingItem.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from("shipping_zones_v2").insert([payload]);
            if (error) throw error;
        }
        toast({ title: editingItem ? "Zone updated" : "Zone created" });
        await loadAll();
        backToList();
    };

    const deleteZone = async (id: string) => {
        await supabase.from("shipping_zones_v2").delete().eq("id", id);
        toast({ title: "Zone deleted" });
        await loadAll();
        backToList();
    };

    const zoneColumns = [
        { key: "zone_name", label: "Zone", render: (r: any) => (
            <div className="flex flex-col">
                <span className="font-semibold text-slate-900 text-[13px]">{r.zone_name}</span>
                <span className="text-[11px] text-slate-400 mt-0.5">{r.country || "India"}</span>
            </div>
        )},
        { key: "tariff_id", label: "Tariff", render: (r: any) => (
            <span className="text-[12px] text-slate-600">{tariffs.find(t => t.id === r.tariff_id)?.tariff_name || "—"}</span>
        )},
        { key: "states", label: "States", render: (r: any) => (
            <span className="text-[12px] text-slate-500 max-w-[200px] truncate block">{(r.states || []).join(", ") || "All States"}</span>
        )},
        { key: "pincode_from", label: "Pincode Range", render: (r: any) => (
            <span className="text-[12px] font-mono text-slate-500">{r.pincode_from && r.pincode_to ? `${r.pincode_from} – ${r.pincode_to}` : "—"}</span>
        )},
        { key: "charge_type", label: "Type", render: (r: any) => (
            <span className={cn("text-[11px] font-semibold px-2 py-1 rounded", r.charge_type === "FLAT" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700")}>
                {r.charge_type}{r.charge_type === "FLAT" ? ` ₹${r.flat_charge}` : ""}
            </span>
        )},
    ];

    // Prepare zone data for editing — convert states array to comma string
    const prepareZoneForEdit = (z: any) => ({
        ...z,
        states: (z.states || []).join(", "),
    });

    // ════════════════════════════════════════════════════════════
    // SLABS
    // ════════════════════════════════════════════════════════════

    const zoneOptions = useMemo(() => [
        { value: "", label: "All Zones (Global)" },
        ...zones.map(z => ({ value: z.id, label: z.zone_name }))
    ], [zones]);

    // Merchant-friendly UoM registry. Add a row here to support a new dimension.
    const UOM_CATALOG: Record<string, { label: string; unit: string; desc: string; color: string }> = {
        g:     { label: "Weight",      unit: "grams",  desc: "Matches against total cart weight in grams",     color: "bg-amber-50 text-amber-700" },
        ml:    { label: "Volume",      unit: "ml",     desc: "Matches against total cart volume in millilitres", color: "bg-violet-50 text-violet-700" },
        qty:   { label: "Quantity",    unit: "pcs",    desc: "Matches against total number of items in cart",  color: "bg-sky-50 text-sky-700" },
        value: { label: "Order Value", unit: "₹",      desc: "Matches against order subtotal in rupees",       color: "bg-emerald-50 text-emerald-700" },
    };
    const uomOf     = (r: any) => (r.slab_uom || "g") as keyof typeof UOM_CATALOG;
    const uomMeta   = (key: string) => UOM_CATALOG[key] || UOM_CATALOG.g;
    const uomLabel  = (key: string) => uomMeta(key).label;
    const uomUnit   = (key: string) => uomMeta(key).unit;

    // Auto-default tariff when the merchant has only one (most common case)
    const defaultTariffId = tariffs.length === 1 ? tariffs[0].id : "";
    const showTariffField = tariffs.length > 1;

    const slabFields = {
        basic: [
            ...(showTariffField ? [{ key: "tariff_id", label: "Tariff", type: "select" as const, required: true, options: tariffOptions }] : []),
            { key: "zone_id", label: "Zone", type: "select" as const, options: zoneOptions, ph: "Applies to which zone?" },
            { key: "slab_uom", label: "Charge Based On", type: "select" as const, required: true, options: [
                { value: "g",     label: "Weight (grams)" },
                { value: "ml",    label: "Volume (millilitres)" },
                { value: "qty",   label: "Quantity (pieces)" },
                { value: "value", label: "Order Value (₹)" },
            ]},
            { key: "range_from", label: "From", type: "number" as const, required: true, ph: "e.g. 0" },
            { key: "range_to", label: "To (leave empty for ∞)", type: "number" as const, ph: "e.g. 750" },
            { key: "base_charge", label: "Charge (₹)", type: "number" as const, required: true, ph: "e.g. 120" },
        ],
        config: [
            { key: "has_per_unit", label: "Add per-unit extra beyond the 'From' value", type: "checkbox" as const },
            { key: "extra_charge_per_unit", label: "Extra per Unit (₹)", type: "number" as const, ph: "e.g. 20" },
            { key: "display_order", label: "Display Order", type: "number" as const, ph: "0" },
        ],
    };

    const saveSlab = async (header: any) => {
        if (!activeCompany) return;
        const payload = {
            company_id: activeCompany.id,
            tariff_id: header.tariff_id || defaultTariffId,
            zone_id: header.zone_id || null,
            slab_uom: header.slab_uom || "g",
            range_from: Number(header.range_from) || 0,
            range_to: header.range_to ? Number(header.range_to) : null,
            base_charge: Number(header.base_charge) || 0,
            extra_charge_per_unit: Number(header.extra_charge_per_unit) || 0,
            has_per_unit: header.has_per_unit || false,
            display_order: Number(header.display_order) || 0,
        };
        if (!payload.tariff_id) {
            toast({ title: "No tariff configured", description: "Create a tariff first in the Settings tab.", variant: "destructive" as any });
            return;
        }
        if (editingItem?.id) {
            const { error } = await supabase.from("shipping_slabs").update(payload).eq("id", editingItem.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from("shipping_slabs").insert([payload]);
            if (error) throw error;
        }
        toast({ title: editingItem ? "Rule updated" : "Rule added" });
        await loadAll();
        backToList();
    };

    const deleteSlab = async (id: string) => {
        await supabase.from("shipping_slabs").delete().eq("id", id);
        toast({ title: "Rule deleted" });
        await loadAll();
        backToList();
    };

    const slabColumns = [
        { key: "zone_id", label: "Zone", render: (r: any) => (
            <span className="text-[13px] font-semibold text-slate-800">{zones.find(z => z.id === r.zone_id)?.zone_name || "All Zones"}</span>
        )},
        { key: "slab_uom", label: "Based On", render: (r: any) => {
            const u = uomOf(r);
            const meta = uomMeta(u);
            return <span className={cn("text-[11px] font-semibold px-2 py-1 rounded", meta.color)}>{meta.label}</span>;
        }},
        { key: "range_from", label: "Range", render: (r: any) => {
            const unit = uomUnit(uomOf(r));
            return <span className="text-[13px] font-mono font-medium text-slate-900">{r.range_from} – {r.range_to ?? "∞"} {unit}</span>;
        }},
        { key: "base_charge", label: "Charge", render: (r: any) => (
            <span className="text-[13px] font-semibold text-slate-900">₹{r.base_charge}</span>
        )},
        { key: "extra_charge_per_unit", label: "Extra/Unit", render: (r: any) => (
            r.has_per_unit
                ? <span className="text-[12px] font-medium text-blue-700">+₹{r.extra_charge_per_unit}/{uomUnit(uomOf(r))}</span>
                : <span className="text-[12px] text-slate-400">—</span>
        )},
        ...(tariffs.length > 1 ? [{ key: "tariff_id", label: "Tariff", render: (r: any) => (
            <span className="text-[12px] text-slate-500">{tariffs.find(t => t.id === r.tariff_id)?.tariff_name || "—"}</span>
        )}] : []),
    ];

    // Preselect tariff on new-rule form when there's exactly one
    const prepareSlabForEdit = (s: any) => s || {};
    const slabInitialData = editingItem ? editingItem : (defaultTariffId ? { tariff_id: defaultTariffId, slab_uom: "g" } : { slab_uom: "g" });

    // ════════════════════════════════════════════════════════════
    // EXTRA CHARGES
    // ════════════════════════════════════════════════════════════

    const extraFields = {
        basic: [
            { key: "tariff_id", label: "Tariff (optional)", type: "select" as const, options: [{ value: "", label: "All Tariffs" }, ...tariffOptions] },
            { key: "charge_type", label: "Charge Type", type: "select" as const, required: true, options: [
                { value: "COD", label: "COD" },
                { value: "EXPRESS", label: "Express" },
                { value: "HANDLING", label: "Handling" },
                { value: "PACKAGING", label: "Packaging" },
                { value: "INSURANCE", label: "Insurance" },
            ]},
            { key: "charge_name", label: "Charge Name", type: "text" as const, required: true, ph: "e.g. COD Fee, Express Surcharge" },
            { key: "amount", label: "Amount", type: "number" as const, required: true, ph: "50" },
            { key: "is_percentage", label: "Amount is Percentage (%)", type: "checkbox" as const },
            { key: "is_active", label: "Active", type: "checkbox" as const },
        ],
        config: [
            { key: "applies_to", label: "Applies To", type: "select" as const, options: [
                { value: "ALL", label: "All Orders" },
                { value: "COD_ONLY", label: "COD Orders Only" },
                { value: "PREPAID_ONLY", label: "Prepaid Orders Only" },
            ]},
            { key: "min_order_value", label: "Min Order Value (₹)", type: "number" as const, ph: "0" },
            { key: "max_order_value", label: "Max Order Value (₹)", type: "number" as const, ph: "0 = no limit" },
        ],
    };

    const saveExtra = async (header: any) => {
        if (!activeCompany) return;
        const payload = {
            company_id: activeCompany.id,
            tariff_id: header.tariff_id || null,
            charge_type: header.charge_type || "COD",
            charge_name: header.charge_name,
            amount: Number(header.amount) || 0,
            is_percentage: header.is_percentage || false,
            is_active: header.is_active ?? true,
            applies_to: header.applies_to || "ALL",
            min_order_value: Number(header.min_order_value) || 0,
            max_order_value: Number(header.max_order_value) || 0,
        };
        if (editingItem?.id) {
            const { error } = await supabase.from("shipping_extra_charges").update(payload).eq("id", editingItem.id);
            if (error) throw error;
        } else {
            const { error } = await supabase.from("shipping_extra_charges").insert([payload]);
            if (error) throw error;
        }
        toast({ title: editingItem ? "Extra charge updated" : "Extra charge created" });
        await loadAll();
        backToList();
    };

    const deleteExtra = async (id: string) => {
        await supabase.from("shipping_extra_charges").delete().eq("id", id);
        toast({ title: "Charge deleted" });
        await loadAll();
        backToList();
    };

    const extraColumns = [
        { key: "charge_type", label: "Type", render: (r: any) => (
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-600">{r.charge_type}</span>
        )},
        { key: "charge_name", label: "Name", render: (r: any) => (
            <span className="text-[13px] font-medium text-slate-800">{r.charge_name}</span>
        )},
        { key: "amount", label: "Amount", render: (r: any) => (
            <span className="text-[13px] font-semibold text-slate-900">{r.is_percentage ? `${r.amount}%` : `₹${r.amount}`}</span>
        )},
        { key: "applies_to", label: "Applies To", render: (r: any) => (
            <span className="text-[12px] text-slate-500">{r.applies_to === "ALL" ? "All Orders" : r.applies_to === "COD_ONLY" ? "COD Only" : "Prepaid Only"}</span>
        )},
        { key: "tariff_id", label: "Tariff", render: (r: any) => (
            <span className="text-[12px] text-slate-500">{tariffs.find(t => t.id === r.tariff_id)?.tariff_name || "All"}</span>
        )},
        { key: "is_active", label: "Status", render: (r: any) => (
            <span className={cn("text-[11px] font-semibold px-2 py-1 rounded", r.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500")}>{r.is_active ? "Active" : "Inactive"}</span>
        )},
    ];

    // ════════════════════════════════════════════════════════════
    // TEST SIMULATION
    // ════════════════════════════════════════════════════════════

    const runTest = async () => {
        if (!activeCompany) return;
        setTesting(true);
        setTestResult(null);
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

    const inputCls = "w-full h-10 px-3 rounded-lg border border-slate-300 bg-white text-slate-900 text-[13px] font-medium placeholder:text-slate-400 outline-none transition-all duration-150 hover:border-blue-400 hover:bg-blue-50/30 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 focus:bg-white";
    const labelCls = "text-[12px] font-semibold text-slate-600";

    // ════════════════════════════════════════════════════════════
    // CONFIG PER SECTION
    // ════════════════════════════════════════════════════════════

    const sectionConfig: Record<Section, {
        label: string; icon: any; data: any[]; columns: any[];
        fields: any; onSave: (h: any, i: any[]) => Promise<void>;
        onDelete?: (id: string) => Promise<void>;
        prepareEdit?: (item: any) => any;
        defaultsForNew?: any;
        formTitle: string; formSubtitle: string;
    } | null> = {
        tariffs: {
            label: "Shipping Settings", icon: Settings,
            data: tariffs, columns: tariffColumns, fields: tariffFields,
            onSave: saveTariff, onDelete: deleteTariff,
            formTitle: editingItem ? "Edit Tariff" : "New Shipping Tariff",
            formSubtitle: "Free shipping threshold, rounding, priority",
        },
        zones: {
            label: "Shipping Zones", icon: Globe,
            data: zones, columns: zoneColumns, fields: zoneFields,
            onSave: saveZone, onDelete: deleteZone,
            prepareEdit: prepareZoneForEdit,
            formTitle: editingItem ? "Edit Zone" : "New Shipping Zone",
            formSubtitle: "Where you ship (state / pincode range / flat-rate zones)",
        },
        slabs: {
            label: "Pricing Rules", icon: Scale,
            data: slabs, columns: slabColumns, fields: slabFields,
            onSave: saveSlab, onDelete: deleteSlab,
            defaultsForNew: slabInitialData,
            formTitle: editingItem ? "Edit Pricing Rule" : "New Pricing Rule",
            formSubtitle: "Pick a zone, pick what to charge based on, set the range and the amount",
        },
        extras: {
            label: "Extra Charges", icon: DollarSign,
            data: extras, columns: extraColumns, fields: extraFields,
            onSave: saveExtra, onDelete: deleteExtra,
            formTitle: editingItem ? "Edit Extra Charge" : "New Extra Charge",
            formSubtitle: "COD / Express / Handling fees",
        },
        test: null,
    };

    const cfg = sectionConfig[section];

    // ════════════════════════════════════════════════════════════
    // RENDER — FORM VIEW
    // ════════════════════════════════════════════════════════════

    if (view === "form" && cfg) {
        const editData = editingItem
            ? (cfg.prepareEdit ? cfg.prepareEdit(editingItem) : editingItem)
            : cfg.defaultsForNew;
        return (
            <ERPEntryForm
                title={cfg.formTitle}
                subtitle={cfg.formSubtitle}
                tabFields={cfg.fields}
                onSave={(header) => cfg.onSave(header, [])}
                onAbort={backToList}
                onDelete={editingItem?.id && cfg.onDelete ? () => cfg.onDelete!(editingItem.id) : undefined}
                initialData={editData}
                showItems={false}
            />
        );
    }

    // ════════════════════════════════════════════════════════════
    // RENDER — LIST VIEW + TEST
    // ════════════════════════════════════════════════════════════

    const filteredData = cfg ? cfg.data.filter((item: any) => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return JSON.stringify(item).toLowerCase().includes(s);
    }) : [];

    const sections: { key: Section; label: string; icon: any; count: number }[] = [
        { key: "zones",   label: "Zones",         icon: Globe,        count: zones.length },
        { key: "slabs",   label: "Pricing Rules", icon: Scale,        count: slabs.length },
        { key: "extras",  label: "Extra Charges", icon: DollarSign,   count: extras.length },
        { key: "tariffs", label: "Settings",      icon: Settings,     count: tariffs.length },
        { key: "test",    label: "Test",          icon: FlaskConical, count: 0 },
    ];

    const sectionHint: Record<Section, string> = {
        zones:   "1. Define where you ship — by state, pincode, or a flat-rate zone.",
        slabs:   "2. Add pricing rules per zone. Each rule charges based on one dimension (weight / volume / quantity / order value). Charges from all matching rules are summed.",
        extras:  "3. Add extra fees like COD, Express, or Handling that apply on top of the base shipping.",
        tariffs: "4. Tariff settings — free-shipping thresholds, rounding rule, priority.",
        test:    "Simulate a customer cart to verify your rules produce the charge you expect.",
    };

    return (
        <div className="space-y-0 animate-in fade-in duration-300">
            {/* Section Tabs */}
            <div className="px-3 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <div>
                        <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900">Shipping & Delivery</h1>
                        <p className="text-[11px] text-slate-400 font-medium">Set up your zones, then add pricing rules. Charges from every matching rule are summed.</p>
                    </div>
                </div>
                <p className="text-[11px] text-slate-500 mb-3 pl-8">{sectionHint[section]}</p>
                <div className="flex gap-1 flex-wrap overflow-x-auto pb-1 -mb-1">
                    {sections.map(s => (
                        <button
                            key={s.key}
                            onClick={() => { setSection(s.key); setView("list"); setSearchTerm(""); }}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold tracking-wide transition-all",
                                section === s.key
                                    ? "bg-slate-900 text-white shadow-sm"
                                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                            )}
                        >
                            <s.icon className="w-3.5 h-3.5" />
                            {s.label}
                            {s.count > 0 && (
                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[9px] font-mono",
                                    section === s.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                )}>
                                    {s.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Test Simulation Panel */}
            {section === "test" && (
                <div className="p-3 sm:p-6 space-y-6">
                    <div className="max-w-2xl space-y-6 mx-auto sm:mx-0">
                        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
                            <h3 className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                                <FlaskConical className="w-4 h-4 text-blue-600" /> Test Shipping Calculation
                            </h3>
                            <p className="text-[11px] text-slate-400">Enter test values to simulate the shipping charge calculation pipeline for your company.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5"><label className={labelCls}>State</label><input value={testForm.state} onChange={e => setTestForm(f => ({ ...f, state: e.target.value }))} className={inputCls} placeholder="e.g. Tamil Nadu" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Pincode</label><input value={testForm.pincode} onChange={e => setTestForm(f => ({ ...f, pincode: e.target.value }))} className={inputCls} placeholder="e.g. 641001" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Weight (grams)</label><input type="number" value={testForm.weight} onChange={e => setTestForm(f => ({ ...f, weight: e.target.value }))} className={inputCls} step="1" placeholder="500" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Quantity</label><input type="number" value={testForm.qty} onChange={e => setTestForm(f => ({ ...f, qty: e.target.value }))} className={inputCls} placeholder="1" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Order Value (₹)</label><input type="number" value={testForm.value} onChange={e => setTestForm(f => ({ ...f, value: e.target.value }))} className={inputCls} placeholder="750" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Volume (ml)</label><input type="number" value={testForm.volume} onChange={e => setTestForm(f => ({ ...f, volume: e.target.value }))} className={inputCls} step="1" placeholder="1000" /></div>
                                <div className="space-y-1.5"><label className={labelCls}>Payment Method</label>
                                    <select value={testForm.payment} onChange={e => setTestForm(f => ({ ...f, payment: e.target.value }))} className={inputCls}>
                                        <option value="prepaid">Prepaid</option>
                                        <option value="cod">Cash on Delivery</option>
                                    </select>
                                </div>
                            </div>
                            <Button
                                className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium gap-2"
                                onClick={runTest}
                                disabled={testing}
                            >
                                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                                Calculate
                            </Button>
                        </div>

                        {testResult && !testResult.error && (
                            <div className="bg-white rounded-xl border border-blue-200 p-6 space-y-3">
                                <h3 className="text-[13px] font-semibold text-blue-700 flex items-center gap-2"><Package className="w-4 h-4" /> Result</h3>
                                <div className="space-y-0 text-[13px]">
                                    <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">Tariff</span><span className="font-medium text-slate-900">{testResult.tariff || "—"}</span></div>
                                    <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">Zone Matched</span><span className="font-medium text-slate-900">{testResult.zone}</span></div>
                                    <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">Method</span><span className="font-medium text-slate-900">{testResult.method}</span></div>
                                    {(testResult.breakdown?.weight_g != null || testResult.breakdown?.volume_ml != null) && (
                                        <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">Cart Input</span><span className="font-medium text-slate-900">{testResult.breakdown.weight_g || 0}g · {testResult.breakdown.volume_ml || 0}ml</span></div>
                                    )}
                                    {(testResult.breakdown?.matched_slabs || []).map((m: any, i: number) => (
                                        <div key={i} className="flex justify-between py-2 border-b border-slate-50">
                                            <span className="text-slate-500">
                                                {uomLabel(m.uom)} rule
                                                <span className="text-[10px] text-slate-400 ml-1">
                                                    ({m.from}–{m.to ?? "∞"} {uomUnit(m.uom)} · input {m.input})
                                                </span>
                                            </span>
                                            <span className="font-medium text-slate-900">₹{m.charge}</span>
                                        </div>
                                    ))}
                                    <div className="flex justify-between py-2 border-b border-slate-50"><span className="text-slate-500">Base Charge Subtotal</span><span className="font-semibold text-slate-900">₹{testResult.breakdown?.base || 0}</span></div>
                                    {(testResult.breakdown?.extra_items || []).map((ex: any, i: number) => (
                                        <div key={i} className="flex justify-between py-2 border-b border-slate-50">
                                            <span className="text-slate-500">{ex.name} <span className="text-[10px] text-slate-400">({ex.type})</span></span>
                                            <span className="font-medium text-slate-900">₹{ex.amount}</span>
                                        </div>
                                    ))}
                                    {testResult.free_shipping && (
                                        <div className="flex justify-between py-2 bg-emerald-50 px-3 rounded-lg border border-emerald-100 mt-2">
                                            <span className="text-emerald-700 font-semibold">FREE SHIPPING</span>
                                            <span className="font-bold text-emerald-700">₹0</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between py-3 bg-slate-900 text-white px-4 rounded-lg mt-3">
                                        <span className="font-semibold">Total Shipping Charge</span>
                                        <span className="text-xl font-bold">₹{testResult.shipping_charge}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {testResult?.error && (
                            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-[13px] text-rose-700">{testResult.error}</div>
                        )}

                        {!testResult && !testing && (
                            <div className="text-center py-8">
                                <FlaskConical className="w-8 h-8 mx-auto mb-3 text-slate-200" />
                                <p className="text-[13px] text-slate-400">Enter values and click Calculate to test your shipping configuration</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Entity List Views */}
            {section !== "test" && cfg && (
                <ERPListView
                    title={cfg.label}
                    data={filteredData}
                    columns={cfg.columns}
                    onNew={openNew}
                    onRefresh={loadAll}
                    isLoading={loading}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    primaryKey="id"
                    onRowClick={openEdit}
                    onDeleteItem={(id) => cfg.onDelete?.(id)}
                />
            )}
        </div>
    );
}
