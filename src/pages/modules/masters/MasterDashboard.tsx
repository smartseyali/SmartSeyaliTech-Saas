import { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Package, Users as UsersIcon, Tag, ListTree, Flag, Ruler, 
    Percent, DollarSign, Database, Plus, RefreshCw,
    TrendingUp, BarChart3, Clock, CheckCircle2,
    Binary, Layers, Briefcase, Zap, ShieldCheck,
    Network, Code, Hash, LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import db from "@/lib/db";

// Sub-modules standardized with "Clean ERP"
import Items from "./Items";
import Categories from "./Categories";
import SubcategoryMapping from "./SubcategoryMapping";
import Attributes from "./Attributes";
import Brands from "./Brands";
import UOMs from "./UOMs";
import Tax from "./Tax";
import PriceLists from "./PriceLists";
import Contacts from "./Contacts";
import SKUGenerator from "./SKUGenerator";
import Variants from "./Variants";
import Users from "./Users";
import Roles from "./Roles";
import ChartOfAccounts from "./ChartOfAccounts";
import FiscalYears from "./FiscalYears";
import PrintFormats from "./PrintFormats";
import Countries from "./Countries";
import States from "./States";
import Districts from "./Districts";
import GlobalPrintFormats from "./GlobalPrintFormats";

export default function MasterDashboard() {
    const { activeCompany } = useTenant();
    const location = useLocation();
    const pathname = location.pathname;

    const renderComponent = () => {
        // Base route: Dashboard
        if (pathname === "/apps/masters" || pathname === "/apps/masters/") return <MasterSummary />;
        
        // Product Management
        if (pathname.includes("/items")) return <Items />;
        if (pathname.includes("/categories")) return <Categories />;
        if (pathname.includes("/mapping")) return <SubcategoryMapping />;
        if (pathname.includes("/sku")) return <SKUGenerator />;
        if (pathname.includes("/variants")) return <Variants />;
        
        // Entity Hub
        if (pathname.includes("/attributes")) return <Attributes />;
        if (pathname.includes("/brands")) return <Brands />;
        if (pathname.includes("/uoms")) return <UOMs />;
        
        // Financial & Compliance
        if (pathname.includes("/tax")) return <Tax />;
        if (pathname.includes("/pricing")) return <PriceLists />;
        
        // CRM / Contacts
        if (pathname.includes("/contacts")) return <Contacts />;

        // Security & Access
        if (pathname.includes("/users")) return <Users />;
        if (pathname.includes("/roles")) return <Roles />;
        
        // Financial Governance
        if (pathname.includes("/coa")) return <ChartOfAccounts />;
        if (pathname.includes("/fiscal-years")) return <FiscalYears />;

        // Print & Templates
        if (pathname.includes("/global-print-formats")) return <GlobalPrintFormats />;
        if (pathname.includes("/print-formats")) return <PrintFormats />;

        // Global Geography (read-only for merchants, managed by super admin)
        if (pathname.includes("/countries")) return <Countries />;
        if (pathname.includes("/states")) return <States />;
        if (pathname.includes("/districts")) return <Districts />;

        return <MasterSummary />;
    };

    return (
        <div className="flex-1 bg-white min-h-screen">
            {renderComponent()}
        </div>
    );
}

function MasterSummary() {
    const { activeCompany } = useTenant();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        items: 0,
        contacts: 0,
        tax: 0,
        categories: 0
    });

    const [health, setHealth] = useState<any[]>([]);

    const fetchStats = async () => {
        if (!activeCompany) return;
        setLoading(true);
        try {
            // Live counts from database
            const [itemsRes, contactsRes, taxRes, catRes] = await Promise.all([
                db.from('master_items').select('*', { count: 'exact', head: true }).eq('company_id', activeCompany.id),
                db.from('master_contacts').select('*', { count: 'exact', head: true }).eq('company_id', activeCompany.id),
                db.from('master_taxes').select('*', { count: 'exact', head: true }).eq('company_id', activeCompany.id),
                db.from('master_categories').select('*', { count: 'exact', head: true }).eq('company_id', activeCompany.id)
            ]);

            const newStats = {
                items: itemsRes.count || 0,
                contacts: contactsRes.count || 0,
                tax: taxRes.count || 0,
                categories: catRes.count || 0
            };
            setStats(newStats);

            setHealth([
                { name: "Product Catalog", status: "Active", nodes: newStats.items, time: "Live", color: "bg-blue-600", icon: Package, path: "/apps/masters/items" },
                { name: "Contact Directory", status: "Verified", nodes: newStats.contacts, time: "Live", color: "bg-slate-900", icon: UsersIcon, path: "/apps/masters/contacts" },
                { name: "Category Mapping", status: "Syncing", nodes: newStats.categories, time: "Live", color: "bg-blue-600", icon: Network, path: "/apps/masters/mapping" },
            ]);
        } catch (err) {
            console.error("Master stats fetch failed:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [activeCompany]);

    const fmt = (n: number) => n.toLocaleString();

    return (
        <div className="min-h-screen bg-slate-50/20 font-sans p-4 lg:p-6 space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-blue-600 pl-4 uppercase">Registry Intelligence</h1>
                    <div className="flex items-center gap-2 pl-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none">Centralized Master Data Hub • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={fetchStats} className="h-8 w-8 text-slate-400 hover:text-blue-600 border border-slate-200 hover:border-blue-200 bg-white">
                        <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
                    </Button>
                    <Button size="sm" onClick={() => navigate('/apps/masters/items')} className="h-8 px-4 bg-slate-900 hover:bg-black text-white text-[10px] font-black shadow-lg shadow-slate-900/10 uppercase tracking-widest rounded-lg">
                        <Plus className="w-3.5 h-3.5 mr-2" /> Add Record
                    </Button>
                </div>
            </div>

            {/* KPI Cards - Navigation Hub */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Product Items", value: fmt(stats.items), sub: "All time assets", icon: Package, color: "text-blue-600", bg: "bg-blue-50", path: "/apps/masters/items" },
                    { label: "Contact Nodes", value: fmt(stats.contacts), sub: "Customers & Vendors", icon: UsersIcon, color: "text-slate-600", bg: "bg-slate-100", path: "/apps/masters/contacts" },
                    { label: "Tax Standards", value: stats.tax, sub: "GST Policy Hub", icon: Percent, color: "text-emerald-600", bg: "bg-emerald-50", path: "/apps/masters/tax" },
                    { label: "Categorization", value: stats.categories, sub: "Hierarchy Mapping", icon: ListTree, color: "text-indigo-600", bg: "bg-indigo-50", path: "/apps/masters/categories" },
                ].map(k => (
                    <div 
                        key={k.label} 
                        onClick={() => navigate(k.path)}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={cn("p-2 rounded-lg", k.bg, k.color)}>
                                <k.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{k.label}</span>
                        </div>
                        <div>
                            <p className="text-xl font-black text-slate-900 tracking-tight leading-none">{loading ? "..." : k.value}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 leading-none">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Database Health List */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-3.5 bg-slate-400 rounded-full" />
                            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Database Health</h2>
                        </div>
                        <Button variant="ghost" size="sm" className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:bg-blue-50">View System Logs</Button>
                    </div>
                    <div className="p-4 space-y-3">
                        {health.map(sync => (
                            <div 
                                key={sync.name} 
                                onClick={() => navigate(sync.path)}
                                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-slate-50/50 transition-all group cursor-pointer shadow-sm"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center font-black text-[10px] shadow-sm transition-all", sync.color === 'bg-blue-600' ? "bg-blue-600 text-white" : "bg-slate-900 text-white")}>
                                        <sync.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-900 uppercase leading-none mb-1 group-hover:text-blue-600">{sync.name}</p>
                                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                            <span>{loading ? "..." : sync.nodes} Records</span>
                                            <span>•</span>
                                            <span className="text-emerald-500">{sync.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{sync.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dark Quick Actions Area */}
                <div className="bg-slate-900 rounded-xl p-5 shadow-xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <h3 className="text-[9px] font-black tracking-widest text-blue-400 mb-5 uppercase leading-none">Quick Registry Access</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: "New Item", icon: Plus, color: "bg-blue-600", path: "/apps/masters/items" },
                                { label: "SKU Tool", icon: Code, color: "bg-blue-600", path: "/apps/masters/sku" },
                                { label: "Category", icon: ListTree, color: "bg-blue-600", path: "/apps/masters/categories" },
                                { label: "UOM Hub", icon: Hash, color: "bg-slate-800", path: "/apps/masters/uoms" },
                                { label: "Tax Ops", icon: ShieldCheck, color: "bg-slate-800", path: "/apps/masters/tax" },
                                { label: "Pricing", icon: DollarSign, color: "bg-slate-800", path: "/apps/masters/pricing" },
                                { label: "COA Grid", icon: LayoutGrid, color: "bg-slate-800", path: "/apps/masters/coa" },
                                { label: "Fiscal", icon: Clock, color: "bg-slate-800", path: "/apps/masters/fiscal-years" },
                            ].map(sh => (
                                <button 
                                    key={sh.label} 
                                    onClick={() => navigate(sh.path)}
                                    className="flex flex-col items-center justify-center p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-white/5 transition-all group/sh gap-2"
                                >
                                    <div className={cn("p-1.5 rounded-md transition-all group-hover/sh:scale-110", sh.color)}>
                                        <sh.icon className="w-3.5 h-3.5 text-white" />
                                    </div>
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover/sh:text-white text-center leading-none">{sh.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
