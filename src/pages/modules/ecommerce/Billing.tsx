import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import {
    CreditCard, CheckCircle2, AlertCircle,
    ArrowRight, Star, Crown, Zap, Loader2,
    Calendar, History, ShieldCheck,
    LayoutGrid, Settings2, Sparkles, Building2,
    X, Check, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLATFORM_MODULES, type PlatformModule } from "@/config/modules";
import { usePermissions } from "@/contexts/PermissionsContext";

export default function Billing() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const navigate = useNavigate();
    const { refreshPermissions, hasModule } = usePermissions();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);
    const [requestedModule, setRequestedModule] = useState<PlatformModule | null>(null);
    const [systemModules, setSystemModules] = useState<any[]>([]);

    useEffect(() => {
        const fetchBillingData = async () => {
            if (!activeCompany?.id) return;
            setLoading(true);
            try {
                // Fetch System Modules mapping (slug -> ID)
                const { data: sModules } = await supabase.from("system_modules").select("*");
                if (sModules) setSystemModules(sModules);

                // Parse module upgrade request from URL
                const params = new URLSearchParams(window.location.search);
                const upgradeModuleSlug = params.get('module');

                if (upgradeModuleSlug) {
                    const mod = PLATFORM_MODULES.find(m => m.id === upgradeModuleSlug);
                    if (mod) setRequestedModule(mod);
                }

                const [subRes, plansRes] = await Promise.all([
                    supabase.from("subscriptions").select("*, subscription_plans(*)").eq("company_id", activeCompany.id).maybeSingle(),
                    supabase.from("subscription_plans").select("*").order("price_monthly", { ascending: true })
                ]);

                setSubscription(subRes.data);
                setPlans(plansRes.data || []);
            } catch (err) {
                console.error("Billing Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBillingData();
    }, [activeCompany?.id]);

    const handleSwitchPlan = async (targetId: string, isModuleAdd = false) => {
        if (!activeCompany?.id || updating) return;
        setUpdating(true);
        try {
            if (isModuleAdd) {
                // targetId here is the SLUG (e.g. 'pos')
                // We need the UUID from systemModules
                const sysMod = systemModules.find(m => m.slug === targetId || m.name.toLowerCase() === targetId.toLowerCase());
                if (!sysMod) throw new Error(`Module '${targetId}' not found in system registry.`);

                const moduleId = sysMod.id; // Correct UUID

                // User is subscribing to a specific module
                const { error: moduleError } = await supabase
                    .from("company_modules")
                    .insert({
                        company_id: activeCompany.id,
                        module_id: moduleId,
                        is_active: true
                    });

                if (moduleError && moduleError.code !== '23505') throw moduleError;

                // Ensure user mapping exists
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    try {
                        await supabase.from("user_modules").insert({
                            company_id: activeCompany.id,
                            user_id: user.id,
                            module_id: moduleId,
                            is_active: true
                        });
                    } catch (e) { /* Quietly handle duplicates */ }
                }

                toast({ title: "Module Activated", description: `You have successfully subscribed to ${requestedModule?.name}.` });
                refreshPermissions();
                setTimeout(() => navigate("/apps"), 1500);
            } else {
                // Standard Plan Upgrade (targetId is the plan UUID/ID)
                const { error } = await supabase
                    .from("subscriptions")
                    .upsert({
                        company_id: activeCompany.id,
                        plan_id: targetId,
                        status: 'active',
                        current_period_start: new Date().toISOString()
                    });

                if (error) throw error;

                toast({ title: "Plan Updated", description: `Your workspace has been upgraded to the ${targetId} tier.` });

                // Refresh local state
                const { data } = await supabase.from("subscriptions").select("*, subscription_plans(*)").eq("company_id", activeCompany.id).single();
                setSubscription(data);
            }
        } catch (err: any) {
            toast({ variant: "destructive", title: "Update Failed", description: err.message });
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="p-8 flex items-center justify-center h-[400px]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Loading Billing Framework</p>
            </div>
        </div>
    );

    const currentPlanId = subscription?.plan_id || 'free';
    const isAlreadySubscribed = requestedModule && (hasModule(requestedModule.name) || hasModule(requestedModule.id));

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-800 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20 rotate-3 transition-transform hover:rotate-0">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase italic">Billing & <span className="text-blue-600">Expansion</span></h1>
                            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Enterprise Architecture Management</p>
                        </div>
                    </div>
                </div>

                {subscription && (
                    <div className="px-6 py-4 bg-white border border-slate-200 rounded-2xl flex items-center gap-5 shadow-sm group hover:border-blue-200 transition-all hover:shadow-lg">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500">
                            <Calendar className="w-6 h-6 text-blue-600 group-hover:text-white group-hover:rotate-12 transition-all" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Automated Renewal</p>
                            <p className="text-base font-bold text-slate-900">{new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Spotlight Banner for Module Request */}
            {requestedModule && (
                <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-1 shadow-2xl animate-in slide-in-from-top duration-700">
                    <div className="relative bg-slate-900/40 backdrop-blur-3xl rounded-[2.3rem] p-10 lg:p-14 flex flex-col lg:flex-row items-center gap-14 text-white overflow-hidden">
                        {/* Interactive Blobs */}
                        <div className={cn("absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br opacity-20 blur-[120px] -mr-64 -mt-64 rounded-full animate-pulse", requestedModule.colorFrom, requestedModule.colorTo)} />
                        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] -ml-40 -mb-40 rounded-full" />

                        <div className="relative z-10 flex-shrink-0">
                            <div className={cn("w-36 h-36 rounded-[2.8rem] bg-gradient-to-br flex items-center justify-center text-7xl shadow-2xl border border-white/20 transform transition-transform duration-700 group hover:rotate-12", requestedModule.colorFrom, requestedModule.colorTo)}>
                                <span className="drop-shadow-2xl">{requestedModule.icon}</span>
                            </div>
                        </div>

                        <div className="relative z-10 flex-1 text-center lg:text-left space-y-8">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-blue-300 shadow-inner">
                                    <Sparkles className="w-4 h-4" /> Ready for Deployment
                                </div>
                                <h2 className="text-5xl lg:text-6xl font-black tracking-tighter uppercase italic leading-[0.9]">
                                    Unleash <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{requestedModule.name}</span>
                                </h2>
                                <p className="text-slate-400 font-bold text-xl max-w-2xl leading-relaxed uppercase tracking-tight">
                                    {requestedModule.tagline}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
                                {requestedModule.features.slice(0, 4).map((f, i) => (
                                    <div key={i} className="flex items-center gap-4 bg-white/5 border border-white/5 px-6 py-4 rounded-2xl transition-all hover:bg-white/10 hover:translate-x-1 group">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] group-hover:scale-125 transition-transform" />
                                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 group-hover:text-white">{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative z-10 w-full lg:w-auto flex flex-col gap-6">
                            {(() => {
                                const currentPlan = plans.find(p => p.id === currentPlanId);
                                const isIncluded = requestedModule.includedInPlans.includes(currentPlanId);

                                if (isAlreadySubscribed) {
                                    return (
                                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-3xl flex flex-col gap-6 backdrop-blur-2xl">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500/60 font-sans">Deployment Status</p>
                                                <p className="text-lg font-black text-emerald-400 flex items-center gap-3 uppercase italic">
                                                    <CheckCircle2 className="w-6 h-6" /> Module Active
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => navigate(requestedModule.dashboardRoute)}
                                                className="h-16 px-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-4"
                                            >
                                                Launch Workspace <ArrowUpRight className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    );
                                }

                                if (isIncluded) {
                                    return (
                                        <div className="bg-white/5 border border-white/10 p-8 rounded-3xl flex flex-col gap-6 backdrop-blur-2xl">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Ecosystem Check</p>
                                                <p className="text-base font-black text-blue-400 flex items-center gap-3 uppercase italic">
                                                    <Check className="w-5 h-5" /> Included in {currentPlan?.name || 'Current'} Plan
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => handleSwitchPlan(requestedModule.id, true)}
                                                disabled={updating}
                                                className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-4 group"
                                            >
                                                {updating ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" /> Activate Component</>}
                                            </Button>
                                        </div>
                                    );
                                } else {
                                    const requiredPlanSlug = requestedModule.includedInPlans[0];
                                    const requiredPlan = plans.find(p => p.id === requiredPlanSlug);

                                    return (
                                        <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-3xl flex flex-col gap-6 backdrop-blur-2xl">
                                            <div className="space-y-2">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500/60">Upgrade Required</p>
                                                <p className="text-base font-black text-amber-500 flex items-center gap-3 uppercase italic">
                                                    <AlertCircle className="w-5 h-5" /> Requires {requiredPlan?.name || 'Higher'} Tier
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => {
                                                    const planEl = document.getElementById(`plan-${requiredPlanSlug}`);
                                                    planEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }}
                                                className="h-16 px-10 bg-amber-500 hover:bg-amber-600 text-white border-none rounded-2xl font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl shadow-amber-500/20 transition-all active:scale-95 flex items-center justify-center gap-4"
                                            >
                                                Review Upgrade Plans <ArrowRight className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        {/* Close button for spotlight */}
                        <button
                            onClick={() => setRequestedModule(null)}
                            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>
            )}

            {/* Current Infrastructure Status Card */}
            <div className="group relative overflow-hidden bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-white shadow-2xl border border-white/5 transition-all duration-700 hover:shadow-blue-500/10">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 blur-[140px] -mr-64 -mt-64 rounded-full transition-all duration-1000 group-hover:scale-125" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] -ml-48 -mb-48 rounded-full" />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                    <div className="lg:col-span-8 space-y-12">
                        <div className="inline-flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] font-black uppercase tracking-[0.4em] text-blue-400 shadow-inner backdrop-blur-md">
                            <ShieldCheck className="w-5 h-5" /> Enterprise Verified Framework
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-5xl lg:text-7xl font-black tracking-tighter uppercase italic leading-[0.8] mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/40">
                                {subscription?.subscription_plans?.name || 'Starter Environment'}
                            </h2>
                            <p className="text-slate-400 font-bold text-2xl max-w-2xl uppercase tracking-tighter leading-tight italic">
                                Operating within the <span className="text-white">{subscription?.subscription_plans?.name || 'Base'}</span> technological ecosystem.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-16 pt-4">
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Service Uptime</p>
                                <div className="font-black text-base flex items-center gap-4 uppercase tracking-widest text-emerald-400">
                                    <div className="w-4 h-4 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.7)]" />
                                    Active Platform
                                </div>
                            </div>
                            <div className="w-px h-16 bg-white/10 hidden sm:block" />
                            <div className="space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Monthly Investment</p>
                                <p className="font-black text-4xl tracking-tighter">₹ {subscription?.subscription_plans?.price_monthly?.toLocaleString() || '0'}<span className="text-sm text-slate-500 ml-2 uppercase tracking-widest font-sans italic">/mo</span></p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-4 relative group/viz flex justify-center">
                        <div className="w-72 h-72 bg-gradient-to-br from-white/10 to-white/0 rounded-[3rem] border border-white/10 p-12 flex flex-col items-center justify-center gap-8 relative overflow-hidden backdrop-blur-xl transition-all duration-700 group-hover:border-blue-500/50 group-hover:scale-105">
                            <History className="w-24 h-24 text-blue-600/30 animate-spin-slow transition-transform duration-700 group-hover/viz:scale-110 group-hover/viz:text-blue-500/40" />
                            <div className="text-center space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">History Sync</p>
                                <p className="text-xs font-black text-white/30 uppercase tracking-[0.2em]">Synchronizing Records...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans Selection Matrix */}
            <div className="pt-8 space-y-16">
                <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-4 px-5 py-2 bg-blue-50 text-blue-600 rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-sm">
                        <Settings2 className="w-4 h-4" /> Platform Scaling Matrix
                    </div>
                    <h2 className="text-5xl lg:text-7xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">Expansion <span className="text-blue-600">Frameworks</span></h2>
                    <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs max-w-2xl mx-auto leading-relaxed">Systematically evolve your digital infrastructure as your brand commands the marketplace.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {plans.map((plan) => {
                        const isCurrent = plan.id === currentPlanId;
                        const isRequired = requestedModule && requestedModule.includedInPlans.includes(plan.id) && !requestedModule.includedInPlans.includes(currentPlanId);
                        const Icon = plan.id === 'free' ? Zap : plan.id === 'pro' ? Star : Crown;

                        return (
                            <div key={plan.id} id={`plan-${plan.id}`} className={cn(
                                "relative bg-white rounded-[3rem] border border-slate-100 p-10 pt-16 space-y-12 flex flex-col justify-between transition-all duration-700 group hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] hover:-translate-y-4",
                                isCurrent && "ring-2 ring-blue-600 border-transparent bg-blue-50/5 shadow-2xl shadow-blue-600/10",
                                isRequired && "ring-2 ring-amber-500 border-transparent scale-[1.03] shadow-2xl shadow-amber-500/20"
                            )}>
                                {isCurrent && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[11px] font-black uppercase tracking-[0.3em] px-8 py-3 rounded-full shadow-2xl shadow-blue-600/30 z-20">
                                        Current Ecosystem
                                    </div>
                                )}
                                {isRequired && (
                                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[11px] font-black uppercase tracking-[0.3em] px-8 py-3 rounded-full shadow-2xl shadow-amber-500/30 z-20 animate-pulse">
                                        Mandatory for {requestedModule?.name}
                                    </div>
                                )}

                                <div className="space-y-10">
                                    <div className="flex items-start justify-between">
                                        <div className={cn(
                                            "w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700",
                                            plan.id === 'enterprise' ? "bg-gradient-to-br from-amber-400 via-amber-600 to-amber-900 text-white shadow-amber-500/30" :
                                                plan.id === 'pro' ? "bg-gradient-to-br from-blue-500 via-indigo-600 to-indigo-900 text-white shadow-blue-500/30" :
                                                    "bg-slate-100 text-slate-500"
                                        )}>
                                            <Icon className="w-10 h-10" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-4xl font-black tracking-tighter text-slate-900 leading-none">₹ {plan.price_monthly.toLocaleString()}</p>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mt-3 italic">Investment Per Month</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{plan.name}</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.15em] leading-relaxed italic">
                                            {plan.id === 'free' ? "Perfect for visionaries starting their digital journey." :
                                                plan.id === 'pro' ? "Optimized for scaling brands with high velocity." :
                                                    "Infinite power for global enterprise dominance."}
                                        </p>
                                    </div>

                                    <div className="space-y-6 pt-10 border-t border-slate-50">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Feature Roadmap</p>
                                        <ul className="grid grid-cols-1 gap-5">
                                            {(plan.features || []).map((feature: string) => (
                                                <li key={feature} className="flex items-center gap-5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-600 group/feature">
                                                    <div className="w-6 h-6 rounded-xl bg-blue-50 flex items-center justify-center group-hover/feature:bg-blue-600 transition-all duration-500">
                                                        <Check className="w-3.5 h-3.5 text-blue-600 group-hover/feature:text-white group-hover/feature:scale-110 transition-all" />
                                                    </div>
                                                    <span className="group-hover/feature:text-slate-900 transition-colors uppercase">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <Button
                                    disabled={isCurrent || updating}
                                    onClick={() => handleSwitchPlan(plan.id)}
                                    className={cn(
                                        "h-16 w-full rounded-[2rem] font-black uppercase tracking-[0.4em] text-[11px] gap-4 transition-all mt-12 shadow-2xl active:scale-95",
                                        isCurrent ? "bg-slate-100 text-slate-300 cursor-default shadow-none ring-0" :
                                            isRequired ? "bg-amber-500 text-white hover:bg-amber-600 shadow-amber-500/20" :
                                                "bg-slate-900 text-white hover:bg-black shadow-slate-900/20"
                                    )}
                                >
                                    {updating ? <Loader2 className="w-5 h-5 animate-spin" /> :
                                        isCurrent ? "Current Framework" :
                                            isRequired ? "Upgrade & Deploy" : "Migrate Ecosystem"}
                                    {!updating && !isCurrent && <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Assistance Card */}
            <div className="group bg-white rounded-[3rem] p-12 lg:p-20 border border-slate-100 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden transition-all hover:border-blue-200">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50/50 blur-[120px] -mr-64 -mt-64 rounded-full transition-all duration-1000 group-hover:scale-125" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10 text-center lg:text-left">
                    <div className="w-24 h-24 rounded-[2rem] bg-slate-900 flex items-center justify-center shadow-2xl transform rotate-3 transition-all duration-700 group-hover:rotate-0 group-hover:scale-110">
                        <Building2 className="w-12 h-12 text-blue-400 group-hover:animate-pulse" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-3xl lg:text-4xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">Enterprise Tailoring</h3>
                        <p className="text-sm font-bold text-slate-400 max-w-lg mt-2 uppercase tracking-[0.2em] leading-relaxed">Architect a bespoke digital infrastructure for your global operations and command the digital frontier.</p>
                    </div>
                </div>
                <Button className="h-16 px-12 rounded-[2rem] bg-white border border-slate-200 text-slate-900 font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl hover:bg-slate-50 transition-all active:scale-95 group">
                    Initiate Contact <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
            </div>

            {/* Platform Footer Mark */}
            <div className="pt-20 pb-10 text-center opacity-20 group">
                <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-400 group-hover:text-blue-600 transition-colors">Digital Infrastructure Managed by Smartseyali Engine v4.0.1</p>
            </div>
        </div>
    );
}
