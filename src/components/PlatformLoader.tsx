import React from "react";
import PLATFORM_CONFIG from "@/config/platform";
import { cn } from "@/lib/utils";

interface PlatformLoaderProps {
    message?: string;
    subtext?: string;
    className?: string;
    fullScreen?: boolean;
}

export const PlatformLoader = ({ 
    message = "Synchronizing Protocol", 
    subtext = "Clinical Engine Core Init",
    className,
    fullScreen = true
}: PlatformLoaderProps) => {
    return (
        <div className={cn(
            "flex flex-col items-center justify-center bg-slate-50/80 backdrop-blur-md transition-all duration-700",
            fullScreen ? "fixed inset-0 z-[10000] h-screen w-full" : "h-full w-full py-12",
            className
        )}>
            <div className="relative group">
                {/* Visual Identity Pulse */}
                <div className="absolute inset-0 bg-primary-600/10 blur-[80px] rounded-full animate-pulse group-hover:bg-primary-500/20 transition-all duration-1000" />
                
                {/* Clinical Logo Node */}
                <div className="relative mb-8 transform hover:scale-110 transition-transform duration-500">
                    <div className="absolute -inset-4 bg-white/50 backdrop-blur-2xl rounded-[2rem] border border-white/50 shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <img 
                        src="/logo.png" 
                        alt={PLATFORM_CONFIG.name} 
                        className="w-24 h-24 object-contain relative z-10 animate-bounce"
                        style={{ animationDuration: '3s' }}
                    />
                    
                    {/* Ring Orbits */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border-2 border-primary-600/5 rounded-full animate-ping" style={{ animationDuration: '4s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-primary-600/5 rounded-full animate-ping" style={{ animationDuration: '6s' }} />
                </div>
            </div>

            <div className="flex flex-col items-center text-center space-y-3 relative z-10">
                <span className="text-[12px] font-black uppercase tracking-[0.6em] text-slate-800 animate-pulse">
                    {PLATFORM_CONFIG.name} <span className="text-primary-600">Enterprise</span>
                </span>
                
                <div className="flex items-center gap-4">
                    <div className="h-px w-8 bg-slate-200" />
                    <div className="flex gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-600 animate-bounce" />
                    </div>
                    <div className="h-px w-8 bg-slate-200" />
                </div>

                <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 italic">
                        {message}
                    </p>
                    {subtext && (
                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary-500/60 transition-all">
                            {subtext}
                        </p>
                    )}
                </div>
            </div>

            {/* Platform Spec Indicator */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 opacity-20 grayscale hover:opacity-100 transition-all duration-700">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Tier</span>
                    <span className="text-[10px] font-black uppercase text-slate-900 italic">L1-Security</span>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Node</span>
                    <span className="text-[10px] font-black uppercase text-slate-900 italic">Universal-Core</span>
                </div>
                <div className="w-px h-6 bg-slate-200" />
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">Async</span>
                    <span className="text-[10px] font-black uppercase text-slate-900 italic">Enabled</span>
                </div>
            </div>
        </div>
    );
};
