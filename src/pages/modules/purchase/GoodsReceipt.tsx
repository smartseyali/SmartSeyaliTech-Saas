import { useState, useEffect } from "react";
import db from "@/lib/db";
import ERPListView from "@/components/modules/ERPListView";
import { TransactionalView } from "@/components/modules/TransactionalView";
import { useTenant } from "@/contexts/TenantContext";
import { toast } from "sonner";

import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function GoodsReceipt() {
    const { activeCompany } = useTenant();
    const [receipts, setReceipts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
    const [view, setView] = useState<"list" | "form">("list");

    const fetchReceipts = async () => {
        setLoading(true);
        try {
            const { data, error } = await db
                .from('stock_moves')
                .select('*')
                .eq('type', 'purchase')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReceipts(data || []);
        } catch (error: any) {
            toast.error("Failed to fetch GRNs: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReceipts();
    }, []);

    const columns = [
        { key: 'reference_id', label: 'GRN Number', className: 'font-mono uppercase font-bold text-blue-600' },
        { key: 'created_at', label: 'Receipt Date', render: (item: any) => new Date(item.created_at).toLocaleDateString("en-IN") },
        { key: 'party_id', label: 'Supplier', className: 'font-medium' },
        { key: 'warehouse_id', label: 'Warehouse / Godown', className: 'font-bold' },
        { key: 'qty_change', label: 'Qty Received', className: 'text-right font-black text-green-600', render: (item: any) => `+ ${item.qty_change}` },
        { key: 'status', label: 'Status' }
    ];

    const grnFields = {
        basic: [
            { key: 'reference_id', label: 'GRN Number *', type: 'text' as const, required: true, ph: 'GRN/24-25/001' },
            { key: 'po_reference', label: 'PO Reference No', ph: 'PO-123' },
            { key: 'created_at', label: 'Receipt Date *', type: 'date' as const, required: true },
            { key: 'party_id', label: 'Supplier (Party) *', type: 'select' as const, lookupTable: 'contacts', lookupLabel: 'name', lookupValue: 'id', lookupFilter: { type: 'vendor' } },
            { key: 'warehouse_id', label: 'Receiving Godown *', type: 'select' as const, lookupTable: 'warehouses', lookupLabel: 'name', lookupValue: 'id' }
        ],
        config: [
            { key: 'received_by', label: 'Received By (Staff)', type: 'text' as const },
            { key: 'supplier_invoice', label: 'Supplier Invoice Ref', ph: 'INV-789' },
            { key: 'inspection_status', label: 'Inspection Status', type: 'select' as const, options: [{ value: 'Pending', label: 'Pending' }, { value: 'Passed', label: 'Passed' }, { value: 'Failed', label: 'Failed / Rejected' }] },
            { key: 'notes', label: 'Gate Entry / Remarks', type: 'text' as const },
            { key: 'status', label: 'GRN Status', type: 'select' as const, options: [{ value: 'Pending', label: 'Pending Audit' }, { value: 'Verified', label: 'Verified & Stocked' }] }
        ]
    };

    const grnItemFields = [
        { key: 'product_id', label: 'Received Item *', type: 'select' as const, lookupTable: 'items', lookupLabel: 'name', lookupValue: 'id' },
        { key: 'batch_number', label: 'Batch / Lot No', type: 'text' as const },
        { key: 'ordered_qty', label: 'Ordered Qty', type: 'number' as const },
        { key: 'qty_change', label: 'Received Qty', type: 'number' as const, ph: '0' },
        { key: 'unit_price', label: 'Purchase Rate (INR)', type: 'number' as const }
    ];

    const handleSave = async (header: any, items: any[]) => {
        try {
            toast.loading("Recording Purchase Inward...");
            // Stock move insertion log
            for (const item of items) {
                await db.from('stock_moves').insert({
                    ...header,
                    ...item,
                    type: 'purchase',
                    tenant_id: activeCompany?.id
                });
            }
            toast.success("Purchase GRN recorded and Stock updated.");
            setView("list");
            fetchReceipts();
        } catch (err: any) {
            toast.error("Save failed: " + err.message);
        }
    };

    if (view === "form") {
        return (
            <ERPEntryForm
                title="Goods Receipt Note (GRN)"
                subtitle="Record received physical inventory against Supplier Invoices"
                tabFields={grnFields}
                itemFields={grnItemFields}
                onSave={handleSave}
                onAbort={() => setView("list")}
            />
        );
    }

    if (selectedReceipt) {
        return (
            <TransactionalView
                title="Purchase GRN / Inward"
                resourceName="purchase_receipts"
                data={selectedReceipt}
                onBack={() => setSelectedReceipt(null)}
                onRefresh={() => {
                    fetchReceipts();
                    setSelectedReceipt(null);
                }}
            />
        );
    }

    return (
        <ERPListView
            title="Purchase GRNs (Stock Inward)"
            data={receipts.filter(r => 
                r.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                r.notes?.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            columns={columns}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onRefresh={fetchReceipts}
            onNew={() => setView("form")}
            onRowClick={(item) => setSelectedReceipt(item)}
        />
    );
}
