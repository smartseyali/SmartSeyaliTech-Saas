import { useState } from "react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";
import { toast } from "sonner";
import { DollarSign, Users, CheckCircle, Clock } from "lucide-react";

export default function Payroll() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<"cycles" | "slips">("cycles");

    const { data: items, loading, fetchItems, createItem, updateItem } = useCrud("hrms_payroll_cycles");

    const fields = [
        { key: "cycle_name", label: "Payroll Cycle Name", required: true },
        { key: "period_from", label: "Period From", type: "date" as const, required: true },
        { key: "period_to", label: "Period To", type: "date" as const, required: true },
        { key: "payment_date", label: "Payment Date", type: "date" as const, required: true },
        {
            key: "pay_frequency", label: "Pay Frequency", type: "select" as const, options: [
                { label: "Monthly", value: "monthly" },
                { label: "Bi-weekly", value: "biweekly" },
                { label: "Weekly", value: "weekly" },
            ]
        },
        { key: "total_employees", label: "No. of Employees", type: "number" as const },
        { key: "gross_payroll", label: "Gross Payroll (₹)", type: "number" as const },
        { key: "total_deductions", label: "Total Deductions (₹)", type: "number" as const },
        { key: "net_payroll", label: "Net Payroll (₹)", type: "number" as const },
        {
            key: "status", label: "Status", type: "select" as const, options: [
                { label: "Draft", value: "draft" },
                { label: "Processing", value: "processing" },
                { label: "Processed", value: "processed" },
                { label: "Paid", value: "paid" },
            ]
        },
        { key: "notes", label: "Notes", type: "text" as const },
    ];

    const mockPayroll = [
        { id: 1, cycle_name: "March 2024 Payroll", period_from: "2024-03-01", period_to: "2024-03-31", payment_date: "2024-03-31", total_employees: 12, gross_payroll: 380000, total_deductions: 48000, net_payroll: 332000, status: "paid" },
        { id: 2, cycle_name: "February 2024 Payroll", period_from: "2024-02-01", period_to: "2024-02-29", payment_date: "2024-02-29", total_employees: 11, gross_payroll: 365000, total_deductions: 45000, net_payroll: 320000, status: "paid" },
        { id: 3, cycle_name: "April 2024 Payroll", period_from: "2024-04-01", period_to: "2024-04-30", payment_date: "2024-04-30", total_employees: 12, gross_payroll: 395000, total_deductions: 49000, net_payroll: 346000, status: "draft" },
    ];

    const handleSave = async (data: any) => {
        if (editingItem) {
            await updateItem(editingItem.id, data);
            toast.success("Payroll cycle updated");
        } else {
            await createItem({ ...data, status: "draft" });
            toast.success("Payroll cycle created");
        }
        setView("list");
        setEditingItem(null);
    };

    const displayData = (items && items.length > 0) ? items : mockPayroll;

    const columns = [
        {
            key: "cycle_name", label: "Payroll Cycle",
            render: (i: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-slate-900 text-xs leading-none">{i.cycle_name || "—"}</span>
                    <span className="text-xs text-slate-400 mt-0.5">{i.period_from} → {i.period_to}</span>
                </div>
            )
        },
        {
            key: "total_employees", label: "Employees",
            render: (i: any) => (
                <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">{i.total_employees || 0}</span>
                </div>
            )
        },
        { key: "gross_payroll", label: "Gross Payroll", render: (i: any) => <span className="font-extrabold font-mono text-xs text-slate-900">₹{Number(i.gross_payroll || 0).toLocaleString()}</span> },
        { key: "total_deductions", label: "Deductions", render: (i: any) => <span className="font-bold font-mono text-xs text-red-600">- ₹{Number(i.total_deductions || 0).toLocaleString()}</span> },
        { key: "net_payroll", label: "Net Payroll", render: (i: any) => <span className="font-extrabold font-mono text-xs text-emerald-700">₹{Number(i.net_payroll || 0).toLocaleString()}</span> },
        { key: "payment_date", label: "Payment Date", render: (i: any) => <span className="text-xs font-medium text-slate-600">{i.payment_date}</span> },
        { key: "status", label: "Status", render: (i: any) => <StatusBadge status={i.status || "draft"} /> },
    ];

    const filteredItems = displayData.filter((i: any) =>
        (i.cycle_name || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: displayData.length,
        paid: displayData.filter((i: any) => i.status === "paid").length,
        pending: displayData.filter((i: any) => ["draft", "processing"].includes(i.status)).length,
        totalNet: displayData.reduce((s: number, i: any) => s + (i.net_payroll || 0), 0),
    };

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Edit Payroll Cycle" : "New Payroll Cycle"}
                    subtitle="Run and manage employee salary cycles"
                    headerFields={fields}
                    onAbort={() => { setView("list"); setEditingItem(null); }}
                    onSave={handleSave}
                    initialData={editingItem}
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pt-6">
                {[
                    { label: "Total Cycles", val: stats.total, icon: Clock, clr: "bg-blue-500" },
                    { label: "Paid Cycles", val: stats.paid, icon: CheckCircle, clr: "bg-emerald-500" },
                    { label: "Pending", val: stats.pending, icon: Clock, clr: "bg-amber-500" },
                    { label: "Total Net Paid", val: `₹${stats.totalNet.toLocaleString()}`, icon: DollarSign, clr: "bg-violet-500" },
                ].map((k) => (
                    <div key={k.label} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-sm">
                        <div className={`w-9 h-9 ${k.clr} rounded-lg flex items-center justify-center`}>
                            <k.icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-500">{k.label}</div>
                            <div className="text-lg font-extrabold text-slate-900">{k.val}</div>
                        </div>
                    </div>
                ))}
            </div>

            <ERPListView
                title="Payroll Cycles"
                data={filteredItems}
                columns={columns}
                onNew={() => { setEditingItem(null); setView("form"); }}
                onRefresh={fetchItems}
                onRowClick={(i) => { setEditingItem(i); setView("form"); }}
                isLoading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />
        </div>
    );
}
