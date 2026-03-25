import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    RefreshCw, Save, Image as ImageIcon,
    ShieldCheck, Zap, Globe, Palette,
    ExternalLink, Lock, Settings2, SlidersHorizontal, ArrowRight,
    Leaf, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDataConnector } from "@/hooks/useDataConnector";
import { cn } from "@/lib/utils";
import { MediaUpload } from "@/components/common/MediaUpload";

export function SettingsTab({ settings, onChange }: { settings: any, onChange: (s: any) => void }) {
    const { config, loading: connectorLoading } = useDataConnector("BRAND_IDENTITY", "core_settings");

    if (!settings || connectorLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-32">
                <Leaf className="w-12 h-12 text-[#14532d]/20 animate-bounce" />
                <p className="text-sm font-bold text-[#14532d]/40  tracking-widest mt-8">Loading Identity Settings...</p>
            </div>
        );
    }

    const handleChange = (key: string, value: any) => {
        onChange({ ...settings, [key]: value });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-4 duration-500">
            {/* Main Settings */}
            <div className="lg:col-span-8 space-y-8">
                <section className="bg-white border rounded-[24px] p-8 md:p-12 shadow-sm relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-10 border-b border-slate-50 pb-8">
                        <div className="w-10 h-10 bg-[#14532d]/10 rounded-xl flex items-center justify-center text-[#14532d]">
                            <Leaf className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[#14532d] leading-none">Brand Identity</h2>
                            <p className="text-xs font-semibold text-slate-400 mt-1  tracking-wider">Configure your store's visual manifest</p>
                        </div>
                    </div>

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-8" onSubmit={(e) => e.preventDefault()}>
                        {config?.fields
                            .filter(f => f.id !== 'primary_color')
                            .map((field) => {
                                if (field.type === "image") {
                                    return (
                                        <div key={field.id} className="space-y-4 md:col-span-2">
                                            <MediaUpload
                                                value={settings[field.id] || ""}
                                                onChange={val => handleChange(field.id, val)}
                                                label={field.label}
                                                folder="brand"
                                            />
                                        </div>
                                    );
                                }

                                return (
                                    <div key={field.id} className="space-y-3">
                                        <label className="text-xs font-bold text-[#14532d]/60  tracking-widest ml-1">{field.label}</label>
                                        <input
                                            value={settings[field.id] || ""}
                                            onChange={(e) => handleChange(field.id, e.target.value)}
                                            placeholder={`Enter ${field.label}...`}
                                            className="w-full h-12 px-5 bg-slate-50 border border-slate-200 rounded-xl focus:border-[#14532d] focus:bg-white transition-all outline-none font-bold text-sm text-[#14532d] placeholder:text-slate-300"
                                        />
                                    </div>
                                );
                            })}
                    </form>
                </section>
            </div>

            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-8">
                {/* Theme Palette */}
                <section className="bg-[#14532d] rounded-[24px] p-8 text-white shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16" />

                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                            <Palette className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight leading-none ">Store Theme</h2>
                    </div>

                    <div className="space-y-8 relative z-10">
                        <div className="space-y-4">
                            <span className="text-[10px] font-bold  tracking-widest text-white/40 block">Primary Brand Color</span>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={settings.primary_color || "#14532d"}
                                    onChange={(e) => handleChange("primary_color", e.target.value)}
                                    className="w-16 h-16 rounded-2xl border-none cursor-pointer bg-transparent"
                                />
                                <div className="flex-1 space-y-2">
                                    <label className="text-[9px] font-bold  tracking-widest text-white/30 ">HEX VALUE</label>
                                    <input
                                        type="text"
                                        value={settings.primary_color || "#14532d"}
                                        onChange={(e) => handleChange("primary_color", e.target.value)}
                                        className="w-full h-10 px-4 bg-white/10 border border-white/10 rounded-lg outline-none font-mono text-xs font-bold  tracking-widest text-white shadow-inner focus:bg-white/20 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 space-y-3 relative overflow-hidden">
                            <h4 className="flex items-center gap-2 text-[10px] font-bold  tracking-widest text-white/60">
                                <Leaf className="w-4 h-4 text-[#f97316]" /> Theme Propagation
                            </h4>
                            <p className="text-[10px] text-white/40 leading-relaxed font-medium">
                                This color will be applied globally to buttons, accents, and highlights across your storefront.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Info Card */}
                <section className="bg-white border rounded-[24px] p-8 shadow-sm space-y-6">
                    <div className="flex items-center gap-3">
                        <SlidersHorizontal className="w-5 h-5 text-[#f97316]" />
                        <h3 className="text-[11px] font-bold  tracking-widest text-[#14532d]">System Status</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                            <span className="text-[10px] font-bold text-slate-400 ">Schema Sync</span>
                            <span className="text-[10px] font-bold text-[#14532d] ">Enabled</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
                            <span className="text-[10px] font-bold text-slate-400 ">Live Preview</span>
                            <span className="text-[10px] font-bold text-[#14532d] ">Active</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
