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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-[#14532d]">Storefront {t("Customers")}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage users who registered on your website.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={load}>
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-xl gap-2">
                        <Download className="w-4 h-4" /> Export
                    </Button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-2xl">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Total {t("Customers")}</p>
                        <p className="text-2xl font-black">{customers.length}</p>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 flex items-center justify-center rounded-2xl">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Active Users</p>
                        <p className="text-2xl font-black">{customers.filter(c => c.status === 'active').length}</p>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-3xl border border-border/50 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 flex items-center justify-center rounded-2xl">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">New Today</p>
                        <p className="text-2xl font-black">
                            {customers.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter & Search */}
            <div className="bg-card p-4 rounded-2xl border border-border/50 shadow-sm flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={`Search ${t("Customers").toLowerCase()} by name, email or phone...`}
                        className="w-full h-11 pl-10 pr-4 rounded-xl border-none bg-secondary/40 text-sm focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <Button variant="outline" className="rounded-xl gap-2 bg-secondary/40 border-none">
                    <Filter className="w-4 h-4" /> Filters
                </Button>
            </div>

            {/* Table */}
            <div className="bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-secondary/30 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            <tr>
                                <th className="px-6 py-4 text-left">{t("Customer")}</th>
                                <th className="px-6 py-4 text-left">Contact</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-left">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {loading ? (
                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground animate-pulse">Loading {t("Customer").toLowerCase()} directory...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="py-20 text-center text-muted-foreground">No {t("Customers").toLowerCase()} found.</td></tr>
                            ) : (
                                filtered.map(c => (
                                    <tr key={c.id} className="hover:bg-secondary/10 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold">
                                                    {c.full_name?.charAt(0) || <User className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800">{c.full_name || `Unnamed ${t("Customer")}`}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">ID: {c.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Mail className="w-3 h-3 text-primary/40" /> {c.email}
                                                </div>
                                                {c.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Phone className="w-3 h-3 text-primary/40" /> {c.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <Badge className={c.status === 'active' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-red-100 text-red-700 hover:bg-red-100'}>
                                                {c.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary"
                                                    onClick={() => toggleStatus(c)}
                                                    title={c.status === 'active' ? `Block ${t("Customer")}` : `Activate ${t("Customer")}`}
                                                >
                                                    {c.status === 'active' ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                                                </Button>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
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
