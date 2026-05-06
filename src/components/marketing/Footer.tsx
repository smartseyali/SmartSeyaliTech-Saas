import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Shield, ArrowUpRight } from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const links = {
    Platform: [
      { label: "Commerce & POS", path: "/products?category=commerce" },
      { label: "Finance & Accounting", path: "/products?category=finance" },
      { label: "HRMS", path: "/products?category=people" },
      { label: "CRM", path: "/products?category=customer" },
      { label: "Analytics", path: "/products?category=analytics" },
    ],
    Company: [
      { label: "About Us", path: "/about" },
      { label: "Services", path: "/services" },
      { label: "Contact", path: "/contact" },
      { label: "Privacy Policy", path: "/policy" },
      { label: "Terms & Conditions", path: "/terms" },
    ],
    "Get Started": [
      { label: "Request Demo", path: "/contact" },
      { label: "Sign In", path: "/login" },
      { label: "All Products", path: "/products" },
    ],
  };

  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            {/* <Link to="/" className="inline-block group">
              <img
                src="/logo.png"
                alt={PLATFORM_CONFIG.name}
                className="h-28 w-auto object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
              />
            </Link> */}
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Enterprise business platform built for growing companies in India.
              Unify your operations, finance, and teams in one place.
            </p>
            <div className="space-y-2.5 pt-2">
              {[
                {
                  icon: Mail,
                  value: `support@${PLATFORM_CONFIG.name.toLowerCase().replace(/\s+/g, "")}.com`,
                },
                { icon: Phone, value: "+91 90477 36612" },
                { icon: MapPin, value: "SR Nagar, Tiruppur, Tamil Nadu" },
              ].map(({ icon: Icon, value }) => (
                <div
                  key={value}
                  className="flex items-center gap-2.5 text-sm text-gray-400"
                >
                  <Icon className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  {value}
                </div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {items.map(({ label, path }) => (
                  <li key={label}>
                    <Link
                      to={path}
                      className="text-sm text-gray-500 hover:text-white transition-colors inline-flex items-center group"
                    >
                      {label}
                      <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            &copy; {currentYear} {PLATFORM_CONFIG.name} Tech. All rights
            reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/policy"
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-700">·</span>
            <Link
              to="/terms"
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Terms & Conditions
            </Link>
            <span className="hidden md:block w-px h-3 bg-white/10" />
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded border border-white/5">
              <Shield className="w-3 h-3 text-[#2563EB]" />
              <span className="text-xs text-gray-500">
                Enterprise-grade security
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
