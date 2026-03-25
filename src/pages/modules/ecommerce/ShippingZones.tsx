import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { ModuleListPage } from "@/components/modules/ModuleListPage";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import { Truck, MapPin, Globe2, Plus } from "lucide-react";

const columns = [
    { key: "name", label: "Zone Name" },
    { key: "courier_partner", label: "Courier Partner" },
    { key: "base_rate", label: "Base Rate", align: "right" as const },
    { key: "estimated_days", label: "Est. Days" },
    { key: "status", label: "Status" },
];

const fieldConfig = [
    { key: "name", label: "Zone Name", required: true, ph: "e.g. South India, Metro Cities" },
    { key: "courier_partner", label: "Courier Partner", ph: "e.g. Delhivery, Bluedart" },
    { key: "base_rate", label: "Base Shipping Rate (₹)", type: "number" as const },
    { key: "free_above", label: "Free Shipping Above (₹)", type: "number" as const },
    { key: "estimated_days", label: "Estimated Delivery Days", ph: "e.g. 2-3 days" },
    { key: "states_str", label: "Covered States (Comma separated)", type: "text" as const, ph: "Tamil Nadu, Kerala, Karnataka..." },
    { key: "pincodes_str", label: "Specific Pincodes (Optional)", type: "text" as const, ph: "641001, 641002..." },
    { key: "is_active", label: "Active", type: "select" as const, options: [{ label: "Yes", value: "true" }, { label: "No", value: "false" }] },
];

export default function ShippingZones() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [view, setView] = useState<"list" | "form">("list");
    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<any>(null);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from("shipping_zones").select("*").eq("company_id", activeCompany!.id);
        const mapped = (data || []).map(z => ({
            ...z,
            status: z.is_active ? "Active" : "Inactive",
            base_rate_fmt: `₹${Number(z.base_rate).toLocaleString()}`,
            states_str: Array.isArray(z.states) ? z.states.join(", ") : z.states,
            pincodes_str: Array.isArray(z.pincodes) ? z.pincodes.join(", ") : z.pincodes,
        }));
        setZones(mapped);
        setLoading(false);
    };

    const handleNew = () => { setEditing(null); setView("form"); };
    const handleEdit = (item: any) => {
        setEditing({
            ...item,
            is_active: String(item.is_active)
        });
        setView("form");
    };

    const handleSubmit = async (formData: any) => {
        const payload = {
            name: formData.name,
            courier_partner: formData.courier_partner,
            base_rate: Number(formData.base_rate),
            free_above: Number(formData.free_above) || null,
            estimated_days: formData.estimated_days,
            company_id: activeCompany?.id,
            states: formData.states_str ? formData.states_str.split(",").map((s: string) => s.trim()) : [],
            pincodes: formData.pincodes_str ? formData.pincodes_str.split(",").map((s: string) => s.trim()) : [],
            is_active: formData.is_active === "true"
        };

        try {
            if (editing?.id) {
                const { error } = await supabase.from("shipping_zones").update(payload).eq("id", editing.id);
                if (error) throw error;
                toast({ title: "Zone updated" });
            } else {
                const { error } = await supabase.from("shipping_zones").insert([payload]);
                if (error) throw error;
                toast({ title: "Zone created" });
            }
            setView("list");
            load();
        } catch (err: any) {
            console.error("ShippingZone save error:", err);
            toast({ variant: "destructive", title: "Save failed", description: err?.message || "Could not save shipping zone" });
        }
    };

    const handleDelete = async (item: any) => {
        if (!confirm("Delete this shipping zone?")) return;
        await supabase.from("shipping_zones").delete().eq("id", item.id);
        load();
    };

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editing ? "Refine Shipping Matrix" : "Initialize Logistics zone"}
                    subtitle="Universal Logistics Engine"
                    headerFields={fieldConfig}
                    onAbort={() => { setView("list"); setEditing(null); }}
                    onSave={handleSubmit}
                    initialData={editing}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ModuleListPage
                title="Shipping Zones"
                subtitle="Manage delivery areas and shipping rates"
                columns={columns.map(c => c.key === 'base_rate' ? { ...c, key: 'base_rate_fmt' } : c)}
                data={zones}
                loading={loading}
                onNew={handleNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}


