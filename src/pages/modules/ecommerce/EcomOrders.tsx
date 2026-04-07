import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useDictionary } from "@/hooks/useDictionary";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Download, ArrowRight } from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import { cn } from "@/lib/utils";

const STATUSES = [
    { key: "all", label: "All", color: "bg-secondary text-foreground" },
    { key: "pending", label: "Pending", color: "bg-amber-100 text-amber-700" },
    { key: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-700" },
    { key: "packed", label: "Packed", color: "bg-indigo-100 text-indigo-700" },
    { key: "shipped", label: "Shipped", color: "bg-purple-100 text-purple-700" },
    { key: "out_for_delivery", label: "Out for Delivery", color: "bg-orange-100 text-orange-700" },
    { key: "delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-700" },
    { key: "cancelled", label: "Cancelled", color: "bg-rose-100 text-rose-700" },
    { key: "returned", label: "Returned", color: "bg-slate-100 text-slate-700" },
];

const NEXT_STATUS: Record<string, string> = {
    pending: "confirmed", confirmed: "packed", packed: "shipped",
    shipped: "out_for_delivery", out_for_delivery: "delivered",
};

export default function EcomOrders() {
    const { activeCompany } = useTenant();
    const navigate = useNavigate();
    const { t } = useDictionary();
    const { toast } = useToast();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeStatus, setActiveStatus] = useState("all");
    const [view, setView] = useState<"list" | "form">("list");
    const [editingOrder, setEditingOrder] = useState<any>(null);

    useEffect(() => { if (activeCompany) load(); }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("ecom_orders").select("*")
            .eq("company_id", activeCompany.id).order("created_at", { ascending: false });
        setOrders(data || []);
        setLoading(false);
    };

    const advanceStatus = async (e: React.MouseEvent, order: any) => {
        e.stopPropagation();
        const next = NEXT_STATUS[order.status];
        if (!next) return;
        try {
            await supabase.from("ecom_orders").update({ status: next, updated_at: new Date().toISOString() }).eq("id", order.id);
            await supabase.from("ecom_order_timeline").insert([{
                order_id: order.id, company_id: activeCompany?.id, status: next, note: `Status updated to ${next}`, created_by: "admin"
            }]);
            toast({ title: `Order ${order.order_number} → ${next}` });
            load();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Failed", description: err.message });
        }
    };

    const fmt = (n: number) => `₹${Number(n).toLocaleString("en-IN")}`;

    // ─── Order Create Form ──────────────────────────────────────────────

    const orderHeaderFields = {
        basic: [
            { key: "customer_name", label: "Customer Name *", type: "text" as const, required: true, ph: "Full name" },
            { key: "customer_email", label: "Customer Email *", type: "email" as const, required: true, ph: "email@example.com" },
            { key: "customer_phone", label: "Phone", type: "phone" as const, ph: "9876543210" },
            { key: "payment_method", label: "Payment Method *", type: "select" as const, required: true, options: [
                { value: "cod", label: "Cash on Delivery" },
                { value: "razorpay", label: "Razorpay" },
                { value: "upi", label: "UPI" },
                { value: "bank_transfer", label: "Bank Transfer" },
            ]},
            { key: "payment_status", label: "Payment Status", type: "select" as const, options: [
                { value: "pending", label: "Pending" },
                { value: "paid", label: "Paid" },
            ]},
            { key: "status", label: "Order Status", type: "select" as const, options: [
                { value: "pending", label: "Pending" },
                { value: "confirmed", label: "Confirmed" },
            ]},
        ],
        config: [
            { key: "shipping_line1", label: "Shipping Address *", type: "text" as const, required: true, ph: "Street address" },
            { key: "shipping_city", label: "City *", type: "text" as const, required: true, ph: "City" },
            { key: "shipping_state", label: "State *", type: "text" as const, required: true, ph: "State" },
            { key: "shipping_pincode", label: "Pincode *", type: "text" as const, required: true, ph: "641001" },
            { key: "shipping_amount", label: "Shipping Charge (₹)", type: "number" as const, ph: "0" },
            { key: "coupon_code", label: "Coupon Code", type: "text" as const, ph: "SAVE20" },
            { key: "discount_amount", label: "Discount (₹)", type: "number" as const, ph: "0" },
            { key: "notes", label: "Order Notes", type: "textarea" as const, ph: "Internal notes..." },
        ],
    };

    const orderItemFields = [
        { key: "product_id", label: "Product", type: "select" as const, lookupTable: "master_items", lookupLabel: "item_name", lookupValue: "id" },
        { key: "product_name", label: "Product Name *", type: "text" as const, required: true, ph: "Product name" },
        { key: "variant_label", label: "Variant", type: "text" as const, ph: "e.g. Red / XL" },
        { key: "sku", label: "SKU", type: "text" as const, ph: "SKU code" },
        { key: "quantity", label: "Qty *", type: "number" as const, required: true, ph: "1" },
        { key: "unit_price", label: "Unit Price (₹) *", type: "number" as const, required: true, ph: "0.00" },
    ];

    const handleSaveOrder = async (header: any, items: any[]) => {
        if (!activeCompany) return;
        try {
            // Generate order number
            let orderNumber: string;
            const { data: rpcResult, error: rpcErr } = await supabase.rpc("generate_order_number", { p_company_id: activeCompany.id });
            if (rpcErr || !rpcResult) {
                orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
            } else {
                orderNumber = rpcResult;
            }

            // Calculate totals
            const subtotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0);
            const shipping = Number(header.shipping_amount) || 0;
            const discount = Number(header.discount_amount) || 0;

            // Get tax rate from settings
            const { data: settings } = await supabase.from("ecom_settings").select("tax_rate").eq("company_id", activeCompany.id).maybeSingle();
            const taxRate = Number(settings?.tax_rate) || 0;
            const taxAmount = Math.round((subtotal * taxRate / 100) * 100) / 100;
            const grandTotal = subtotal + taxAmount + shipping - discount;

            // Insert order
            const { data: order, error: orderErr } = await supabase.from("ecom_orders").insert([{
                company_id: activeCompany.id,
                order_number: orderNumber,
                customer_name: header.customer_name,
                customer_email: header.customer_email,
                customer_phone: header.customer_phone,
                shipping_address: {
                    line1: header.shipping_line1,
                    city: header.shipping_city,
                    state: header.shipping_state,
                    pincode: header.shipping_pincode,
                },
                subtotal,
                tax_amount: taxAmount,
                shipping_amount: shipping,
                discount_amount: discount,
                coupon_code: header.coupon_code || null,
                coupon_discount: discount,
                grand_total: grandTotal,
                payment_method: header.payment_method || "cod",
                payment_status: header.payment_status || "pending",
                status: header.status || "pending",
                notes: header.notes || "",
            }]).select().single();

            if (orderErr) throw orderErr;

            // Insert order items
            if (items.length > 0) {
                const orderItems = items.map(item => ({
                    order_id: order.id,
                    company_id: activeCompany.id,
                    product_id: item.product_id || null,
                    product_name: item.product_name,
                    variant_label: item.variant_label || null,
                    sku: item.sku || null,
                    quantity: Number(item.quantity) || 1,
                    unit_price: Number(item.unit_price) || 0,
                    amount: (Number(item.quantity) || 1) * (Number(item.unit_price) || 0),
                }));
                const { error: itemsErr } = await supabase.from("ecom_order_items").insert(orderItems);
                if (itemsErr) throw itemsErr;
            }

            // Initialize timeline
            await supabase.from("ecom_order_timeline").insert([{
                order_id: order.id,
                company_id: activeCompany.id,
                status: header.status || "pending",
                note: "Order created by admin.",
                created_by: "admin",
            }]);

            // Sync ecom_customer
            await supabase.from("ecom_customers").upsert({
                company_id: activeCompany.id,
                email: header.customer_email?.toLowerCase(),
                full_name: header.customer_name,
                phone: header.customer_phone,
            }, { onConflict: "company_id,email" });

            toast({ title: `Order ${orderNumber} created` });
            setView("list");
            load();
        } catch (err: any) {
            toast({ variant: "destructive", title: "Order creation failed", description: err.message });
        }
    };

    // ─── Form View ──────────────────────────────────────────────────────

    if (view === "form") {
        return (
            <ERPEntryForm
                title={editingOrder ? `Edit Order ${editingOrder.order_number}` : "Create New Order"}
                subtitle="E-Commerce Order"
                tabFields={orderHeaderFields}
                itemFields={orderItemFields}
                itemTitle="Order Items"
                onSave={handleSaveOrder}
                onAbort={() => { setView("list"); setEditingOrder(null); }}
                initialData={editingOrder}
                initialItems={editingOrder?.items || []}
                showItems={true}
            />
        );
    }

    // ─── List View ──────────────────────────────────────────────────────

    const orderColumns = [
        {
            key: "order_number",
            label: "Order No",
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-blue-600 tracking-widest text-[13px] font-mono group-hover:underline">#{row.order_number}</span>
                    <span className="text-xs text-gray-400 font-bold tracking-widest mt-1">
                        {new Date(row.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                </div>
            )
        },
        {
            key: "customer_name",
            label: "Customer",
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-tight">{row.customer_name}</span>
                    <span className="text-xs text-gray-400 font-bold tracking-widest mt-1">{row.customer_phone || row.customer_email}</span>
                </div>
            )
        },
        {
            key: "grand_total",
            label: "Amount",
            render: (row: any) => (
                <div className="flex flex-col items-start">
                    <span className="font-bold text-slate-900 tracking-tight">{fmt(row.grand_total)}</span>
                    <div className={cn(
                        "mt-1 px-2 py-0.5 rounded text-[8px] font-bold tracking-widest border",
                        row.payment_status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            row.payment_status === "refunded" ? "bg-violet-50 text-violet-600 border-violet-100" :
                                "bg-amber-50 text-amber-600 border-amber-100"
                    )}>
                        {row.payment_status}
                    </div>
                </div>
            )
        },
        {
            key: "status",
            label: "Status",
            render: (row: any) => (
                <div className="flex flex-col items-start gap-1">
                    <StatusBadge status={row.status} />
                    {row.return_status && (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold tracking-widest bg-orange-50 text-orange-600 border border-orange-100">
                            Return: {row.return_status}
                        </span>
                    )}
                </div>
            )
        },
        {
            key: "actions",
            label: "",
            render: (row: any) => (
                <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition-all">
                    {NEXT_STATUS[row.status] && (
                        <button
                            onClick={(e) => advanceStatus(e, row)}
                            className="h-7 px-3 rounded-lg bg-blue-600 text-white text-[11px] font-bold tracking-widest hover:bg-black transition-all flex items-center gap-1.5"
                        >
                            <ArrowRight className="w-3 h-3" /> Advance
                        </button>
                    )}
                </div>
            ),
            className: "text-right"
        }
    ];

    const filteredOrders = orders.filter(o => {
        const matchStatus = activeStatus === "all" || o.status === activeStatus;
        const matchSearch = (o.order_number || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.customer_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (o.customer_email || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchStatus && matchSearch;
    });

    return (
        <ERPListView
            title="Order Management"
            data={filteredOrders}
            columns={orderColumns}
            onNew={() => { setEditingOrder(null); setView("form"); }}
            onRefresh={load}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            onRowClick={(row) => navigate(`/apps/ecommerce/orders/${row.id}`)}
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-bold text-xs tracking-widest bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-2 shadow-sm">
                        <Download className="w-3.5 h-3.5" /> Export
                    </button>
                </div>
            }
            tabs={
                STATUSES.map(s => (
                    <button
                        key={s.key}
                        onClick={() => setActiveStatus(s.key)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                            activeStatus === s.key
                                ? "bg-slate-900 text-white shadow-lg"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        {s.label}
                        <span className={cn(
                            "px-1.5 py-0.5 rounded text-[8px] font-mono",
                            activeStatus === s.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        )}>
                            {s.key === "all" ? orders.length : orders.filter(o => o.status === s.key).length}
                        </span>
                    </button>
                ))
            }
        />
    );
}
