import { useState } from "react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import { toast } from "sonner";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function Expenses() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingItem, setEditingItem] = useState<any>(null);
    const [expenses, setExpenses] = useState([
        { id: "EXP-001", description: "AWS Hosting Bill", category: "Infrastructure", amount: 25400, date: "2024-03-08", status: "paid", payment: "HDFC Credit" },
        { id: "EXP-002", description: "Office Supplies", category: "Admin", amount: 1200, date: "2024-03-07", status: "rejected", payment: "Petty Cash" },
        { id: "EXP-003", description: "Team Lunch", category: "Welfare", amount: 4500, date: "2024-03-06", status: "pending", payment: "Reimbursement" },
        { id: "EXP-004", description: "Petrol Allowance", category: "Travel", amount: 2000, date: "2024-03-05", status: "paid", payment: "Cash" },
    ]);

    const expenseFields = [
        { key: "description", label: "Description", required: true, ph: "e.g. AWS Invoice #202" },
        {
            key: "category", label: "Category", type: "select" as const, options: [
                { label: "Infrastructure", value: "Infrastructure" },
                { label: "Admin", value: "Admin" },
                { label: "Welfare", value: "Welfare" },
                { label: "Travel", value: "Travel" }
            ], required: true
        },
        { key: "amount", label: "Amount", type: "number" as const, required: true },
        { key: "payment", label: "Payment Mode", type: "text" as const, ph: "e.g. Credit Card", required: true }
    ];

    const handleSave = async (data: any) => {
        if (editingItem) {
            setExpenses(expenses.map(e => e.id === editingItem.id ? { ...e, ...data } : e));
            toast.success("Expense record updated");
        } else {
            const newExp = {
                id: `EXP-00${expenses.length + 5}`,
                date: new Date().toISOString().split('T')[0],
                status: "pending",
                ...data,
                amount: Number(data.amount)
            };
            setExpenses([newExp, ...expenses]);
            toast.success("Expense logged into books");
        }
        setView("list");
        setEditingItem(null);
    };

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    const expenseColumns = [
        { 
            key: "description", 
            label: "Data",
            render: (exp: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-tight leading-none">{exp.description}</span>
                    <span className="text-[10px] text-gray-400 font-bold tracking-widest mt-1">{exp.id} • {exp.date}</span>
                </div>
            )
        },
        { 
            key: "category", 
            label: "Categorization",
            render: (exp: any) => (
                <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px] font-bold tracking-widest border border-gray-200">
                    {exp.category}
                </span>
            )
        },
        { 
            key: "amount", 
            label: "Valuation",
            render: (exp: any) => <span className="font-bold text-rose-600 ">{fmt(exp.amount)}</span>
        },
        { 
            key: "status", 
            label: "Lifecycle",
            render: (exp: any) => <StatusBadge status={exp.status} />
        }
    ];

    const filteredExpenses = expenses.filter(e =>
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingItem ? "Refine Expense Voucher" : "Log Business Expense"}
                    subtitle="Treasury Hub"
                    headerFields={expenseFields}
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
            title="Expense Log"
            data={filteredExpenses}
            columns={expenseColumns}
            onNew={() => { setEditingItem(null); setView("form"); }}
            onRefresh={() => {}}
            onRowClick={(exp) => { setEditingItem(exp); setView("form"); }}
            isLoading={false}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
        />
    );
}

