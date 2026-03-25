import { useState, useEffect } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
    BarChart, FileText, Menu, PenTool, Settings, Globe,
    ExternalLink, RefreshCw, Save, Zap, Image,
    Layout
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Organic Tab Fragments
import { OverviewTab } from "./website/OverviewTab";
import { PagesTab } from "./website/PagesTab";
import { NavigationTab } from "./website/NavigationTab";
import { BlogTab } from "./website/BlogTab";
import { SettingsTab } from "./website/SettingsTab";
import { SectionEditor } from "./website/SectionEditor";

type WebsiteTab = "overview" | "banners" | "pages" | "navigation" | "blog" | "settings";

export default function Website() {
    const { activeCompany } = useTenant();
    const { toast } = useToast();
    const { settings, updateSettings, loading: settingsLoading } = useStoreSettings();
    const [activeTab, setActiveTab] = useState<WebsiteTab>("overview");
    const [loading, setLoading] = useState(false);
    const [localSettings, setLocalSettings] = useState<any>(null);

    useEffect(() => {
        if (settings) {
            setLocalSettings(settings);
        }
    }, [settings]);

    const handleSave = async () => {
        if (!localSettings) return;
        setLoading(true);
        try {
            await updateSettings(localSettings);
            toast({
                title: "Settings Saved",
                description: "Your storefront has been updated with the new configuration."
            });
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "We couldn't update your storefront settings. Please try again."
            });
        } finally {
            setLoading(false);
        }
    };

    const [stats, setStats] = useState({
        totalPages: 0,
        activeMenus: 0,
        blogPosts: 0,
        publishedArticles: 0
    });

    useEffect(() => {
        if (activeCompany) loadStats();
    }, [activeCompany]);

    const loadStats = async () => {
        if (!activeCompany) return;
        const [p, m, b] = await Promise.all([
            supabase.from("ecom_pages").select("id", { count: "exact", head: true }).eq("company_id", activeCompany.id),
            supabase.from("ecom_menus").select("id", { count: "exact", head: true }).eq("company_id", activeCompany.id),
            supabase.from("ecom_blog").select("id", { count: "exact", head: true }).eq("company_id", activeCompany.id),
        ]);
        setStats({
            totalPages: p.count || 0,
            activeMenus: m.count || 0,
            blogPosts: b.count || 0,
            publishedArticles: b.count || 0
        });
    };

    const TabButton = ({ id, label, icon: Icon, sub }: { id: WebsiteTab, label: string, icon: any, sub: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={cn(
                "flex flex-col items-start gap-3 p-6 rounded-xl border transition-all duration-200 group/tab relative overflow-hidden",
                activeTab === id
                    ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02] z-20"
                    : "bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-600 hover:bg-slate-50"
            )}
        >
            <div className="flex items-center justify-between w-full">
                <Icon className={cn("w-5 h-5 transition-transform duration-200", activeTab === id ? "scale-110" : "group-hover/tab:scale-110")} />
            </div>
            <div className="text-left">
                <p className="text-sm font-bold tracking-tight">{label}</p>
                <p className={cn("text-xs font-medium opacity-60", activeTab === id ? "text-white/80" : "text-slate-500")}>{sub}</p>
            </div>
        </button>
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            <div className="w-full px-6 py-12 space-y-12">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-border">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-blue-600" />
                            <span className="text-slate-500 font-bold  tracking-widest text-xs">Website Management</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Storefront Builder</h1>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white rounded-lg border border-slate-200 w-fit shadow-sm">
                            <Globe className="w-3.5 h-3.5 text-slate-300" />
                            <span className="text-xs font-semibold text-slate-500 tracking-tight">domain.com/{activeCompany?.subdomain}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 animate-in slide-in-from-right-4 duration-500">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                className="h-10 px-4 rounded-md border-slate-200 bg-white text-slate-700 font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2"
                                onClick={() => window.open(`/${activeCompany?.subdomain?.toLowerCase()}`, '_blank')}
                            >
                                <ExternalLink className="w-4 h-4" /> View Site
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="h-10 px-6 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all flex items-center gap-2"
                            >
                                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                    <TabButton id="overview" label="Overview" sub="Dashboard Stats" icon={BarChart} />
                    <TabButton id="banners" label="Hero Banners" sub="Banner Slider" icon={Image} />
                    <TabButton id="pages" label="Pages" sub="Custom Content" icon={FileText} />
                    <TabButton id="navigation" label="Navigation" sub="Header & Footer" icon={Menu} />
                    <TabButton id="blog" label="Blog" sub="Latest Articles" icon={PenTool} />
                    <TabButton id="settings" label="Store Settings" sub="Theme & Identity" icon={Settings} />
                </div>

                {/* Content */}
                <div className="min-h-[600px] relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {activeTab === "overview" && <OverviewTab stats={stats} onTabChange={setActiveTab} />}
                            {activeTab === "banners" && <SectionEditor companyId={activeCompany?.id} />}
                            {activeTab === "pages" && <PagesTab companyId={activeCompany?.id} />}
                            {activeTab === "navigation" && <NavigationTab companyId={activeCompany?.id} />}
                            {activeTab === "blog" && <BlogTab companyId={activeCompany?.id} />}
                            {activeTab === "settings" && (
                                <SettingsTab
                                    settings={localSettings}
                                    onChange={(s: any) => setLocalSettings(s)}
                                />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
