import { useState, useEffect } from "react";
import {
    Plus,
    Edit
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";

export default function Deliveries() {
    const { activeCompany } = useTenant();
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingDelivery, setEditingDelivery] = useState<any>(null);

    useEffect(() => {
        if (activeCompany) loadDeliveries();
    }, [activeCompany?.id]);

    const loadDeliveries = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('sales_deliveries')
            .select('*')
            .eq('company_id', activeCompany.id)
            .order('created_at', { ascending: false });

        if (!error && data) setDeliveries(data);
        setLoading(false);
    };

    const deliveryHeaderFields = [
        { key: "customer_name", label: "Recipient Name", required: true },
        { key: "reference_no", label: "Delivery Note Ref", required: true },
        { key: "date", label: "Shipment Date", type: "date" as const },
        { key: "tracking_no", label: "Logistics Tracking" },
        {
            key: "status", label: "Shipment Status", type: "select" as const,
            options: [
                { label: "Draft Note", value: "draft" },
                { label: "Dispatch Ready", value: "ready" },
                { label: "In Transit", value: "in-transit" },
                { label: "Successfully Delivered", value: "delivered" }
            ]
        }
    ];

    const handleSaveDelivery = async (header: any, items: any[]) => {
        try {
            const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

            const payload = {
                ...header,
                company_id: activeCompany?.id,
                total_qty: totalQty
            };

            const { data: savedHeader, error: hError } = await supabase
                .from('sales_deliveries')
                .upsert([payload])
                .select()
                .single();

            if (hError) throw hError;

            if (header.id) {
                await supabase.from('sales_delivery_items').delete().eq('delivery_id', header.id);
            }

            const lineItems = items.map(item => ({
                delivery_id: savedHeader.id,
                description: item.description,
                quantity: item.quantity
            }));

            const { error: iError } = await supabase.from('sales_delivery_items').insert(lineItems);
            if (iError) throw iError;

            toast.success("Delivery Protocol Synchronized");
            setView("list");
            loadDeliveries();
        } catch (err: any) {
            toast.error(`Logistics Sync Failure: ${err.message}`);
        }
    };

    const filteredDeliveries = deliveries.filter(d =>
        d.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.reference_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <ERPEntryForm
                title={editingDelivery ? "Modify Delivery Note" : "Initialize Dispatch"}
                subtitle="Enterprise Inventory Logistics"
                headerFields={deliveryHeaderFields}
                onAbort={() => { setView("list"); setEditingDelivery(null); }}
                onSave={handleSaveDelivery}
                initialData={editingDelivery}
                initialItems={editingDelivery ? [] : undefined}
            />
        );
    }

    const deliveryColumns = [
        { 
            key: "reference_no", 
            label: "Dispatch Ref",
            render: (d: any) => <span className="font-bold text-gray-900 tracking-tight ">{d.reference_no}</span>
        },
        { 
            key: "customer_name", 
            label: "Destination",
            render: (d: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800   leading-none">{d.customer_name}</span>
                    <span className="text-xs text-gray-400 font-bold  tracking-widest mt-1">Tracking: {d.tracking_no || 'Pending'}</span>
                </div>
            )
        },
        { 
            key: "total_qty", 
            label: "Load Detail",
            render: (d: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-600 tracking-tight">{d.total_qty || 0} Units</span>
                    <span className="text-xs text-gray-400 font-bold  tracking-widest">Ship Date: {d.date}</span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Status",
            render: (d: any) => <StatusBadge status={d.status} />
        }
    ];

    return (
        <ERPListView
            title="Delivery Notes"
            data={filteredDeliveries}
            columns={deliveryColumns}
            onNew={() => { setEditingDelivery(null); setView("form"); }}
            onRefresh={loadDeliveries}
            onRowClick={(d) => { setEditingDelivery(d); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
