import { useState } from "react";
import { Building2, Mail, Phone, MapPin, Search, Plus, Filter, RefreshCw, X, Save } from "lucide-react";
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
        { key: "name", label: "Contact Name", required: true, ph: "First Last or Company..." },
        { key: "email", label: "Email Address", ph: "email@domain.com" },
        { key: "phone", label: "Phone Number", ph: "+91 ..." },
        { key: "company_name", label: "Company Name", ph: "Acme Corp" },
        { key: "job_title", label: "Job Title", ph: "Manager / Director" },
        { 
            key: "type", label: "Type", type: "select" as const,
            options: [
                { label: "Standard Customer", value: "customer" },
                { label: "Strategic Vendor", value: "vendor" },
                { label: "Prospect Lead", value: "lead" }
            ]
        },
        { key: "city", label: "City", ph: "City" },
        { key: "status", label: "Status", type: "select" as const,
            options: [
                { label: "Active Nodes", value: "active" },
                { label: "Dormant / Archive", value: "inactive" },
                { label: "Blacklisted", value: "blocked" }
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
            label: "Entity Name",
            render: (c: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900   tracking-tight">{c.name}</span>
                    <span className="text-xs text-gray-400 font-bold  tracking-widest mt-1">{c.job_title || "Unclassified Role"}</span>
                </div>
            )
        },
        { 
            key: "company_name", 
            label: "Corporate Unit",
            render: (c: any) => (
                <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[13px] font-bold text-gray-600  tracking-widest">{c.company_name || 'Individual'}</span>
                </div>
            )
        },
        { 
            key: "email", 
            label: "Communication",
            render: (c: any) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-gray-500  tracking-widest flex items-center gap-2"><Mail size={10}/> {c.email}</span>
                    <span className="text-xs font-bold text-gray-500  tracking-widest flex items-center gap-2"><Phone size={10}/> {c.phone}</span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Status",
            render: (c: any) => <StatusBadge status={c.status} />
        }
    ];

    const filteredContacts = (contacts || []).filter(c =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingContact ? "Refine Contact Matrix" : "Initialize Entity Entry"}
                    subtitle="Contact Management"
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
            title="Directory"
            data={filteredContacts}
            columns={contactColumns}
            onNew={() => { setEditingContact(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(c) => { setEditingContact(c); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
