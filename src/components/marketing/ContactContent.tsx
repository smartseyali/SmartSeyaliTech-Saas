"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  ArrowRight,
  CheckCircle,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trackEvent } from "@/lib/gtm";
import { usePlatformSettings } from "@/hooks/useMarketingData";

const WHY_US = [
  "Customised solution architecture",
  "Transparent pricing — no hidden fees",
  "Direct access to senior engineers",
  "Rapid prototype & demo delivery",
  "Post-launch support included",
  "Dedicated WhatsApp account manager",
];

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "";

type FormStatus = "idle" | "submitting" | "success" | "error";

const CONTACT_SETTINGS_KEYS = [
  "contact_email", "contact_phone", "contact_whatsapp",
  "contact_address", "contact_address_detail",
  "contact_hours", "contact_hours_sub",
];

export function ContactContent() {
  const { settings } = usePlatformSettings(CONTACT_SETTINGS_KEYS);

  const contactInfo = [
    {
      icon: Mail,
      label: "Email",
      value: settings.contact_email   || "support@smartseyali.com",
      sub:   "We reply within 24 hours",
    },
    {
      icon: Phone,
      label: "Phone",
      value: settings.contact_phone   || "+91 90477 36612",
      sub:   "Mon–Sat, available on WhatsApp",
    },
    {
      icon: MapPin,
      label: "Office",
      value: settings.contact_address || "SR Nagar, Tiruppur, TN",
      sub:   settings.contact_address_detail || "Nethaji Third Street, India",
    },
    {
      icon: Clock,
      label: "Hours",
      value: settings.contact_hours   || "Mon–Sat: 6pm – 10pm",
      sub:   settings.contact_hours_sub || "Limited weekend support",
    },
  ];

  const whatsappHref = `https://wa.me/${settings.contact_whatsapp || "919047736612"}?text=Hello!%20I%20would%20like%20to%20chat.`;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    trackEvent("contact_form_submit", {
      form_location: "/contact",
      has_company: !!formData.company,
    });

    if (!WEB3FORMS_KEY) {
      const body = `Name: ${formData.name}\nEmail: ${formData.email}\nCompany: ${formData.company}\nSubject: ${formData.subject}\n\n${formData.message}`;
      window.location.href = `mailto:${settings.contact_email || "support@smartseyali.com"}?subject=${encodeURIComponent(
        formData.subject || "Demo request"
      )}&body=${encodeURIComponent(body)}`;
      setStatus("success");
      setFormData({ name: "", email: "", company: "", subject: "", message: "" });
      return;
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `[SmartSeyali] ${formData.subject || "Demo request"}`,
          from_name: formData.name,
          email: formData.email,
          company: formData.company,
          message: formData.message,
          replyto: formData.email,
        }),
      });
      const result = await response.json();
      if (result.success) {
        setStatus("success");
        setFormData({ name: "", email: "", company: "", subject: "", message: "" });
        trackEvent("contact_form_success", { form_location: "/contact" });
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      trackEvent("contact_form_error", { form_location: "/contact" });
    }
  };

  return (
    <div className="bg-white">
      <section className="relative bg-white pt-32 pb-16 lg:pt-40 lg:pb-20 border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-gradient-to-bl from-primary-50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary-600 mb-4 block">Get In Touch</span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Let&apos;s Start a
              <br />
              <span className="text-primary-600">Conversation</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              Ready to modernise your business operations? Our specialists will map out the right platform for your exact
              workflow — no obligation.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-primary-50">
                  <info.icon className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-0.5">{info.label}</p>
                  <p className="text-sm font-semibold text-gray-900">{info.value}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5 hidden sm:block">{info.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-3">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary-50">
                    <Send className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Send us a message</h2>
                    <p className="text-sm text-gray-500">We&apos;ll respond within 24 hours.</p>
                  </div>
                </div>

                {status === "success" ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-1">Message sent</h3>
                    <p className="text-sm text-gray-600">
                      We&apos;ve received your enquiry and will respond within 24 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => setStatus("idle")}
                      className="mt-4 text-sm font-semibold text-primary-600 hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="name">
                          Full Name <span className="text-red-400">*</span>
                        </Label>
                        <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="John Doe" className="h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="email">
                          Email Address <span className="text-red-400">*</span>
                        </Label>
                        <Input id="email" name="email" type="email" required value={formData.email} onChange={handleChange} placeholder="john@company.com" className="h-11" />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" name="company" value={formData.company} onChange={handleChange} placeholder="Acme Corp" className="h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="subject">
                          Subject <span className="text-red-400">*</span>
                        </Label>
                        <Input id="subject" name="subject" required value={formData.subject} onChange={handleChange} placeholder="Demo Request" className="h-11" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="message">
                        Message <span className="text-red-400">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell us about your business and what you'd like to achieve..."
                        className="min-h-[130px] resize-none"
                      />
                    </div>

                    {status === "error" && errorMessage && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">{errorMessage}</div>
                    )}

                    <Button type="submit" disabled={status === "submitting"} className="w-full h-11 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-0 transition-colors">
                      {status === "submitting" ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Send Message <ArrowRight className="w-4 h-4" />
                        </span>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="lg:col-span-2 space-y-5">
              <div className="bg-gray-900 rounded-xl p-7 text-white">
                <h3 className="font-bold text-base mb-5">Why Choose SmartSeyali?</h3>
                <ul className="space-y-3">
                  {WHY_US.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-primary-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-primary-50">
                  <Globe className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Based in Tiruppur</h3>
                  <p className="text-sm text-primary-600">SR Nagar, Tamil Nadu, India</p>
                  <p className="text-xs text-gray-400 mt-1">Serving clients across India and beyond.</p>
                </div>
              </div>

              <div className="border border-primary-200 bg-primary-50/50 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-gray-900">Quick Connect</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Prefer a direct conversation? Chat with us on WhatsApp for instant support.
                </p>
                <Button asChild variant="outline" className="w-full h-10 border-blue-300 text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-colors">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                    onClick={() => trackEvent("whatsapp_click", { source: "/contact" })}
                  >
                    Chat on WhatsApp <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-primary-50 border-t border-primary-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">Start Your Journey Today</h2>
            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
              Explore our full service lineup and see how SmartSeyali fits your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white border-0 transition-colors">
                <Link href="/services">
                  Explore Services <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 px-8 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 bg-white transition-colors">
                <Link href="/login">Sign In to Dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
