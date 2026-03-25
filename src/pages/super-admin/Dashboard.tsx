import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import {
    Users, Building2, LayoutDashboard, Search,
    MoreVertical, ExternalLink, ShieldCheck,
    TrendingUp, ArrowUpRight, Globe, Settings
} from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SuperAdminDashboard() {
    const { setCompany } = useTenant();
    const navigate = useNavigate();
    const [companiesList, setCompaniesList] = useState<any[]>([]);
    const [stats, setStats] = useState({ companies: 0, users: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchGlobalData = async () => {
            setLoading(true);
            try {
                // Fetch companies with their selected system plans
                const { data: compData, error: compErr } = await supabase
                    .from("companies")
                    .select(`
                        *,
                        system_plans (
                            name,
                            price_monthly
                        )
                    `)
                    .order("created_at", { ascending: false });

                if (compErr) throw compErr;

                // Fetch total user count
                const { count: userCount, error: userErr } = await supabase
                    .from("users")
                    .select("id", { count: "exact" });

                if (userErr) throw userErr;

                setCompaniesList(compData || []);

                // Calculate MRR based on active company plan prices
                const totalRevenue = (compData || []).reduce((acc, company: any) => {
                    return acc + (company.system_plans?.price_monthly || 0);
                }, 0);

                setStats({
                    companies: compData?.length || 0,
                    users: userCount || 0,
                    revenue: totalRevenue
                });
            } catch (err) {
                console.error("Super Admin Data Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchGlobalData();
    }, []);

    const filteredCompanies = companiesList.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subdomain.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Control Center</h1>
                    </div>
                    <p className="text-xs font-semibold text-muted-foreground opacity-70 ml-1">Universal {PLATFORM_CONFIG.name} Administration</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search Ecosystem..."
                            className="h-14 pl-12 pr-6 w-full md:w-[300px] rounded-2xl bg-card border border-border focus:ring-2 focus:ring-primary/20 focus:outline-none font-bold text-sm"
                        />
                    </div>
                    <Button variant="outline" className="h-14 w-14 rounded-2xl p-0">
                        <Settings className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Active Nodes", value: stats.companies, Icon: Building2, color: "text-blue-500", bg: "bg-blue-500/10" },
                    { label: "Total Accounts", value: stats.users, Icon: Users, color: "text-indigo-500", bg: "bg-indigo-500/10" },
                    { label: "Platform MRR", value: `$ ${stats.revenue.toLocaleString()}`, Icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10" }
                ].map((s, i) => (
                    <div key={i} className="bg-card rounded-[2.5rem] border border-border p-8 space-y-4 hover:shadow-xl hover:shadow-primary/5 transition-all group">
                        <div className="flex items-center justify-between">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", s.bg)}>
                                <s.Icon className={cn("w-7 h-7", s.color)} />
                            </div>
                            <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-bold flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" /> 100%
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground mb-1">{s.label}</p>
                            <p className="text-3xl font-bold tracking-tight">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Companies Table */}
            <div className="bg-card rounded-[2.5rem] border border-border overflow-hidden shadow-2xl shadow-black/5">
                <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/5">
                    <h2 className="text-xl font-bold tracking-tight">Enterprise Registry</h2>
                    <div className="flex gap-3">
                        <Button variant="outline" className="rounded-xl font-bold gap-2" onClick={() => navigate('/super-admin/modules')}>
                            <LayoutDashboard className="w-4 h-4" /> Manage Modules
                        </Button>
                        <Button className="rounded-xl font-bold gap-2">
                            <Settings className="w-4 h-4" /> System Logs
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/40">
                                <th className="px-8 py-5 text-xs font-bold text-muted-foreground">Ecosystem</th>
                                <th className="px-8 py-5 text-xs font-bold text-muted-foreground">Live Endpoint</th>
                                <th className="px-8 py-5 text-xs font-bold text-muted-foreground">Engine Pack</th>
                                <th className="px-8 py-5 text-xs font-bold text-muted-foreground">Deployment</th>
                                <th className="px-8 py-5 text-xs font-bold text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                            {filteredCompanies.map((company) => {
                                const plan = company.system_plans;
                                return (
                                    <tr key={company.id} className="hover:bg-secondary/5 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-primary">
                                                    {company.name[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{company.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium  opacity-60">REF: {company.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 text-indigo-500 hover:text-indigo-600 transition-colors cursor-pointer">
                                                <Globe className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold tracking-tight underline decoration-indigo-500/30 underline-offset-4">
                                                    {company.subdomain}.{PLATFORM_CONFIG.name.toLowerCase().replace(/\s+/g, '')}.tech
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={cn(
                                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-bold border",
                                                company.plan === 'enterprise' || company.plan === 'Enterprise' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                                                    company.plan === 'professional' || company.plan === 'Professional' ? "bg-blue-500/10 text-blue-600 border-blue-500/20" : "bg-muted text-muted-foreground border-border"
                                            )}>
                                                {plan?.name || company.plan || 'Starter'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-xs font-bold text-muted-foreground">
                                                {new Date(company.created_at).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="rounded-xl font-bold h-10 gap-2 border-slate-200"
                                                    onClick={() => {
                                                        setCompany(company.id);
                                                        navigate("/ecommerce");
                                                    }}
                                                >
                                                    Access Node <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
