import { useState } from "react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import { toast } from "sonner";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function LeaveManagement() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);
    const [leaves, setLeaves] = useState([
        { id: 1, name: "Sarah Jenkins", type: "Annual Leave", duration: "3 Days", start: "2024-03-12", status: "pending", reason: "Family trip" },
        { id: 2, name: "Michael Chen", type: "Sick Leave", duration: "1 Day", start: "2024-03-08", status: "approved", reason: "Medical appointment" },
        { id: 3, name: "Jessica Roe", type: "Work From Home", duration: "2 Days", start: "2024-03-09", status: "approved", reason: "Home maintenance" },
    ]);

    const leaveFields = [
        {
            key: "type", label: "Leave Type", type: "select" as const, options: [
                { label: "Annual Leave", value: "Annual Leave" },
                { label: "Sick Leave", value: "Sick Leave" },
                { label: "Work From Home", value: "Work From Home" },
                { label: "Casual Leave", value: "Casual Leave" }
            ], required: true
        },
        { key: "start", label: "Start Date", type: "date" as const, ph: "YYYY-MM-DD", required: true },
        { key: "duration", label: "Duration (Days)", required: true },
        { key: "reason", label: "Reason/Notes", type: "text" as const }
    ];

    const handleSave = async (data: any) => {
        if (editingItem) {
            setLeaves(leaves.map(l => l.id === editingItem.id ? { ...l, ...data } : l));
            toast.success("Leave request re-calibrated");
        } else {
            const newLeave = {
                id: leaves.length + 1,
                name: "Current User",
                status: "pending",
                ...data
            };
            setLeaves([newLeave, ...leaves]);
            toast.success("Leave request submitted for approval");
        }
        setView("list");
        setEditingItem(null);
    };

    const filteredLeaves = leaves.filter(l =>
        (l.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (l.type || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const leaveColumns = [
        { 
            key: "name", 
            label: "Requestor",
            render: (lv: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-tight leading-none">{lv.name}</span>
                    <span className="text-xs text-gray-400 font-bold tracking-widest mt-1">{lv.reason}</span>
                </div>
            )
        },
        { 
            key: "type", 
            label: "Time-Off",
            render: (lv: any) => (
                <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${lv.type.includes('Sick') ? "bg-rose-500" : "bg-emerald-500"}`} />
                    <span className="text-xs font-bold text-gray-700">{lv.type}</span>
                </div>
            )
        },
        { 
            key: "duration", 
            label: "Span",
            render: (lv: any) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 leading-none">{lv.duration}</span>
                    <span className="text-xs text-gray-400 font-bold tracking-widest leading-none mt-1">Starts {lv.start}</span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Lifecycle",
            render: (lv: any) => <StatusBadge status={lv.status} />
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Refine Absence Protocol" : "Initialize Leave Request"}
                    subtitle="Human Resources Hub"
                    headerFields={leaveFields}
                    onAbort={() => { setView("list"); setEditingItem(null); }}
                    onSave={handleSave}
                    initialData={editingItem}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Leave Management"
            data={filteredLeaves}
            columns={leaveColumns}
            onNew={() => { setEditingItem(null); setView("form"); }}
            onRefresh={() => {}}
            onRowClick={(lv) => { setEditingItem(lv); setView("form"); }}
            isLoading={false}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}

