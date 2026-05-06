import { Zap, Key, Link as LinkIcon, RefreshCw, ShieldCheck, ExternalLink, Globe, Smartphone, BarChart3, MessageSquare, Tag, CheckCircle2, XCircle, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useNavigate } from "react-router-dom";

const staticConnectors = [
    { name: "ShipRocket", desc: "Logistics & Tracking Sync", status: "Connected", icon: LinkIcon, delay: "Real-time", type: "Distribution" },
    { name: "Razorpay", desc: "Payment Gateway Core", status: "Active", icon: ShieldCheck, delay: "Instantly", type: "Financials" },
    { name: "WhatsApp Business API", desc: "Automated Notifications", status: "Authorized", icon: MessageSquare, delay: "Real-time", type: "Engagement" },
];

type AnalyticsConnector = {
    name: string;
    desc: string;
    type: string;
    icon: React.ElementType;
    idLabel: string;
    idValue: string | undefined;
};

export default function APIIntegrations() {
    const { settings } = useStoreSettings();
    const navigate = useNavigate();

    const analyticsConnectors: AnalyticsConnector[] = [
        {
            name: "Google Analytics 4",
            desc: "Page views, sessions, conversion funnel tracking.",
            type: "Intelligence",
            icon: BarChart3,
            idLabel: "Measurement ID",
            idValue: settings?.integrations?.ga4_measurement_id,
        },
        {
            name: "Google Tag Manager",
            desc: "Centralised tag container for all scripts.",
            type: "Intelligence",
            icon: Tag,
            idLabel: "Container ID",
            idValue: settings?.integrations?.gtm_container_id,
        },
        {
            name: "Meta Pixel",
            desc: "Facebook & Instagram conversion tracking.",
            type: "Advertising",
            icon: Zap,
            idLabel: "Pixel ID",
            idValue: settings?.integrations?.meta_pixel_id,
        },
        {
            name: "Microsoft Clarity",
            desc: "Session recordings, heatmaps, and behaviour analytics.",
            type: "Intelligence",
            icon: Settings2,
            idLabel: "Project ID",
            idValue: settings?.integrations?.clarity_project_id,
        },
    ];

    const goToAnalyticsSettings = () => navigate("/apps/ecommerce/settings");

    return (
        <div className="p-8 space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Globe className="w-6 h-6 text-blue-600" />
                        <span className="text-xs font-bold tracking-widest text-slate-500">Ecosystem & Bridges</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">API & Integrations</h1>
                    <p className="text-sm font-medium text-slate-500">Connect your store with high-performance external services and tools.</p>
                </div>
                <Button className="h-11 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/10 transition-all gap-2">
                    <Key className="w-4 h-4" /> Generate Access Key
                </Button>
            </div>

            {/* ── Static: Logistics & Payments ─────────────────── */}
            <div>
                <p className="text-xs font-bold tracking-widest text-slate-400 mb-5">LOGISTICS & PAYMENTS</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {staticConnectors.map((c, i) => (
                        <div key={i} className="group bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-300">
                            <div className="flex justify-between items-start mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner border border-slate-100">
                                    <c.icon className="w-7 h-7" />
                                </div>
                                <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[13px] font-bold tracking-widest border border-emerald-100 shadow-sm">
                                    {c.status}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-blue-600 tracking-widest">{c.type}</p>
                                    <h3 className="text-xl font-bold text-slate-900 leading-none tracking-tight mt-1">{c.name}</h3>
                                </div>
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">"{c.desc}"</p>
                                <div className="pt-4 flex justify-between items-center border-t border-slate-50">
                                    <span className="text-[13px] font-bold text-slate-500 tracking-widest flex items-center gap-2">
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin-slow opacity-40 text-blue-600" /> {c.delay}
                                    </span>
                                    <Button variant="ghost" className="h-10 px-5 text-xs font-bold tracking-widest text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all gap-2">
                                        Configure <ExternalLink className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Analytics & Tracking ─────────────────────────── */}
            <div>
                <div className="flex items-center justify-between mb-5">
                    <p className="text-xs font-bold tracking-widest text-slate-400">ANALYTICS & TRACKING</p>
                    <Button
                        variant="ghost"
                        onClick={goToAnalyticsSettings}
                        className="h-8 px-4 text-xs font-bold tracking-widest text-blue-600 hover:bg-blue-50 rounded-xl gap-2"
                    >
                        <Settings2 className="w-3.5 h-3.5" /> Configure in Settings
                    </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {analyticsConnectors.map((c, i) => {
                        const connected = Boolean(c.idValue);
                        return (
                            <div key={i} className={cn(
                                "group bg-white p-8 rounded-[32px] border shadow-sm hover:shadow-xl transition-all duration-300",
                                connected ? "border-emerald-200 hover:border-emerald-300" : "border-slate-200 hover:border-slate-300"
                            )}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className={cn(
                                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-inner border",
                                        connected
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white"
                                            : "bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-blue-600 group-hover:text-white"
                                    )}>
                                        <c.icon className="w-6 h-6" />
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold tracking-widest border",
                                        connected
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : "bg-slate-50 text-slate-400 border-slate-100"
                                    )}>
                                        {connected
                                            ? <CheckCircle2 className="w-3.5 h-3.5" />
                                            : <XCircle className="w-3.5 h-3.5" />
                                        }
                                        {connected ? "Connected" : "Not configured"}
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-bold text-blue-600 tracking-widest">{c.type}</p>
                                        <h3 className="text-xl font-bold text-slate-900 leading-none tracking-tight mt-1">{c.name}</h3>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 leading-relaxed">{c.desc}</p>
                                    {connected && (
                                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                            <span className="text-[11px] font-bold text-slate-400 tracking-widest">{c.idLabel}:</span>
                                            <code className="text-xs font-mono text-slate-700">{c.idValue}</code>
                                        </div>
                                    )}
                                    <div className="pt-4 border-t border-slate-50">
                                        <Button
                                            variant="ghost"
                                            onClick={goToAnalyticsSettings}
                                            className="h-9 px-4 text-xs font-bold tracking-widest text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all gap-2"
                                        >
                                            {connected ? "Update ID" : "Configure"} <ExternalLink className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Helper Card */}
            <div className="bg-slate-900 rounded-[32px] p-12 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Smartphone className="w-64 h-64 -rotate-12 translate-x-12 translate-y-12" />
                </div>
                <div className="relative z-10 space-y-6 max-w-xl">
                    <h2 className="text-3xl font-bold tracking-tight">Need a custom connector?</h2>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">Our SDK allows you to build custom integrations for your unique business logic and requirements.</p>
                    <div className="flex gap-4 pt-4">
                        <Button className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all">
                            Developer Hub
                        </Button>
                        <Button variant="outline" className="h-12 px-8 rounded-xl border-slate-700 text-white hover:bg-slate-800 font-bold">
                            API Documentation
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
