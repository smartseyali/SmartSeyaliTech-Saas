import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Youtube, Mail, Phone, MapPin, ShieldCheck, Smartphone } from "lucide-react";
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
        <footer className="bg-[#0f1f0f] text-white mt-0">
            {/* Trust bar */}
            <div className="border-b border-white/10">
                <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: "🚚", label: "Free Delivery", sub: "On orders above ₹999" },
                            { icon: "🔄", label: "Easy Returns", sub: "7-day hassle-free return" },
                            { icon: "🔒", label: "100% Secure", sub: "UPI, Cards, NetBanking & COD" },
                            { icon: "📞", label: "24/7 Support", sub: "Dedicated customer helpline" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center gap-3">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <p className="text-xs font-black text-white">{item.label}</p>
                                    <p className="text-[10px] text-slate-400">{item.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main links */}
            <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1 space-y-4">
                        <span className="text-xl font-black italic tracking-tight">{settings?.store_name || "Our Store"}</span>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            {settings?.footer_text || "Bharat ka apna online store — taaza products, best daam, aur ghar tak delivery."}
                        </p>
                        {settings?.contact_phone && (
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <Phone className="w-3.5 h-3.5 text-green-400" /> {settings.contact_phone}
                            </div>
                        )}
                        {settings?.contact_email && (
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                                <Mail className="w-3.5 h-3.5 text-green-400" /> {settings.contact_email}
                            </div>
                        )}
                        {/* Social icons */}
                        <div className="flex items-center gap-2 pt-2">
                            {[
                                { Icon: Facebook, href: "#" },
                                { Icon: Instagram, href: "#" },
                                { Icon: Youtube, href: "#" },
                                { Icon: Twitter, href: "#" },
                            ].map(({ Icon, href }, i) => (
                                <a key={i} href={href} className="w-8 h-8 bg-white/10 hover:bg-green-700 rounded-full flex items-center justify-center transition-all">
                                    <Icon className="w-3.5 h-3.5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* About */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Company</h5>
                        {[
                            { label: "About Us", path: "/about" },
                            { label: "Contact Us", path: "/contact" },
                            { label: "Careers", path: "#" },
                            { label: "Press & Media", path: "#" },
                            { label: "Blog", path: "#" },
                        ].map(l => (
                            <div key={l.label}><Link to={storeLink(l.path)} className="text-xs text-slate-300 hover:text-white transition-colors">{l.label}</Link></div>
                        ))}
                    </div>

                    {/* Help */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Help & Support</h5>
                        {[
                            { label: "Track My Order", path: "/orders" },
                            { label: "Payment Options", path: "#" },
                            { label: "Cancellation & Returns", path: "#" },
                            { label: "FAQs", path: "#" },
                            { label: "Report an Issue", path: "#" },
                        ].map(l => (
                            <div key={l.label}><Link to={storeLink(l.path)} className="text-xs text-slate-300 hover:text-white transition-colors">{l.label}</Link></div>
                        ))}
                    </div>

                    {/* Policy */}
                    <div className="space-y-3">
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Legal</h5>
                        {[
                            "Return & Refund Policy",
                            "Terms & Conditions",
                            "Privacy Policy",
                            "Security",
                            "Sitemap",
                            "GST & Invoicing",
                        ].map(l => (
                            <div key={l}><Link to="#" className="text-xs text-slate-300 hover:text-white transition-colors">{l}</Link></div>
                        ))}
                    </div>

                    {/* Payments */}
                    <div className="space-y-4">
                        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">We Accept</h5>
                        <div className="grid grid-cols-3 gap-2">
                            {["UPI", "RuPay", "Visa", "MC", "NB", "COD"].map(p => (
                                <div key={p} className="bg-white/10 rounded-lg px-2 py-1.5 text-center">
                                    <span className="text-[9px] font-black text-slate-300">{p}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-3 space-y-2">
                            <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Download App</h5>
                            {[
                                { label: "Google Play", sub: "Android" },
                                { label: "App Store", sub: "iOS" }
                            ].map(a => (
                                <a key={a.label} href="#" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl px-3 py-2 transition-all">
                                    <Smartphone className="w-4 h-4 text-green-400" />
                                    <div>
                                        <p className="text-[9px] text-slate-400">Get it on</p>
                                        <p className="text-[10px] font-black text-white">{a.label}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-white/10">
                <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row items-center gap-3 justify-between">
                    <p className="text-[11px] text-slate-400">
                        © {new Date().getFullYear()} {settings?.store_name || "Our Store"} Pvt. Ltd. | CIN: U74999MH2024PTC000000 | All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-4 flex-wrap justify-center">
                        {["Privacy Policy", "Terms of Use", "Grievance Officer", "Cookie Policy"].map(item => (
                            <Link key={item} to="#" className="text-[11px] text-slate-400 hover:text-white transition-colors">{item}</Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
