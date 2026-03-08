import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import { ModuleListPage } from "@/components/modules/ModuleListPage";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
import { Truck, MapPin, Globe2, Plus } from "lucide-react";

const columns = [
    { key: "name", label: "Zone Name" },
    { key: "courier_partner", label: "Courier Partner" },
    { key: "base_rate", label: "Base Rate", align: "right" as const },
    { key: "estimated_days", label: "Est. Days" },
    { key: "status", label: "Status" },
];

const fieldConfig: FieldConfig[] = [
    { key: "name", label: "Zone Name", required: true, ph: "e.g. South India, Metro Cities" },
    { key: "courier_partner", label: "Courier Partner", ph: "e.g. Delhivery, Bluedart" },
    { key: "base_rate", label: "Base Shipping Rate (₹)", type: "number" },
    { key: "free_above", label: "Free Shipping Above (₹)", type: "number" },
    { key: "estimated_days", label: "Estimated Delivery Days", ph: "e.g. 2-3 days" },
    { key: "states", label: "Covered States (Comma separated)", type: "textarea", ph: "Tamil Nadu, Kerala, Karnataka..." },
    { key: "pincodes", label: "Specific Pincodes (Optional)", type: "textarea", ph: "641001, 641002..." },
    { key: "is_active", label: "Active", type: "select", options: [{ label: "Yes", value: "true" }, { label: "No", value: "false" }] },
];

export default function ShippingZones() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [zones, setZones] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<any>(null);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from("shipping_zones").select("*").eq("company_id", activeCompany!.id);
        const mapped = (data || []).map(z => ({
            ...z,
            status: z.is_active ? "Active" : "Inactive",
            base_rate: `₹${Number(z.base_rate).toLocaleString()}`
        }));
        setZones(mapped);
        setLoading(false);
    };

    const handleNew = () => { setEditing(null); setOpen(true); };
    const handleEdit = (item: any) => {
        setEditing({
            ...item,
            states: Array.isArray(item.states) ? item.states.join(", ") : item.states,
            pincodes: Array.isArray(item.pincodes) ? item.pincodes.join(", ") : item.pincodes,
            is_active: String(item.is_active)
        });
        setOpen(true);
    };

    const handleSubmit = async (formData: any) => {
        const payload = {
            ...formData,
            company_id: activeCompany?.id,
            base_rate: Number(formData.base_rate),
            free_above: Number(formData.free_above) || null,
            states: formData.states ? formData.states.split(",").map((s: string) => s.trim()) : [],
            pincodes: formData.pincodes ? formData.pincodes.split(",").map((s: string) => s.trim()) : [],
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
            setOpen(false);
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

    return (
        <div className="space-y-6">
            <ModuleListPage
                title="Shipping Zones"
                subtitle="Manage delivery areas and shipping rates"
                columns={columns}
                data={zones}
                loading={loading}
                onNew={handleNew}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
            <DynamicFormDialog
                open={open}
                onOpenChange={setOpen}
                title={editing ? "Edit Zone" : "New Shipping Zone"}
                fields={fieldConfig}
                initialData={editing}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

