import { useState } from "react";
import { Building2, ShieldCheck, Mail, Phone, Star, Search, Plus, Filter, RefreshCw, X, Save } from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Vendors() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingVendor, setEditingVendor] = useState<any>(null);
    
    // Using unified contacts table, filtered for vendors
    const { data: contacts, loading, fetchItems, createItem, updateItem } = useCrud("contacts");

    const vendorHeaderFields = [
        { key: "name", label: "Company Name", required: true, ph: "Global Logistics Ltd..." },
        { key: "email", label: "Email Address", ph: "shippping@global.com" },
        { key: "phone", label: "Phone Number", ph: "+91 ..." },
        { key: "company_name", label: "Trading Name", ph: "Global Logistics" },
        { key: "category", label: "Sector", ph: "Shipping / Hardware" },
        { 
            key: "status", label: "Status", type: "select" as const,
            options: [
                { label: "Verified", value: "Verified" },
                { label: "Preferred Partner", value: "Preferred" },
                { label: "Active Account", value: "Active" },
                { label: "Blocked Asset", value: "Blocked" }
            ]
        },
        { key: "rating", label: "Trust Index (0-5)", type: "number" as const, ph: "4.5" }
    ];

    const handleSave = async (header: any) => {
        if (editingVendor) {
            await updateItem(editingVendor.id, header);
        } else {
            await createItem({ ...header, type: "vendor" });
        }
        setView("list");
        setEditingVendor(null);
    };

    const vendorColumns = [
        { 
            key: "name", 
            label: "Company Name",
            render: (row: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900   tracking-tight">{row.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold  tracking-widest mt-1">{row.category || "General"} / REGISTERED</span>
                </div>
            )
        },
        { 
            key: "contact_info", 
            label: "point / Email",
            render: (row: any) => (
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500  tracking-widest">
                        <Mail className="w-3 h-3 text-slate-300" /> {row.email}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500  tracking-widest">
                        <Phone className="w-3 h-3 text-slate-300" /> {row.phone}
                    </div>
                </div>
            )
        },
        { 
            key: "rating", 
            label: "Trust Index",
            render: (row: any) => (
                <div className="flex items-center gap-1.5">
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.floor(row.rating || 0) ? 'fill-rose-500 text-rose-500' : 'text-slate-200'}`} />
                        ))}
                    </div>
                    <span className="text-[11px] font-bold text-slate-900 tracking-tight">{row.rating || "0.0"}</span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "ledger status",
            render: (row: any) => <StatusBadge status={row.status || "Active"} />
        }
    ];

    const filteredVendors = (contacts || [])
        .filter(c => c.type === 'vendor')
        .filter(v =>
            v.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.category?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingVendor ? "Refine Supplier Node" : "Initialize Vendor Identity"}
                    subtitle="Procurement Management"
                    headerFields={vendorHeaderFields}
                    onAbort={() => { setView("list"); setEditingVendor(null); }}
                    onSave={handleSave}
                    initialData={editingVendor}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Procurement"
            data={filteredVendors}
            columns={vendorColumns}
            onNew={() => { setEditingVendor(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(v) => { setEditingVendor(v); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingVendor(null); setView("form"); }} className="h-8 px-4 rounded-xl font-bold text-[10px]  tracking-widest bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2 shadow-sm">
                        <Building2 className="w-3.5 h-3.5" /> Enlist Supplier
                    </button>
                    <button className="h-8 px-4 rounded-xl font-bold text-[10px]  tracking-widest bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all shadow-sm">
                        Matrix Export
                    </button>
                </div>
            }
        />
    );
}
