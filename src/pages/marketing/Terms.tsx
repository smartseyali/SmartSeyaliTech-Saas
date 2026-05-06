import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Shield, FileText, CreditCard, AlertTriangle, Scale,
  Lock, Users, Globe, RefreshCw, Mail, Phone, MapPin,
  CheckCircle, XCircle, ArrowRight,
} from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";

const COMPANY = `${PLATFORM_CONFIG.name} Tech`;
const SUPPORT_EMAIL = `support@${PLATFORM_CONFIG.name.toLowerCase().replace(/\s+/g, "")}.com`;
const WEBSITE = `https://www.${PLATFORM_CONFIG.name.toLowerCase().replace(/\s+/g, "")}.com`;
const EFFECTIVE_DATE = "1 May 2026";

const SECTIONS = [
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "description", label: "Platform Description" },
  { id: "accounts", label: "Accounts & Registration" },
  { id: "billing", label: "Subscription & Billing" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "ip", label: "Intellectual Property" },
  { id: "data", label: "Data & Privacy" },
  { id: "availability", label: "Service Availability" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "termination", label: "Termination" },
  { id: "governing-law", label: "Governing Law" },
  { id: "changes", label: "Changes to Terms" },
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

export default function TermsAndConditions() {
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
              Terms &
              <br />
              <span className="text-[#2563EB]">Conditions</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed max-w-2xl mb-6">
              Please read these terms carefully before using the {PLATFORM_CONFIG.name} business platform.
              By accessing or using our services, you agree to be bound by these terms.
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
              <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
              <span className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                Governed by Indian Law
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Body ─────────────────────────────────────────────────────── */}
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
                  to="/policy"
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#2563EB] transition-colors group"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Privacy Policy
                  <ArrowRight className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </div>
            </div>
          </motion.aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">

            <SectionBlock id="acceptance" number="01" icon={CheckCircle} title="Acceptance of Terms">
              <p>
                By accessing or using {COMPANY}'s {PLATFORM_CONFIG.name} platform ("Service"), you ("User", "Customer", or
                "you") agree to be legally bound by these Terms and Conditions ("Terms"). If you are accessing the Service on
                behalf of an organisation, you represent that you have the authority to bind that organisation.
              </p>
              <p className="mt-3">
                If you do not agree to these Terms, you must not access or use the Service. These Terms apply to all
                visitors, registered users, and subscribers.
              </p>
            </SectionBlock>

            <SectionBlock id="description" number="02" icon={Globe} title="Platform Description">
              <p>
                {PLATFORM_CONFIG.name} is a multi-tenant Software-as-a-Service (SaaS) business management platform that
                provides modular applications including, but not limited to:
              </p>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                {[
                  "E-Commerce & Storefront",
                  "Point of Sale (POS)",
                  "CRM & Customer Management",
                  "Sales Management",
                  "Inventory & Warehouse",
                  "Purchase Management",
                  "HRMS & Payroll",
                  "Finance & Accounting",
                  "WhatsApp Business Integration",
                  "Website Builder",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4">
                Features and modules are subject to change. {COMPANY} reserves the right to modify, discontinue, or add
                features with reasonable notice to subscribers.
              </p>
            </SectionBlock>

            <SectionBlock id="accounts" number="03" icon={Users} title="Account Registration & Security">
              <SubSection title="3.1 Registration">
                <Ul items={[
                  "You must provide accurate, complete, and current information when registering",
                  "Each company workspace is an independent tenant — data is fully isolated",
                  "One primary admin account is created per company registration",
                  "You must be at least 18 years old to create an account",
                ]} />
              </SubSection>
              <SubSection title="3.2 Account Security">
                <Ul items={[
                  "You are responsible for maintaining the confidentiality of your login credentials",
                  "You must notify us immediately at " + SUPPORT_EMAIL + " of any unauthorised access",
                  "We recommend enabling Multi-Factor Authentication (MFA/TOTP) for all accounts",
                  "We are not liable for losses caused by unauthorised use of your account credentials",
                ]} />
              </SubSection>
              <SubSection title="3.3 Super Admin Access">
                <p>
                  Company owners and super admins have elevated permissions. They are solely responsible for managing
                  user roles, permissions, and data access within their tenant workspace.
                </p>
              </SubSection>
            </SectionBlock>

            <SectionBlock id="billing" number="04" icon={CreditCard} title="Subscription & Billing">
              <SubSection title="4.1 Subscription Model">
                <p>
                  {PLATFORM_CONFIG.name} operates on a per-module subscription model. Each installed module is billed
                  separately at the listed monthly price. Core modules included with all accounts are free of charge.
                </p>
              </SubSection>
              <SubSection title="4.2 Billing Cycle & Payments">
                <Ul items={[
                  "Subscriptions are billed monthly on the first day of each billing cycle",
                  "Payments are processed via Razorpay in Indian Rupees (INR)",
                  "All prices are exclusive of applicable GST unless stated otherwise",
                  "Invoices are generated automatically and available in your billing dashboard",
                ]} />
              </SubSection>
              <SubSection title="4.3 Free Trials">
                <p>
                  Certain modules may offer a free trial period (as indicated on the module listing). At the end of the
                  trial, the module will require an active subscription to continue use. No payment information is required
                  to start a trial.
                </p>
              </SubSection>
              <SubSection title="4.4 Refund Policy">
                <p>
                  Monthly subscriptions are non-refundable once a billing cycle has begun. If you cancel during a cycle,
                  access continues until the end of that period. We may issue credits at our discretion for service
                  interruptions exceeding 24 hours caused by our infrastructure.
                </p>
              </SubSection>
              <SubSection title="4.5 Price Changes">
                <p>
                  We reserve the right to change subscription prices. We will provide at least 30 days' advance notice
                  via email and platform notification before any price change takes effect.
                </p>
              </SubSection>
            </SectionBlock>

            <SectionBlock id="acceptable-use" number="05" icon={Shield} title="Acceptable Use Policy">
              <SubSection title="5.1 Permitted Use">
                <p>You may use the Service only for lawful business operations and in accordance with these Terms.</p>
              </SubSection>
              <SubSection title="5.2 Prohibited Activities">
                <p className="mb-2">You must not:</p>
                <div className="space-y-2">
                  {[
                    "Use the Service for any unlawful, fraudulent, or deceptive purpose",
                    "Attempt to gain unauthorised access to other tenants' data or system resources",
                    "Upload or transmit viruses, malware, or malicious code",
                    "Conduct automated scraping, crawling, or data harvesting without written consent",
                    "Resell, sublicense, or white-label the Service without a written reseller agreement",
                    "Use the WhatsApp integration in violation of Meta's Business Messaging Policy",
                    "Store or transmit content that is illegal, defamatory, obscene, or infringing",
                    "Attempt to reverse-engineer, decompile, or extract source code from the platform",
                    "Use the Service to send unsolicited bulk communications (spam)",
                    "Misrepresent your identity or impersonate another person or organisation",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-gray-600">
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </SubSection>
              <p className="mt-2">
                Violation of this policy may result in immediate suspension or termination of your account without refund.
              </p>
            </SectionBlock>

            <SectionBlock id="ip" number="06" icon={Lock} title="Intellectual Property">
              <SubSection title="6.1 Our Intellectual Property">
                <p>
                  The {PLATFORM_CONFIG.name} platform, including all software, source code, design, trademarks, logos, and
                  documentation, is the exclusive intellectual property of {COMPANY}. You receive a limited, non-exclusive,
                  non-transferable licence to use the Service during your subscription.
                </p>
              </SubSection>
              <SubSection title="6.2 Your Data">
                <p>
                  You retain full ownership of all data, content, and business information you upload or create within the
                  platform ("Customer Data"). You grant {COMPANY} a limited licence to process and store Customer Data
                  solely to provide the Service.
                </p>
              </SubSection>
              <SubSection title="6.3 Feedback">
                <p>
                  Any feedback, suggestions, or ideas you submit may be used by {COMPANY} without obligation or compensation
                  to you.
                </p>
              </SubSection>
            </SectionBlock>

            <SectionBlock id="data" number="07" icon={Shield} title="Data & Privacy">
              <p>
                Your use of the Service is also governed by our{" "}
                <Link to="/policy" className="text-[#2563EB] underline">Privacy Policy</Link>, which is incorporated into
                these Terms by reference. Key commitments:
              </p>
              <Ul items={[
                "Your data is stored with strict tenant isolation — no other customer can access your data",
                "We process your data only as necessary to deliver the subscribed services",
                "We never sell your personal or business data to third parties",
                "You can export or delete your data at any time by contacting support",
                "On account termination, your data is deleted within 30 days (except where law requires longer retention)",
              ]} />
            </SectionBlock>

            <SectionBlock id="availability" number="08" icon={RefreshCw} title="Service Availability & SLA">
              <p>
                We target 99.5% monthly uptime for the {PLATFORM_CONFIG.name} platform, excluding scheduled maintenance
                windows (announced at least 24 hours in advance).
              </p>
              <Ul items={[
                "Scheduled maintenance is typically performed on Sundays between 02:00–06:00 IST",
                "We will notify you via email and in-platform banner for planned downtime",
                "Unplanned outages will be communicated as soon as identified",
                "We do not guarantee uninterrupted or error-free service",
                "Third-party service outages (Supabase, Razorpay, Meta) are outside our direct control",
              ]} />
            </SectionBlock>

            <SectionBlock id="liability" number="09" icon={AlertTriangle} title="Limitation of Liability">
              <p>
                To the maximum extent permitted by applicable law:
              </p>
              <Ul items={[
                "The Service is provided 'as is' without warranties of any kind, express or implied",
                COMPANY + " shall not be liable for indirect, incidental, special, consequential, or punitive damages",
                "Our total aggregate liability to you in any 12-month period shall not exceed the fees you paid to us in that period",
                "We are not liable for data loss resulting from your actions, third-party failures, or force majeure events",
                "We are not responsible for losses arising from your use of integrated third-party services",
              ]} />
              <p className="mt-3">
                Some jurisdictions do not allow limitation of implied warranties or liability; in such cases, our liability
                is limited to the greatest extent permitted by applicable law.
              </p>
            </SectionBlock>

            <SectionBlock id="indemnification" number="10" icon={Shield} title="Indemnification">
              <p>
                You agree to indemnify, defend, and hold harmless {COMPANY}, its directors, officers, employees, and
                agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
              </p>
              <Ul items={[
                "Your use or misuse of the Service",
                "Your violation of these Terms",
                "Your violation of any third-party rights (intellectual property, privacy, etc.)",
                "Any content or data you upload or process through the Service",
                "Any illegal activity carried out using your account",
              ]} />
            </SectionBlock>

            <SectionBlock id="termination" number="11" icon={XCircle} title="Termination">
              <SubSection title="11.1 Termination by You">
                <p>
                  You may cancel your subscription at any time from the Billing section of your dashboard. Cancellation
                  takes effect at the end of the current billing period. You retain access until that date.
                </p>
              </SubSection>
              <SubSection title="11.2 Termination by Us">
                <p>We may suspend or terminate your account immediately if:</p>
                <Ul items={[
                  "You materially breach these Terms and fail to cure within 7 days of notice",
                  "You use the Service for fraudulent, illegal, or harmful activities",
                  "Your account is involved in a security incident or data breach",
                  "Required to do so by law or regulation",
                  "Subscription payments remain unpaid for more than 14 days after the due date",
                ]} />
              </SubSection>
              <SubSection title="11.3 Effect of Termination">
                <p>
                  Upon termination, your access to the Service ceases. You may request an export of your Customer Data
                  within 14 days of termination. After 30 days, your data will be permanently deleted.
                </p>
              </SubSection>
            </SectionBlock>

            <SectionBlock id="governing-law" number="12" icon={Scale} title="Governing Law & Dispute Resolution">
              <p>
                These Terms are governed by and construed in accordance with the laws of India, specifically:
              </p>
              <Ul items={[
                "Information Technology Act, 2000 and its amendments",
                "Digital Personal Data Protection Act, 2023 (DPDPA)",
                "Indian Contract Act, 1872",
              ]} />
              <p className="mt-3">
                Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction
                of the courts in <strong>Tiruppur, Tamil Nadu, India</strong>.
              </p>
              <p className="mt-3">
                Before initiating legal proceedings, both parties agree to attempt good-faith resolution through direct
                negotiation for a period of 30 days.
              </p>
            </SectionBlock>

            <SectionBlock id="changes" number="13" icon={RefreshCw} title="Changes to Terms">
              <p>
                {COMPANY} reserves the right to modify these Terms at any time. When material changes are made:
              </p>
              <Ul items={[
                "The 'Effective Date' at the top of this page will be updated",
                "We will send email notice to the primary account holder at least 14 days before changes take effect",
                "A banner notification will appear within the platform",
                "Continued use after the effective date constitutes acceptance of the revised Terms",
              ]} />
              <p className="mt-3">
                If you do not agree to the revised Terms, you must cease using the Service and may cancel your subscription
                before the effective date for a pro-rated refund of any unused prepaid subscription.
              </p>
            </SectionBlock>

            <SectionBlock id="contact" number="14" icon={Mail} title="Contact Us">
              <p>For questions about these Terms, billing disputes, or legal notices, contact us:</p>
              <div className="mt-4 grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Mail, label: "Legal / Support", value: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
                  { icon: Phone, label: "Phone", value: "+91 90477 36612", href: "tel:+919047736612" },
                  { icon: MapPin, label: "Registered Office", value: "SR Nagar, Tiruppur, Tamil Nadu 641601, India", href: undefined },
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
                to="/policy"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#2563EB] hover:underline"
              >
                Read our Privacy Policy
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>

          </div>
        </div>
      </div>

    </div>
  );
}
