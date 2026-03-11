import { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";

export default function PurchaseOrders() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingOrder, setEditingOrder] = useState<any>(null);

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('purchase_orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setOrders(data);
        setLoading(false);
    };

    const orderHeaderFields = [
        { key: "vendor_name", label: "Supplier Entity", required: true },
        { key: "reference_no", label: "Procurement Ref", required: true },
        { key: "date", label: "Procurement Date", type: "date" as const },
        { key: "expected_delivery", label: "Supply Threshold", type: "date" as const },
        {
            key: "status", label: "Procurement Status", type: "select" as const,
            options: [
                { label: "Draft Request", value: "draft" },
                { label: "Confirmed Supply", value: "confirmed" },
                { label: "Engine Received", value: "received" },
                { label: "Closed Logic", value: "closed" }
            ]
        }
    ];

    const handleSaveOrder = async (header: any, items: any[]) => {
        try {
            const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
            const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
            const taxAmount = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice * i.taxRate / 100), 0);
            const grandTotal = subtotal + taxAmount;

            const payload = {
                ...header,
                total_qty: totalQty,
                subtotal: subtotal,
                tax_amount: taxAmount,
                grand_total: grandTotal
            };

            const { data: savedHeader, error: hError } = await supabase
                .from('purchase_orders')
                .upsert([payload])
                .select()
                .single();

            if (hError) throw hError;

            if (header.id) {
                await supabase.from('purchase_order_items').delete().eq('order_id', header.id);
            }

            const lineItems = items.map(item => ({
                order_id: savedHeader.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                tax_percentage: item.taxRate,
                amount: item.amount
            }));

            const { error: iError } = await supabase.from('purchase_order_items').insert(lineItems);
            if (iError) throw iError;

            toast.success("Procurement Blueprint Committed");
            setView("list");
            loadOrders();
        } catch (err: any) {
            toast.error(`Supply Sync Failure: ${err.message}`);
        }
    };

    const filteredOrders = orders.filter(o =>
        o.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.reference_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

    if (view === "form") {
        return (
            <ERPEntryForm
                title={editingOrder ? "Modify Procurement" : "Initialize Procurement"}
                subtitle="Enterprise Inventory Replenishment Protocol"
                headerFields={orderHeaderFields}
                onAbort={() => { setView("list"); setEditingOrder(null); }}
                onSave={handleSaveOrder}
                initialData={editingOrder}
                initialItems={editingOrder ? [] : undefined}
            />
        );
    }

    const orderColumns = [
        { 
            key: "reference_no", 
            label: "Ref ID",
            render: (o: any) => <span className="font-bold text-gray-900 tracking-tight italic">{o.reference_no}</span>
        },
        { 
            key: "vendor_name", 
            label: "Vendor",
            render: (o: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{o.vendor_name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Expected: {o.expected_delivery || 'N/A'}</span>
                </div>
            )
        },
        { 
            key: "grand_total", 
            label: "Total Value",
            render: (o: any) => <span className="font-black text-indigo-600 tracking-tight">{fmt(o.grand_total)}</span>,
            className: "text-right"
        },
        { 
            key: "status", 
            label: "Status",
            render: (o: any) => <StatusBadge status={o.status} />
        }
    ];

    return (
        <ERPListView
            title="Purchase Orders"
            data={filteredOrders}
            columns={orderColumns}
            onNew={() => { setEditingOrder(null); setView("form"); }}
            onRefresh={loadOrders}
            onRowClick={(o) => { setEditingOrder(o); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
