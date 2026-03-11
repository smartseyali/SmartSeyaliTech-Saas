import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Grid3X3, Lock, Settings, LogOut, LayoutGrid, ChevronDown, PlusCircle } from "lucide-react";
import { useState, useMemo } from "react";
import {
    PLATFORM_MODULES,
    CATEGORY_LABELS,
    ModuleCategory,
    type PlatformModule,
} from "@/config/modules";
import PLATFORM_CONFIG from "@/config/platform";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionsContext";
import { cn } from "@/lib/utils";

const CATEGORY_ORDER: ModuleCategory[] = [
    'commerce', 'finance', 'operations', 'people', 'customer', 'analytics', 'collaboration'
];

function ModuleCard({ mod, isSubscribed, onOpen }: { mod: PlatformModule; isSubscribed: boolean, onOpen: (m: PlatformModule) => void }) {
    const isAvailable = mod.status === 'live' || mod.status === 'beta';
    const canAccess = isSubscribed && isAvailable;
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={{ scale: 1.08, y: -8 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => isAvailable && (canAccess ? onOpen(mod) : navigate(`/apps/ecommerce/billing?module=${mod.id}`))}
            className={cn(
                "relative flex flex-col items-center gap-4 p-4 rounded-[2rem] transition-all duration-500 group cursor-pointer",
                !isAvailable && "opacity-30 grayscale pointer-events-none"
            )}
        >
            {/* Odoo-style App Icon */}
            <div className={cn(
                "relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center text-4xl shadow-lg transition-all duration-500",
                "bg-gradient-to-br", mod.colorFrom, mod.colorTo,
                "group-hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] group-hover:ring-4 group-hover:ring-emerald-500/10",
                !canAccess && "ring-1 ring-gray-200 shadow-none border border-gray-100"
            )}>
                <span className="group-hover:scale-110 transition-transform duration-500">{mod.icon}</span>
                
                {!canAccess && isAvailable && (
                    <div className="absolute -top-1 -right-1 w-7 h-7 bg-amber-500 rounded-full flex items-center justify-center shadow-xl border-2 border-white">
                        <Lock className="w-3.5 h-3.5 text-white" />
                    </div>
                )}
                
                {/* Micro-sparkle on hover */}
                <div className="absolute inset-0 rounded-3xl bg-white/0 group-hover:bg-white/10 transition-colors duration-500" />
            </div>

            {/* Technical labeling */}
            <div className="text-center">
                <h3 className="text-[11px] font-black text-gray-800 uppercase tracking-[0.2em] group-hover:text-emerald-700 transition-colors">
                    {mod.name}
                </h3>
                {mod.status === 'beta' && (
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600/60 mt-1 block">
                        Module Pre-Release
                    </span>
                )}
            </div>
        </motion.div>
    );
}

export default function AppLauncher() {
    const navigate = useNavigate();
    const { activeCompany } = useTenant();
    const { signOut } = useAuth();
    const { hasModule, isSuperAdmin } = usePermissions();
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | 'all'>('all');
    const [showAllModules, setShowAllModules] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { installedModules, marketplaceModules } = useMemo(() => {
        const filtered = PLATFORM_MODULES.filter(m => {
            const matchesSearch = !search ||
                m.name.toLowerCase().includes(search.toLowerCase()) ||
                m.tagline?.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        const installed = filtered.filter(m => isSuperAdmin || m.isCore || hasModule(m.name) || hasModule(m.id));
        const marketplace = filtered.filter(m => !(isSuperAdmin || m.isCore || hasModule(m.name) || hasModule(m.id)));

        return { installedModules: installed, marketplaceModules: marketplace };
    }, [search, selectedCategory, isSuperAdmin, hasModule]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 relative overflow-x-hidden font-sans selection:bg-emerald-100">
            {/* Odoo-style background clean structure */}
            <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]" />

            {/* Full-screen top navigation */}
            <nav className="relative z-50 flex items-center justify-between px-10 py-5 bg-white border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-11 h-11 rounded-2xl bg-gray-900 flex items-center justify-center text-lg shadow-2xl transition-all group-hover:scale-105 group-hover:bg-emerald-600">
                            <LayoutGrid className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-emerald-600 transition-colors leading-none mb-1">Infrastructure</span>
                            <span className="text-xl font-bold text-gray-900 tracking-tighter">{PLATFORM_CONFIG.name}</span>
                        </div>
                    </div>
                </div>

                {/* Centralized Technical Search */}
                <div className="hidden lg:flex relative flex-1 max-w-2xl mx-20">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search workspace nodes, apps, and registries..."
                        className="w-full h-12 bg-gray-50 border border-gray-100 rounded-2xl pl-14 pr-6 text-sm font-bold text-gray-900 placeholder:text-gray-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-600/20 transition-all uppercase tracking-widest text-[10px]"
                    />
                </div>

                <div className="flex items-center gap-8">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">Current Node</span>
                        <span className="text-[11px] font-black text-gray-900 uppercase tracking-tighter italic">{activeCompany?.name || 'Personal Cloud'}</span>
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100">
                        <button className="p-3 text-gray-400 hover:text-emerald-600 hover:bg-white rounded-xl transition-all" title="System Settings">
                            <Settings className="w-4 h-4" />
                        </button>
                        <button onClick={signOut} className="p-3 text-gray-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all" title="Terminate Session">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="relative z-10 max-w-[1400px] mx-auto px-10 py-16">
                {/* Categorization Matrix */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-10 mb-20 border-b border-gray-100 pb-12">
                    <div className="relative group">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-4 px-8 py-4 bg-white border border-gray-100 rounded-[1.5rem] text-[11px] font-black text-gray-800 hover:border-emerald-200 transition-all shadow-md group uppercase tracking-[0.2em]"
                        >
                            <Grid3X3 className="w-4 h-4 text-emerald-600" />
                            <span>
                                {selectedCategory === 'all' ? "Module Registry" : CATEGORY_LABELS[selectedCategory]}
                            </span>
                            <ChevronDown className={cn("w-4 h-4 transition-transform duration-500", isFilterOpen && "rotate-180")} />
                        </button>

                        <AnimatePresence>
                            {isFilterOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                                        className="absolute top-full left-0 mt-4 w-72 bg-white border border-gray-100 rounded-[2rem] shadow-2xl z-50 py-4 overflow-hidden"
                                    >
                                        {(['all', ...CATEGORY_ORDER] as const).map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => {
                                                    setSelectedCategory(cat);
                                                    setIsFilterOpen(false);
                                                }}
                                                className={cn(
                                                    "w-full flex items-center px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                                    selectedCategory === cat
                                                        ? "text-emerald-600 bg-emerald-50/50"
                                                        : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
                                                )}
                                            >
                                                {cat === 'all' ? "View All Modules" : CATEGORY_LABELS[cat]}
                                            </button>
                                        ))}
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 mb-2">Operational Density</span>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{installedModules.length} Active</span>
                            </div>
                            {marketplaceModules.length > 0 && (
                                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100 cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setShowAllModules(true)}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest">{marketplaceModules.length} Marketplace</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Primary Workspace Grid */}
                <div className="mb-24">
                    <div className="flex items-center gap-4 mb-12">
                        <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-400">Primary Workspace Node</h2>
                        <div className="h-[1px] flex-1 bg-gray-100" />
                    </div>
                    
                    <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-12 gap-y-16">
                        <AnimatePresence mode="popLayout">
                            {installedModules.map(mod => (
                                <ModuleCard
                                    key={mod.id}
                                    mod={mod}
                                    isSubscribed={true}
                                    onOpen={m => navigate(m.dashboardRoute)}
                                />
                            ))}
                        </AnimatePresence>
                    </motion.div>
                    
                    {installedModules.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                            <PlusCircle className="w-12 h-12 text-gray-200 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">No active nodes in this sector</p>
                        </div>
                    )}
                </div>

                {/* Marketplace - Collapsible Registry */}
                {marketplaceModules.length > 0 && (
                    <div className="pt-20 border-t border-gray-100">
                        <button 
                            onClick={() => setShowAllModules(!showAllModules)}
                            className="flex items-center justify-between w-full group mb-12 hover:bg-gray-50 p-6 rounded-[2rem] transition-all"
                        >
                            <div className="flex items-center gap-6">
                                <div className={cn("w-2 h-8 rounded-full transition-all duration-500", showAllModules ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]" : "bg-gray-200")} />
                                <h2 className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-400 group-hover:text-gray-900 transition-colors">Marketplace Library</h2>
                            </div>
                            <ChevronDown className={cn("w-6 h-6 text-gray-300 transition-transform duration-700 ease-in-out", showAllModules && "rotate-180")} />
                        </button>

                        <motion.div 
                            initial={false}
                            animate={{ height: showAllModules ? 'auto' : 0, opacity: showAllModules ? 1 : 0 }}
                            className="overflow-hidden"
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-12 gap-y-16 pb-20">
                                {marketplaceModules.map(mod => (
                                    <ModuleCard
                                        key={mod.id}
                                        mod={mod}
                                        isSubscribed={false}
                                        onOpen={m => navigate(`/apps/ecommerce/billing?module=${m.id}`)}
                                    />
                                ))}
                            </div>
                        </motion.div>

                        {!showAllModules && (
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm cursor-pointer hover:shadow-xl transition-all duration-500 group" onClick={() => setShowAllModules(true)}>
                                <div className="w-16 h-16 rounded-3xl bg-amber-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <PlusCircle className="w-8 h-8 text-amber-500" />
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover:text-gray-900 transition-colors">Expand Operational Capabilities</span>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* Technical Sub-bar (Breadcrumbs / Status) */}
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-10 py-4 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                <div className="max-w-[1400px] mx-auto flex items-center justify-between text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">
                    <div className="flex gap-10">
                        <span className="flex items-center gap-2 group cursor-help">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:animate-ping" />
                            <span className="text-gray-500">{installedModules.length} Nodes Synchronized</span>
                        </span>
                        <span className="hidden sm:flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                            <span className="text-gray-400">NATTU CORE ENGINE V4.2</span>
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-emerald-600/40">
                        SECURE END-TO-END ENCRYPTION ACTIVE
                    </div>
                </div>
            </div>
        </div>
    );
}
