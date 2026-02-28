import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Zap, Image as ImageIcon, Sparkles,
    ArrowRight, Save, ShieldCheck,
    RefreshCw, Trash2, Plus, Leaf, Trash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaUpload } from "@/components/common/MediaUpload";

export function HeroEditor({ banner, onChange, onDelete }: { banner: any, onChange: (b: any) => void, onDelete?: () => void }) {
    return (
        <section className="bg-white border rounded-[32px] p-6 md:p-10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1.5 h-full bg-[#14532d]/10 group-hover:bg-[#f97316] transition-colors duration-500" />

            <div className="flex flex-col md:flex-row md:items-start justify-between mb-12 gap-6 pb-8 border-b border-border">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-[#f97316]" />
                        <span className="text-[#14532d]/40 font-bold uppercase tracking-widest text-[10px]">Home Page Header</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#14532d] leading-none">Banner <span className="text-[#14532d]/20 italic">Slide</span></h2>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#14532d] text-white rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-12 shadow-lg shadow-[#14532d]/20">
                        <Sparkles className="w-5 h-5 text-[#f97316]" />
                    </div>
                    {onDelete && (
                        <Button variant="ghost" size="icon" onClick={onDelete} className="w-12 h-12 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all">
                            <Trash className="w-5 h-5" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Fields */}
                <div className="lg:col-span-4 space-y-8">
                    <MediaUpload
                        value={banner?.image_url || ""}
                        onChange={val => onChange({ ...banner, image_url: val })}
                        label="Banner Canvas"
                        folder="hero"
                    />

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#14532d]/40 ml-1">Main Heading</label>
                            <input
                                value={banner?.title || ""}
                                onChange={(e) => onChange({ ...banner, title: e.target.value })}
                                placeholder="e.g. Special Offer"
                                className="w-full h-12 px-5 bg-[#f8fafc] border border-border rounded-xl focus:border-[#14532d] focus:bg-white transition-all outline-none font-bold text-sm text-[#14532d]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#14532d]/40 ml-1">Subtext / Description</label>
                            <input
                                value={banner?.subtitle || ""}
                                onChange={(e) => onChange({ ...banner, subtitle: e.target.value })}
                                placeholder="e.g. Save 50% today"
                                className="w-full h-12 px-5 bg-[#f8fafc] border border-border rounded-xl focus:border-[#14532d] focus:bg-white transition-all outline-none font-bold text-sm text-[#14532d]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#14532d]/40 ml-1">Badge Label</label>
                            <input
                                value={banner?.badge_text || ""}
                                onChange={(e) => onChange({ ...banner, badge_text: e.target.value })}
                                placeholder="e.g. New Launch"
                                className="w-full h-12 px-5 bg-[#f8fafc] border border-border rounded-xl focus:border-[#14532d] focus:bg-white transition-all outline-none font-bold text-sm text-[#14532d]"
                            />
                        </div>
                    </div>
                </div>

                {/* Preview */}
                <div className="lg:col-span-8">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#14532d]/40 ml-1 mb-2 block">Live Rendering Manifest</label>
                    <div className="relative aspect-[16/9] bg-[#f8fafc] rounded-[32px] border border-border shadow-2xl overflow-hidden group/viz">
                        <img
                            src={banner?.image_url || "https://images.unsplash.com/photo-1549439602-43ebca2327af?w=1600"}
                            className="w-full h-full object-cover group-hover/viz:scale-105 transition-transform duration-[4s]"
                        />
                        <div className="absolute inset-0 bg-[#0a2e18]/40 p-8 md:p-16 flex flex-col justify-end">
                            <div className="max-w-xl space-y-6">
                                {banner?.badge_text && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white bg-[#f97316] w-fit px-4 py-1.5 rounded-full shadow-lg shadow-[#f97316]/20">
                                        {banner.badge_text}
                                    </span>
                                )}
                                <h3 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase leading-[0.9] italic">
                                    {banner?.title || "Crafted with Nature"}
                                </h3>
                                <p className="text-sm md:text-lg text-white/90 font-medium italic max-w-lg leading-relaxed border-l-2 border-[#f97316] pl-6">
                                    {banner?.subtitle || "Experience the finest organic selections delivered to your door."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
