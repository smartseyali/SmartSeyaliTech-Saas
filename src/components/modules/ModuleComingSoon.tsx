import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Zap, Bell } from "lucide-react";
import { getModule } from "@/config/modules";
import { Button } from "@/components/ui/button";

interface Props {
    moduleId: string;
}

export default function ModuleComingSoon({ moduleId }: Props) {
    const navigate = useNavigate();
    const mod = getModule(moduleId);

    if (!mod) return null;

    const isBeta = mod.status === 'beta';

    return (
        <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background glow */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{ background: `radial-gradient(circle at 50% 50%, ${mod.color}40, transparent 70%)` }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full text-center space-y-10"
            >
                {/* Back button */}
                <button
                    onClick={() => navigate('/apps')}
                    className="flex items-center gap-2 text-white/30 hover:text-white transition-colors text-[11px] font-black uppercase tracking-widest mx-auto"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to App Launcher
                </button>

                {/* Module icon */}
                <div className="flex justify-center">
                    <div
                        className="w-32 h-32 rounded-[40px] flex items-center justify-center text-6xl shadow-2xl"
                        style={{ background: `linear-gradient(135deg, ${mod.color}cc, ${mod.color}66)` }}
                    >
                        {mod.icon}
                    </div>
                </div>

                {/* Title */}
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] mb-3"
                        style={{ color: mod.color }}>
                        {isBeta ? 'Coming in Beta' : 'In Development'}
                    </p>
                    <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-none mb-4">
                        {mod.name}
                    </h1>
                    <p className="text-white/40 text-lg font-medium leading-relaxed max-w-lg mx-auto">
                        {mod.description}
                    </p>
                </div>

                {/* Features preview */}
                <div className="grid grid-cols-2 gap-3 text-left max-w-lg mx-auto">
                    {mod.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0" style={{ backgroundColor: mod.color }} />
                            <span className="text-xs font-medium text-white/50 leading-relaxed">{f}</span>
                        </div>
                    ))}
                </div>

                {/* Notify CTA */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        onClick={() => navigate('/apps')}
                        className="h-14 px-8 rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all"
                        variant="ghost"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Launcher
                    </Button>
                    <Button
                        className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 transition-all text-white shadow-2xl"
                        style={{ backgroundColor: mod.color }}
                    >
                        <Bell className="w-4 h-4" />
                        Notify Me When Live
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>

                {/* Estimated */}
                <div className="flex items-center justify-center gap-2 text-white/15">
                    <Zap className="w-4 h-4 text-white/10" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                        Smartseyali Platform · {mod.category.replace('-', ' ')} module
                    </span>
                </div>
            </motion.div>
        </div>
    );
}
