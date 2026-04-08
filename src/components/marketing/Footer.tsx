
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Globe, Camera, Code, Activity, ShieldCheck, ArrowRight, ArrowUpRight } from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";
import { motion } from "framer-motion";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-white overflow-hidden relative">
      {/* Gradient accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-600/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Company Info */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3 group inline-flex">
              <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/25 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                {PLATFORM_CONFIG.name} <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">Tech</span>
              </span>
            </Link>
            <p className="text-gray-500 max-w-sm leading-relaxed text-sm">
              We engineer robust enterprise software solutions designed for global scalability and high-performance operational efficiency.
            </p>
            <div className="flex gap-3 pt-2">
              {[
                { Icon: Globe, label: "Website" },
                { Icon: Camera, label: "Instagram" },
                { Icon: Code, label: "GitHub" },
              ].map(({ Icon, label }, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={label}
                  className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center hover:bg-primary-600 hover:border-primary-600 transition-all duration-300 hover:-translate-y-1 group"
                >
                  <Icon className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Quick Links</h3>
            <ul className="space-y-3">
              {[
                { label: "Home", path: "/" },
                { label: "Products", path: "/products" },
                { label: "Services", path: "/services" },
                { label: "About Us", path: "/about" },
                { label: "Contact", path: "/contact" },
              ].map((link, i) => (
                <li key={i}>
                  <Link
                    to={link.path}
                    className="text-sm text-gray-500 hover:text-white transition-colors duration-300 inline-flex items-center group"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Contact Us</h3>
            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: `support@${PLATFORM_CONFIG.name.toLowerCase().replace(/\s+/g, '')}.com` },
                { icon: Phone, label: "Phone", value: "+91 90477 36612" },
                { icon: MapPin, label: "Location", value: "SR Nagar, Tiruppur, IN" },
              ].map(({ icon: Icon, label, value }, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-3.5 w-3.5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-0.5">{label}</p>
                    <p className="text-sm text-gray-400">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            &copy; {currentYear} {PLATFORM_CONFIG.name} Tech. All rights reserved.
          </p>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/5">
            <ShieldCheck className="w-3.5 h-3.5 text-primary-400" />
            <span className="text-xs text-gray-500 font-medium">Enterprise Grade Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
