import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Directory() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingEmp, setEditingEmp] = useState<any>(null);
    
    const { data: employees, loading, fetchItems, createItem, updateItem } = useCrud("hrms_employees");

    const employeeHeaderFields = [
        { key: "employee_code", label: "Registry Code", required: true, ph: "EMP-001" },
        { key: "full_name", label: "Legal Resource Name", required: true, ph: "John Doe" },
        { key: "email", label: "Corporate Email Hub", required: true, ph: "john@company.com" },
        { key: "designation", label: "Structural Designation", ph: "Senior Engineer" },
        { 
            key: "status", label: "Operational State", type: "select" as const,
            options: [
                { label: "Active Operational", value: "active" },
                { label: "On Temporary Leave", value: "on-leave" },
                { label: "Resigned Asset", value: "resigned" }
            ]
        },
        { key: "date_of_joining", label: "Induction Date", type: "date" as const }
    ];

    const handleSave = async (header: any) => {
        if (editingEmp) {
            await updateItem(editingEmp.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingEmp(null);
    };

    const employeeColumns = [
        { 
            key: "full_name", 
            label: "Employee Matrix",
            render: (emp: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-bold text-xs">
                        {(emp.full_name || "??").split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900 tracking-tight italic uppercase">{emp.full_name}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{emp.employee_code}</span>
                    </div>
                </div>
            )
        },
        { 
            key: "designation", 
            label: "Corporate Role",
            render: (emp: any) => (
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700">{emp.designation || "Not Assigned"}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{emp.email}</span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Status",
            render: (emp: any) => <StatusBadge status={emp.status} />
        }
    ];

    const filteredEmployees = (employees || []).filter(emp => 
        emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingEmp ? "Refine Resource Data" : "Initialize Employee Node"}
                    subtitle="Human Capital Management"
                    headerFields={employeeHeaderFields}
                    onAbort={() => { setView("list"); setEditingEmp(null); }}
                    onSave={handleSave}
                    initialData={editingEmp}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Resource Directory"
            data={filteredEmployees}
            columns={employeeColumns}
            onNew={() => { setEditingEmp(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(emp) => { setEditingEmp(emp); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}
