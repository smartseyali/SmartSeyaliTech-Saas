import { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useDictionary } from "@/hooks/useDictionary";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Download, ArrowRight, Printer, ChevronDown } from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import {
    DropdownMenuItem,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PrintPreview = lazy(() => import("@/components/modules/PrintPreview"));

const STATUSES = [
    { key: "all", label: "All" },
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "packed", label: "Packed" },
    { key: "shipped", label: "Shipped" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
    { key: "returned", label: "Returned" },
];

const NEXT_STATUS: Record<string, string> = {
    pending: "confirmed", confirmed: "packed", packed: "shipped",
    shipped: "out_for_delivery", out_for_delivery: "delivered",
};

const PRINT_DOCTYPE = "ecomOrder";

interface PrintFormat {
    id: string;
    name: string;
    is_default: boolean;
}

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

    // Print state
    const [printFormats, setPrintFormats] = useState<PrintFormat[]>([]);
    const [printing, setPrinting] = useState<null | {
        formatId: string | null;
        docs: Array<{ record: any; items: any[] }>;
    }>(null);

    useEffect(() => { if (activeCompany) { load(); loadPrintFormats(); } }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data } = await supabase.from("ecom_orders").select("*")
            .eq("company_id", activeCompany.id).order("created_at", { ascending: false });
        setOrders(data || []);
        setLoading(false);
    };

    const loadPrintFormats = async () => {
        if (!activeCompany) return;
        const { data } = await supabase
            .from("print_formats")
            .select("id, name, is_default")
            .eq("company_id", activeCompany.id)
            .eq("doctype_key", PRINT_DOCTYPE)
            .eq("is_active", true)
            .order("is_default", { ascending: false });
        setPrintFormats(data || []);
    };

    /** Fetch items for one or many orders. Returns in the same order as ids. */
    const fetchOrdersWithItems = async (ids: any[]) => {
        if (!activeCompany || ids.length === 0) return [];
        const idToOrder = new Map(orders.filter(o => ids.includes(o.id)).map(o => [o.id, o]));
        const { data: items } = await supabase
            .from("ecom_order_items")
            .select("*")
            .eq("company_id", activeCompany.id)
            .in("order_id", ids);
        const byOrder = new Map<any, any[]>();
        (items || []).forEach((it) => {
            const arr = byOrder.get(it.order_id) || [];
            arr.push(it);
            byOrder.set(it.order_id, arr);
        });
        return ids
            .map((id) => idToOrder.get(id))
            .filter(Boolean)
            .map((record) => ({ record, items: byOrder.get(record!.id) || [] }));
    };

    const handlePrintOne = async (orderId: any, formatId: string | null = null) => {
        const docs = await fetchOrdersWithItems([orderId]);
        if (docs.length === 0) return;
        setPrinting({ formatId, docs });
    };

    const handlePrintMany = async (orderIds: any[], formatId: string | null = null) => {
        const docs = await fetchOrdersWithItems(orderIds);
        if (docs.length === 0) return;
        setPrinting({ formatId, docs });
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
            let orderNumber: string;
            const { data: rpcResult, error: rpcErr } = await supabase.rpc("generate_order_number", { p_company_id: activeCompany.id });
            if (rpcErr || !rpcResult) orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
            else orderNumber = rpcResult;

            const subtotal = items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unit_price) || 0), 0);
            const shipping = Number(header.shipping_amount) || 0;
            const discount = Number(header.discount_amount) || 0;

            const { data: settings } = await supabase.from("ecom_settings").select("tax_rate").eq("company_id", activeCompany.id).maybeSingle();
            const taxRate = Number(settings?.tax_rate) || 0;
            const taxAmount = Math.round((subtotal * taxRate / 100) * 100) / 100;
            const grandTotal = subtotal + taxAmount + shipping - discount;

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

            await supabase.from("ecom_order_timeline").insert([{
                order_id: order.id,
                company_id: activeCompany.id,
                status: header.status || "pending",
                note: "Order created by admin.",
                created_by: "admin",
            }]);

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
                    <span className="font-semibold text-primary font-mono text-sm group-hover:underline">
                        #{row.order_number}
                    </span>
                    <span className="text-[11px] text-gray-400 mt-0.5">
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
                    <span className="font-medium text-gray-900 dark:text-foreground">{row.customer_name}</span>
                    <span className="text-[11px] text-gray-400 mt-0.5">{row.customer_phone || row.customer_email}</span>
                </div>
            )
        },
        {
            key: "grand_total",
            label: "Amount",
            render: (row: any) => (
                <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold text-gray-900 tabular-nums dark:text-foreground">{fmt(row.grand_total)}</span>
                    <StatusBadge status={row.payment_status} />
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
                        <span className="erp-pill bg-warning-100 text-warning-700">
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
                <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    {NEXT_STATUS[row.status] && (
                        <Button size="xs" onClick={(e) => advanceStatus(e, row)}>
                            <ArrowRight className="w-3 h-3" /> Advance
                        </Button>
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
        <>
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
                    <Button variant="outline" size="sm">
                        <Download className="w-3.5 h-3.5" /> Export
                    </Button>
                }
                tabs={
                    <div className="flex items-center gap-1 overflow-x-auto erp-scrollbar">
                        {STATUSES.map(s => (
                            <button
                                key={s.key}
                                onClick={() => setActiveStatus(s.key)}
                                className={cn(
                                    "px-2.5 h-7 rounded text-xs font-medium transition-colors whitespace-nowrap inline-flex items-center gap-1.5",
                                    activeStatus === s.key
                                        ? "bg-primary text-primary-foreground"
                                        : "text-gray-600 hover:bg-gray-100 dark:hover:bg-accent",
                                )}
                            >
                                {s.label}
                                <span className={cn(
                                    "px-1 rounded text-[10px] font-semibold tabular-nums",
                                    activeStatus === s.key ? "bg-white/25" : "bg-gray-100 text-gray-500 dark:bg-accent/60",
                                )}>
                                    {s.key === "all" ? orders.length : orders.filter(o => o.status === s.key).length}
                                </span>
                            </button>
                        ))}
                    </div>
                }
                rowActions={(row) =>
                    printFormats.length > 0 ? (
                        <>
                            <DropdownMenuLabel>Print</DropdownMenuLabel>
                            {printFormats.map((fmt) => (
                                <DropdownMenuItem
                                    key={fmt.id}
                                    onClick={(e) => { e.stopPropagation(); handlePrintOne(row.id, fmt.id); }}
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    {fmt.name}
                                    {fmt.is_default && <span className="ml-auto text-[10px] text-gray-400">default</span>}
                                </DropdownMenuItem>
                            ))}
                        </>
                    ) : (
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handlePrintOne(row.id); }}>
                            <Printer className="w-3.5 h-3.5" /> Print (default layout)
                        </DropdownMenuItem>
                    )
                }
                bulkActions={(ids, clear) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                                <Printer className="w-3 h-3" /> Print
                                <ChevronDown className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuLabel>Print {ids.length} orders</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {printFormats.length > 0 ? (
                                printFormats.map((f) => (
                                    <DropdownMenuItem
                                        key={f.id}
                                        onClick={() => { handlePrintMany(ids, f.id); clear(); }}
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        {f.name}
                                        {f.is_default && <span className="ml-auto text-[10px] text-gray-400">default</span>}
                                    </DropdownMenuItem>
                                ))
                            ) : (
                                <DropdownMenuItem onClick={() => { handlePrintMany(ids); clear(); }}>
                                    <Printer className="w-3.5 h-3.5" /> Default layout
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            />

            {printing && (
                <Suspense fallback={null}>
                    <PrintPreview
                        doctype={PRINT_DOCTYPE}
                        record={printing.docs[0]?.record}
                        items={printing.docs[0]?.items || []}
                        batchRecords={printing.docs.length > 1 ? printing.docs : undefined}
                        initialFormatId={printing.formatId}
                        onClose={() => setPrinting(null)}
                    />
                </Suspense>
            )}
        </>
    );
}
