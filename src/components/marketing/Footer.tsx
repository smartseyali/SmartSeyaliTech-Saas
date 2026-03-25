
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Facebook, Instagram, Github, Activity, ShieldCheck, ArrowRight } from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-slate-900 text-white font-sans overflow-hidden border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-24 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2 space-y-8">
            <Link to="/" className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-6">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight">{PLATFORM_CONFIG.name} <span className="text-primary-500">Tech</span></span>
            </Link>
            <p className="text-slate-400 font-medium  max-w-sm leading-relaxed">
              We engineer robust enterprise software solutions designed for global scalability and high-performance operational efficiency.
            </p>
            <div className="flex space-x-6 pt-4">
              {[Facebook, Instagram, Github].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-primary-600 transition-all hover:-translate-y-1">
                  <Icon className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-500">Quick Links</h3>
            <ul className="space-y-4">
              {[
                { label: "Home", path: "/" },
                { label: "Products", path: "/products" },
                { label: "Services", path: "/services" },
                { label: "About Us", path: "/about" },
                { label: "Contact", path: "/contact" }
              ].map((link, i) => (
                <li key={i}>
                  <Link to={link.path} className="text-md font-semibold text-slate-400 hover:text-white transition-all inline-flex items-center group">
                    {link.label} <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-8">
            <h3 className="text-sm font-bold uppercase tracking-widest text-primary-500">Contact Us</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 shrink-0">Inquiries</p>
                  <p className="text-sm font-semibold text-slate-300">support@{PLATFORM_CONFIG.name.toLowerCase().replace(/\s+/g, '')}.com</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Call Us</p>
                  <p className="text-sm font-semibold text-slate-300">+91 90477 36612</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Location</p>
                  <p className="text-sm font-semibold text-slate-300">SR Nagar, Tiruppur, IN</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-10 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest ">
            © {currentYear} {PLATFORM_CONFIG.name} TECH. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-3 bg-slate-800/50 px-5 py-2 rounded-full border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-primary-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Enterprise Grade Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
