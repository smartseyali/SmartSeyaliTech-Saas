import { useState } from "react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import { toast } from "sonner";
import { DynamicFormDialog, FieldConfig } from "@/components/modules/DynamicFormDialog";

export default function Expenses() {
    const [searchTerm, setSearchTerm] = useState("");
    const [expenses, setExpenses] = useState([
        { id: "EXP-001", description: "AWS Hosting Bill", category: "Infrastructure", amount: 25400, date: "2024-03-08", status: "paid", payment: "HDFC Credit" },
        { id: "EXP-002", description: "Office Supplies", category: "Admin", amount: 1200, date: "2024-03-07", status: "rejected", payment: "Petty Cash" },
        { id: "EXP-003", description: "Team Lunch", category: "Welfare", amount: 4500, date: "2024-03-06", status: "pending", payment: "Reimbursement" },
        { id: "EXP-004", description: "Petrol Allowance", category: "Travel", amount: 2000, date: "2024-03-05", status: "paid", payment: "Cash" },
    ]);

    const [isAddOpen, setIsAddOpen] = useState(false);

    const expenseFields: FieldConfig[] = [
        { key: "description", label: "Description", required: true, ph: "e.g. AWS Invoice #202" },
        {
            key: "category", label: "Category", type: "select", options: [
                { label: "Infrastructure", value: "Infrastructure" },
                { label: "Admin", value: "Admin" },
                { label: "Welfare", value: "Welfare" },
                { label: "Travel", value: "Travel" }
            ], required: true
        },
        { key: "amount", label: "Amount", type: "number", required: true },
        { key: "payment", label: "Payment Mode", type: "text", ph: "e.g. Credit Card", required: true }
    ];

    const handleRecordExpense = async (data: any) => {
        const newExp = {
            id: `EXP-00${expenses.length + 5}`,
            date: new Date().toISOString().split('T')[0],
            status: "pending",
            ...data,
            amount: Number(data.amount)
        };
        setExpenses([newExp, ...expenses]);
        toast.success("Expense logged into books");
    };

    const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

    const expenseColumns = [
        { 
            key: "description", 
            label: "Identity",
            render: (exp: any) => (
                <div className="flex flex-col">
                    <span className="font-bold text-gray-900 tracking-tight italic uppercase leading-none">{exp.description}</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{exp.id} • {exp.date}</span>
                </div>
            )
        },
        { 
            key: "category", 
            label: "Categorization",
            render: (exp: any) => (
                <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-[10px] font-bold uppercase tracking-widest border border-gray-200">
                    {exp.category}
                </span>
            )
        },
        { 
            key: "amount", 
            label: "Valuation",
            render: (exp: any) => <span className="font-bold text-rose-600 italic">{fmt(exp.amount)}</span>
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

    return (
        <>
            <ERPListView
                title="Expense Log"
                data={filteredExpenses}
                columns={expenseColumns}
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
                title="Log Business Expense"
                fields={expenseFields}
                onSubmit={handleRecordExpense}
            />
        </>
    );
}
