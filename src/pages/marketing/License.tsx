import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Shield, Eye, Database, Lock, Users, RefreshCw,
  Mail, Phone, MapPin, ArrowRight, FileText, Globe,
} from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";

const COMPANY = `${PLATFORM_CONFIG.name} Tech`;
const SUPPORT_EMAIL = `support@${PLATFORM_CONFIG.name.toLowerCase().replace(/\s+/g, "")}.com`;
const WEBSITE = `https://www.${PLATFORM_CONFIG.name.toLowerCase().replace(/\s+/g, "")}.com`;
const EFFECTIVE_DATE = "1 May 2026";

const SECTIONS = [
  { id: "information", label: "Information We Collect" },
  { id: "use", label: "How We Use Your Information" },
  { id: "sharing", label: "Data Sharing & Disclosure" },
  { id: "cookies", label: "Cookies & Tracking" },
  { id: "security", label: "Data Storage & Security" },
  { id: "retention", label: "Data Retention" },
  { id: "rights", label: "Your Rights" },
  { id: "third-party", label: "Third-Party Services" },
  { id: "children", label: "Children's Privacy" },
  { id: "changes", label: "Policy Changes" },
  { id: "contact", label: "Contact Us" },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

function SectionBlock({
  id,
  number,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  number: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div id={id} {...fadeUp()} className="bg-white border border-gray-100 rounded-2xl p-8 scroll-mt-24">
      <div className="flex items-start gap-4 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-[#2563EB]" />
        </div>
        <div>
          <span className="text-xs font-semibold text-[#2563EB] uppercase tracking-widest block mb-0.5">
            {number}
          </span>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>
      </div>
      <div className="pl-14 space-y-3 text-gray-600 text-sm leading-relaxed">
        {children}
      </div>
    </motion.div>
  );
}

function Ul({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-gray-800 mb-2">{title}</p>
      {children}
    </div>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-white pt-32 pb-16 lg:pt-40 lg:pb-20 border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-gradient-to-bl from-blue-50 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#2563EB] text-xs font-semibold uppercase tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
              Legal
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Privacy
              <br />
              <span className="text-[#2563EB]">Policy</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mb-6">
              How {COMPANY} collects, uses, and protects your personal information
              when you use the {PLATFORM_CONFIG.name} business platform.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Effective: {EFFECTIVE_DATE}
              </span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" />
                Applies to: {WEBSITE}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Body: TOC + Content ──────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex gap-12 items-start">

          {/* Sticky TOC — desktop only */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden xl:block w-64 shrink-0 sticky top-24"
          >
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Contents</p>
              <nav className="space-y-1">
                {SECTIONS.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-lg text-sm text-gray-500 hover:text-[#2563EB] hover:bg-blue-50 transition-colors group"
                  >
                    <span className="text-[10px] font-bold text-gray-300 group-hover:text-[#2563EB] w-4 shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.label}
                  </a>
                ))}
              </nav>
              <div className="mt-6 pt-5 border-t border-gray-100">
                <Link
                  to="/terms"
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#2563EB] transition-colors group"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Terms & Conditions
                  <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          </motion.aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">

            <SectionBlock id="information" number="01" icon={Eye} title="Information We Collect">
              <SubSection title="a) Account & Identity Information">
                <Ul items={[
                  "Full name, email address, and password (hashed)",
                  "Profile avatar and username",
                  "Phone number (optional)",
                  "Multi-factor authentication credentials",
                ]} />
              </SubSection>
              <SubSection title="b) Business & Company Data">
                <Ul items={[
                  "Company name, address, city, state, country, and pincode",
                  "GSTIN and other tax identification numbers",
                  "Company logo and branding assets",
                  "Industry type and business category",
                ]} />
              </SubSection>
              <SubSection title="c) Operational Data">
                <Ul items={[
                  "Product catalogs, orders, invoices, and inventory records",
                  "Customer and contact lists created within the platform",
                  "Financial transactions, journal entries, and accounting records",
                  "HR records: employee profiles, attendance, payroll (within HRMS module)",
                  "WhatsApp message templates and campaign data",
                ]} />
              </SubSection>
              <SubSection title="d) Automatically Collected Information">
                <Ul items={[
                  "IP address, browser type, and operating system",
                  "Pages visited, actions performed, and session duration",
                  "Device identifiers and timezone",
                  "Error logs and performance diagnostics",
                ]} />
              </SubSection>
            </SectionBlock>

            <SectionBlock id="use" number="02" icon={Database} title="How We Use Your Information">
              <Ul items={[
                "To create and manage your account and company workspace",
                "To deliver the modules and features you subscribe to",
                "To process billing, subscriptions, and trial management",
                "To send transactional emails — order confirmations, invoices, OTPs",
                "To provide customer support and respond to queries",
                "To detect fraud, security threats, and policy violations",
                "To generate platform analytics and improve our services",
                "To comply with applicable Indian laws and regulatory requirements",
                "To communicate product updates, feature releases, and service notices",
              ]} />
            </SectionBlock>

            <SectionBlock id="sharing" number="03" icon={Users} title="Data Sharing & Disclosure">
              <p>We <strong>do not sell</strong> your personal data to third parties. We may share limited data with:</p>
              <Ul items={[
                "Supabase Inc. — our cloud database and authentication provider",
                "Razorpay — for processing subscription payments (subject to Razorpay's Privacy Policy)",
                "Meta Platforms Inc. — for WhatsApp Business API message delivery (WhatsApp module only)",
                "Email service providers — for sending transactional and marketing emails",
                "Legal authorities — when required by law, court order, or to protect rights",
                "Service acquirers — in the event of a merger or acquisition (users will be notified)",
              ]} />
              <p className="mt-3 text-xs text-gray-400">
                All third-party providers are bound by data processing agreements consistent with applicable privacy laws.
              </p>
            </SectionBlock>

            <SectionBlock id="cookies" number="04" icon={Globe} title="Cookies & Tracking Technologies">
              <p>We use cookies and similar technologies for:</p>
              <Ul items={[
                "Session management — keeping you logged in securely",
                "Preferences — remembering your theme, language, and layout settings",
                "Analytics — understanding how the platform is used (Google Analytics 4 / GTM, if configured by your admin)",
                "Security — CSRF protection and bot detection",
              ]} />
              <p className="mt-3">
                You can disable cookies in your browser settings, but this may affect platform functionality. We do not use
                third-party advertising cookies.
              </p>
            </SectionBlock>

            <SectionBlock id="security" number="05" icon={Lock} title="Data Storage & Security">
              <p>Your data is stored on <strong>Supabase</strong> infrastructure, which uses PostgreSQL with row-level security (RLS) policies ensuring strict tenant isolation — your company's data is never accessible to other tenants.</p>
              <p className="mt-3">Security measures include:</p>
              <Ul items={[
                "TLS 1.3 encryption for all data in transit",
                "AES-256 encryption for data at rest",
                "Row-level security policies enforced at the database layer",
                "Multi-factor authentication (TOTP) available for all accounts",
                "Session timeouts and token rotation",
                "Access logs and audit trails",
                "Role-based access controls limiting data access to authorized personnel",
              ]} />
            </SectionBlock>

            <SectionBlock id="retention" number="06" icon={RefreshCw} title="Data Retention">
              <p>We retain your data for as long as your account is active or as needed to provide services.</p>
              <Ul items={[
                "Account data — retained for the lifetime of your account",
                "Business records (orders, invoices, HR) — retained for 7 years for compliance with Indian tax law",
                "WhatsApp message logs — stored temporarily; purged after 90 days",
                "Usage/access logs — retained for 12 months",
                "Billing records — retained for 7 years as required by financial regulations",
              ]} />
              <p className="mt-3">
                Upon account deletion, personal data is removed within 30 days, except where retention is required by law.
              </p>
            </SectionBlock>

            <SectionBlock id="rights" number="07" icon={Shield} title="Your Rights">
              <p>Under applicable Indian and international privacy laws, you have the right to:</p>
              <Ul items={[
                "Access — request a copy of your personal data we hold",
                "Correction — update inaccurate or incomplete information",
                "Erasure — request deletion of your personal data (subject to legal retention requirements)",
                "Portability — receive your data in a machine-readable format",
                "Restriction — limit how we process your data in certain circumstances",
                "Objection — opt out of non-essential communications",
                "Withdraw consent — for any processing based on consent",
              ]} />
              <p className="mt-3">
                To exercise these rights, email <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#2563EB] underline">{SUPPORT_EMAIL}</a> with subject line "Privacy Request". We respond within 30 days.
              </p>
            </SectionBlock>

            <SectionBlock id="third-party" number="08" icon={Globe} title="Third-Party Services">
              <p>The platform integrates with third-party services. Their use of your data is governed by their own privacy policies:</p>
              <Ul items={[
                "Supabase — Database & Authentication: supabase.com/privacy",
                "Razorpay — Payment Processing: razorpay.com/privacy",
                "Meta / WhatsApp Business API — Messaging: facebook.com/privacy",
                "Google Analytics / GTM — Analytics (if enabled by admin)",
                "Microsoft Clarity — Session Recording (if enabled by admin)",
              ]} />
              <p className="mt-3">
                We are not responsible for the privacy practices of third-party services. We recommend reviewing their policies.
              </p>
            </SectionBlock>

            <SectionBlock id="children" number="09" icon={Users} title="Children's Privacy">
              <p>
                {COMPANY}'s platform is a business-to-business (B2B) service intended exclusively for organisations and
                individuals aged 18 and above. We do not knowingly collect personal information from minors. If you believe a
                minor has created an account, contact us immediately at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#2563EB] underline">{SUPPORT_EMAIL}</a> and we will delete the account promptly.
              </p>
            </SectionBlock>

            <SectionBlock id="changes" number="10" icon={RefreshCw} title="Policy Changes">
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices, technology, or legal
                requirements. When we make material changes:
              </p>
              <Ul items={[
                "The 'Effective Date' at the top of this page will be updated",
                "We will send an email notice to the primary account holder",
                "A banner notification will appear within the platform",
              ]} />
              <p className="mt-3">
                Continued use of the platform after the effective date constitutes acceptance of the updated policy.
              </p>
            </SectionBlock>

            <SectionBlock id="contact" number="11" icon={Mail} title="Contact Us">
              <p>For privacy-related questions, data requests, or concerns, contact our privacy team:</p>
              <div className="mt-4 grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Mail, label: "Email", value: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
                  { icon: Phone, label: "Phone", value: "+91 90477 36612", href: "tel:+919047736612" },
                  { icon: MapPin, label: "Address", value: "SR Nagar, Tiruppur, Tamil Nadu, India", href: undefined },
                ].map(({ icon: Icon, label, value, href }) => (
                  <div key={label} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-[#2563EB]" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
                      {href ? (
                        <a href={href} className="text-sm text-gray-700 hover:text-[#2563EB] transition-colors">{value}</a>
                      ) : (
                        <p className="text-sm text-gray-700">{value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </SectionBlock>

            {/* Bottom nav */}
            <motion.div {...fadeUp()} className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <p className="text-xs text-gray-400">
                Last updated: {EFFECTIVE_DATE} &nbsp;·&nbsp; {COMPANY}
              </p>
              <Link
                to="/terms"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline"
              >
                Read our Terms & Conditions
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

          </div>
        </div>
      </div>

    </div>
  );
}
