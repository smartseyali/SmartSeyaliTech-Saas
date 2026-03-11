import { useState } from "react";
import { 
    Building2, Mail, Phone, MapPin, 
    Search, Plus, Filter, RefreshCw, 
    X, Save, Users, UserCheck, 
    TrendingUp, Briefcase 
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Contacts() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingContact, setEditingContact] = useState<any>(null);
    
    // Fetch all contacts from unified table
    const { data: contacts, loading, fetchItems, createItem, updateItem } = useCrud("contacts");

    const contactHeaderFields = [
        { key: "name", label: "Registry Entity Identity", required: true, ph: "First Last or Company Node..." },
        { key: "email", label: "Primary Communication Node", ph: "email@domain.com" },
        { key: "phone", label: "Voice Channel", ph: "+91 ..." },
        { key: "company_name", label: "Associated Corporate Body", ph: "Acme Corp Matrix" },
        { key: "job_title", label: "Structural Role", ph: "Manager / Director" },
        { 
            key: "type", label: "Registry Type Classification", type: "select" as const,
            options: [
                { label: "Standard Customer Node", value: "customer" },
                { label: "Strategic Vendor Node", value: "vendor" },
                { label: "Prospect Lead Stream", value: "lead" }
            ]
        },
        { key: "city", label: "Geographic Registry Hub", ph: "City" },
        { key: "status", label: "Operational State", type: "select" as const,
            options: [
                { label: "Active Operational Node", value: "active" },
                { label: "Dormant / Archive State", value: "inactive" },
                { label: "Blacklisted Sector", value: "blocked" }
            ]
        }
    ];

    const handleSave = async (header: any) => {
        if (editingContact) {
            await updateItem(editingContact.id, header);
        } else {
            await createItem({ ...header, type: header.type || "customer" });
        }
        setView("list");
        setEditingContact(null);
    };

    const contactColumns = [
        { 
            key: "name", 
            label: "Entity Identity / Type",
            render: (c: any) => (
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 ${
                        c.type === 'vendor' ? 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-900 group-hover:text-white' :
                        c.type === 'lead' ? 'bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:bg-cyan-900 group-hover:text-white' :
                        'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-900 group-hover:text-white'
                    }`}>
                        {c.type === 'vendor' ? <Briefcase className="w-5 h-5" /> : 
                         c.type === 'lead' ? <TrendingUp className="w-5 h-5" /> : 
                         <Users className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{c.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none border-r pr-2 border-slate-200">
                                {c.type?.toUpperCase() || "CUSTOMER"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                                {c.job_title || "Unclassified Role"}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "company_name", 
            label: "Corporate Unit Identity",
            render: (c: any) => (
                <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400 group-hover:text-slate-900 transition-colors" />
                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{c.company_name || 'Individual / Personal Node'}</span>
                </div>
            )
        },
        { 
            key: "email", 
            label: "Operational Communication hub",
            render: (c: any) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 group-hover:text-indigo-600 transition-colors"><Mail size={12}/> {c.email}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 group-hover:text-amber-600 transition-colors"><Phone size={12}/> {c.phone}</span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Operational status",
            render: (c: any) => <StatusBadge status={c.status || "Active"} />
        }
    ];

    const filteredContacts = (contacts || []).filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingContact ? "Refine Contact Matrix" : "Initialize Entity Identity Entry"}
                    subtitle="Universal Contact Management Protocol"
                    headerFields={contactHeaderFields}
                    onAbort={() => { setView("list"); setEditingContact(null); }}
                    onSave={handleSave}
                    initialData={editingContact}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Unified Contact Matrix"
            data={filteredContacts}
            columns={contactColumns}
            onNew={() => { setEditingContact(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(c) => { setEditingContact(c); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100 transition-all flex items-center gap-2 shadow-sm">
                        Matrix Bulk Import
                    </button>
                </div>
            }
        />
    );
}
