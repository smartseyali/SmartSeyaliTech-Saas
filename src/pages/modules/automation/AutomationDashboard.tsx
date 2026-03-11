import { useNavigate } from "react-router-dom";
import { 
    Zap, Cpu, Binary, 
    Activity, Clock, Settings, 
    LayoutGrid, ChevronRight, 
    ArrowUpRight, Server, Terminal,
    Database, Network, Power
} from "lucide-react";
import { motion } from "framer-motion";

const AUTOMATION_STATS = [
    { label: "Active Cycles", value: "24", icon: <Zap className="text-amber-500 fill-amber-500/10" />, trend: "Real-time" },
    { label: "Execution Success", value: "99.2%", icon: <Activity className="text-emerald-500" />, trend: "Last 24h" },
    { label: "Compute Load", value: "12%", icon: <Cpu className="text-blue-500" />, trend: "Optimized" }
];

const AUTOMATION_NODES = [
    {
        title: "Orchestration Layer",
        items: [
            { id: 'jobs', name: 'Automation Cycles', icon: <Binary />, route: '/apps/automation/jobs', desc: 'Manage background cron protocols' },
            { id: 'triggers', name: 'Event Triggers', icon: <Zap />, route: '/apps/automation/triggers', desc: 'Webhooks & reactive data nodes' }
        ]
    },
    {
        title: "System Telemetry",
        items: [
            { id: 'logs', name: 'Execution Ledger', icon: <Terminal />, route: '/apps/automation/logs', desc: 'Audit historical job performance' },
            { id: 'nodes', name: 'Processing Nodes', icon: <Server />, route: '/apps/automation/nodes', desc: 'Distributed compute cluster health' }
        ]
    }
];

export default function AutomationDashboard() {
    const navigate = useNavigate();

    return (
        <div className="p-8 space-y-12 animate-in fade-in duration-700">
            {/* Header Matrix */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Power className="w-6 h-6 text-indigo-600 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Enterprise Orchestrator</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Automation Hub</h1>
                    <p className="text-sm font-medium text-slate-500 max-w-xl">Centralized command center for distributed background cycles, data synchronization, and systemic protocols.</p>
                </div>

                <div className="flex gap-4">
                    {AUTOMATION_STATS.map((stat, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col items-center text-center min-w-[160px]">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4">{stat.icon}</div>
                            <span className="text-2xl font-black text-slate-900 tracking-tighter">{stat.value}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">{stat.label}</span>
                            <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest mt-2">{stat.trend}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hub Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {AUTOMATION_NODES.map((sector, idx) => (
                    <div key={idx} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{sector.title}</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {sector.items.map((node) => (
                                <motion.div
                                    key={node.id}
                                    whileHover={{ x: 8, scale: 1.01 }}
                                    onClick={() => navigate(node.route)}
                                    className="p-8 bg-white border border-slate-100 rounded-[2.5rem] hover:shadow-2xl transition-all group cursor-pointer flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                            {node.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-[15px] font-bold text-slate-900 uppercase italic leading-none group-hover:text-indigo-600 transition-colors">{node.name}</h3>
                                            <p className="text-[11px] font-medium text-slate-400 mt-2 uppercase tracking-widest">{node.desc}</p>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                        <ChevronRight size={18} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* System Health Pulse */}
            <div className="p-10 bg-indigo-950 rounded-[3rem] text-white overflow-hidden relative group border-t border-white/10">
                <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
                    <Network size={240} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300">Cluster Identity: NODE-ALPHA-01</span>
                        </div>
                        <h4 className="text-2xl font-bold uppercase italic tracking-tight">System Orchestration Active</h4>
                        <p className="text-xs text-indigo-200/60 font-medium uppercase tracking-widest">Next systemic synchronization cycle: T - 04:12m</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="px-8 py-4 bg-white text-indigo-950 hover:bg-indigo-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-white/5">
                            View Cluster Metrics
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
