import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { 
    CreditCard, ShieldCheck, Plus, 
    Search, Filter, RefreshCw, Save, 
    X, Tag, FileText, Globe, Percent
} from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export function PriceLists() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingList, setEditingList] = useState<any>(null);
    
    // Using a generic table name for now
    const { data: priceLists, loading, fetchItems, createItem, updateItem } = useCrud("ecom_price_lists");

    const listFields = [
        { key: "name", label: "Price List Name", required: true, ph: "Summer Sale 2026, Wholesale..." },
        { 
            key: "currency", label: "Currency", type: "select" as const,
            options: [
                { label: "INR (₹)", value: "INR" },
                { label: "USD ($)", value: "USD" },
                { label: "EUR (€)", value: "EUR" }
            ]
        },
        { 
            key: "is_active", label: "Status", type: "select" as const,
            options: [
                { label: "Active Revenue Stream", value: "true" },
                { label: "Archived Strategy", value: "false" }
            ]
        },
        { key: "description", label: "Economic Context", ph: "Detailed pricing strategy..." }
    ];

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true" };
        if (editingList) {
            await updateItem(editingList.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingList(null);
    };

    const columns = [
        { 
            key: "name", 
            label: "Economic Unit",
            render: (l: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 border border-green-100 group-hover:bg-green-900 group-hover:text-white transition-all duration-500">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 tracking-tight">{l.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">CURRENCY: {l.currency || 'INR'}</span>
                    </div>
                </div>
            )
        },
        { 
            key: "is_active", 
            label: "Operational status",
            render: (l: any) => <StatusBadge status={l.is_active !== false ? "Active" : "Archived"} />
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingList ? "Refine Pricing Strategy" : "Initialize Price Matrix"}
                    subtitle="Universal Pricing"
                    headerFields={listFields}
                    onAbort={() => { setView("list"); setEditingList(null); }}
                    onSave={handleSave}
                    initialData={editingList}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Price Lists"
            data={priceLists || []}
            columns={columns}
            onNew={() => { setEditingList(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(l) => { setEditingList(l); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}

export function TaxMapping() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingTax, setEditingTax] = useState<any>(null);
    
    const { data: taxes, loading, fetchItems, createItem, updateItem } = useCrud("ecom_taxes");

    const taxFields = [
        { key: "name", label: "Tax Liability Identity", required: true, ph: "GST 18%, VAT 5%..." },
        { key: "rate", label: "Tax Rate (%)", type: "number" as const, ph: "18.00" },
        { 
            key: "is_active", label: "Status", type: "select" as const,
            options: [
                { label: "Active Enforcement", value: "true" },
                { label: "Legacy Compliance", value: "false" }
            ]
        }
    ];

    const handleSave = async (header: any) => {
        const payload = { ...header, is_active: header.is_active === "true" };
        if (editingTax) {
            await updateItem(editingTax.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingTax(null);
    };

    const columns = [
        { 
            key: "name", 
            label: "Fiscal identify",
            render: (t: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100 group-hover:bg-amber-900 group-hover:text-white transition-all duration-500">
                        <Percent className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 tracking-tight">{t.name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">RATE: {t.rate || 0}%</span>
                    </div>
                </div>
            )
        },
        { 
            key: "is_active", 
            label: "Status",
            render: (t: any) => <StatusBadge status={t.is_active !== false ? "Active" : "Compliance"} />
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingTax ? "Refine Fiscal Mapping" : "Initialize Tax Compliance Node"}
                    subtitle="Tax Governance"
                    headerFields={taxFields}
                    onAbort={() => { setView("list"); setEditingTax(null); }}
                    onSave={handleSave}
                    initialData={editingTax}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Tax Mapping"
            data={taxes || []}
            columns={columns}
            onNew={() => { setEditingTax(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(t) => { setEditingTax(t); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
