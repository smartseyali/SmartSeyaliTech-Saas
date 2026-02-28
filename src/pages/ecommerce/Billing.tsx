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

    const handleSwitchPlan = async (planId: string) => {
        if (!activeCompany?.id || updating) return;
        setUpdating(true);
        try {
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                            <CreditCard className="w-6 h-6" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight uppercase text-foreground">Billing & <span className="text-primary italic">Subscription</span></h1>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground opacity-60 ml-1">Manage institutional commerce tier</p>
                </div>

                {subscription && (
                    <div className="px-6 py-3 bg-card border border-border rounded-2xl flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Next Renewal</p>
                            <p className="text-xs font-bold">{new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Current Status Card */}
            <div className="relative overflow-hidden bg-black rounded-[2.5rem] p-10 text-white shadow-2xl shadow-primary/20">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32" />
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-black uppercase tracking-widest text-primary">
                            <ShieldCheck className="w-4 h-4" /> Fully Protected System
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl font-black tracking-tight tracking-tighter uppercase">
                                {subscription?.subscription_plans?.name || 'Starter Plan'}
                            </h2>
                            <p className="text-sm font-medium opacity-60 max-w-sm">
                                Your marketplace is currently running on the {subscription?.subscription_plans?.name || 'Starter'} tier with all core commerce features active.
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Status</p>
                                <div className="font-bold flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Active
                                </div>
                            </div>
                            <div className="w-px h-10 bg-white/10" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Monthly Charge</p>
                                <p className="font-bold">₹ {subscription?.subscription_plans?.price_monthly?.toLocaleString() || '0'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="aspect-video bg-white/5 rounded-[2rem] border border-white/10 p-8 flex items-center justify-center">
                            <History className="w-12 h-12 opacity-10 animate-spin-slow" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black tracking-tight uppercase">Expansion Tiers</h2>
                    <p className="text-sm text-muted-foreground font-medium">Switch between institutional plans as your brand grows.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => {
                        const isCurrent = plan.id === currentPlanId;
                        const Icon = plan.id === 'free' ? Zap : plan.id === 'pro' ? Star : Crown;

                        return (
                            <div key={plan.id} className={cn(
                                "relative bg-card rounded-[2.5rem] border p-8 space-y-8 flex flex-col justify-between transition-all duration-500 hover:shadow-2xl hover:shadow-black/5",
                                isCurrent && "border-primary ring-1 ring-primary/20 shadow-xl shadow-primary/10"
                            )}>
                                {isCurrent && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
                                        Current Logic
                                    </div>
                                )}

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", plan.id === 'enterprise' ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary")}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-black tracking-tight">₹ {plan.price_monthly.toLocaleString()}</p>
                                            <p className="text-[10px] font-black uppercase opacity-40">per month</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-lg font-black tracking-tight uppercase">{plan.name}</h3>
                                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                            {plan.id === 'free' ? "Institutional starter kit for emerging brands." :
                                                plan.id === 'pro' ? "Professional commerce engine for scaling businesses." :
                                                    "Enterprise grade infrastructure for large institutions."}
                                        </p>
                                    </div>

                                    <ul className="space-y-3 pt-4 border-t border-border/50">
                                        {(plan.features || []).map((feature: string) => (
                                            <li key={feature} className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground">
                                                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button
                                    disabled={isCurrent || updating}
                                    onClick={() => handleSwitchPlan(plan.id)}
                                    className={cn(
                                        "h-14 w-full rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2 transition-all mt-8",
                                        isCurrent ? "bg-secondary text-muted-foreground opacity-50 cursor-default" : "shadow-xl shadow-primary/10 hover:scale-[1.02]"
                                    )}
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> :
                                        isCurrent ? "Active Tier" : "Migrate Logic"}
                                    {!updating && !isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                                </Button>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Assistance Card */}
            <div className="bg-secondary/30 rounded-[2.5rem] p-8 border border-border/50 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                        <AlertCircle className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-bold text-sm">Need a custom institutional plan?</p>
                        <p className="text-xs text-muted-foreground">Contact our architecture team for tailored marketplace solutions.</p>
                    </div>
                </div>
                <Button variant="outline" className="h-12 rounded-xl font-bold px-8">Talk to Architecture</Button>
            </div>
        </div>
    );
}
