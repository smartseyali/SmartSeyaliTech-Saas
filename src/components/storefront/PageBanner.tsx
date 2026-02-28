import { useDynamicContent } from "@/hooks/useDynamicContent";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PageBannerProps {
    position: string;         // e.g. "shop_header", "cart_top", "checkout_top"
    height?: string;          // e.g. "h-48", "h-64"
    className?: string;
    autoPlay?: boolean;
}

/**
 * PageBanner — a reusable banner strip that pulls from ecom_banners
 * by `position` value. Drop anywhere across any storefront page.
 */
export function PageBanner({ position, height = "h-48", className, autoPlay = true }: PageBannerProps) {
    const { data: banners, loading } = useDynamicContent("HOME_PAGE", position as any);
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!autoPlay || banners.length <= 1) return;
        const t = setInterval(() => setCurrent(p => (p + 1) % banners.length), 5000);
        return () => clearInterval(t);
    }, [banners.length, autoPlay]);

    if (loading || banners.length === 0) return null;

    return (
        <div className={cn("relative overflow-hidden rounded-3xl shadow-md w-full", height, className)}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    <img
                        src={banners[current].image_url}
                        alt={banners[current].title || "Banner"}
                        className="w-full h-full object-cover"
                    />
                    {/* Overlay */}
                    <div
                        className="absolute inset-0"
                        style={{ background: `rgba(0,0,0,${(banners[current].overlay_opacity ?? 30) / 100})` }}
                    />

                    {/* Text Content */}
                    {(banners[current].title || banners[current].badge_text) && (
                        <div className="absolute inset-0 flex items-center px-10">
                            <div className="text-white space-y-3 max-w-lg">
                                {banners[current].badge_text && (
                                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-[10px] font-bold uppercase tracking-widest">
                                        {banners[current].badge_text}
                                    </span>
                                )}
                                {banners[current].title && (
                                    <h3 className="text-2xl md:text-3xl font-black leading-tight">
                                        {banners[current].title}
                                    </h3>
                                )}
                                {banners[current].subtitle && (
                                    <p className="text-white/80 text-sm">{banners[current].subtitle}</p>
                                )}
                                {banners[current].button_text && banners[current].button_link && (
                                    <a
                                        href={banners[current].button_link}
                                        className="inline-block mt-2 px-6 py-2.5 bg-white text-slate-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors"
                                    >
                                        {banners[current].button_text}
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Dot indicators */}
                    {banners.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                            {banners.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrent(i)}
                                    className={cn(
                                        "h-1 transition-all duration-500 rounded-full",
                                        i === current ? "w-8 bg-white" : "w-2 bg-white/40"
                                    )}
                                />
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
