import { useState } from "react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import { toast } from "sonner";

export default function Attendance() {
    const attendance = [
        { id: 1, name: "Sarah Jenkins", timeIn: "09:02 AM", timeOut: "06:15 PM", status: "on-time", location: "Remote" },
        { id: 2, name: "Michael Chen", timeIn: "09:45 AM", timeOut: "-", status: "late", location: "Office HQ" },
        { id: 3, name: "John Doe", timeIn: "08:55 AM", timeOut: "05:30 PM", status: "on-time", location: "Office HQ" },
        { id: 4, name: "Jessica Roe", timeIn: "-", timeOut: "-", status: "absent", location: "-" },
    ];

    const [searchTerm, setSearchTerm] = useState("");

    const attendanceColumns = [
        { 
            key: "name", 
            label: "Employee",
            render: (log: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-tight italic uppercase leading-none">{log.name}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{log.location}</span>
                </div>
            )
        },
        { 
            key: "timeIn", 
            label: "Check-In",
            render: (log: any) => <span className="font-bold text-gray-700 italic">{log.timeIn}</span>
        },
        { 
            key: "timeOut", 
            label: "Check-Out",
            render: (log: any) => <span className="font-bold text-gray-700 italic">{log.timeOut}</span>
        },
        { 
            key: "status", 
            label: "Punctuality",
            render: (log: any) => <StatusBadge status={log.status} />
        }
    ];

    const filteredAttendance = attendance.filter(log => 
        log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ERPListView
            title="Attendance Logs"
            data={filteredAttendance}
            columns={attendanceColumns}
            onNew={() => toast.info("Manual entry coming soon...")}
            onRefresh={() => {}}
            isLoading={false}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
