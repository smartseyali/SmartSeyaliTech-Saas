import { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";

export default function PurchaseBills() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [bills, setBills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingBill, setEditingBill] = useState<any>(null);
    const { activeCompany } = useTenant();

    useEffect(() => {
        if (activeCompany) loadBills();
    }, [activeCompany]);

    const loadBills = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('purchase_bills')
            .select('*')
            .eq('company_id', activeCompany.id)
            .order('created_at', { ascending: false });

        if (!error && data) setBills(data);
        setLoading(false);
    };

    const billHeaderFields = [
        { key: "vendor_name", label: "Supplier", required: true },
        { key: "bill_no", label: "Vendor Invoice No", required: true },
        { key: "reference_no", label: "Internal Settlement ID", required: true },
        { key: "date", label: "Recording Date", type: "date" as const },
        { key: "due_date", label: "Settlement Threshold", type: "date" as const },
        {
            key: "status", label: "Liability Status", type: "select" as const,
            options: [
                { label: "Draft Liability", value: "draft" },
                { label: "Unpaid Obligation", value: "unpaid" },
                { label: "Settled Account", value: "paid" },
                { label: "Overdue Risk", value: "overdue" }
            ]
        }
    ];

    const handleSaveBill = async (header: any, items: any[]) => {
        try {
            const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
            const taxAmount = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice * i.taxRate / 100), 0);
            const grandTotal = subtotal + taxAmount;

            const payload = {
                ...header,
                company_id: activeCompany?.id,
                subtotal: subtotal,
                tax_amount: taxAmount,
                grand_total: grandTotal
            };

            const { data: savedHeader, error: hError } = await supabase
                .from('purchase_bills')
                .upsert([payload])
                .select()
                .single();

            if (hError) throw hError;

            if (header.id) {
                await supabase.from('purchase_bill_items').delete().eq('bill_id', header.id);
            }

            const lineItems = items.map(item => ({
                bill_id: savedHeader.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                tax_percentage: item.taxRate,
                amount: item.amount
            }));

            const { error: iError } = await supabase.from('purchase_bill_items').insert(lineItems);
            if (iError) throw iError;

            toast.success("Accounts Payable Asset Synchronized");
            setView("list");
            loadBills();
        } catch (err: any) {
            toast.error(`Liability Sync Failure: ${err.message}`);
        }
    };

    const filteredBills = bills.filter(b =>
        b.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.reference_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

    if (view === "form") {
        return (
            <ERPEntryForm
                title={editingBill ? "Modify Liability Record" : "Generate Vendor Settlement"}
                subtitle="Accounts Payable Optimization"
                headerFields={billHeaderFields}
                onAbort={() => { setView("list"); setEditingBill(null); }}
                onSave={handleSaveBill}
                initialData={editingBill}
                initialItems={editingBill ? [] : undefined}
            />
        );
    }

    const billColumns = [
        { 
            key: "reference_no", 
            label: "Ref ID",
            render: (o: any) => <span className="font-bold text-gray-900 tracking-tight italic">{o.reference_no}</span>
        },
        { 
            key: "vendor_name", 
            label: "Supplier",
            render: (o: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800">{o.vendor_name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Due: {o.due_date || 'N/A'}</span>
                </div>
            )
        },
        { 
            key: "grand_total", 
            label: "Obligation Amount",
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
            title="Purchase Bills"
            data={filteredBills}
            columns={billColumns}
            onNew={() => { setEditingBill(null); setView("form"); }}
            onRefresh={loadBills}
            onRowClick={(b) => { setEditingBill(b); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
