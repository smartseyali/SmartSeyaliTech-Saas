import { useState, useEffect } from "react";
import db from "@/lib/db";
import ERPListView from "@/components/modules/ERPListView";
import { TransactionalView } from "@/components/modules/TransactionalView";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";

import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function SalesQuotations() {
    const { activeCompany } = useTenant();
    const [quotations, setQuotations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);
    const [view, setView] = useState<"list" | "form">("list");

    const fetchQuotations = async () => {
        if (!activeCompany) return;
        setLoading(true);
        try {
            const { data, error } = await db
                .from('sales_quotations')
                .select('*, items:sales_quotation_items(*)')
                .eq('company_id', activeCompany.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setQuotations(data || []);
        } catch (error: any) {
            toast.error("Failed to fetch quotations: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuotations();
    }, []);

    const columns = [
        { key: 'reference_no', label: 'Quotation No', className: 'font-bold text-blue-600 tracking-wider' },
        { key: 'date', label: 'Date', render: (item: any) => new Date(item.date).toLocaleDateString("en-IN") },
        { key: 'party_id', label: 'Customer' },
        { key: 'grand_total', label: 'Net Amount', className: 'text-right font-bold', render: (item: any) => '₹' + item.grand_total?.toLocaleString("en-IN") },
        { key: 'status', label: 'Status' }
    ];

    const quotationFields = {
        basic: [
            { key: 'reference_no', label: 'Quotation No *', type: 'text' as const, required: true, ph: 'SQ/24-25/001' },
            { key: 'date', label: 'Quotation Date *', type: 'date' as const, required: true },
            { key: 'party_id', label: 'Select Customer *', type: 'select' as const, lookupTable: 'contacts', lookupLabel: 'name', lookupValue: 'id', lookupFilter: { type: 'customer' } },
            { key: 'customer_gstin', label: 'Customer GSTIN', type: 'text' as const, ph: '27AAAAA0000A1Z5' },
            { key: 'place_of_supply', label: 'Place of Supply (State) *', type: 'select' as const, options: [{ value: 'Maharashtra', label: 'Maharashtra' }, { value: 'Delhi', label: 'Delhi' }, { value: 'Karnataka', label: 'Karnataka' }] },
            { key: 'quotation_expiry', label: 'Valid Until', type: 'date' as const }
        ],
        config: [
            { key: 'billing_address', label: 'Billing Address (Inc. State/Pincode)', type: 'textarea' as any },
            { key: 'shipping_address', label: 'Shipping Address', type: 'textarea' as any },
            { key: 'sales_person', label: 'Sales Agent / Person', type: 'text' as const },
            { key: 'payment_terms', label: 'Payment Mode / Terms', type: 'text' as const, ph: 'e.g. 50% Advance' },
            { key: 'delivery_terms', label: 'Delivery Terms', type: 'text' as const },
            { key: 'status', label: 'Quotation Status', type: 'select' as const, options: [{ value: 'Draft', label: 'Draft' }, { value: 'Sent', label: 'Sent / Issued' }] }
        ]
    };

    const itemFields = [
        { key: "product_id", label: "Item / Service", type: "select" as const, lookupTable: 'items', lookupLabel: 'name', lookupValue: 'id' },
        { key: "description", label: "Technical Description", type: "text" as const, ph: "Description" },
        { key: 'hsn_code', label: 'HSN / SAC Code', type: 'text' as const, ph: '8471' },
        { key: 'quantity', label: 'Quantity', type: 'number' as const, ph: '0' },
        { key: 'unit_price', label: 'Rate (INR)', type: 'number' as const, ph: '0.00' },
        { key: 'discount_percent', label: 'Discount %', type: 'number' as const, ph: '0' },
        { key: 'tax_rate', label: 'GST Rate (%)', type: 'number' as const, ph: '18' },
        { key: 'gst_type', label: 'Tax Type', type: 'select' as const, options: [{ value: 'IGST', label: 'IGST (Inter-state)' }, { value: 'CGST_SGST', label: 'CGST/SGST (Intra-state)' }] }
    ];

    const handleSave = async (header: any, items: any[]) => {
        try {
            toast.loading("Recording Proforma Invoice...");
            const { data: quote, error } = await db.from('sales_quotations').insert({
                ...header,
                company_id: activeCompany?.id,
                grand_total: items.reduce((acc, i) => acc + (i.quantity * i.unit_price * (1 + (i.tax_rate || 0)/100)), 0)
            }).select().single();

            if (error) throw error;

            await db.from('sales_quotation_items').insert(
                items.map(item => ({
                    ...item,
                    quotation_id: quote.id,
                    company_id: activeCompany?.id
                }))
            );

            toast.success("Sales Quotation recorded successfully.");
            setView("list");
            fetchQuotations();
        } catch (err: any) {
            toast.error("Save failed: " + err.message);
        }
    };

    if (view === "form") {
        return (
            <ERPEntryForm
                title="Create Sales Quote"
                subtitle="Issued to Customer for pricing confirmation"
                tabFields={quotationFields}
                itemFields={itemFields}
                onSave={handleSave}
                onAbort={() => setView("list")}
            />
        );
    }

    if (selectedQuotation) {
        return (
            <TransactionalView
                title="Proforma Invoice / Quote"
                resourceName="sales_quotations"
                data={selectedQuotation}
                onBack={() => setSelectedQuotation(null)}
                onRefresh={() => {
                    fetchQuotations();
                    setSelectedQuotation(null);
                }}
            />
        );
    }

    return (
        <ERPListView
            title="Sales Quotations (Proforma)"
            data={quotations.filter(q => 
                q.reference_no.toLowerCase().includes(searchTerm.toLowerCase()) || 
                q.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            columns={columns}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={fetchQuotations}
            onRowClick={(item) => setSelectedQuotation(item)}
            onNew={() => setView("form")}
        />
    );
}
