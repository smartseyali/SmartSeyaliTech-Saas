import { useNavigate } from "react-router-dom";
import { 
    Package, Users, Tag, ShieldCheck, 
    Globe, Building2, CreditCard, Clock,
    Scale, UserCheck, Briefcase, LayoutGrid,
    Library, MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";

const MASTER_NODES = [
    {
        title: "Operational Resources",
        items: [
            { id: 'items', name: 'Item Registry', icon: <Package />, route: '/apps/masters/items', desc: 'Unified product & service catalog' },
            { id: 'categories', name: 'Category Matrix', icon: <LayoutGrid />, route: '/apps/masters/categories', desc: 'Structural node classification' },
            { id: 'brands', name: 'Brand Identities', icon: <ShieldCheck />, route: '/apps/masters/brands', desc: 'Corporate brand management' },
            { id: 'uoms', name: 'UOM Protocols', icon: <Scale />, route: '/apps/masters/uoms', desc: 'Universal dimension normalization' }
        ]
    },
    {
        title: "Catalog Engineering",
        items: [
            { id: 'attributes', name: 'Attribute Matrix', icon: <Tag />, route: '/apps/masters/attributes', desc: 'Variation identity protocols' },
            { id: 'variants', name: 'Variant Registry', icon: <Library />, route: '/apps/masters/variants', desc: 'SKU & attribute mapping hub' },
            { id: 'reviews', name: 'Feedback Moderation', icon: <MessageSquare />, route: '/apps/masters/reviews', desc: 'Consumer narrative governance' }
        ]
    },
    {
        title: "Entity Management",
        items: [
            { id: 'contacts', name: 'Unified Contacts', icon: <Users />, route: '/apps/masters/contacts', desc: 'Customers, Vendors & Strategic Leads' },
            { id: 'departments', name: 'Organizational Nodes', icon: <Building2 />, route: '/apps/masters/departments', desc: 'Branch & department hierarchy' }
        ]
    }
];

export default function RegistryDashboard() {
    const navigate = useNavigate();

    return (
        <div className="p-8 space-y-12 animate-in fade-in duration-700">
            {/* Header Matrix */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Building2 className="w-6 h-6 text-slate-900" />
                        <span className="text-xs font-black uppercase tracking-[0.4em] text-slate-400">Foundation Layer</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 uppercase italic">Master Registry</h1>
                    <p className="text-sm font-medium text-slate-500">The centralized structural hub for all platform operations and resource identities.</p>
                </div>
            </div>

            {/* Hub Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {MASTER_NODES.map((sector, idx) => (
                    <div key={idx} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-1.5 h-6 bg-slate-900 rounded-full" />
                            <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{sector.title}</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {sector.items.map((node) => (
                                <motion.div
                                    key={node.id}
                                    whileHover={{ x: 8 }}
                                    onClick={() => navigate(node.route)}
                                    className="p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-xl transition-all group cursor-pointer flex items-center gap-6"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500">
                                        {node.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-[13px] font-bold text-slate-900 uppercase italic leading-none group-hover:text-slate-900">{node.name}</h3>
                                        <p className="text-[10px] font-medium text-slate-400 mt-2 uppercase tracking-widest">{node.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
