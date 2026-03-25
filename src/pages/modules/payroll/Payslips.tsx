import { useState } from "react";
import { 
    Banknote, Receipt, Calculator, 
    Plus, Search, Filter, RefreshCw, 
    CheckCircle2, AlertCircle, Clock,
    CreditCard, ArrowRightLeft, Landmark,
    TrendingUp, UserCircle
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function PayrollPayslips() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingPayslip, setEditingPayslip] = useState<any>(null);
    
    // Fetch payslips from payroll_payslips registry
    const { data: payslips, loading, fetchItems, createItem, updateItem } = useCrud("payroll_payslips");

    const payslipFields = [
        { 
            key: "employee_id", label: "Resource", type: "select" as const, 
            required: true, options: [] // Fetch active employees
        },
        { key: "period_start", label: "Cycle Commencement", type: "date" as const, required: true },
        { key: "period_end", label: "Cycle Finalization", type: "date" as const, required: true },
        { 
            key: "status", label: "Disbursement", type: "select" as const,
            options: [
                { label: "Calculation Draft", value: "draft" },
                { label: "Treasury Approved", value: "approved" },
                { label: "Disbursed / Paid", value: "paid" }
            ]
        }
    ];

    const payslipItemFields = [
        { 
            key: "component_id", label: "Formula", type: "select" as const,
            options: [
                { label: "Basic Salary", value: "basic" },
                { label: "HRA Allocation", value: "hra" },
                { label: "Performance Incentive", value: "incentive" },
                { label: "Statutory Deduction", value: "deduction" }
            ]
        },
        { key: "amount", label: "Magnitude", type: "number" as const },
        { key: "memo", label: "Narrative", ph: "Outline formula application..." }
    ];

    const handleSave = async (header: any, items: any[]) => {
        const payload = { ...header, items };
        if (editingPayslip) {
            await updateItem(editingPayslip.id, payload);
        } else {
            await createItem(payload);
        }
        setView("list");
        setEditingPayslip(null);
    };

    const payslipColumns = [
        { 
            key: "identity", 
            label: "Resource / Period",
            render: (p: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/10 group-hover:bg-indigo-600 transition-all duration-500">
                        <UserCircle className="w-7 h-7 opacity-80" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900   tracking-tight">{p.employee_name || 'System Resource Node'}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-bold  tracking-widest leading-none border-r pr-2 border-slate-200">
                                {p.period_start} TO {p.period_end}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "financials", 
            label: "Compensation Magnitude",
            render: (p: any) => (
                <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-slate-900 tracking-tighter">
                        ₹{(p.net_pay || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-500  tracking-widest">Calculated Logic</span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Treasury",
            render: (p: any) => <StatusBadge status={p.status || "paid"} />
        },
        {
            key: "reference",
            label: "Disbursement",
            render: (p: any) => (
                <div className="flex items-center gap-2 text-slate-400">
                    <Landmark size={14}/>
                    <span className="text-[10px] font-bold  tracking-widest">{p.payment_ref || 'BANK_POST_IND...'}</span>
                </div>
            )
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingPayslip ? "Refine Disbursement node" : "Initialize Payroll Cycle"}
                    subtitle="Universal Resource Compensation"
                    headerFields={payslipFields}
                    itemFields={payslipItemFields}
                    onAbort={() => { setView("list"); setEditingPayslip(null); }}
                    onSave={handleSave}
                    initialData={editingPayslip}
                    itemTitle="Compensation Formula matrix"
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Payroll Payslip"
            data={payslips || []}
            columns={payslipColumns}
            onNew={() => { setEditingPayslip(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(p) => { setEditingPayslip(p); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-bold text-[10px]  tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                        <TrendingUp className="w-3.5 h-3.5" /> Batch Calculation
                    </button>
                    <button className="h-8 px-4 rounded-xl font-bold text-[10px]  tracking-widest bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-all flex items-center gap-2">
                        <CreditCard className="w-3.5 h-3.5" /> Disburse Batch
                    </button>
                </div>
            }
        />
    );
}
