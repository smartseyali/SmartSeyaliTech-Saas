import { useNavigate } from "react-router-dom";
import { 
    GitPullRequest, CheckCircle2, ShieldCheck, 
    AlarmClock, Settings, LayoutGrid, 
    ChevronRight, ArrowUpRight, Activity,
    Flame, Zap, Binary
} from "lucide-react";
import { motion } from "framer-motion";

const WORKFLOW_STATS = [
    { label: "Pending Approvals", value: "14", icon: <AlarmClock className="text-amber-500" />, trend: "+2 today" },
    { label: "Authorized Access", value: "1,204", icon: <CheckCircle2 className="text-emerald-500" />, trend: "98% success" },
    { label: "Active Pipelines", value: "8", icon: <Binary className="text-indigo-500" />, trend: "Governance active" }
];

const WORKFLOW_NODES = [
    {
        title: "Authorization",
        items: [
            { id: 'approvals', name: 'Approval Matrix', icon: <ShieldCheck />, route: '/apps/workflow/approvals', desc: 'Authorize system resource requests' },
            { id: 'design', name: 'Workflow Designer', icon: <GitPullRequest />, route: '/apps/workflow/designer', desc: 'Design multi-level transition logic' }
        ]
    },
    {
        title: "Operational Monitoring",
        items: [
            { id: 'logs', name: 'Transition Logs', icon: <Activity />, route: '/apps/workflow/logs', desc: 'Audit historical state transitions' },
            { id: 'settings', name: 'Governance Settings', icon: <Settings />, route: '/apps/workflow/settings', desc: 'Global approval timeouts & rules' }
        ]
    }
];

export default function WorkflowDashboard() {
    const navigate = useNavigate();

    return (
        <div className="p-8 space-y-12 animate-in fade-in duration-700">
            {/* Header Matrix */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Zap className="w-6 h-6 text-indigo-600 fill-indigo-600/10" />
                        <span className="text-xs font-semibold text-slate-500">Governance Engine</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900">Workflow Control</h1>
                    <p className="text-sm font-medium text-slate-500 max-w-xl">Centralized authorization and protocol enforcement node for all enterprise lifecycle events.</p>
                </div>

                <div className="flex gap-4">
                    {WORKFLOW_STATS.map((stat, i) => (
                        <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm flex flex-col items-center text-center min-w-[160px]">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4">{stat.icon}</div>
                            <span className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</span>
                            <span className="text-[10px] font-medium text-slate-500 mt-1">{stat.label}</span>
                            <span className="text-[9px] font-bold text-emerald-600 mt-2">{stat.trend}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hub Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {WORKFLOW_NODES.map((sector, idx) => (
                    <div key={idx} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-6 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                            <h2 className="text-xs font-bold text-slate-500">{sector.title}</h2>
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
                                            <h3 className="text-[15px] font-bold text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">{node.name}</h3>
                                            <p className="text-[11px] font-medium text-slate-500 mt-2">{node.desc}</p>
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

            {/* Recent Activity Mini-Feed */}
            <div className="p-10 bg-slate-900 rounded-[3rem] text-white overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                    <Activity size={120} />
                </div>
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                            <span className="text-[10px] font-semibold text-slate-400">Live Transition Feed</span>
                        </div>
                        <h4 className="text-xl font-bold">System State Metrics</h4>
                    </div>
                    <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-[10px] font-bold transition-all">
                        View Audit Ledger
                    </button>
                </div>
            </div>
        </div>
    );
}
