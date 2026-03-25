import { motion } from "framer-motion";
import {
    Users, Target, Award, Coffee,
    Facebook, Instagram, Twitter, Mail,
    MessageCircle, Phone, MapPin, Globe, ArrowRight,
    Zap, Box, Layout, ShieldCheck, CheckCircle2,
    Database, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useNavigate } from "react-router-dom";
import { useTenant } from "@/contexts/TenantContext";

export default function About() {
    const { settings } = useStoreSettings();
    const navigate = useNavigate();
    const { activeCompany } = useTenant();

    const storeLink = (path: string) => {
        const slug = activeCompany?.subdomain || "";
        return `/${slug}${path === "/" ? "" : path}`;
    };

    const stats = [
        { icon: Users, label: "Happy Customers", value: "50,000+" },
        { icon: Database, label: "Verified Products", value: "2,500+" },
        { icon: MapPin, label: "Global Locations", value: "250+" },
        { icon: ShieldCheck, label: "Strategic Partners", value: "120+" }
    ];

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-40 font-sans selection:bg-blue-600 selection:text-white pt-24 text-slate-900">
            {/* Mission Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600"
                        alt="Ecosystem Vision"
                        className="w-full h-full object-cover grayscale opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#f8fafc]/0 to-[#f8fafc]" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 text-center space-y-12 px-6 max-w-5xl"
                >
                    <div className="flex items-center justify-center gap-3">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <span className="text-slate-500 font-bold  tracking-widest text-xs ">Our Vision</span>
                    </div>
                    <h1 className="text-6xl md:text-[9rem] font-bold tracking-tighter text-slate-900  leading-[0.8] ">
                        Our <span className="text-blue-600">Mission</span>
                    </h1>
                    <p className="text-xl md:text-2xl font-medium  text-slate-500 max-w-3xl mx-auto leading-relaxed">
                        Engineering reliable infrastructure for the next generation of commerce and enterprise management. High-yield results through technical excellence.
                    </p>
                </motion.div>
            </section>

            {/* Our Story */}
            <section className="py-40 container mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                    <div className="space-y-20">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-1 bg-blue-600" />
                                <span className="text-slate-500 font-bold  tracking-widest text-xs ">The Genesis</span>
                            </div>
                            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter text-slate-900  leading-[0.8] ">Quality <br /><span className="text-blue-600">Engineering</span></h2>
                        </div>
                        <p className="text-xl text-slate-500 leading-relaxed font-medium  border-l-4 border-blue-600/10 pl-10 py-4 max-w-xl">
                            "What started as a specialized vision for logistics has evolved into a comprehensive SaaS framework, empowering thousands of enterprises with precision-grade reliability and scalable logic."
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-16 pt-12 border-t border-slate-100">
                            <div className="space-y-6">
                                <h4 className="font-bold text-slate-900  tracking-widest text-[13px] flex items-center gap-3  font-bold">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600" /> Built for Integrity
                                </h4>
                                <p className="text-slate-500 text-sm leading-relaxed  font-medium">Direct-to-market protocols ensuring zero-compromise product verification and localized auditing.</p>
                            </div>
                            <div className="space-y-6">
                                <h4 className="font-bold text-slate-900  tracking-widest text-[13px] flex items-center gap-3  font-bold">
                                    <Target className="w-5 h-5 text-blue-600" /> Scalable Growth
                                </h4>
                                <p className="text-slate-500 text-sm leading-relaxed  font-medium">Advanced resource optimization across our global distribution network, built on sustainable architecture.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative group p-6 bg-white rounded-[4rem] border border-slate-50 shadow-2xl shadow-slate-200/20 overflow-hidden">
                        <div className="aspect-square rounded-[3.5rem] overflow-hidden relative">
                            <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000" className="w-full h-full object-cover grayscale transition-all duration-[3000ms] group-hover:scale-110 group-hover:grayscale-0" alt="Process" />
                            <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-transparent transition-colors" />
                        </div>
                        <div className="absolute top-16 left-16 flex items-center gap-4 px-6 py-3 bg-slate-900/90 backdrop-blur-md rounded-full shadow-2xl">
                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                            <span className="text-xs font-bold  tracking-widest text-white ">Operational Status: Verified</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-24 container mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="text-center space-y-6 p-12 bg-white rounded-[3.5rem] border border-slate-50 shadow-2xl shadow-slate-200/20 group hover:bg-slate-900 transition-all duration-700 hover:-translate-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto text-blue-600 group-hover:bg-white group-hover:text-slate-900 transition-all shadow-inner">
                                <stat.icon className="w-8 h-8 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-5xl font-bold text-slate-900 tracking-tighter  group-hover:text-white transition-colors tabular-nums">{stat.value}</h3>
                                <p className="text-xs font-bold text-slate-500  tracking-widest  group-hover:text-blue-400">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-40 container mx-auto px-6">
                <div className="bg-white rounded-[4rem] p-20 md:p-32 text-center border border-slate-50 shadow-2xl shadow-slate-200/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-bl-full" />

                    <div className="relative z-10 space-y-16 max-w-4xl mx-auto">
                        <div className="flex flex-col items-center gap-8">
                            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-blue-400 shadow-2xl shadow-slate-900/10">
                                <Mail className="w-10 h-10" />
                            </div>
                            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter  leading-none  text-slate-900">Get in <br /><span className="text-blue-600">Touch</span></h2>
                            <p className="text-slate-500 text-xl md:text-2xl font-medium  max-w-2xl mx-auto leading-relaxed">
                                Connect with our corporate headquarters for partnership inquiries and technical support. Secure channels initialized.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 pt-16 border-t border-slate-50 mt-16">
                            <div className="space-y-4 group cursor-pointer transition-all hover:scale-105">
                                <Phone className="w-8 h-8 mx-auto text-blue-600" />
                                <p className="text-[13px] font-bold  tracking-widest text-slate-900 ">{settings?.contact_phone || "+1 (555) 000-0000"}</p>
                            </div>
                            <div className="space-y-4 group cursor-pointer transition-all hover:scale-105">
                                <Mail className="w-8 h-8 mx-auto text-blue-600" />
                                <p className="text-[13px] font-bold  tracking-widest text-slate-900  truncate px-4">{settings?.contact_email || "office@ecosystem.io"}</p>
                            </div>
                            <div className="space-y-4 group cursor-pointer transition-all hover:scale-105">
                                <MapPin className="w-8 h-8 mx-auto text-blue-600" />
                                <p className="text-[13px] font-bold  tracking-widest text-slate-900  truncate px-4">{settings?.address || "Silicon Valley, Global HQ"}</p>
                            </div>
                        </div>

                        <Button
                            onClick={() => navigate(storeLink("/contact"))}
                            className="mt-16 h-24 px-20 rounded-[2rem] bg-slate-900 text-white font-bold  tracking-widest text-[13px] hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/10  border-none"
                        >
                            Contact Support <ArrowRight className="ml-5 w-6 h-6" />
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}
