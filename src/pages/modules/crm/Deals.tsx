import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Deals() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingDeal, setEditingDeal] = useState<any>(null);
    
    const { data: deals, loading, fetchItems, createItem, updateItem } = useCrud("crm_deals");

    const dealHeaderFields = [
        { key: "title", label: "Deal Title", required: true, ph: "Enterprise Plan Upgrade..." },
        { key: "amount", label: "Amount", type: "number" as const, ph: "0.00" },
        { 
            key: "stage", label: "Operational Stage", type: "select" as const,
            options: [
                { label: "Discovery Phase", value: "discovery" },
                { label: "Proposal", value: "proposal" },
                { label: "Negotiation Link", value: "negotiation" },
                { label: "Closing", value: "closing" },
                { label: "Won Asset", value: "won" },
                { label: "Lost Link", value: "lost" }
            ]
        },
        { key: "expected_closing", label: "Forecasted Close Date", type: "date" as const },
        { 
            key: "priority", label: "Strategic Priority", type: "select" as const,
            options: [
                { label: "Low Impact", value: "low" },
                { label: "Medium Flow", value: "medium" },
                { label: "High Criticality", value: "high" }
            ]
        },
        { key: "notes", label: "Negotiation Narrative", ph: "Key deal points..." }
    ];

    const handleSave = async (header: any) => {
        if (editingDeal) {
            await updateItem(editingDeal.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingDeal(null);
    };

    const fmt = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

    const dealColumns = [
        { 
            key: "title", 
            label: "Deal",
            render: (deal: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-tight  ">{deal.title}</span>
                    <span className="text-xs text-gray-400 font-bold  tracking-widest">{deal.priority || "Standard"} Priority</span>
                </div>
            )
        },
        { 
            key: "amount", 
            label: "Yield",
            render: (deal: any) => <span className="font-bold text-gray-900 tracking-tight">{fmt(deal.amount)}</span>,
            className: "text-right"
        },
        { 
            key: "stage", 
            label: "Stage",
            render: (deal: any) => <StatusBadge status={deal.stage} />
        },
        { 
            key: "expected_closing", 
            label: "Closing Date",
            render: (deal: any) => <span className="text-sm font-bold text-gray-500">{deal.expected_closing || "TBD"}</span>
        }
    ];

    const filteredDeals = (deals || []).filter(deal => 
        deal.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingDeal ? "Refine Negotiation Data" : "Initialize Deal Matrix"}
                    subtitle="Revenue Forecasting"
                    headerFields={dealHeaderFields}
                    onAbort={() => { setView("list"); setEditingDeal(null); }}
                    onSave={handleSave}
                    initialData={editingDeal}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Active Deals"
            data={filteredDeals}
            columns={dealColumns}
            onNew={() => { setEditingDeal(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(deal) => { setEditingDeal(deal); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
