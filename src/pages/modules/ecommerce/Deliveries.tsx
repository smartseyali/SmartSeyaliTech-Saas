import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { Truck, Package, Clock, ExternalLink } from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";

export default function Deliveries() {
    const { activeCompany } = useTenant();
    const [deliveries, setDeliveries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("ecom_orders")
            .select("*")
            .eq("company_id", activeCompany.id)
            .in("status", ["packed", "shipped", "out_for_delivery", "delivered"])
            .order("updated_at", { ascending: false });

        setDeliveries(data || []);
        setLoading(false);
    };

    const deliveryColumns = [
        { 
            key: "order_number", 
            label: "Node Identifier",
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 uppercase italic tracking-tight">#{row.order_number}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Order Sequence</span>
                </div>
            )
        },
        { 
            key: "customer_name", 
            label: "Consignee Entity",
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 uppercase italic tracking-tight">{row.customer_name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Shipment Target</span>
                </div>
            )
        },
        { 
            key: "tracking_number", 
            label: "Tracking Node",
            render: (row: any) => row.tracking_number ? (
                <div className="flex items-center gap-2 group">
                    <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">{row.tracking_number}</span>
                    <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                </div>
            ) : (
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Awaiting Scan</span>
            )
        },
        { 
            key: "status", 
            label: "Fulfillment state",
            render: (row: any) => <StatusBadge status={row.status} />
        }
    ];

    const filteredDeliveries = (deliveries || []).filter(d => 
        (d.order_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (d.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ERPListView
            title="Logistics Registry"
            data={filteredDeliveries}
            columns={deliveryColumns}
            onNew={() => {}}
            onRefresh={load}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2 shadow-sm">
                        <Truck className="w-3.5 h-3.5" /> Manifest Generation
                    </button>
                </div>
            }
        />
    );
}

