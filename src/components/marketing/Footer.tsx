import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Shield, ArrowUpRight } from "lucide-react";
import { SITE_NAME } from "@/lib/seoUtils";

const LINKS: Record<string, { label: string; href: string }[]> = {
  Platform: [
    { label: "Commerce & POS", href: "/products?category=commerce" },
    { label: "Finance & Accounting", href: "/products?category=finance" },
    { label: "HRMS", href: "/products?category=people" },
    { label: "CRM", href: "/products?category=customer" },
    { label: "Analytics", href: "/products?category=analytics" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Services", href: "/services" },
    { label: "Pricing", href: "/pricing" },
    { label: "Contact", href: "/contact" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/policy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
  "Get Started": [
    { label: "Request Demo", href: "/contact" },
    { label: "Sign In", href: "/login" },
    { label: "All Products", href: "/products" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-12">
          <div className="lg:col-span-2 space-y-5">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 group"
              aria-label={`${SITE_NAME} home`}
            >
              <Image
                src="/icon.png"
                alt={SITE_NAME}
                width={200}
                height={60}
                className="h-10 w-auto object-contain"
              />
              <span className="text-xl font-bold tracking-tight">
                {SITE_NAME}
              </span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Enterprise business platform built for growing companies in India.
              Unify your operations, finance, and teams in one place.
            </p>
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <Mail className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                support@smartseyali.com
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <Phone className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                +91 90477 36612
              </div>
              <div className="flex items-center gap-2.5 text-sm text-gray-400">
                <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                SR Nagar, Tiruppur, Tamil Nadu
              </div>
            </div>
          </div>

          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                {title}
              </h3>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
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

        <div className="mt-14 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            &copy; {currentYear} {SITE_NAME} Tech. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/policy"
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-700">·</span>
            <Link
              href="/terms"
              className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
            >
              Terms &amp; Conditions
            </Link>
            <span className="hidden md:block w-px h-3 bg-white/10" />
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 rounded border border-white/5">
              <Shield className="w-3 h-3 text-primary-500" />
              <span className="text-xs text-gray-500">
                Enterprise-grade security
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
