import { Zap, Key, Link as LinkIcon, RefreshCw, ShieldCheck, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const connectors = [
    { name: "ShipRocket", desc: "Logistics & Tracking Sync", status: "Connected", icon: LinkIcon, delay: "Real-time" },
    { name: "Razorpay", desc: "Payment Gateway Core", status: "Active", icon: ShieldCheck, delay: "Instantly" },
    { name: "Google Analytics 4", desc: "Behavioral Tracking", status: "Live", icon: Zap, delay: "5 mins" },
    { name: "WhatsApp Business API", desc: "automated notifications", status: "Authorized", icon: LinkIcon, delay: "Real-time" },
];

export default function APIIntegrations() {
    return (
        <div className="p-8 space-y-12">
            <div className="flex justify-between items-end border-b border-slate-100 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Zap className="w-6 h-6 text-[#f97316]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#14532d]/40">External Connectivity</span>
                    </div>
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase text-[#14532d]">API & <br /><span className="text-slate-200">Integrations</span></h1>
                </div>
                <Button className="h-16 px-10 rounded-2xl bg-[#14532d] hover:bg-[#14532d]/90 font-black uppercase tracking-widest text-[10px]">
                    <Key className="w-4 h-4 mr-3" /> Generate API Key
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {connectors.map((c, i) => (
                    <div key={i} className="bg-white p-10 rounded-[48px] border border-slate-50 shadow-sm group hover:shadow-2xl hover:shadow-[#14532d]/5 transition-all">
                        <div className="flex justify-between items-start mb-8">
                            <div className="w-16 h-16 rounded-[24px] bg-[#fafaf9] flex items-center justify-center text-[#14532d] group-hover:bg-[#14532d] group-hover:text-white transition-all shadow-inner border border-slate-50">
                                <c.icon className="w-7 h-7" />
                            </div>
                            <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {c.status}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black text-[#14532d] uppercase tracking-tight">{c.name}</h3>
                            <p className="text-slate-400 font-medium italic">{c.desc}</p>
                            <div className="pt-6 flex justify-between items-center border-t border-slate-50">
                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                    <RefreshCw className="w-3 h-3 animate-spin-slow" /> Latency: {c.delay}
                                </span>
                                <Button variant="ghost" className="h-10 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl">
                                    Configure <ExternalLink className="w-3 h-3 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
