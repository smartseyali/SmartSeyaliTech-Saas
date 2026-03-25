import { useState } from "react";
import { Users, Building2, MapPin, Phone, History } from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";

export default function Customers() {
    const [searchTerm, setSearchTerm] = useState("");
    const [customers] = useState([
        { id: "CUS-001", name: "Acme Corp", contact: "John Walker", location: "New York, US", revenue: 850000, status: "key-account" },
        { id: "CUS-002", name: "Globex Inc", contact: "Sarah Miller", location: "London, UK", revenue: 420000, status: "active" },
        { id: "CUS-003", name: "Eco Power", contact: "David Sun", location: "Singapore", revenue: 120000, status: "prospect" },
    ]);

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    const customerColumns = [
        { 
            key: "name", 
            label: "Entity Name",
            render: (c: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900   tracking-tight">{c.name}</span>
                    <span className="text-xs text-gray-400 font-bold  tracking-widest mt-1">POC: {c.contact}</span>
                </div>
            )
        },
        { 
            key: "location", 
            label: "Location",
            render: (c: any) => (
                <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[13px] font-bold text-gray-600  tracking-widest">{c.location}</span>
                </div>
            )
        },
        { 
            key: "revenue", 
            label: "Lifetime Value",
            render: (c: any) => <span className="font-bold text-indigo-600 tracking-tight">{fmt(c.revenue)}</span>,
            className: "text-right"
        },
        { 
            key: "status", 
            label: "Relationship",
            render: (c: any) => <StatusBadge status={c.status} />
        }
    ];

    const filteredCustomers = customers.filter(c => 
        (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.contact || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.location || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ERPListView
            title="Customer Directory"
            data={filteredCustomers}
            columns={customerColumns}
            onNew={() => {}}
            onRefresh={() => {}}
            isLoading={false}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
