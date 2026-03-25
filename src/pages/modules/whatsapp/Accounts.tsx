import { useState } from "react";
import { 
    Smartphone, Database, ShieldCheck, 
    Plus, Search, Filter, RefreshCw, 
    CheckCircle2, AlertCircle, Clock,
    Facebook, ExternalLink, Key
} from "lucide-react";
import { useCrud } from "@/hooks/useCrud";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";
import ERPEntryForm from "@/components/modules/ERPEntryForm";

export default function WhatsAppAccounts() {
    const [view, setView] = useState<"list" | "form">("list");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingAccount, setEditingAccount] = useState<any>(null);
    
    // Fetch accounts from whatsapp_accounts registry
    const { data: accounts, loading, fetchItems, createItem, updateItem } = useCrud("whatsapp_accounts");

    const accountFields = [
        { key: "display_name", label: "Account Name", required: true, ph: "Primary Business API..." },
        { key: "phone_number_id", label: "Meta Phone Number ID", required: true, ph: "1092837465..." },
        { key: "waba_id", label: "WhatsApp Business Account ID", required: true, ph: "987654321..." },
        { key: "access_token", label: "Permanent access Token", ph: "EAAG...", type: "text" as const },
        { 
            key: "status", label: "Verification", type: "select" as const,
            options: [
                { label: "Pending", value: "pending" },
                { label: "Infrastructure Verified", value: "verified" },
                { label: "Connection Interrupted", value: "disconnected" }
            ]
        }
    ];

    const handleSave = async (header: any) => {
        if (editingAccount) {
            await updateItem(editingAccount.id, header);
        } else {
            await createItem(header);
        }
        setView("list");
        setEditingAccount(null);
    };

    const accountColumns = [
        { 
            key: "identity", 
            label: "Business Account",
            render: (a: any) => (
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-900 border border-emerald-800 flex items-center justify-center text-emerald-400 shadow-xl shadow-emerald-900/10 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900   tracking-tight">{a.display_name}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 font-bold  tracking-widest leading-none border-r pr-2 border-slate-200">
                                WABA ID: {a.waba_id || '987-XXX-YYY'}
                            </span>
                        </div>
                    </div>
                </div>
            )
        },
        { 
            key: "infrastructure", 
            label: "Connection",
            render: (a: any) => (
                <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Database size={12}/>
                        <span className="text-[10px] font-bold  tracking-widest">PNID: {a.phone_number_id || '109XXXXXXXX'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-indigo-400 mt-1">
                        <Facebook size={12}/>
                        <span className="text-[10px] font-bold  tracking-widest">Business API Authorized</span>
                    </div>
                </div>
            )
        },
        { 
            key: "security", 
            label: "Authorization",
            render: (a: any) => (
                <div className="flex items-center gap-2">
                    <Key size={14} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-slate-400  tracking-widest">Token encrypted & rotating</span>
                </div>
            )
        },
        { 
            key: "status", 
            label: "Status",
            render: (a: any) => <StatusBadge status={a.status || "verified"} />
        }
    ];

    if (view === "form") {
        return (
            <div className="p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
                <ERPEntryForm
                    title={editingAccount ? "Refine Meta Account" : "Initialize Meta identity"}
                    subtitle="WhatsApp Business Infrastructure Configuration"
                    headerFields={accountFields}
                    onAbort={() => { setView("list"); setEditingAccount(null); }}
                    onSave={handleSave}
                    initialData={editingAccount}
                    showItems={false}
                />
            </div>
        );
    }

    return (
        <ERPListView
            title="Meta Account"
            data={accounts || []}
            columns={accountColumns}
            onNew={() => { setEditingAccount(null); setView("form"); }}
            onRefresh={fetchItems}
            onRowClick={(a) => { setEditingAccount(a); setView("form"); }}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-bold text-[10px]  tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5" /> Security Audit
                    </button>
                    <button className="h-8 px-4 rounded-xl font-bold text-[10px]  tracking-widest bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 transition-all flex items-center gap-2">
                        <ExternalLink className="w-3.5 h-3.5" /> Meta Dev Hub
                    </button>
                </div>
            }
        />
    );
}
