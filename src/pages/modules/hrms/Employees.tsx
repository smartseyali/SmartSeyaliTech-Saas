import { useState } from "react";
import { 
    Users, UserCheck, Briefcase, 
    Calendar, Mail, Phone, Building2, 
    Plus, Search, Filter, RefreshCw, 
    UserPlus, ShieldCheck, BadgeCheck
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Employees() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingEmployee, setEditingEmployee] = useState<any>(null);
    
    // Fetch employees from hrms_employees table
    const { data: employees, loading, fetchItems, createItem, updateItem } = useCrud("hrms_employees");

    const employeeFields = [
        { key: "employee_code", label: "Structural (Code)", required: true, ph: "EMP-2026-001" },
        { key: "full_name", label: "Contact Name", required: true, ph: "John Doe..." },
        { key: "email", label: "Corporate Communication", ph: "john.doe@company.com" },
        { 
            key: "department_id", label: "Organizational", type: "select" as const,
            options: [
                { label: "Engineering Sector", value: "1" },
                { label: "Financial Governance", value: "2" },
                { label: "Operational Logistics", value: "3" }
            ]
        },
        { 
            key: "designation_id", label: "Job Title", type: "select" as const,
            options: [
                { label: "Lead Architect", value: "1" },
                { label: "Senior Analyst", value: "2" },
                { label: "Process Manager", value: "3" }
            ]
        },
        { key: "joining_date", label: "Mobilization Date", type: "date" as const },
        { 
            key: "status", label: "Status", type: "select" as const,
            options: [
                { label: "Active Resource", value: "active" },
                { label: "On Leave", value: "leave" },
                { label: "Offboarded", value: "inactive" }
            ]
        }
    ];

    const handleSave = async (header: any) => {
        if (editingEmployee) {
            await updateItem(editingEmployee.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingEmployee(null);
    };

    const employeeColumns = [
        { 
            key: "name", 
            label: "Employee / Role",
            render: (emp: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm relative">
                        <Users className="w-5 h-5" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                            <BadgeCheck className="w-2 h-2 text-white" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 uppercase italic tracking-tight">{emp.full_name || emp.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none border-r pr-2 border-slate-200">
                                {emp.employee_code || "EMP-XXXX"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                                {emp.designation_name || "Unassigned Designation"}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "department", 
            label: "Organizational Unit",
            render: (emp: any) => (
                <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest leading-none">
                        {emp.department_name || "Corporate Hub"}
                    </span>
                </div>
            )
        },
        { 
            key: "contact", 
            label: "Communication",
            render: (emp: any) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 group-hover:text-slate-900 transition-colors">
                        <Mail size={12}/> {emp.email || 'N/A'}
                    </span>
                    <span className="text-[11px] font-black text-slate-700 tracking-tighter">
                        {emp.phone || '+91 0000 0000'}
                    </span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Data",
            render: (emp: any) => <StatusBadge status={emp.status || "active"} />
        }
    ];

    const filteredEmployees = (employees || []).filter(emp =>
        (emp.full_name || emp.name)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingEmployee ? "Refine Resource Profile" : "Initialize Resource Entry"}
                    subtitle="Human Capital Management"
                    headerFields={employeeFields}
                    onAbort={() => { setView("list"); setEditingEmployee(null); }}
                    onSave={handleSave}
                    initialData={editingEmployee}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Human Capital"
            data={filteredEmployees}
            columns={employeeColumns}
            onNew={() => { setEditingEmployee(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(emp) => { setEditingEmployee(emp); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg shadow-slate-900/10">
                        <UserPlus className="w-3.5 h-3.5" /> Rapid Induction
                    </button>
                </div>
            }
        />
    );
}
