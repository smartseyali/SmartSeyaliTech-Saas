import { useState } from "react";
import {
    GitBranch, Map, Filter, Plus,
    MoreHorizontal, ArrowRight, TrendingUp,
    Target, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Pipelines() {
    const pipelines = [
        {
            name: "Direct Sales",
            stages: ["Leads", "Meeting", "Proposal", "Negotiation", "Closed"],
            metrics: { active: 45, value: 854000 }
        },
        {
            name: "Channel Partners",
            stages: ["Partner Referral", "Discovery", "Joint Proposal", "Closing"],
            metrics: { active: 12, value: 2450000 }
        }
    ];

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10 border-b border-slate-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <GitBranch className="w-6 h-6 text-violet-600" />
                        <span className="text-xs font-bold  tracking-widest text-slate-500">Workflow Engine</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-slate-900  ">Sales Pipelines</h1>
                    <p className="text-sm font-medium text-slate-500">Configure your deal stages and visual workflows.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button className="h-12 px-8 rounded-2xl bg-violet-600 hover:bg-black text-white font-bold shadow-xl shadow-violet-600/20 transition-all gap-3 border-0">
                        <Plus className="w-5 h-5" /> Create Pipeline
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {pipelines.map(pipe => (
                    <div key={pipe.name} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden hover:shadow-xl transition-all p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">{pipe.name}</h3>
                                <div className="flex items-center gap-4 text-xs font-bold text-slate-500  tracking-widest">
                                    <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> {pipe.metrics.active} Deals</span>
                                    <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" /> ₹{(pipe.metrics.value / 100000).toFixed(1)}L Value</span>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-xl"><MoreHorizontal className="w-5 h-5" /></Button>
                        </div>

                        <div className="flex items-center gap-4">
                            {pipe.stages.map((stage, idx) => (
                                <div key={stage} className="flex-1 flex items-center gap-4 group">
                                    <div className="flex-1 p-4 rounded-2xl bg-slate-50 border border-slate-100 group-hover:border-violet-200 group-hover:bg-violet-50 transition-all text-center">
                                        <p className="text-xs font-bold  tracking-widest text-slate-500 group-hover:text-violet-600 mb-1">{idx + 1}</p>
                                        <p className="text-xs font-bold text-slate-900">{stage}</p>
                                    </div>
                                    {idx < pipe.stages.length - 1 && (
                                        <ArrowRight className="w-4 h-4 text-slate-200" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
