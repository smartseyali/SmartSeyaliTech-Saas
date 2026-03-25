import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useDictionary } from "@/hooks/useDictionary";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Calendar, CheckCircle2, XCircle } from "lucide-react";
import ERPListView, { StatusBadge } from "@/components/modules/ERPListView";

export default function Customers() {
    const { activeCompany } = useTenant();
    const { t } = useDictionary();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (activeCompany) load();
    }, [activeCompany]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("ecom_customers")
                .select("*")
                .eq("company_id", activeCompany.id)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setCustomers(data || []);
        } catch (err: any) {
            console.error("Error loading customers:", err);
            toast({
                title: `Error loading ${t("Customers").toLowerCase()}`,
                description: `Registry access failure.`,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (customer: any) => {
        const next = customer.status === 'active' ? 'blocked' : 'active';
        try {
            const { error } = await supabase
                .from("ecom_customers")
                .update({ status: next })
                .eq("id", customer.id);

            if (error) throw error;
            toast({ title: `Identity ${next === 'active' ? 'Validated' : 'Suspended'}` });
            load();
        } catch (err: any) {
            toast({ title: "Operation failed", variant: "destructive" });
        }
    };

    const customerColumns = [
        { 
            key: "full_name", 
            label: "Resource",
            render: (row: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        {row.full_name?.charAt(0) || <User className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-900   tracking-tight">{row.full_name || "Anonymous Entity"}</span>
                        <span className="text-[10px] text-gray-400 font-bold  tracking-widest mt-1">ID: {row.id.slice(0, 8)}</span>
                    </div>
                </div>
            )
        },
        { 
            key: "email", 
            label: "Digital contact",
            render: (row: any) => (
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500  tracking-widest">
                        <Mail className="w-3 h-3 text-slate-300" /> {row.email}
                    </div>
                    {row.phone && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500  tracking-widest">
                            <Phone className="w-3 h-3 text-slate-300" /> {row.phone}
                        </div>
                    )}
                </div>
            )
        },
        { 
            key: "created_at", 
            label: "Date",
            render: (row: any) => (
                <div className="flex items-center gap-2 text-[11px] font-bold text-gray-400  tracking-widest ">
                    <Calendar className="w-3 h-3" />
                    {new Date(row.created_at).toLocaleDateString("en-IN")}
                </div>
            )
        },
        { 
            key: "status", 
            label: "Validation",
            render: (row: any) => <StatusBadge status={row.status} />
        }
    ];

    const filteredCustomers = customers.filter(c => 
        (c.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ERPListView
            title="User Directory"
            data={filteredCustomers}
            columns={customerColumns}
            onNew={() => {}}
            onRefresh={load}
            isLoading={loading}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            primaryKey="id"
            headerActions={
                <div className="flex items-center gap-2">
                    <button className="h-8 px-4 rounded-xl font-bold text-[10px]  tracking-widest bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 transition-all">
                        Registry Export
                    </button>
                </div>
            }
        />
    );
}
