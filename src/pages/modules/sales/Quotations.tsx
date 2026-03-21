import { useState, useEffect } from "react";
import {
    Plus,
    Edit,
    ArrowRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";

export default function Quotations() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingQuote, setEditingQuote] = useState<any>(null);
    const { activeCompany } = useTenant();
    const navigate = useNavigate();

    useEffect(() => {
        if (activeCompany) loadQuotations();
    }, [activeCompany]);

    const loadQuotations = async () => {
        if (!activeCompany) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('sales_quotations')
            .select('*')
            .eq('company_id', activeCompany.id)
            .order('created_at', { ascending: false });

        if (!error && data) setQuotes(data);
        setLoading(false);
    };

    const quoteHeaderFields = [
        { key: "customer_name", label: "Customer Representation", required: true },
        { key: "reference_no", label: "Reference Sequence", required: true },
        { key: "date", label: "Issuance Date", type: "date" as const },
        { key: "valid_until", label: "Validity Threshold", type: "date" as const },
        {
            key: "status", label: "Lifecycle Status", type: "select" as const,
            options: [
                { label: "Draft Proposal", value: "draft" },
                { label: "Awaiting Client", value: "sent" },
                { label: "Approved Engine", value: "accepted" }
            ]
        }
    ];

    const handleSaveQuote = async (header: any, items: any[]) => {
        try {
            const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
            const subtotal = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
            const taxAmount = items.reduce((sum, i) => sum + (i.quantity * i.unitPrice * i.taxRate / 100), 0);
            const grandTotal = subtotal + taxAmount;

            const payload = {
                ...header,
                company_id: activeCompany?.id,
                total_qty: totalQty,
                subtotal: subtotal,
                tax_amount: taxAmount,
                grand_total: grandTotal
            };

            const { data: savedHeader, error: hError } = await supabase
                .from('sales_quotations')
                .upsert([payload])
                .select()
                .single();

            if (hError) throw hError;

            if (header.id) {
                await supabase.from('sales_quotation_items').delete().eq('quotation_id', header.id);
            }

            const lineItems = items.map(item => ({
                quotation_id: savedHeader.id,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unitPrice,
                tax_rate: item.taxRate,
                amount: item.amount
            }));

            const { error: iError } = await supabase.from('sales_quotation_items').insert(lineItems);
            if (iError) throw iError;

            toast.success("Quotation Blueprint Committed Successfully");
            setView("list");
            loadQuotations();
        } catch (err: any) {
            toast.error(`Sync Failure: ${err.message}`);
        }
    };

    const filteredQuotes = quotes.filter(q =>
        q.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.reference_no?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

    const handleConvertToSO = () => {
        navigate("/apps/sales/orders", { 
            state: { 
                sourceRecord: editingQuote, 
                conversionType: 'quotation_to_so' 
            } 
        });
    };

    if (view === "form") {
        return (
            <ERPEntryForm
                title={editingQuote ? "Modify Quotation" : "Initialize Quotation"}
                subtitle="Advanced Sales Lifecycle Management"
                headerFields={quoteHeaderFields}
                onAbort={() => { setView("list"); setEditingQuote(null); }}
                onSave={handleSaveQuote}
                initialData={editingQuote}
                initialItems={editingQuote ? [] : undefined}
                customActions={
                    editingQuote && (
                        <button
                            onClick={handleConvertToSO}
                            className="flex items-center h-9 px-4 text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl transition-all shadow-sm border border-indigo-100"
                        >
                            <ArrowRight className="w-3.5 h-3.5 mr-2" />
                            Create Sales Order
                        </button>
                    )
                }
            />
        );
    }

    const quoteColumns = [
        { 
            key: "reference_no", 
            label: "Reference",
            render: (q: any) => <span className="font-bold text-gray-900 tracking-tight italic">{q.reference_no}</span>
        },
        { 
            key: "customer_name", 
            label: "Client Engine",
            render: (q: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-800 uppercase italic leading-none">{q.customer_name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Issued: {q.date}</span>
                </div>
            )
        },
        { 
            key: "grand_total", 
            label: "Valuation",
            render: (q: any) => (
                <div className="flex flex-col">
                    <span className="font-black text-indigo-600 tracking-tight">{fmt(q.grand_total)}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Qty: {q.total_qty}</span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Lifecycle",
            render: (q: any) => <StatusBadge status={q.status} />
        }
    ];

    return (
        <ERPListView
            title="Quotation"
            data={filteredQuotes}
            columns={quoteColumns}
            onNew={() => { setEditingQuote(null); setView("form"); }}
            onRefresh={loadQuotations}
            onRowClick={(q) => { setEditingQuote(q); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
