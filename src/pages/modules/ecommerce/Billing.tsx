import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";
import {
    CreditCard, CheckCircle2, AlertCircle,
    ArrowRight, Star, Crown, Zap, Loader2,
    Calendar, History, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Billing() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);
    const [plans, setPlans] = useState<any[]>([]);

    useEffect(() => {
        const fetchBillingData = async () => {
            if (!activeCompany?.id) return;
            setLoading(true);
            try {
                // If there's a ?module= param, we interpret this as a direct module upgrade request
                const params = new URLSearchParams(window.location.search);
                const upgradeModuleSlug = params.get('module');

                if (upgradeModuleSlug) {
                    // Quick check to resolve slug to ID if needed
                    const { data: mod } = await supabase.from('system_modules').select('id').eq('slug', upgradeModuleSlug).maybeSingle();
                    if (mod) {
                        await handleSwitchPlan(mod.id.toString(), true);
                        return; // Handle switch plan redirects itself
                    }
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

    const handleSwitchPlan = async (planId: string, isModuleAdd = false) => {
        if (!activeCompany?.id || updating) return;
        setUpdating(true);
        try {
            if (isModuleAdd) {
                // User is subscribing to a specific module
                const { error: moduleError } = await supabase
                    .from("company_modules")
                    .insert({
                        company_id: activeCompany.id,
                        module_id: planId, // In this flow, planId holds the module ID
                        is_active: true
                    });

                if (moduleError) {
                    // Ignore unique constraint errors if they already have it
                    if (moduleError.code !== '23505') throw moduleError;
                }

                // Let's also ensure user mapping exists just in case
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    try {
                        await supabase.from("user_modules").insert({
                            company_id: activeCompany.id,
                            user_id: user.id,
                            module_id: planId,
                            is_active: true
                        });
                    } catch (e) {
                        // Catch unique constraint quietly
                    }
                }

                toast({ title: "Module Activated", description: `You have successfully subscribed to the new application.` });
                setTimeout(() => window.location.href = "/apps", 1000);
            } else {
                // Standard Plan Upgrade
                const { error } = await supabase
                    .from("subscriptions")
                    .upsert({
                        company_id: activeCompany.id,
                        plan_id: planId,
                        status: 'active',
                        current_period_start: new Date().toISOString()
                    });

                if (error) throw error;

                toast({ title: "Plan Updated", description: `Your marketplace has been migrated to the ${planId} tier.` });

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

    if (loading) return <div className="p-8 flex items-center justify-center h-[400px]"><Loader2 className="w-8 h-8 animate-spin opacity-20" /></div>;

    const currentPlanId = subscription?.plan_id || 'free';

    return (
        <div className="p-8 space-y-12 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Billing & Plans</h1>
                    </div>
                    <p className="text-sm font-medium text-slate-500">Manage your subscription and billing details</p>
                </div>

                {subscription && (
                    <div className="px-5 py-3 bg-white border border-slate-200 rounded-xl flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Next Renewal</p>
                            <p className="text-sm font-bold text-slate-900">{new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Current Status Card */}
            <div className="relative overflow-hidden bg-slate-900 rounded-2xl p-10 text-white shadow-xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] -mr-32 -mt-32" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                            <ShieldCheck className="w-4 h-4" /> Secure Billing
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight">
                                {subscription?.subscription_plans?.name || 'Starter Plan'}
                            </h2>
                            <p className="text-sm font-medium text-slate-400 max-w-sm">
                                Your store is currently running on the {subscription?.subscription_plans?.name || 'Starter'} tier.
                            </p>
                        </div>
                        <div className="flex gap-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</p>
                                <div className="font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Active
                                </div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Monthly Cost</p>
                                <p className="font-bold">₹ {subscription?.subscription_plans?.price_monthly?.toLocaleString() || '0'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="aspect-video bg-white/5 rounded-xl border border-white/10 p-8 flex items-center justify-center">
                            <History className="w-12 h-12 text-slate-700 animate-spin-slow" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">Expansion Plans</h2>
                    <p className="text-sm text-slate-500 font-medium">Switch between plans as your business grows.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const isCurrent = plan.id === currentPlanId;
                        const Icon = plan.id === 'free' ? Zap : plan.id === 'pro' ? Star : Crown;

                        return (
                            <div key={plan.id} className={cn(
                                "relative bg-white rounded-2xl border border-slate-200 p-8 space-y-8 flex flex-col justify-between transition-all duration-300 hover:shadow-lg",
                                isCurrent && "border-blue-600 ring-1 ring-blue-50"
                            )}>
                                {isCurrent && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                                        Current Plan
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", plan.id === 'enterprise' ? "bg-amber-50 text-amber-600" : "bg-blue-50 text-blue-600")}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold tracking-tight text-slate-900">₹ {plan.price_monthly.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold uppercase text-slate-400">per month</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                            {plan.id === 'free' ? "Perfect for small stores starting out." :
                                                plan.id === 'pro' ? "Best for growing stores with more traffic." :
                                                    "Full power for large scale operations."}
                                        </p>
                                    </div>

                                    <ul className="space-y-3 pt-6 border-t border-slate-100">
                                        {(plan.features || []).map((feature: string) => (
                                            <li key={feature} className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                                                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button
                                    disabled={isCurrent || updating}
                                    onClick={() => handleSwitchPlan(plan.id)}
                                    className={cn(
                                        "h-11 w-full rounded-lg font-bold uppercase tracking-wider text-[10px] gap-2 transition-all mt-8",
                                        isCurrent ? "bg-slate-100 text-slate-400 cursor-default" : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/10"
                                    )}
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                        isCurrent ? "Active Plan" : "Switch Plan"}
                                    {!updating && !isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Assistance Card */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <AlertCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                        <p className="font-bold text-slate-900">Need a custom plan?</p>
                        <p className="text-sm text-slate-500 font-medium">Contact our team for enterprise solutions tailored to your brand.</p>
                    </div>
                </div>
                <Button variant="outline" className="h-11 rounded-lg font-bold px-8 border-slate-200 hover:bg-white transition-all">Contact Us</Button>
            </div>
        </div>
    );
}
