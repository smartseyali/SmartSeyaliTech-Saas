import { Mail, Phone, MapPin, Clock, Send, MessageSquare, ShieldCheck, Activity, User, Zap, Box, Layout, Headphones } from "lucide-react";
import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function Contact() {
    const { activeCompany } = useTenant();
    const { settings } = useStoreSettings();

    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div className="bg-[#f8fafc] min-h-screen pt-40 pb-40 font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
            {/* Hero */}
            <section className="relative py-20 overflow-hidden">
                <div className="container mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-8">
                        <div className="flex items-center justify-center gap-3">
                            <Activity className="w-5 h-5 text-blue-600 animate-pulse" />
                            <span className="text-slate-400 font-bold  tracking-widest text-[10px] ">Operational Status: Online</span>
                        </div>
                        <h1 className="text-6xl md:text-[8rem] font-bold text-slate-900 tracking-tighter leading-[0.8] mb-12  ">
                            Contact <br /><span className="text-blue-600">Center</span>
                        </h1>
                        <p className="text-xl md:text-2xl font-medium  text-slate-400 max-w-3xl mx-auto leading-relaxed">
                            Professional support channels initialized. Our team is standing by for corporate inquiries, product support, and partnership verification.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-6 mt-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">

                    {/* Contact Info Cards */}
                    <div className="lg:col-span-4 space-y-8">
                        {[
                            {
                                icon: Phone, title: "Primary_Line",
                                value: activeCompany?.contact_phone || "+1 (555) 902-8831",
                                sub: "24/7 Global Support",
                                color: "blue"
                            },
                            {
                                icon: Mail, title: "Email_Channel",
                                value: activeCompany?.contact_email || "support@ecosystem.io",
                                sub: <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" /> Response &lt; 120ms</span>,
                                color: "blue"
                            },
                            {
                                icon: MapPin, title: "Corporate_Hub",
                                value: activeCompany?.address || "Building_404, Tech_Sect_9",
                                sub: `${activeCompany?.city || "Silicon_Valley"}, Global_Matrix`,
                                color: "blue"
                            },
                            {
                                icon: Clock, title: "Business_Window",
                                value: "09:00 - 21:00 UTC",
                                sub: "Automated Handlers 24/7",
                                color: "blue"
                            },
                        ].map((info, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-8 p-10 bg-white rounded-[3rem] border border-slate-50 shadow-2xl shadow-slate-200/20 group hover:shadow-blue-600/10 transition-all duration-500"
                            >
                                <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-colors">
                                    <info.icon className="w-7 h-7 text-blue-600 group-hover:text-white" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold  tracking-widest text-slate-300 mb-1  leading-none">{info.title}</p>
                                    <p className="font-bold text-xl text-slate-900 tracking-tight  ">{info.value}</p>
                                    <div className="text-[10px] font-bold text-slate-400   tracking-widest leading-none pt-2">{info.sub}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-8">
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center py-40 bg-white rounded-[4rem] border border-slate-50 shadow-2xl shadow-slate-200/20"
                            >
                                <div className="w-32 h-32 rounded-[2.5rem] bg-slate-900 flex items-center justify-center mb-12 shadow-2xl shadow-slate-900/20">
                                    <ShieldCheck className="w-16 h-16 text-blue-400 animate-pulse" />
                                </div>
                                <h2 className="text-5xl font-bold text-slate-900 mb-6  tracking-tighter ">Message Received</h2>
                                <p className="text-slate-400 text-xl font-medium  max-w-sm">Submission accepted. Our handlers are analyzing your query for immediate response.</p>
                                <Button
                                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                                    className="mt-12 h-20 px-16 rounded-3xl bg-slate-900 text-white font-bold  tracking-widest text-[11px]  transition-all hover:bg-blue-600 shadow-2xl shadow-slate-900/10 border-none"
                                >
                                    New Message
                                </Button>
                            </motion.div>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleSubmit}
                                className="bg-white rounded-[4rem] border border-slate-50 shadow-2xl shadow-slate-200/20 p-20 space-y-16"
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-1 bg-blue-600" />
                                        <span className="text-slate-400 font-bold  tracking-widest text-[10px] ">Inquiry Registry</span>
                                    </div>
                                    <h2 className="text-5xl font-bold text-slate-900  tracking-tighter  leading-none">Send <span className="text-blue-600">Message</span></h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                    {[
                                        { key: "name", label: "FULL_NAME", placeholder: "IDENTIFIER", required: true, type: "text", icon: User },
                                        { key: "email", label: "EMAIL_ADDRESS", placeholder: "NAME@CORPORATE.COM", required: true, type: "email", icon: Mail },
                                        { key: "phone", label: "CONTACT_ID", placeholder: "+1 (000) 000-0000", required: false, type: "tel", icon: Zap },
                                        { key: "subject", label: "SUBJECT_QUERY", placeholder: "INQUIRY_TYPE", required: true, type: "text", icon: ShieldCheck },
                                    ].map(field => (
                                        <div key={field.key} className="space-y-4 group">
                                            <div className="flex items-center justify-between px-2">
                                                <label className="text-[10px] font-bold  tracking-widest text-slate-300 group-focus-within:text-blue-600 transition-colors  leading-none">{field.label}</label>
                                                <field.icon className="w-3.5 h-3.5 text-slate-100 group-focus-within:text-blue-200 transition-all" />
                                            </div>
                                            <input
                                                type={field.type}
                                                required={field.required}
                                                placeholder={field.placeholder}
                                                value={(form as any)[field.key]}
                                                onChange={e => set(field.key, e.target.value)}
                                                className="w-full h-16 px-8 rounded-2xl border border-slate-50 bg-slate-50 text-[11px] font-bold  tracking-widest text-slate-900 outline-none focus:border-blue-600/20 focus:bg-white transition-all shadow-inner focus:shadow-2xl focus:shadow-blue-600/5 placeholder:text-slate-200"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 group">
                                    <div className="flex items-center justify-between px-2">
                                        <label className="text-[10px] font-bold  tracking-widest text-slate-300 group-focus-within:text-blue-600 transition-colors  leading-none">MESSAGE_BODY</label>
                                        <MessageSquare className="w-3.5 h-3.5 text-slate-100 group-focus-within:text-blue-200 transition-all" />
                                    </div>
                                    <textarea
                                        required
                                        placeholder="INPUT_QUERY_HERE"
                                        value={form.message}
                                        onChange={e => set("message", e.target.value)}
                                        rows={6}
                                        className="w-full px-8 py-8 rounded-[2rem] border border-slate-50 bg-slate-50 text-[11px] font-bold  tracking-widest text-slate-900 outline-none focus:border-blue-600/20 focus:bg-white transition-all shadow-inner focus:shadow-2xl focus:shadow-blue-600/5 placeholder:text-slate-200 resize-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-24 rounded-[2rem] bg-slate-900 text-white font-bold  tracking-[0.5em] text-[13px] flex items-center justify-center gap-6 hover:bg-blue-600 transition-all shadow-2xl shadow-slate-900/10  border-none group/btn"
                                >
                                    <Send className="w-6 h-6 group-hover:translate-x-2 transition-transform" /> Submit Message
                                </Button>
                            </motion.form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
