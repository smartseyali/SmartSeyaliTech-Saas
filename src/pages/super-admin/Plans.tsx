
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Plus, CreditCard, Trash2, Edit, Check, X, Shield, Star, Zap, Crown } from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PlatformPlans() {
    const { toast } = useToast();
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        slug: "",
        price_monthly: 0,
        features: "",
        is_active: true,
        sort_order: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('system_plans')
            .select('*')
            .order('sort_order', { ascending: true });

        if (!error && data) {
            setPlans(data);
        } else {
            console.error("Plans load error:", error);
        }
        setLoading(false);
    };

    const handleOpenDialog = (plan?: any) => {
        if (plan) {
            setEditingId(plan.id);
            setFormData({
                name: plan.name,
                slug: plan.slug,
                price_monthly: plan.price_monthly,
                features: Array.isArray(plan.features) ? plan.features.join("\n") :
                    (typeof plan.features === 'string' ? JSON.parse(plan.features).join("\n") : ""),
                is_active: plan.is_active,
                sort_order: plan.sort_order || 0
            });
        } else {
            setEditingId(null);
            setFormData({
                name: "",
                slug: "",
                price_monthly: 0,
                features: "",
                is_active: true,
                sort_order: plans.length
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.slug) {
            toast({ title: "Required Fields", description: "Name and Slug are required.", variant: "destructive" });
            return;
        }

        setIsSubmitting(true);
        const featuresArray = formData.features.split('\n').map(f => f.trim()).filter(Boolean);

        const payload = {
            name: formData.name,
            slug: formData.slug,
            price_monthly: formData.price_monthly,
            features: featuresArray,
            is_active: formData.is_active,
            sort_order: formData.sort_order
        };

        try {
            if (editingId) {
                const { error } = await supabase.from('system_plans').update(payload).eq('id', editingId);
                if (error) throw error;
                toast({ title: "Plan Hub Updated" });
            } else {
                const { error } = await supabase.from('system_plans').insert([payload]);
                if (error) throw error;
                toast({ title: "Package Registered" });
            }
            setIsDialogOpen(false);
            loadData();
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Remove this subscription package permanently?")) return;
        const { error } = await supabase.from('system_plans').delete().eq('id', id);
        if (error) toast({ title: "Delete Failed", variant: "destructive" });
        else loadData();
    };

    const getPlanIcon = (slug: string) => {
        if (slug.includes('standard')) return <Shield className="w-8 h-8 text-slate-400" />;
        if (slug.includes('pro')) return <Zap className="w-8 h-8 text-blue-500" />;
        if (slug.includes('enterprise')) return <Crown className="w-8 h-8 text-amber-500" />;
        return <Star className="w-8 h-8 text-indigo-500" />;
    };

    return (
        <div className="p-8 max-w-[1400px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900  ">Subscription Ecosystem</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Manage the commercial performance tiers available to {PLATFORM_CONFIG.name} customers.</p>
                </div>
                <Button onClick={() => handleOpenDialog()} className="h-14 bg-black hover:bg-slate-900 text-white font-bold px-8 rounded-2xl shadow-xl flex gap-3 transition-transform hover:scale-105 active:scale-95">
                    <Plus className="w-5 h-5" /> Register Package
                </Button>
            </div>

            {loading ? (
                <div className="h-96 flex flex-col items-center justify-center gap-4">
                    <CreditCard className="w-12 h-12 text-slate-200 animate-pulse" />
                    <span className="text-xs font-bold text-slate-300  tracking-widest">Synchronizing Tiers...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => (
                        <div key={plan.id} className={`bg-white rounded-[32px] p-8 border-2 transition-all ${plan.is_active ? 'border-slate-100 shadow-sm hover:shadow-2xl' : 'border-slate-200 opacity-60'}`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    {getPlanIcon(plan.slug)}
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <button onClick={() => handleOpenDialog(plan)} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors">
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDelete(plan.id)} className="w-10 h-10 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center text-red-600 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 tracking-tight  mb-1">{plan.name}</h3>
                            <div className="flex items-baseline gap-1 mb-6">
                                <span className="text-3xl font-bold text-blue-600">${plan.price_monthly}</span>
                                <span className="text-xs font-bold text-slate-400  tracking-widest">/ month</span>
                            </div>

                            <div className="space-y-3 mb-8">
                                <p className="text-[10px] font-bold  text-slate-400 tracking-widest border-b border-slate-50 pb-2">Enabled Engines</p>
                                {(Array.isArray(plan.features) ? plan.features : []).slice(0, 5).map((f: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-600">
                                        <Check className="w-4 h-4 text-green-500 shrink-0" /> {f}
                                    </div>
                                ))}
                            </div>

                            <div className={`mt-auto pt-6 border-t border-slate-50 flex items-center justify-between`}>
                                <span className="text-[9px] font-bold  text-slate-400 tracking-widest">Slug: {plan.slug}</span>
                                <div className={`px-3 py-1 rounded-full text-[9px] font-bold  tracking-widest ${plan.is_active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                    {plan.is_active ? 'Active' : 'Disabled'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent
                    className="sm:max-w-[500px]"
                    onPointerDownOutside={(e) => e.preventDefault()}
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold  tracking-tight">{editingId ? 'Modify Engine Pack' : 'Initialize Package'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold  tracking-widest text-slate-400">Pack Name</Label>
                                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Professional" className="font-bold h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold  tracking-widest text-slate-400">System Slug</Label>
                                <Input value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} placeholder="e.g. enterprise-tier" className="font-mono text-sm h-12" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold  tracking-widest text-slate-400">Monthly Yield ($)</Label>
                                <Input type="number" value={formData.price_monthly} onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) || 0 })} className="font-bold h-12" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold  tracking-widest text-slate-400">Sort Priority</Label>
                                <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })} className="font-bold h-12" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-bold  tracking-widest text-slate-400">Engine Features (One per line)</Label>
                            <Textarea
                                value={formData.features}
                                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                placeholder="Core SaaS Engine&#10;Unlimited Cloud Storage&#10;Dedicated IT Advisor"
                                className="min-h-[120px] font-medium text-sm leading-relaxed"
                            />
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                                className={`w-12 h-6 rounded-full transition-colors relative ${formData.is_active ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_active ? 'left-[26px]' : 'left-1'}`} />
                            </button>
                            <Label className="text-xs font-bold text-slate-900  tracking-widest cursor-pointer">Live in Onboarding</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="font-bold  text-[10px] tracking-widest">Abort</Button>
                        <Button onClick={handleSave} disabled={isSubmitting} className="bg-black text-white hover:bg-slate-900 h-12 px-8 rounded-xl font-bold  text-[10px] tracking-widest">
                            {isSubmitting ? "Processing..." : "Commit Package"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
