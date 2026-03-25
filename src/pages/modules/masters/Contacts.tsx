import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import { User, Plus, Search, Filter, RefreshCw, Save, X, Phone, Mail, MapPin } from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Contacts() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingContact, setEditingContact] = useState<any>(null);
    
    const { data: contacts, loading, fetchItems, createItem, updateItem } = useCrud("ecom_customers");

    const contactColumns = [
        { key: "full_name", label: "Contact Name", className: "font-bold text-slate-900" },
        { 
            key: "type", 
            label: "Category",
            render: (item: any) => (
                <span className="text-[12px] font-medium text-slate-500 uppercase tracking-tighter">
                    {item.type || "Customer"}
                </span>
            )
        },
        { key: "email", label: "Email Address" },
        { key: "phone", label: "Phone Number" },
        { 
            key: "status", 
            label: "Status",
            render: (item: any) => <StatusBadge status={item.status || "Active"} />
        },
        { key: "updated_at", label: "Updated Date" }
    ];

    const contactTabFields = {
        basic: [
            { key: "full_name", label: "Legal Name *", type: "text" as const, required: true, ph: "Company or Individual Name" },
            { 
                key: "type", label: "Type", type: "select" as const,
                options: [
                    { label: "Customer", value: "Customer" },
                    { label: "Vendor", value: "Vendor" },
                    { label: "Employee", value: "Employee" }
                ]
            },
            { key: "phone", label: "Phone Number", type: "text" as const, ph: "+91..." },
            { key: "email", label: "Email Address", type: "text" as const, ph: "contact@example.com" },
            { key: "gst_number", label: "GST Number", type: "text" as const, ph: "27AAAAA0000A1Z5" },
            { key: "pan", label: "PAN", type: "text" as const, ph: "ABCDE1234F" }
        ],
        config: [
            { key: "billing_address", label: "Billing Address", type: "textarea" as any, ph: "Full billing address..." },
            { key: "shipping_address", label: "Shipping Address", type: "textarea" as any, ph: "Full shipping address..." }
        ],
        mapping: [
            { key: "erp_id", label: "ERP ID", type: "text" as const },
            { key: "status", label: "Status", type: "select" as const, options: [{ value: 'Active', label: 'Active' }, { value: 'Blocked', label: 'Blocked' }] }
        ]
    };

    const personFields = [
        { key: "contact_person", label: "Contact Person", type: "text" as const, ph: "Name" },
        { key: "phone", label: "Phone", type: "text" as const, ph: "Phone" },
        { key: "email", label: "Email", type: "text" as const, ph: "Email" },
        { key: "role", label: "Role", type: "text" as const, ph: "e.g. Manager" }
    ];

    const handleSave = async (header: any, items: any[]) => {
        try {
            console.log("Saving contact with people:", { header, items });
            if (editingContact) {
                await updateItem(editingContact.id, header);
            } else {
                await createItem(header);
            }
            setView("list");
            setEditingContact(null);
            fetchItems();
        } catch (err) {
            console.error("Save failed:", err);
        }
    };

    if (view === "form") {
        return (
            <div className="p-4 bg-slate-50 min-h-screen">
                <ERPEntryForm
                    title={editingContact ? "Edit Contact" : "Add New Contact"}
                    subtitle="Manage customer, vendor and employee details"
                    tabFields={contactTabFields}
                    itemFields={personFields}
                    itemTitle="Contact Persons"
                    onAbort={() => { setView("list"); setEditingContact(null); }}
                    onSave={handleSave}
                    initialData={editingContact}
                    showItems={true}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white">
            <ERPListView
                title="Unified Contact Master"
                data={contacts || []}
                columns={contactColumns}
                onNew={() => { setEditingContact(null); setView("form"); }}
                onRefresh={fetchItems}
                onRowClick={(item) => { setEditingContact(item); setView("form"); }}
                isLoading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                primaryKey="id"
            />
        </div>
    );
}
