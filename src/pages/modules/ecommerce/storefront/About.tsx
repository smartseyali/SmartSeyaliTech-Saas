import { motion } from "framer-motion";
import {
    Users, Target, Award, Coffee,
    Facebook, Instagram, Twitter, Mail,
    MessageCircle, Phone, MapPin, Globe, ArrowRight,
    Leaf, Sparkles, Sprout, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export default function About() {
    const { settings } = useStoreSettings();

    const stats = [
        { icon: Users, label: "Satisfied Customers", value: "50,000+" },
        { icon: Leaf, label: "Products Listed", value: "500+" },
        { icon: Heart, label: "Cities Delivered", value: "250+" },
        { icon: Sprout, label: "Kisan Partners", value: "120+" }
    ];

    const primaryColor = settings?.primary_color || "#14532d";

    return (
        <div className="bg-[#fafaf9] min-h-screen pb-20 font-sans selection:bg-[#14532d] selection:text-white pt-24">
            {/* Organic Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1600"
                        alt="Our Story"
                        className="w-full h-full object-cover grayscale opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#fafaf9]/0 to-[#fafaf9]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 text-center space-y-8 px-6 max-w-4xl"
                >
                    <div className="flex items-center justify-center gap-3">
                        <Leaf className="w-5 h-5 text-[#f97316]" />
                        <span className="text-[#14532d]/40 font-black uppercase tracking-[0.4em] text-[10px]">Hamari Kahani</span>
                    </div>
                    <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter text-[#14532d] uppercase leading-[0.85]">
                        {settings?.store_name || "About Us"}
                    </h1>
                    <p className="text-lg md:text-xl font-medium italic text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Desh ke kone kone mein pahuncha rahe hain asli, bharosemand products.
                    </p>
                </motion.div>
            </section>

            {/* Our Story */}
            <section className="py-40 container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                    <div className="space-y-16">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-0.5 bg-[#f97316]" />
                                <span className="text-[#14532d]/40 font-black uppercase tracking-[0.4em] text-[10px]">The Beginning</span>
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-[#14532d] uppercase leading-[0.9]">Harvest <br /><span className="text-slate-200 italic">With Heart</span></h2>
                        </div>
                        <p className="text-lg text-slate-500 leading-relaxed font-medium italic border-l-4 border-[#f97316]/20 pl-8">
                            {settings?.footer_text || "Humari shuruaat ek chote se sapne se hui thi — ki Bharat ke har ghar mein asli, saaf aur taaza products pahunche. Aaj, hazaron kisanon aur lakhs of customers ke bharose ke saath hum us sapne ko sach kar rahe hain."}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 pt-8 border-t border-slate-100">
                            <div className="space-y-4">
                                <h4 className="font-black text-[#14532d] uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#f97316]" /> Hamari Soch
                                </h4>
                                <p className="text-slate-400 text-sm leading-relaxed font-medium">Seedha kisan se aapke ghar tak — bina milawat, bina compromise. Pure Made in India.</p>
                            </div>
                            <div className="space-y-4">
                                <h4 className="font-black text-[#14532d] uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Sprout className="w-4 h-4 text-[#f97316]" /> Sustainable India
                                </h4>
                                <p className="text-slate-400 text-sm leading-relaxed font-medium">Eco-friendly packaging, kisan empowerment aur biodiversity conservation ke saath ek behtar Bharat banana.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative group p-4 bg-white rounded-[48px] border border-slate-100 shadow-xl overflow-hidden">
                        <div className="aspect-square rounded-[40px] overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1000" className="w-full h-full object-cover transition-all duration-[2000ms] group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                        </div>
                        <div className="absolute top-12 left-12 flex items-center gap-3 px-4 py-1.5 bg-white/80 backdrop-blur-sm rounded-full shadow-lg">
                            <Leaf className="w-4 h-4 text-[#14532d]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#14532d]">Pure Organic Field</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-32">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="text-center space-y-4 p-10 bg-white rounded-[40px] border border-slate-50 shadow-sm group hover:border-[#14532d]/10 transition-all hover:-translate-y-2">
                                <div className="w-16 h-16 bg-[#fafaf9] rounded-2xl flex items-center justify-center mx-auto text-[#14532d] group-hover:bg-[#14532d] group-hover:text-white transition-all shadow-inner">
                                    <stat.icon className="w-7 h-7" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-4xl font-black text-[#14532d] tracking-tighter italic">{stat.value}</h3>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Bridge */}
            <section className="py-40 container mx-auto px-6">
                <div className="bg-[#14532d] rounded-[64px] p-16 md:p-32 text-center text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-bl-full" />

                    <div className="relative z-10 space-y-12 max-w-3xl mx-auto">
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-[#f97316]">
                                <MessageCircle className="w-8 h-8" />
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none">Connect <br /><span className="text-white/30 italic">With Us</span></h2>
                            <p className="text-white/60 text-lg md:text-xl font-medium italic max-w-lg mx-auto leading-relaxed">
                                Aapke sawal, sujhav ya kuch bhi — hum sununte hain. Seedha baat karo hum se!
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-white/10 mt-12">
                            <div className="space-y-4 group cursor-pointer">
                                <Phone className="w-6 h-6 mx-auto text-[#f97316]" />
                                <p className="text-sm font-black uppercase tracking-widest">{settings?.contact_phone || "Call Concierge"}</p>
                            </div>
                            <div className="space-y-4 group cursor-pointer">
                                <Mail className="w-6 h-6 mx-auto text-[#f97316]" />
                                <p className="text-sm font-black uppercase tracking-widest">{settings?.contact_email || "Direct Email"}</p>
                            </div>
                            <div className="space-y-4 group cursor-pointer">
                                <MapPin className="w-6 h-6 mx-auto text-[#f97316]" />
                                <p className="text-sm font-black uppercase tracking-widest line-clamp-1">{settings?.address || "The Farm Location"}</p>
                            </div>
                        </div>

                        <Button
                            style={{ backgroundColor: "#f97316" }}
                            className="mt-12 h-16 px-12 rounded-2xl text-white font-black uppercase tracking-[0.2em] text-[11px] hover:opacity-90 transition-all shadow-xl shadow-black/20"
                        >
                            Abhi Sampark Karo <ArrowRight className="ml-3 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
