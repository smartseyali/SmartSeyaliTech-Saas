import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";
import { useStoreSettings } from "@/hooks/useStoreSettings";
import { useTenant } from "@/contexts/TenantContext";

export function StoreFooter() {
    const { settings } = useStoreSettings();
    const { activeCompany } = useTenant();

    const storeLink = (path: string) => {
        const slug = activeCompany?.subdomain || "";
        return `/${slug}${path === "/" ? "" : path}`;
    };

    return (
        <footer className="bg-slate-950 text-white mt-0 border-t border-white/5">
            {/* Trust Standards */}
            <div className="border-b border-white/5">
                <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-10">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            { icon: "🏎️", label: "Fast Delivery", sub: "Optimized logistics pipeline" },
                            { icon: "🔄", label: "Easy Returns", sub: "Simple return protocols" },
                            { icon: "🛡️", label: "Secure Payments", sub: "Enterprise-grade encryption" },
                            { icon: "💬", label: "24/7 Support", sub: "Professional technical help" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-5">
                                <span className="text-3xl grayscale opacity-50">{item.icon}</span>
                                <div>
                                    <p className="text-[11px] font-bold text-white uppercase tracking-widest leading-none ">{item.label}</p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1.5 ">{item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Links */}
            <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-20">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-16">
                    {/* Brand Identity */}
                    <div className="col-span-2 md:col-span-1 space-y-8">
                        <div className="space-y-3">
                            <span className="text-2xl font-bold  tracking-tighter uppercase leading-none block">{settings?.store_name || "SmartStore"}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 ">Corporate Office</span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed  pr-4">
                            "{settings?.footer_text || "Reliable SaaS infrastructure for professional business operations and sustainable growth."}"
                        </p>
                        <div className="space-y-4">
                            {settings?.contact_phone && (
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest ">
                                    <Phone className="w-3.5 h-3.5 text-blue-500" /> {settings.contact_phone}
                                </div>
                            )}
                            {settings?.contact_email && (
                                <div className="flex items-center gap-3 text-[10px] font-bold text-slate-300 uppercase tracking-widest ">
                                    <Mail className="w-3.5 h-3.5 text-blue-500" /> {settings.contact_email}
                                </div>
                            )}
                        </div>
                        {/* Social Links */}
                        <div className="flex items-center gap-3">
                            {[
                                { Icon: Facebook, href: "#" },
                                { Icon: Instagram, href: "#" },
                                { Icon: Youtube, href: "#" },
                                { Icon: Twitter, href: "#" },
                            ].map(({ Icon, href }, i) => (
                                <a key={i} href={href} className="w-10 h-10 bg-white/5 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all border border-white/5">
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="space-y-6">
                        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-8 ">Company</h5>
                        <div className="space-y-4">
                            {[
                                { label: "About Us", path: "/about" },
                                { label: "Contact Us", path: "/contact" },
                                { label: "Careers", path: "#" },
                                { label: "Media Kit", path: "#" },
                                { label: "Tech Blog", path: "#" },
                            ].map(l => (
                                <div key={l.label}><Link to={storeLink(l.path)} className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest ">{l.label}</Link></div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-8 ">Support</h5>
                        <div className="space-y-4">
                            {[
                                { label: "Track Order", path: "/orders" },
                                { label: "Shipping Info", path: "#" },
                                { label: "Returns & Refunds", path: "#" },
                                { label: "Help Center", path: "#" },
                                { label: "Support Ticket", path: "#" },
                            ].map(l => (
                                <div key={l.label}><Link to={storeLink(l.path)} className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest ">{l.label}</Link></div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-8 ">Legal</h5>
                        <div className="space-y-4">
                            {[
                                "Terms of Service",
                                "Privacy Policy",
                                "Security Standards",
                                "Cookie Policy",
                                "Compliance",
                                "Site Map",
                            ].map(l => (
                                <div key={l}><Link to="#" className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-widest ">{l}</Link></div>
                            ))}
                        </div>
                    </div>

                    {/* Payments */}
                    <div className="space-y-8">
                        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-8 ">Payments</h5>
                        <div className="grid grid-cols-2 gap-2">
                            {["UPI", "RuPay", "Visa", "MC", "NB", "COD"].map(p => (
                                <div key={p} className="bg-white/5 rounded-lg px-2 py-2 text-center border border-white/5">
                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest ">{p}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 space-y-4">
                            <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ">Mobile Access</h5>
                            {[
                                { label: "Google Play", sub: "Android App" },
                                { label: "App Store", sub: "iOS App" }
                            ].map(a => (
                                <a key={a.label} href="#" className="flex items-center gap-4 bg-white/5 hover:bg-white/10 rounded-2xl px-6 py-4 transition-all border border-white/5 group">
                                    <Smartphone className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                    <div>
                                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ">Download on</p>
                                        <p className="text-[11px] font-bold text-white uppercase tracking-widest ">{a.label}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Compliance Bottom */}
            <div className="border-t border-white/5 bg-black/20">
                <div className="max-w-screen-xl mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-center gap-6 justify-between">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest ">
                        © {new Date().getFullYear()} {settings?.store_name || "SmartStore"} | All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-8 flex-wrap justify-center">
                        {["Terms", "Privacy", "Security", "Ethics"].map(item => (
                            <Link key={item} to="#" className="text-[10px] font-bold text-slate-600 hover:text-blue-500 transition-colors uppercase tracking-widest ">{item}</Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
