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
    const [loading, setLoading] = useState(false);
    const [stats] = useState({
        totalItems: 4820,
        totalContacts: 1450,
        totalCategories: 24,
        totalBrands: 18,
        totalTaxRules: 12
    });

    const fmt = (n: number) => n.toLocaleString();

    return (
        <div className="p-10 space-y-12 animate-in fade-in duration-500 pb-20 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">Master Data Hub</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                        <p className="text-[13px] font-bold tracking-[0.2em] text-slate-500 uppercase leading-none">Centralized record management • {activeCompany?.name}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1000); }}
                        className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 transition-all hover:shadow-lg"
                    >
                        <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                    </button>
                    <Button 
                        onClick={() => navigate('/apps/masters/items')}
                        className="h-12 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs tracking-[0.2em] uppercase transition-all shadow-xl shadow-slate-900/20 gap-3 border-0"
                    >
                        <Plus className="w-4 h-4" /> Global Create
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Products", value: fmt(stats.totalItems), sub: "Registered Catalog", icon: Package, color: "bg-blue-600", path: "/apps/masters/items" },
                    { label: "Entities", value: fmt(stats.totalContacts), sub: "Contact Matrix", icon: UsersIcon, color: "bg-slate-900", path: "/apps/masters/contacts" },
                    { label: "Tax Compliance", value: stats.totalTaxRules, sub: "Active Slabs", icon: Percent, color: "bg-blue-600", path: "/apps/masters/tax" },
                    { label: "Classifications", value: stats.totalCategories, sub: "Domain Groups", icon: ListTree, color: "bg-slate-900", path: "/apps/masters/categories" },
                ].map(k => (
                    <div 
                        key={k.label} 
                        onClick={() => navigate(k.path)}
                        className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-2xl transition-all h-64 group cursor-pointer"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className={cn("w-14 h-14 rounded-3xl flex items-center justify-center text-white transition-transform group-hover:scale-110 duration-500", k.color)}>
                                <k.icon className="w-6 h-6" />
                            </div>
                            <span className="text-xs font-bold tracking-[0.2em] text-slate-400 uppercase leading-none">{k.label}</span>
                        </div>
                        <div>
                            <p className="text-5xl font-black tracking-tighter text-slate-900 mb-2 leading-none">{k.value}</p>
                            <p className="text-[12px] font-bold text-slate-500 tracking-[0.1em] uppercase mt-4 leading-none">{k.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                <div className="lg:col-span-8 bg-white rounded-[4rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-12 py-10 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 uppercase leading-none">Database Health</h2>
                        <Button variant="ghost" className="h-10 px-6 rounded-xl text-[11px] font-bold tracking-[0.2em] text-blue-600 uppercase hover:bg-blue-50 transition-all">Audit Logs</Button>
                    </div>
                    <div className="p-12 space-y-8">
                        {[
                            { name: "Product Catalog", status: "Active", nodes: 4820, time: "2m ago", color: "bg-blue-600", icon: Package, path: "/apps/masters/items" },
                            { name: "Contact Directory", status: "Verified", nodes: 245, time: "15m ago", color: "bg-slate-900", icon: UsersIcon, path: "/apps/masters/contacts" },
                            { name: "Category Mapping", status: "Syncing", nodes: 64, time: "Updating...", color: "bg-blue-600", icon: Network, path: "/apps/masters/mapping" },
                        ].map(sync => (
                            <div 
                                key={sync.name} 
                                onClick={() => navigate(sync.path)}
                                className="flex items-center justify-between p-8 rounded-[3.5rem] border border-slate-50 hover:border-blue-100 hover:bg-slate-50/30 transition-all group cursor-pointer"
                            >
                                <div className="flex items-center gap-8">
                                    <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all group-hover:rotate-6", sync.color)}>
                                        <sync.icon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase text-[14px] tracking-tight leading-none">{sync.name}</p>
                                        <div className="flex items-center gap-4 mt-3 text-[12px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                                            <span>{sync.nodes} Records</span>
                                            <span className="text-slate-200">•</span>
                                            <span className="text-blue-600">{sync.status}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[11px] font-bold text-slate-300 uppercase leading-none">{sync.time}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 bg-slate-900 rounded-[4rem] p-12 shadow-2xl relative overflow-hidden group min-h-[500px]">
                     <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Zap className="w-64 h-64 text-blue-500 -rotate-12 translate-x-24" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-[0.3em] mb-12 border-b border-white/5 pb-8">Quick Actions</h2>
                    <div className="grid grid-cols-2 gap-6 relative z-10">
                        {[
                            { label: "New Item", icon: Plus, color: "bg-blue-600", path: "/apps/masters/items" },
                            { label: "SKU Wizard", icon: Code, color: "bg-blue-600", path: "/apps/masters/sku" },
                            { label: "Category", icon: ListTree, color: "bg-blue-600", path: "/apps/masters/categories" },
                            { label: "UOM Matrix", icon: Hash, color: "bg-white/10", path: "/apps/masters/uoms" },
                            { label: "Tax Layer", icon: ShieldCheck, color: "bg-white/10", path: "/apps/masters/tax" },
                            { label: "Price Matrix", icon: DollarSign, color: "bg-white/10", path: "/apps/masters/pricing" },
                            { label: "CoA Hub", icon: LayoutGrid, color: "bg-white/10", path: "/apps/masters/coa" },
                            { label: "Fiscal Cycle", icon: Clock, color: "bg-white/10", path: "/apps/masters/fiscal-years" },
                        ].map(sh => (
                            <button 
                                key={sh.label} 
                                onClick={() => navigate(sh.path)}
                                className="flex flex-col items-center justify-center p-8 rounded-[2.5rem] bg-white/5 hover:bg-white/10 transition-all border border-white/5 gap-5 group/sh"
                            >
                                <div className={cn("w-12 h-12 rounded-[1.25rem] flex items-center justify-center text-white transition-all group-hover/sh:scale-110 group-hover/sh:shadow-2xl group-hover/sh:shadow-blue-500/20", sh.color)}>
                                    <sh.icon className="w-5 h-5" />
                                </div>
                                <span className="text-[11px] font-black tracking-[0.2em] text-slate-400 uppercase group-hover/sh:text-white transition-colors text-center leading-tight">{sh.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
