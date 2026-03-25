import { Zap, Key, Link as LinkIcon, RefreshCw, ShieldCheck, ExternalLink, Globe, Smartphone, BarChart3, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const connectors = [
    { name: "ShipRocket", desc: "Logistics & Tracking Sync", status: "Connected", icon: LinkIcon, delay: "Real-time", type: "Distribution" },
    { name: "Razorpay", desc: "Payment Gateway Core", status: "Active", icon: ShieldCheck, delay: "Instantly", type: "Financials" },
    { name: "Google Analytics 4", desc: "Behavioral Tracking", status: "Live", icon: BarChart3, delay: "5 mins", type: "Intelligence" },
    { name: "WhatsApp Business API", desc: "Automated Notifications", status: "Authorized", icon: MessageSquare, delay: "Real-time", type: "Engagement" },
];

export default function APIIntegrations() {
    return (
        <div className="p-8 space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Globe className="w-6 h-6 text-blue-600" />
                        <span className="text-xs font-bold  tracking-widest text-slate-400">Ecosystem & Bridges</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">API & Integrations</h1>
                    <p className="text-sm font-medium text-slate-500">Connect your store with high-performance external services and tools.</p>
                </div>
                <Button className="h-11 px-6 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-600/10 transition-all gap-2">
                    <Key className="w-4 h-4" /> Generate Access Key
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {connectors.map((c, i) => (
                    <div key={i} className="group bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner border border-slate-100">
                                <c.icon className="w-7 h-7" />
                            </div>
                            <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold  tracking-widest border border-emerald-100 shadow-sm">
                                {c.status}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-blue-600  tracking-widest">{c.type}</p>
                                <h3 className="text-2xl font-bold text-slate-900 leading-none tracking-tight">{c.name}</h3>
                            </div>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed ">"{c.desc}"</p>

                            <div className="pt-8 flex justify-between items-center border-t border-slate-50">
                                <span className="text-[9px] font-bold text-slate-400  tracking-widest flex items-center gap-2">
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow opacity-40 text-blue-600" /> Latency: {c.delay}
                                </span>
                                <Button variant="ghost" className="h-10 px-5 text-[10px] font-bold  tracking-widest text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all gap-2">
                                    Configure Proxy <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Helper Card */}
            <div className="bg-slate-900 rounded-[32px] p-12 text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Smartphone className="w-64 h-64 -rotate-12 translate-x-12 translate-y-12" />
                </div>
                <div className="relative z-10 space-y-6 max-w-xl">
                    <h2 className="text-3xl font-bold tracking-tight">Need a custom connector?</h2>
                    <p className="text-slate-400 font-medium text-lg leading-relaxed">Our SDK allows you to build custom integrations for your unique business logic and requirements.</p>
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
