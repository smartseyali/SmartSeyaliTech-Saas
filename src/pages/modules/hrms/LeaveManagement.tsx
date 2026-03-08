import { useState } from "react";
import {
    Calendar, Search, Filter, Plus,
    MoreHorizontal, CheckCircle2, XCircle,
    Clock, Plane, Heart, Home, GraduationCap,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";
import { toast } from "sonner";

export default function LeaveManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [leaves, setLeaves] = useState([
        { id: 1, name: "Sarah Jenkins", type: "Annual Leave", duration: "3 Days", start: "2024-03-12", status: "Pending", reason: "Family trip" },
        { id: 2, name: "Michael Chen", type: "Sick Leave", duration: "1 Day", start: "2024-03-08", status: "Approved", reason: "Medical appointment" },
        { id: 3, name: "Jessica Roe", type: "Work From Home", duration: "2 Days", start: "2024-03-09", status: "Approved", reason: "Home maintenance" },
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
            name: "Current User", // Mocked
            status: "Pending",
            ...data
        };
        setLeaves([newLeave, ...leaves]);
        toast.success("Leave request submitted for approval");
    };

    const handleStatusUpdate = (id: number, newStatus: string) => {
        setLeaves(leaves.map(l => l.id === id ? { ...l, status: newStatus } : l));
        toast.info(`Request ${newStatus.toLowerCase()}`);
    };

    const filteredLeaves = leaves.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Calendar className="w-6 h-6 text-emerald-600" />
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Personnel Operations</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Leave Management</h1>
                    <p className="text-sm font-medium text-slate-500">Manage time-off requests and vacation balances.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex items-center bg-slate-100 rounded-2xl px-4 h-12 border border-slate-200">
                        <Search className="w-4 h-4 text-slate-400 mr-2" />
                        <input
                            type="text"
                            placeholder="Find requests..."
                            className="bg-transparent border-0 focus:ring-0 text-sm w-48 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="h-12 px-8 rounded-2xl bg-emerald-600 hover:bg-black text-white font-bold shadow-xl shadow-emerald-600/20 transition-all gap-3 border-0"
                    >
                        <Plus className="w-5 h-5" /> Request Leave
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Sick Balance", value: "12 Days", icon: Heart, color: "bg-rose-50 text-rose-600" },
                    { label: "Casual Balance", value: "08 Days", icon: Home, color: "bg-amber-50 text-amber-600" },
                    { label: "Earned Leave", value: "15 Days", icon: Plane, color: "bg-emerald-50 text-emerald-600" },
                    { label: "Training Quota", value: "05 Days", icon: GraduationCap, color: "bg-indigo-50 text-indigo-600" },
                ].map(k => (
                    <div key={k.label} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm group hover:shadow-xl transition-all text-center">
                        <div className={cn("inline-flex p-4 rounded-2xl mb-6 transition-transform group-hover:scale-110", k.color)}>
                            <k.icon className="w-8 h-8" />
                        </div>
                        <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-2">{k.label}</h4>
                        <p className="text-2xl font-black text-slate-900 leading-none">{k.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden mt-8">
                <table className="w-full text-left font-sans">
                    <thead>
                        <tr className="border-b border-slate-50 bg-slate-50/50">
                            <th className="py-6 pl-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Requestor Identity</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Time-Off Logic</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Span</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Lifecycle</th>
                            <th className="py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right pr-10">Approval Flow</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredLeaves.map((lv) => (
                            <tr key={lv.id} className="group hover:bg-slate-50/50 transition-all">
                                <td className="py-8 pl-10">
                                    <p className="text-sm font-black text-slate-900 uppercase italic mb-1 leading-none">{lv.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{lv.reason}</p>
                                </td>
                                <td className="py-8">
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", lv.type.includes('Sick') ? "bg-rose-500 shadow-[0_0_8px_theme(colors.rose.400)]" : "bg-emerald-500 shadow-[0_0_8px_theme(colors.emerald.400)]")} />
                                        <span className="text-xs font-bold text-slate-700">{lv.type}</span>
                                    </div>
                                </td>
                                <td className="py-8">
                                    <p className="text-sm font-black text-slate-900 leading-none mb-1 uppercase tracking-tight italic">{lv.duration}</p>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Starts {lv.start}</p>
                                </td>
                                <td className="py-8">
                                    <span className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-500",
                                        lv.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            lv.status === 'Rejected' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {lv.status}
                                    </span>
                                </td>
                                <td className="py-8 pr-10 text-right">
                                    <div className="flex justify-end gap-2">
                                        {lv.status === 'Pending' ? (
                                            <>
                                                <Button
                                                    onClick={() => handleStatusUpdate(lv.id, "Approved")}
                                                    size="icon" variant="ghost" className="h-10 w-10 text-emerald-600 bg-emerald-50 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleStatusUpdate(lv.id, "Rejected")}
                                                    size="icon" variant="ghost" className="h-10 w-10 text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-600 hover:text-white transition-all"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </Button>
                                            </>
                                        ) : (
                                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-300 rounded-xl">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <DynamicFormDialog
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                title="Request New Leave"
                fields={leaveFields}
                onSubmit={handleRequestLeave}
            />
        </div>
    );
}
