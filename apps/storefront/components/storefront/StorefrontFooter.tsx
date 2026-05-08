import Link from "next/link";
import { Mail, MapPin, Phone, Instagram, Facebook, Youtube } from "lucide-react";
import { getTenant } from "@/lib/tenant";

const LINKS = {
  Shop: [
    { label: "All Products", href: "/shop/" },
    { label: "New Arrivals", href: "/shop/?filter=new" },
    { label: "Best Sellers", href: "/shop/?filter=bestseller" },
    { label: "Offers", href: "/shop/?filter=offer" },
  ],
  Account: [
    { label: "My Profile", href: "/account/" },
    { label: "My Orders", href: "/account/orders/" },
    { label: "Wishlist", href: "/wishlist/" },
    { label: "Cart", href: "/cart/" },
  ],
  Information: [
    { label: "About Us", href: "/about/" },
    { label: "Contact", href: "/contact/" },
    { label: "FAQ", href: "/faq/" },
    { label: "Privacy Policy", href: "/privacy/" },
    { label: "Terms & Conditions", href: "/terms/" },
  ],
};

export function StorefrontFooter() {
  const tenant = getTenant();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-900 text-white mt-20">
      <div className="container-tight py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10">
          <div className="col-span-2 lg:col-span-2 space-y-5">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold tracking-tight">{tenant.brandName}</span>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">{tenant.description}</p>
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-sm text-white/70">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <a href={`mailto:${tenant.contact.email}`} className="hover:text-white transition-colors">
                  {tenant.contact.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/70">
                <Phone className="w-3.5 h-3.5 shrink-0" />
                <a href={`tel:${tenant.contact.phone.replace(/\s/g, "")}`} className="hover:text-white transition-colors">
                  {tenant.contact.phone}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-sm text-white/70">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {tenant.contact.address}
              </div>
            </div>
            {(tenant.social?.instagram || tenant.social?.facebook || tenant.social?.youtube) && (
              <div className="flex items-center gap-2 pt-2">
                {tenant.social.instagram && (
                  <a
                    href={tenant.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent-500 flex items-center justify-center transition-colors"
                    aria-label="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
                {tenant.social.facebook && (
                  <a
                    href={tenant.social.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent-500 flex items-center justify-center transition-colors"
                    aria-label="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                  </a>
                )}
                {tenant.social.youtube && (
                  <a
                    href={tenant.social.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-white/10 hover:bg-accent-500 flex items-center justify-center transition-colors"
                    aria-label="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}
          </div>

          {Object.entries(LINKS).map(([title, items]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-accent-400">{title}</h3>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-white/70 hover:text-white transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/50">
            &copy; {currentYear} {tenant.brandName}. All rights reserved.
          </p>
          <p className="text-xs text-white/50">
            Powered by <span className="font-semibold text-white">SmartSeyali</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
