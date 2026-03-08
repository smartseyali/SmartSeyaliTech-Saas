import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Grid3X3, ArrowRight, Zap, Star, Lock } from "lucide-react";
import { useState } from "react";
import {
    PLATFORM_MODULES,
    CATEGORY_LABELS,
    ModuleCategory,
    type PlatformModule,
} from "@/config/modules";
import { useTenant } from "@/contexts/TenantContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionsContext";

const CATEGORY_ORDER: ModuleCategory[] = [
    'commerce', 'finance', 'operations', 'people', 'customer', 'analytics', 'collaboration'
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    'live': { label: 'Live', cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    'beta': { label: 'Beta', cls: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    'coming-soon': { label: 'Coming Soon', cls: 'bg-white/5 text-white/30 border-white/10' },
    'planned': { label: 'Planned', cls: 'bg-white/5 text-white/20 border-white/10' },
};

function ModuleCard({ mod, isSubscribed, onOpen }: { mod: PlatformModule; isSubscribed: boolean, onOpen: (m: PlatformModule) => void }) {
    const isAvailable = mod.status === 'live' || mod.status === 'beta';
    const badge = STATUS_BADGE[mod.status];
    const canAccess = isSubscribed && isAvailable;
    const navigate = useNavigate();

    return (
        <motion.div
            whileHover={isAvailable ? { y: -4, scale: 1.01 } : {}}
            whileTap={isAvailable ? { scale: 0.98 } : {}}
            onClick={() => isAvailable && (canAccess ? onOpen(mod) : navigate('/apps/ecommerce/billing'))}
            className={`
                relative flex flex-col gap-5 p-6 rounded-2xl border transition-all duration-300 group
                ${canAccess
                    ? 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl cursor-pointer'
                    : isAvailable ? 'border-amber-100 bg-amber-50/30 hover:shadow-lg hover:border-amber-300 cursor-pointer' : 'border-slate-100 bg-white/50 grayscale-[0.5]'
                }
            `}
        >
            {/* Status badge */}
            <div className="absolute top-4 right-4 flex gap-2">
                {!isSubscribed && isAvailable && (
                    <div className="px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest bg-amber-500 text-white shadow-sm">
                        Get App
                    </div>
                )}
                <div className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border ${badge.cls.replace('text-emerald-400', 'text-emerald-600').replace('text-blue-400', 'text-blue-600').replace('text-white/30', 'text-slate-400').replace('text-white/20', 'text-slate-300').replace('rounded-full', 'rounded-md')}`}>
                    {badge.label}
                </div>
            </div>

            {/* Icon */}
            <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center text-2xl
                bg-gradient-to-br ${mod.colorFrom} ${mod.colorTo}
                shadow-lg transition-transform duration-300 ${canAccess ? 'group-hover:scale-105' : ''}
            `}>
                {isAvailable ? mod.icon : <Lock className="w-5 h-5 text-white/40" />}
            </div>

            {/* Info */}
            <div className="flex-1 mt-1">
                <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1 group-hover:text-blue-600 transition-colors uppercase">{mod.name}</h3>
                <p className="text-[11px] font-medium text-slate-500 leading-relaxed line-clamp-2">{mod.tagline}</p>
            </div>

            {/* Key features preview (live only) */}
            {isAvailable && (
                <div className="flex flex-col gap-2 mt-2">
                    {mod.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-100" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{f}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Open button */}
            {isAvailable && (
                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 group-hover:text-blue-600 transition-colors">
                        {isSubscribed ? 'Open App' : 'Learn More'}
                    </span>
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isSubscribed ? 'bg-slate-50 group-hover:bg-blue-600 group-hover:text-white' : 'bg-slate-100 group-hover:bg-slate-900 group-hover:text-white'
                        }`}>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                </div>
            )}
        </motion.div>
    );
}

export default function AppLauncher() {
    const navigate = useNavigate();
    const { activeCompany } = useTenant();
    const { user } = useAuth();
    const { hasModule, isSuperAdmin } = usePermissions();
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<ModuleCategory | 'all'>('all');

    const filtered = PLATFORM_MODULES.filter(m => {
        // Super Admin sees everything in launcher
        // Merchants see their subscribed modules OR core modules
        // const isPermitted = isSuperAdmin || m.isCore || hasModule(m.name) || hasModule(m.id); // Removed permission filtering from here

        const matchesSearch = !search ||
            m.name.toLowerCase().includes(search.toLowerCase()) ||
            m.tagline.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || m.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const subscribedApps = filtered.filter(m => isSuperAdmin || m.isCore || hasModule(m.name) || hasModule(m.id));
    const availableApps = filtered.filter(m => !(isSuperAdmin || m.isCore || hasModule(m.name) || hasModule(m.id)));

    const renderGrid = (modules: typeof filtered) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
            {modules.map(mod => (
                <ModuleCard
                    key={mod.id}
                    mod={mod}
                    isSubscribed={isSuperAdmin || mod.isCore || hasModule(mod.name) || hasModule(mod.id)}
                    onOpen={m => navigate(m.dashboardRoute)}
                />
            ))}
        </div>
    );

    const liveCount = PLATFORM_MODULES.filter(m => m.status === 'live' || m.status === 'beta').length;

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden font-sans">
            {/* Background pattern */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.4] bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px]" />

            {/* Background blobs */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-100 rounded-full blur-[200px] opacity-40 animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[800px] h-[800px] bg-indigo-100 rounded-full blur-[200px] opacity-30" />
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-8 py-16">

                {/* ── Header ──────────────────────────────────────── */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 mb-16">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-lg shadow-lg shadow-blue-500/20">🚀</div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-600">Smartseyali Platform</span>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 tracking-tighter leading-none mt-2">
                            App Launcher
                        </h1>
                        <p className="text-slate-500 font-medium text-base max-w-xl">
                            Welcome back, <span className="text-indigo-600 font-bold">{activeCompany?.name || user?.email?.split('@')[0]}</span>
                            {' '}· Access your {liveCount} business apps
                        </p>
                    </div>

                    {/* Stats strip */}
                    <div className="flex items-center gap-3 w-full lg:w-auto">
                        {[
                            { label: 'Available Now', count: PLATFORM_MODULES.filter(m => m.status === 'live').length, color: 'text-emerald-600' },
                            { label: 'Beta Release', count: PLATFORM_MODULES.filter(m => m.status === 'beta').length, color: 'text-blue-600' },
                            { label: 'Upcoming', count: PLATFORM_MODULES.filter(m => m.status === 'coming-soon').length + PLATFORM_MODULES.filter(m => m.status === 'planned').length, color: 'text-slate-400' },
                        ].map(s => (
                            <div key={s.label} className="flex-1 lg:flex-none px-6 py-5 rounded-2xl bg-white border border-slate-100 shadow-sm text-center">
                                <div className={`text-3xl font-bold ${s.color} tracking-tight`}>{s.count}</div>
                                <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400 mt-1">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Search + Category Filter ─────────────────────── */}
                <div className="flex flex-col xl:flex-row gap-6 mb-16">
                    {/* Search */}
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search apps..."
                            className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-6 text-slate-900 placeholder:text-slate-400 font-semibold focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all shadow-sm"
                        />
                    </div>

                    {/* Category tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
                        {(['all', ...CATEGORY_ORDER] as const).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`
                                    shrink-0 h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-[0.1em] transition-all
                                    ${selectedCategory === cat
                                        ? 'bg-slate-900 text-white shadow-lg translate-y-[-1px]'
                                        : 'bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-slate-100 shadow-sm'
                                    }
                                `}
                            >
                                {cat === 'all' ? (
                                    <span className="flex items-center gap-2"><Grid3X3 className="w-3.5 h-3.5" /> All</span>
                                ) : CATEGORY_LABELS[cat].split(' ')[0]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Subscribed Apps ─────────────────────────────── */}
                <div className="space-y-10">
                    <div>
                        <div className="flex items-center gap-6 mb-8">
                            <h2 className="text-[14px] font-black uppercase tracking-[0.3em] text-slate-800 leading-none">Your Subscriptions</h2>
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="px-4 py-1.5 rounded-full bg-blue-50 text-[10px] font-bold text-blue-600 uppercase tracking-widest">{subscribedApps.length} Live</span>
                        </div>
                        {subscribedApps.length > 0 ? renderGrid(subscribedApps) : (
                            <div className="p-10 border border-slate-200 border-dashed rounded-3xl text-center bg-white/50">
                                <p className="text-sm font-semibold text-slate-500">No applications match your search criteria.</p>
                            </div>
                        )}
                    </div>

                    {/* ── Available Apps ─────────────────────────────── */}
                    {availableApps.length > 0 && (
                        <div className="pt-10">
                            <div className="flex items-center gap-6 mb-8">
                                <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-slate-400 leading-none">Available for Upgrade</h2>
                                <div className="flex-1 h-px bg-slate-100" />
                            </div>
                            {renderGrid(availableApps)}
                        </div>
                    )}
                </div>

                {/* ── Bottom CTA ───────────────────────────────────── */}
                <div className="mt-24 p-10 lg:p-14 rounded-3xl bg-slate-900 text-white flex flex-col xl:flex-row items-center justify-between gap-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10 text-center xl:text-left">
                        <div className="flex items-center justify-center xl:justify-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-yellow-400 fill-current" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400">Growing Platform</span>
                        </div>
                        <h3 className="text-4xl lg:text-5xl font-bold text-white tracking-tighter leading-tight xl:leading-none">
                            12+ Professional <br /><span className="text-white/40 group-hover:text-blue-400 transition-colors duration-700">Business Apps</span>
                        </h3>
                        <p className="text-white/40 font-medium mt-4 text-lg max-w-xl">
                            Our architecture team is actively developing Accounting, Projects, HRMS, and more.
                        </p>
                    </div>
                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
                        <button className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-[10px] tracking-wider shadow-xl transition-all active:scale-95 flex items-center gap-3">
                            Subscribe to Roadmap <ArrowRight className="w-4 h-4" />
                        </button>
                        <div className="px-6 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-[10px] font-bold text-white uppercase tracking-wider leading-none">Enterprise suite early access</span>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-20 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-300">© 2026 Smartseyali Systems Inc · Business Platform v4.0.1</p>
                </div>

            </div>
        </div>
    );
}
