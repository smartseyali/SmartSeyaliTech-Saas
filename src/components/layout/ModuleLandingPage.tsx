import { Link } from "react-router-dom";
import { 
    ChevronRight, Plus, MoreHorizontal, LucideIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface QuickAccessCard {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    color: string;
    onClick?: () => void;
}

export interface GridItem {
    label: string;
    url: string;
    icon?: LucideIcon;
}

export interface GridSection {
    id: string;
    label: string;
    icon: LucideIcon;
    color: string;
    items: GridItem[];
}

interface ModuleLandingPageProps {
    title: string;
    subtitle: string;
    quickAccess: QuickAccessCard[];
    sections: GridSection[];
}

export default function ModuleLandingPage({ title, subtitle, quickAccess, sections }: ModuleLandingPageProps) {
    return (
        <div className="max-w-[1600px] mx-auto p-12">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-16">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">{title}</h1>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                        <p className="text-xs font-bold tracking-widest text-slate-500 uppercase">{subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" className="h-11 px-6 rounded-2xl border-slate-200 font-bold text-[13px] tracking-widest uppercase gap-2">
                        <MoreHorizontal className="w-4 h-4" /> Customize
                    </Button>
                </div>
            </div>

            {/* Top Quick Access */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {quickAccess.map((card, idx) => (
                    <div 
                        key={idx} 
                        onClick={card.onClick}
                        className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm flex items-center justify-between group hover:border-indigo-200 transition-all cursor-pointer overflow-hidden relative"
                    >
                        <div className="flex items-center gap-6 relative z-10">
                            <div className={cn("w-14 h-14 rounded-3xl flex items-center justify-center", card.color)}>
                                <card.icon className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                                <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">{card.subtitle}</p>
                            </div>
                        </div>
                        <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-indigo-600 transition-all relative z-10" />
                        <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                            <card.icon className="w-32 h-32 -rotate-12 translate-x-8 translate-y-8" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 tracking-tight uppercase tracking-wider opacity-60">Operations & Logistics</h2>
            </div>

            {/* Grid of Master Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {sections.map((group) => (
                    <div key={group.id} className="bg-white border border-slate-100/60 rounded-[3rem] p-10 shadow-sm group hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all">
                        <div className="flex items-center gap-4 mb-8">
                            <div className={cn("w-12 h-12 rounded-[1.5rem] flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12", group.color)}>
                                <group.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{group.label}</h3>
                        </div>
                        <div className="space-y-1">
                            {group.items.map((item) => (
                                <Link
                                    key={item.label}
                                    to={item.url}
                                    className="flex items-center gap-4 p-4 rounded-[1.25rem] hover:bg-slate-50 transition-all text-slate-500 hover:text-indigo-600 font-bold text-[13px] group/item"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover/item:bg-indigo-600 group-hover/item:scale-125 transition-all" />
                                    <span className="flex-1 truncate tracking-tight uppercase tracking-wider">{item.label}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
