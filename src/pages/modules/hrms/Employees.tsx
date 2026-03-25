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
        { key: "employee_code", label: "Employee ID", required: true, ph: "EMP-2026-001" },
        { key: "full_name", label: "Employee Name", required: true, ph: "John Doe..." },
        { key: "email", label: "Email Address", ph: "john.doe@company.com" },
        { 
            key: "department_id", label: "Department", type: "select" as const,
            options: [
                { label: "Engineering", value: "1" },
                { label: "Finance", value: "2" },
                { label: "Operations", value: "3" }
            ]
        },
        { 
            key: "designation_id", label: "Designation", type: "select" as const,
            options: [
                { label: "Software Engineer", value: "1" },
                { label: "Accountant", value: "2" },
                { label: "Manager", value: "3" }
            ]
        },
        { key: "joining_date", label: "Joining Date", type: "date" as const },
        { 
            key: "status", label: "Status", type: "select" as const,
            options: [
                { label: "Active", value: "active" },
                { label: "On Leave", value: "leave" },
                { label: "Inactive", value: "inactive" }
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
            label: "Employee",
            render: (emp: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-sm relative">
                        <Users className="w-5 h-5" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                            <BadgeCheck className="w-2 h-2 text-white" />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 tracking-tight">{emp.full_name || emp.name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-gray-400 font-bold tracking-widest leading-none border-r pr-2 border-slate-200">
                                {emp.employee_code || "EMP-XXXX"}
                            </span>
                            <span className="text-xs text-gray-400 font-bold tracking-widest leading-none">
                                {emp.designation_name || "Employee"}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "department", 
            label: "Department",
            render: (emp: any) => (
                <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-[13px] font-bold text-slate-600 tracking-widest leading-none">
                        {emp.department_name || "General"}
                    </span>
                </div>
            )
        },
        { 
            key: "contact", 
            label: "Contact Info",
            render: (emp: any) => (
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-500 tracking-widest flex items-center gap-2 group-hover:text-slate-900 transition-colors">
                        <Mail size={12}/> {emp.email || 'N/A'}
                    </span>
                    <span className="text-[13px] font-bold text-slate-700 tracking-tighter">
                        {emp.phone || '+91 0000 0000'}
                    </span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Status",
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
                    title={editingEmployee ? "Edit Employee" : "New Employee"}
                    subtitle="Manage employee records and information"
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
            title="Employee Directory"
            data={filteredEmployees}
            columns={employeeColumns}
            onNew={() => { setEditingEmployee(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(emp) => { setEditingEmployee(emp); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
