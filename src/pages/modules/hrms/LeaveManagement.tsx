import { useState } from "react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import { toast } from "sonner";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";

export default function LeaveManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [leaves, setLeaves] = useState([
        { id: 1, name: "Sarah Jenkins", type: "Annual Leave", duration: "3 Days", start: "2024-03-12", status: "pending", reason: "Family trip" },
        { id: 2, name: "Michael Chen", type: "Sick Leave", duration: "1 Day", start: "2024-03-08", status: "approved", reason: "Medical appointment" },
        { id: 3, name: "Jessica Roe", type: "Work From Home", duration: "2 Days", start: "2024-03-09", status: "approved", reason: "Home maintenance" },
    ]);

    const [isAddOpen, setIsAddOpen] = useState(false);

    const leaveFields: FieldConfig[] = [
        {
            key: "type", label: "Leave Type", type: "select", options: [
                { label: "Annual Leave", value: "Annual Leave" },
                { label: "Sick Leave", value: "Sick Leave" },
                { label: "Work From Home", value: "Work From Home" },
                { label: "Casual Leave", value: "Casual Leave" }
            ], required: true
        },
        { key: "start", label: "Start Date", type: "text", ph: "YYYY-MM-DD", required: true },
        { key: "duration", label: "Duration (Days)", required: true },
        { key: "reason", label: "Reason/Notes", type: "textarea" }
    ];

    const handleRequestLeave = async (data: any) => {
        const newLeave = {
            id: leaves.length + 1,
            name: "Current User",
            status: "pending",
            ...data
        };
        setLeaves([newLeave, ...leaves]);
        toast.success("Leave request submitted for approval");
    };

    const filteredLeaves = leaves.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const leaveColumns = [
        { 
            key: "name", 
            label: "Requestor",
            render: (lv: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-tight italic uppercase leading-none">{lv.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{lv.reason}</span>
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
                    <span className="text-sm font-black text-gray-900 italic leading-none">{lv.duration}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Starts {lv.start}</span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Lifecycle",
            render: (lv: any) => <StatusBadge status={lv.status} />
        }
    ];

    return (
        <>
            <ERPListView
                title="Leave Management"
                data={filteredLeaves}
                columns={leaveColumns}
                onNew={() => setIsAddOpen(true)}
                onRefresh={() => {}}
                isLoading={false}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                primaryKey="id"
            />
            <DynamicFormDialog
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                title="Request New Leave"
                fields={leaveFields}
                onSubmit={handleRequestLeave}
            />
        </>
    );
}
