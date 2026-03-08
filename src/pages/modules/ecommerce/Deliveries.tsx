import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { ModuleListPage } from "@/components/modules/ModuleListPage";
import { Truck, Package, CheckCircle2, Clock } from "lucide-react";

const columns = [
    { key: "order_number", label: "Order #" },
    { key: "customer_name", label: "Customer" },
    { key: "status", label: "Status" },
    { key: "courier_partner", label: "Courier" },
    { key: "tracking_id", label: "Tracking ID" },
    { key: "date", label: "Order Date" },
];

export default function Deliveries() {
    const { activeCompany } = useTenant();
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        setLoading(true);
        // Fetch orders that are packed, shipped or out_for_delivery
        const { data } = await supabase.from("ecom_orders")
            .select("*")
            .eq("company_id", activeCompany!.id)
            .in("status", ["packed", "shipped", "out_for_delivery", "delivered"])
            .order("updated_at", { ascending: false });

        const mapped = (data || []).map(d => ({
            ...d,
            tracking_id: d.tracking_number || "Pending",
            courier_partner: d.courier_name || "—",
            date: new Date(d.created_at).toLocaleDateString("en-IN")
        }));
        setDeliveries(mapped);
        setLoading(false);
    };

    return (
        <ModuleListPage
            title="Deliveries"
            subtitle="Track and manage outgoing shipments"
            columns={columns}
            data={deliveries}
            loading={loading}
            detailBaseUrl="/apps/ecommerce/orders"
            idKey="id"
        />
    );
}

