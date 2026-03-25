import { motion } from "framer-motion";
import {
    FileText, PenTool, Menu, Globe,
    ArrowRight, Plus, Search, CheckCircle2,
    Zap, Eye, BarChart, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function OverviewTab({ stats, onTabChange }: { stats: any, onTabChange: (tab: any) => void }) {
    return (
        <div className="space-y-12 animate-in slide-in-from-bottom-4 duration-500 font-sans">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: "Active Pages", value: stats.totalPages, icon: FileText, sub: "Content Layouts", tab: "pages" },
                    { label: "Blog Posts", value: stats.blogPosts, icon: PenTool, sub: "Latest Articles", tab: "blog" },
                    { label: "Nav Menus", value: stats.activeMenus, icon: Menu, sub: "Header & Footer", tab: "navigation" },
                    { label: "Total Visits", value: "2.4k", icon: Globe, sub: "Storefront Traffic", tab: "overview" },
                ].map((k, i) => (
                    <motion.div
                        key={k.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        onClick={() => onTabChange(k.tab)}
                        className="p-8 bg-white border border-border rounded-[24px] shadow-sm group hover:shadow-lg hover:shadow-[#14532d]/5 transition-all duration-300 relative overflow-hidden cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-12 h-12 bg-slate-50 border-l border-b rounded-bl-2xl flex items-center justify-center text-slate-300 group-hover:bg-[#14532d] group-hover:text-white transition-all">
                            <k.icon className="w-5 h-5" />
                        </div>
                        <p className="text-4xl font-bold tracking-tight text-[#14532d] mb-1 ">{k.value}</p>
                        <p className="text-[13px] font-bold  tracking-widest text-[#f97316]">{k.label}</p>
                        <p className="text-xs font-medium text-slate-500 mt-3">{k.sub}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Recent Content */}
                <div className="lg:col-span-8 bg-white border rounded-[32px] p-8 md:p-10 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-10 border-b border-border pb-8">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[#14532d] font-bold  tracking-widest text-xs">Merchant Intelligence</span>
                            </div>
                            <h2 className="text-2xl font-bold text-[#14532d]">Latest <span className="text-slate-200 ">Pages</span></h2>
                        </div>
                        <Button
                            onClick={() => onTabChange("pages")}
                            variant="ghost" className="text-xs font-bold  tracking-widest text-[#14532d]/60 hover:text-[#14532d] hover:bg-[#14532d]/5"
                        >
                            Manage All Pages
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {["Home Page", "Product Collections", "Our Organic Story", "Shipping & Delivery", "Contact Us"].map((p, idx) => (
                            <div key={p}
                                onClick={() => onTabChange("pages")}
                                className="flex items-center justify-between p-6 bg-[#f8fafc] rounded-2xl border border-transparent hover:border-[#14532d]/20 hover:bg-white transition-all group/item cursor-pointer">
                                <div className="flex items-center gap-6">
                                    <span className="text-3xl font-bold text-[#14532d]/10 group-hover/item:text-[#f97316] transition-colors">{idx + 1}</span>
                                    <div>
                                        <p className="font-bold text-base text-[#14532d] group-hover/item:translate-x-1 transition-transform">{p}</p>
                                        <p className="text-xs font-medium text-slate-500  tracking-widest mt-0.5">Updated 2 days ago</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#14532d]/20 group-hover/item:text-[#14532d] group-hover/item:translate-x-1 transition-all" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-[#14532d] p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full" />
                        <h2 className="text-xl font-bold  mb-1">Quick Actions</h2>
                        <p className="text-xs font-bold text-white/40  tracking-widest mb-8 border-b border-white/5 pb-4">Manage your storefront</p>

                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: "Add Page", icon: Plus, tab: "pages" },
                                { label: "Write Blog", icon: PenTool, tab: "blog" },
                                { label: "Edit Menu", icon: Menu, tab: "navigation" },
                                { label: "SEO Settings", icon: Search, tab: "settings" },
                            ].map((a, i) => (
                                <button key={a.label}
                                    onClick={() => onTabChange(a.tab)}
                                    className="flex flex-col items-center justify-center p-6 bg-white/10 rounded-2xl border border-white/10 hover:bg-white hover:text-[#14532d] transition-all duration-300 group/btn">
                                    <a.icon className="w-5 h-5 mb-3 group-hover/btn:scale-110 transition-transform" />
                                    <span className="text-xs font-bold  tracking-widest whitespace-nowrap">{a.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border rounded-[24px] p-6 flex items-center gap-6 shadow-sm group">
                        <div className="w-14 h-14 bg-[#f97316]/10 rounded-2xl flex items-center justify-center text-[#f97316] group-hover:bg-[#f97316] group-hover:text-white transition-all shadow-inner">
                            <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="font-bold text-[#14532d]">Platform Active</p>
                            <p className="text-xs font-bold text-slate-500  tracking-widest">Storefront optimized</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
