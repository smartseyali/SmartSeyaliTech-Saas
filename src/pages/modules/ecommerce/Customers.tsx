import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useDictionary } from "@/hooks/useDictionary";
import { useToast } from "@/hooks/use-toast";
import {
    Search, Filter, Plus, User, Mail, Phone, Calendar,
    CheckCircle2, XCircle, MoreVertical, ExternalLink,
    RefreshCw, Download, ShoppingBag, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Customers() {
    const { activeCompany } = useTenant();
    const { t } = useDictionary();
    const { toast } = useToast();
    const [customers, setCustomers] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (activeCompany) load();
    }, [activeCompany]);

    useEffect(() => {
        applyFilter();
    }, [customers, search]);

    const load = async () => {
        if (!activeCompany) return;
        setLoading(true);
        try {
            // Fetch from ecom_customers table
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
                description: `Make sure the ecom_customers table exists in your database.`,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        let f = customers;
        if (search) {
            const s = search.toLowerCase();
            f = f.filter(c =>
                c.full_name?.toLowerCase().includes(s) ||
                c.email?.toLowerCase().includes(s) ||
                c.phone?.includes(s)
            );
        }
        setFiltered(f);
    };

    const toggleStatus = async (customer: any) => {
        const next = customer.status === 'active' ? 'blocked' : 'active';
        try {
            const { error } = await supabase
                .from("ecom_customers")
                .update({ status: next })
                .eq("id", customer.id);

            if (error) throw error;
            toast({ title: `${t("Customer")} ${next === 'active' ? 'Activated' : 'Blocked'}` });
            load();
        } catch (err: any) {
            toast({ title: "Operation failed", variant: "destructive" });
        }
    };

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <User className="w-6 h-6 text-blue-600" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Customer Relations</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Directory</h1>
                    <p className="text-sm font-medium text-slate-500">Manage customers who registered on your website</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-11 px-4 rounded-lg bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2" onClick={load}>
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
                    </Button>
                    <Button variant="outline" className="h-11 px-6 rounded-lg bg-white border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all gap-2">
                        <Download className="w-4 h-4" /> Export
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: `Total ${t("Customers")}`, value: customers.length, icon: User, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Active Users", value: customers.filter(c => c.status === 'active').length, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
                    { label: "New Today", value: customers.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length, icon: ShoppingBag, color: "text-amber-600", bg: "bg-amber-50" },
                ].map(s => (
                    <div key={s.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
                        <div className={cn("w-12 h-12 flex items-center justify-center rounded-xl", s.bg, s.color)}>
                            <s.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1.5">{s.label}</p>
                            <p className="text-2xl font-bold tracking-tight text-slate-900">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter & Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={`Search ${t("Customers").toLowerCase()} by name, email or phone...`}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                />
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100">
                                <th className="px-6 py-4 text-left">{t("Customer")}</th>
                                <th className="px-6 py-4 text-left">Contact Info</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Member Since</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20">
                                    <div className="flex flex-col items-center justify-center gap-4">
                                        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin opacity-40" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Loading directory...</p>
                                    </div>
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-bold">No {t("Customers").toLowerCase()} found.</td></tr>
                            ) : (
                                filtered.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                                                    {c.full_name?.charAt(0) || <User className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{c.full_name || `Unnamed ${t("Customer")}`}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: {c.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                    <Mail className="w-3.5 h-3.5 text-slate-300" /> {c.email}
                                                </div>
                                                {c.phone && (
                                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                                        <Phone className="w-3.5 h-3.5 text-slate-300" /> {c.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className={cn(
                                                "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border",
                                                c.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                            )}>
                                                {c.status}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 italic">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {new Date(c.created_at).toLocaleDateString("en-IN")}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 border border-slate-100"
                                                    onClick={() => toggleStatus(c)}
                                                    title={c.status === 'active' ? `Block ${t("Customer")}` : `Activate ${t("Customer")}`}
                                                >
                                                    {c.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                </button>
                                                <button className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
