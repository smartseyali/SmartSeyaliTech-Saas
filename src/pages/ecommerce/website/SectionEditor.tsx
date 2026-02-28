import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap, Image as ImageIcon, Sparkles,
    ArrowRight, Save, ShieldCheck,
    RefreshCw, Trash2, Plus, Layout,
    ShoppingBag, Star, Layers, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroEditor } from "./HeroEditor";
import { useDynamicContent } from "@/hooks/useDynamicContent";
import { useTenant } from "@/contexts/TenantContext";
import { useToast } from "@/hooks/use-toast";

export function SectionEditor({ companyId }: { companyId: any }) {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const { data: banners, loading: bannersLoading, updateItem, createItem, deleteItem } = useDynamicContent("HOME_PAGE", "hero_banners");
    const [localBanners, setLocalBanners] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (banners) setLocalBanners(banners);
    }, [banners]);

    const handleBannerChange = (idx: number, updated: any) => {
        const next = [...localBanners];
        next[idx] = updated;
        setLocalBanners(next);
    };

    const handleAddBanner = async () => {
        const newBanner = {
            title: "New Featured Banner",
            subtitle: "Add your marketing subtext here",
            badge_text: "Special Offer",
            image_url: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600",
            company_id: activeCompany?.id
        };
        await createItem(newBanner);
        toast({ title: "Banner Fragment Added", description: "A new banner placeholder has been created." });
    };

    const handleSaveBanners = async () => {
        setSaving(true);
        try {
            for (const banner of localBanners) {
                if (banner.id) {
                    await updateItem(banner.id, banner);
                }
            }
            toast({ title: "Banners Updated", description: "Your home page banners have been successfully synced." });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-16 animate-in slide-in-from-bottom-4 duration-500">
            {/* Context Header */}
            <div className="flex items-center justify-between gap-4 bg-white p-8 rounded-[24px] border border-border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#f97316]/10 rounded-2xl flex items-center justify-center text-[#f97316]">
                        <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#14532d]">Banner Management</h2>
                        <p className="text-xs font-semibold text-slate-400 mt-0.5">Edit and arrange hero images for your storefront home page.</p>
                    </div>
                </div>
                <Button
                    onClick={handleSaveBanners}
                    disabled={saving || bannersLoading}
                    className="h-10 px-6 rounded-xl bg-[#14532d] hover:bg-[#14532d]/90 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#14532d]/10 transition-all"
                >
                    {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {saving ? "Saving..." : "Save All Banners"}
                </Button>
            </div>

            {/* Banner List */}
            <div className="space-y-10">
                {bannersLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border border-dashed border-border">
                        <RefreshCw className="w-8 h-8 text-[#14532d]/20 animate-spin" />
                        <p className="mt-4 text-xs font-bold text-[#14532d]/40 uppercase tracking-widest">Loading Slides...</p>
                    </div>
                ) : (
                    <>
                        {localBanners.map((b, idx) => (
                            <HeroEditor
                                key={b.id || idx}
                                banner={b}
                                onChange={(updated) => handleBannerChange(idx, updated)}
                                onDelete={() => deleteItem(b.id)}
                            />
                        ))}

                        <Button
                            onClick={handleAddBanner}
                            className="w-full h-24 border-2 border-dashed border-[#14532d]/20 bg-[#14532d]/5 hover:bg-white hover:border-[#14532d] rounded-[32px] font-black uppercase tracking-[0.2em] text-[11px] text-[#14532d] transition-all duration-300 group/add"
                        >
                            <Plus className="w-6 h-6 mr-2 group-hover/add:rotate-90 transition-transform" /> Add New Banner Slide
                        </Button>
                    </>
                )}
            </div>

            {/* Stats Card */}
            <div className="p-8 bg-[#14532d] rounded-[24px] flex flex-col md:flex-row items-center justify-between gap-6 text-white group overflow-hidden relative shadow-xl">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent to-white/5 pointer-events-none" />
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-[#f97316]">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white uppercase tracking-tight">Layout Integrity Active</p>
                        <p className="text-xs text-white/50 font-medium">Your banners are responsive and optimized for mobile devices.</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl border border-white/10 relative z-10">
                    <Leaf className="w-3.5 h-3.5 text-[#f97316]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Node: {activeCompany?.subdomain}</span>
                </div>
            </div>
        </div>
    );
}
