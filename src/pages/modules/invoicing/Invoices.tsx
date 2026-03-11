import { useState, useEffect } from "react";
import {
    FileText, Search, Plus,
    MoreHorizontal, Mail, Download,
    Trash2, Clock, CheckCircle2,
    Filter, ArrowRight, Eye, Edit,
    CreditCard, DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";

export default function Invoices() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingInvoice, setEditingInvoice] = useState<any>(null);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('sales_invoices')
            .select('*')
            .order('created_at', { ascending: false });

        if (!error && data) setInvoices(data);
        setLoading(false);
    };

    const invoiceHeaderFields = [
        { key: "customer_name", label: "Payer Entity", required: true, ph: "Billing name..." },
        { key: "reference_no", label: "Invoice Identifier", required: true, ph: "INV-2026-001" },
        { key: "date", label: "Billing Date", type: "date" as const },
        { key: "due_date", label: "Settlement Deadline", type: "date" as const },
        {
            key: "status", label: "Ledger Status", type: "select" as const,
            options: [
                { label: "Draft Bill", value: "draft" },
                { label: "Unpaid Liability", value: "unpaid" },
                { label: "Settled Ledger", value: "paid" },
                { label: "Overdue Alert", value: "overdue" }
            ]
        }
    ];

    const handleSaveInvoice = async (header: any, items: any[]) => {
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
                .from('sales_invoices')
                .upsert([payload])
                .select()
                .single();

            if (hError) throw hError;

            if (header.id) {
                await supabase.from('sales_invoice_items').delete().eq('invoice_id', header.id);
            }

            const lineItems = items.map(item => ({
                invoice_id: savedHeader.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                tax_percentage: item.taxRate,
                amount: item.amount
            }));

            const { error: iError } = await supabase.from('sales_invoice_items').insert(lineItems);
            if (iError) throw iError;

            toast.success("Accounts Receivable Synchronized");
            setView("list");
            loadInvoices();
        } catch (err: any) {
            toast.error(`Ledger Sync Failure: ${err.message}`);
        }
    };

    const filteredInvoices = invoices.filter(i =>
        i.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.reference_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

    if (view === "form") {
        return (
            <div className="p-4 sm:p-6 animate-in fade-in slide-in-from-right-10 duration-500">
                <ERPEntryForm
                    title={editingInvoice ? "Modify Ledger Bill" : "Generate Settlement Bill"}
                    subtitle="Accounts Receivable Engine Protocol"
                    headerFields={invoiceHeaderFields}
                    onAbort={() => { setView("list"); setEditingInvoice(null); }}
                    onSave={handleSaveInvoice}
                    initialData={editingInvoice}
                    initialItems={editingInvoice ? [] : undefined}
                />
            </div>
        );
    }

    const invoiceColumns = [
        { 
            key: "reference_no", 
            label: "Invoice ID",
            render: (i: any) => <span className="font-bold text-gray-900 italic">{i.reference_no}</span>
        },
        { 
            key: "customer_name", 
            label: "Customer",
            render: (i: any) => (
                <div className="flex flex-col text-sm">
                    <span className="font-bold text-gray-800">{i.customer_name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{i.due_date ? `Due: ${i.due_date}` : 'No Due Date'}</span>
                </div>
            )
        },
        { 
            key: "grand_total", 
            label: "Payment Valuation",
            render: (i: any) => <span className="font-black text-indigo-600 tabular-nums">{fmt(i.grand_total)}</span>,
            className: "text-right"
        },
        { 
            key: "status", 
            label: "Ledger Status",
            render: (i: any) => <StatusBadge status={i.status} />
        }
    ];

    return (
        <ERPListView
            title="Sales Invoices"
            data={filteredInvoices}
            columns={invoiceColumns}
            onNew={() => { setEditingInvoice(null); setView("form"); }}
            onRefresh={loadInvoices}
            onRowClick={(i) => { setEditingInvoice(i); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            statusField="status"
        />
    );
}
