import { useState, useEffect } from "react";
import {
    ShoppingCart, Search, Plus,
    MoreHorizontal, Mail, Download,
    Trash2, Clock, CheckCircle2,
    Filter, ArrowRight, Eye, Edit,
    Truck, FileInput
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";

export default function Orders() {
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
            .from('sales_orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setOrders(data);
        setLoading(false);
    };

    const orderHeaderFields = [
        { key: "customer_name", label: "Client Entity", required: true, ph: "Customer name..." },
        { key: "reference_no", label: "Order Reference", required: true, ph: "ORD-2026-001" },
        { key: "date", label: "Order Date", type: "date" as const },
        { key: "delivery_date", label: "Expected Logic Deployment", type: "date" as const },
        {
            key: "status", label: "Engine Status", type: "select" as const,
            options: [
                { label: "Draft Confirmation", value: "draft" },
                { label: "On-Hold Delay", value: "on-hold" },
                { label: "Confirmed Deployment", value: "confirmed" },
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
                .from('sales_orders')
                .upsert([payload])
                .select()
                .single();

            if (hError) throw hError;

            if (header.id) {
                await supabase.from('sales_order_items').delete().eq('order_id', header.id);
            }

            const lineItems = items.map(item => ({
                order_id: savedHeader.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                tax_percentage: item.taxRate, // Mapping taxRate to tax_percentage in DB
                amount: item.amount
            }));

            const { error: iError } = await supabase.from('sales_order_items').insert(lineItems);
            if (iError) throw iError;

            toast.success("Sales Order Blueprint Committed");
            setView("list");
            loadOrders();
        } catch (err: any) {
            toast.error(`Sync Failure: ${err.message}`);
        }
    };

    const filteredOrders = orders.filter(o =>
        o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.reference_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingOrder ? "Modify Sales Order" : "Initialize Sales Order"}
                    subtitle="Confirmed Enterprise Logic Deployment"
                    headerFields={orderHeaderFields}
                    onAbort={() => { setView("list"); setEditingOrder(null); }}
                    onSave={handleSaveOrder}
                    initialData={editingOrder}
                    initialItems={editingOrder ? [] : undefined}
                />
            </div>
        );
    }

    const orderColumns = [
        { 
            key: "reference_no", 
            label: "Order ID",
            render: (o: any) => <span className="font-bold text-gray-900 tracking-tight italic">{o.reference_no}</span>
        },
        { 
            key: "customer_name", 
            label: "Customer",
            render: (o: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{o.customer_name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{o.date || 'No Date'}</span>
                </div>
            )
        },
        { 
            key: "grand_total", 
            label: "Total Amount",
            render: (o: any) => <span className="font-black text-blue-600 tracking-tight">{fmt(o.grand_total)}</span>,
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
            title="Sales Orders"
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
