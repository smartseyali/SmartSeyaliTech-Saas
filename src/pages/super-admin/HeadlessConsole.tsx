import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
    Zap, Code, Globe, ShieldCheck, Copy,
    RefreshCw, Plus, Trash2, CheckCircle2,
    Database, Network, ExternalLink, Cpu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function HeadlessConsole() {
    const { toast } = useToast();
    const [companies, setCompanies] = useState<any[]>([]);
    const [configList, setConfigList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        setLoading(true);
        try {
            const [compRes, confRes] = await Promise.all([
                supabase.from("companies").select("id, name, subdomain"),
                supabase.from("headless_configs").select("*")
            ]);
            setCompanies(compRes.data || []);
            setConfigList(confRes.data || []);
        } catch (err) {
            console.error("Headless Fetch Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied!", description: "API Configuration copied to clipboard." });
    };

    const generateSnippet = (config: any) => {
        return `// BeliBeli Headless Connector
fetch('https://api.belibeli.com/v1/content', {
  method: 'POST',
  headers: { 'X-API-KEY': '${config.api_key}' },
  body: JSON.stringify({ 
    screen: '${config.screen_id}', 
    section: '${config.section_id}' 
  })
})`;
    };

    return (
        <div className="p-10 space-y-10 animate-in fade-in duration-700 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tighter ">Headless <span className="text-indigo-600 ">API</span> Console</h1>
                            <p className="text-[10px] font-bold  tracking-widest text-muted-foreground opacity-60">Connector Path Management • Super Admin Only</p>
                        </div>
                    </div>
                </div>
                <Button className="h-14 px-8 rounded-2xl font-bold text-xs  tracking-widest bg-indigo-600 shadow-xl shadow-indigo-600/20 gap-3">
                    <Plus className="w-5 h-5" /> Architect New Path
                </Button>
            </div>

            {/* Info Card */}
            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
                <div className="relative z-10 space-y-4 max-w-2xl">
                    <h2 className="text-3xl font-bold leading-tight ">Empower companies with "Backend-as-a-Service".</h2>
                    <p className="text-sm font-medium opacity-80 leading-relaxed">
                        Use this console to connect external frontends to the BeliBeli engine.
                        Super Admins can map custom UI sections to our institutional database tables,
                        providing a robust backend for websites without their own logic.
                    </p>
                </div>
                <div className="shrink-0 relative z-10">
                    <div className="w-32 h-32 rounded-full border-4 border-white/20 flex items-center justify-center animate-pulse">
                        <Cpu className="w-16 h-16 opacity-50" />
                    </div>
                </div>
                <Network className="absolute -right-20 -bottom-20 w-96 h-96 opacity-10 text-white" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-card rounded-[2.5rem] border border-border p-8 shadow-xl shadow-black/5">
                        <h3 className="text-lg font-bold tracking-tight mb-6 flex items-center gap-2   text-indigo-600">
                            <Globe className="w-5 h-5" /> Institutional Roster
                        </h3>
                        <div className="space-y-3">
                            {companies.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedCompany(c.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between p-5 rounded-2xl border-2 transition-all group",
                                        selectedCompany === c.id ? "border-indigo-600 bg-indigo-600/5 text-indigo-600" : "border-border/50 hover:border-indigo-600/30"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-secondary group-hover:bg-indigo-600/10 flex items-center justify-center font-bold text-xs transition-colors">
                                            {c.name[0]}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-xs tracking-tight">{c.name}</p>
                                            <p className="text-[9px] font-medium opacity-50  tracking-widest">{c.subdomain}</p>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        selectedCompany === c.id ? "bg-indigo-600 scale-125 shadow-[0_0_10px_rgba(79,70,229,0.5)]" : "bg-border group-hover:bg-indigo-600/30"
                                    )} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-black rounded-[2.5rem] p-8 text-white space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-400" />
                            <h4 className="text-xs font-bold  tracking-widest">Master API Status</h4>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold opacity-50  tracking-widest">Global Endpoint</p>
                            <code className="text-[10px] font-mono text-indigo-300 break-all">https://api.belibeli.com/v1/headless</code>
                        </div>
                        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[9px] font-bold  tracking-widest text-emerald-400 flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Systems Nominal
                            </span>
                            <span className="text-[9px] font-bold  tracking-widest opacity-40">v2.4.0-stable</span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-card rounded-[2.5rem] border border-border p-10 shadow-xl shadow-black/5 min-h-[500px]">
                        {!selectedCompany ? (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-20 opacity-40">
                                <Code className="w-16 h-16" />
                                <p className="font-bold text-sm  tracking-widest">Select a Merchant to manage API Paths</p>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in slide-in-from-bottom-5 duration-500">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xl font-bold tracking-tighter ">API Configurations</h3>
                                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-[9px] font-bold  tracking-widest">
                                        <ShieldCheck className="w-3 h-3" /> Secure Endpoint
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {configList.filter(cf => cf.company_id === selectedCompany).length === 0 ? (
                                        <div className="p-10 border-2 border-dashed border-border rounded-3xl text-center">
                                            <p className="text-muted-foreground font-medium ">No paths architected for this merchant yet.</p>
                                        </div>
                                    ) : (
                                        configList.filter(cf => cf.company_id === selectedCompany).map(config => (
                                            <div key={config.id} className="p-8 rounded-[2rem] bg-secondary/20 border border-border/50 space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-sm border border-border/50">
                                                            <Database className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-sm  tracking-tight">{config.section_id}</p>
                                                            <p className="text-[10px] text-muted-foreground font-bold ">Mapping: {config.screen_id} → {config.mapping_config?.table || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Button variant="ghost" size="icon" className="rounded-xl"><RefreshCw className="w-4 h-4 text-muted-foreground" /></Button>
                                                        <Button variant="ghost" size="icon" className="rounded-xl hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                                                    </div>
                                                </div>

                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-bold  tracking-widest text-indigo-600 ml-1">Frontend Implementation Path</p>
                                                    <div className="relative group">
                                                        <pre className="p-6 rounded-2xl bg-black text-indigo-400 text-[11px] font-mono overflow-x-auto border-2 border-indigo-600/20">
                                                            {generateSnippet(config)}
                                                        </pre>
                                                        <button
                                                            onClick={() => copyToClipboard(generateSnippet(config))}
                                                            className="absolute top-4 right-4 p-2 rounded-xl bg-indigo-600 text-white opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4 text-[10px] font-bold  tracking-widest opacity-50">
                                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> CORS Enabled</span>
                                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> SSL Active</span>
                                                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Rate Limited</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
