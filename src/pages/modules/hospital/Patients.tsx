import { useState } from "react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import { toast } from "sonner";

export default function Patients() {
    const [patients] = useState([
        { id: "PAT-001", name: "John Doe", age: 45, blood: "O+", gender: "Male", status: "in-patient", dept: "Cardiology" },
        { id: "PAT-002", name: "Jane Smith", age: 32, blood: "A-", gender: "Female", status: "out-patient", dept: "General" },
        { id: "PAT-003", name: "Michael Roe", age: 28, blood: "B+", gender: "Male", status: "emergency", dept: "Orthopedic" },
    ]);

    const [searchTerm, setSearchTerm] = useState("");

    const patientColumns = [
        { 
            key: "id", 
            label: "Medical ID",
            render: (pat: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900   leading-none">{pat.id}</span>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">{pat.blood}</span>
                        <span className="text-[10px] font-bold text-gray-400  tracking-widest">{pat.gender}</span>
                    </div>
                </div>
            )
        },
        { 
            key: "name", 
            label: "Biological Details",
            render: (pat: any) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700 leading-none">{pat.name}</span>
                    <span className="text-[10px] font-bold text-gray-400  tracking-tighter mt-1">{pat.age} Years Old</span>
                </div>
            )
        },
        { 
            key: "dept", 
            label: "Department",
            render: (pat: any) => <span className="text-sm font-bold text-gray-900  ">{pat.dept}</span>
        },
        { 
            key: "status", 
            label: "Current Lifecycle",
            render: (pat: any) => <StatusBadge status={pat.status} />
        }
    ];

    const filteredPatients = patients.filter(pat => 
        pat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pat.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pat.dept.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ERPListView
            title="Patient Directory"
            data={filteredPatients}
            columns={patientColumns}
            onNew={() => toast.info("Registration coming soon...")}
            onRefresh={() => {}}
            isLoading={false}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
