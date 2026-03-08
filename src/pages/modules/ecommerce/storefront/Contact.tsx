import { Mail, Phone, MapPin, Clock, Send, MessageSquare, Headphones, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useTenant } from "@/contexts/TenantContext";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { motion } from "framer-motion";

export default function Contact() {
    const { activeCompany } = useTenant();
    const { settings } = useStoreSettings();
    const primaryColor = settings?.primary_color || "#14532d";

    const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

    return (
        <div className="bg-white min-h-screen pt-24 pb-20 font-sans">
            {/* Hero */}
            <section className="relative py-20 overflow-hidden" style={{ background: `linear-gradient(135deg, ${primaryColor}08, ${primaryColor}15)` }}>
                <div className="container mx-auto px-6 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                            <Headphones className="w-3 h-3" /> Hum Yahan Hain — 24/7
                        </span>
                        <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                            Baat Karo <span style={{ color: primaryColor }}>Hum Se</span>
                        </h1>
                        <p className="text-lg text-slate-500 max-w-xl mx-auto">
                            Order tracking, product query, ya koi bhi sawal — hamari team hamesha ready hai.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="container mx-auto px-6 mt-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Contact Info Cards */}
                    <div className="space-y-6">
                        {[
                            {
                                icon: Phone, title: "Call / WhatsApp",
                                value: activeCompany?.contact_phone || "+91 98765 43210",
                                sub: "Mon–Sat, 9am–6pm IST",
                                color: "#3b82f6"
                            },
                            {
                                icon: Mail, title: "Email Karein",
                                value: activeCompany?.contact_email || "support@store.in",
                                sub: "24 ghante mein jawab milega",
                                color: "#8b5cf6"
                            },
                            {
                                icon: MapPin, title: "Hamare Paas Aayein",
                                value: activeCompany?.address || "123 Market Street, Sector 5",
                                sub: `${activeCompany?.city || "Mumbai"}, ${activeCompany?.state || "Maharashtra"} — India`,
                                color: "#f59e0b"
                            },
                            {
                                icon: Clock, title: "Business Hours",
                                value: "Mon–Sat: 9am – 6pm IST",
                                sub: "Sunday: Band rehta hai",
                                color: "#10b981"
                            },
                        ].map((info, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="flex items-start gap-5 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"
                            >
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${info.color}15` }}>
                                    <info.icon className="w-5 h-5" style={{ color: info.color }} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{info.title}</p>
                                    <p className="font-bold text-slate-800">{info.value}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{info.sub}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        {submitted ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm"
                            >
                                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: `${primaryColor}15` }}>
                                    <MessageSquare className="w-8 h-8" style={{ color: primaryColor }} />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 mb-3">Sandesh Mila!</h2>
                                <p className="text-slate-500 max-w-sm">Shukriya! Hamari team 24 ghante ke andar aapko jawab degi.</p>
                                <button
                                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }}
                                    className="mt-8 px-8 py-3 rounded-xl text-white font-bold text-sm"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    Send Another Message
                                </button>
                            </motion.div>
                        ) : (
                            <motion.form
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                onSubmit={handleSubmit}
                                className="bg-white rounded-3xl border border-slate-100 shadow-sm p-10 space-y-8"
                            >
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 mb-1">Send Us a Message</h2>
                                    <p className="text-slate-400 text-sm">Fill out the form and we'll respond as soon as possible.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { key: "name", label: "Poora Naam *", placeholder: "Ramesh Sharma", required: true, type: "text" },
                                        { key: "email", label: "Email ID *", placeholder: "ramesh@gmail.com", required: true, type: "email" },
                                        { key: "phone", label: "Mobile Number", placeholder: "+91 98765 43210", required: false, type: "tel" },
                                        { key: "subject", label: "Vishay *", placeholder: "Order tracking, refund, COD query...", required: true, type: "text" },
                                    ].map(field => (
                                        <div key={field.key} className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">{field.label}</label>
                                            <input
                                                type={field.type}
                                                required={field.required}
                                                placeholder={field.placeholder}
                                                value={(form as any)[field.key]}
                                                onChange={e => set(field.key, e.target.value)}
                                                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-all"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Message *</label>
                                    <textarea
                                        required
                                        placeholder="Apna sawal ya sujhav yahan likhein..."
                                        value={form.message}
                                        onChange={e => set("message", e.target.value)}
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 outline-none focus:border-slate-400 focus:bg-white transition-all resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full h-14 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-lg"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    <Send className="w-4 h-4" /> Sandesh Bhejo
                                </button>
                            </motion.form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
