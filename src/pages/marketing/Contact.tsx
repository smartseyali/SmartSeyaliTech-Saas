import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Mail, Phone, MapPin, Clock, Send, MessageSquare,
  ArrowRight, CheckCircle, Globe,
} from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const PRIMARY = "#2563EB";

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email",
    value: `support@${PLATFORM_CONFIG.name.toLowerCase().replace(/\s+/g, "")}.com`,
    sub: "We reply within 24 hours",
  },
  {
    icon: Phone,
    label: "Phone",
    value: "+91 90477 36612",
    sub: "Mon–Sat, available on WhatsApp",
  },
  {
    icon: MapPin,
    label: "Office",
    value: "SR Nagar, Tiruppur, TN",
    sub: "Nethaji Third Street, India",
  },
  {
    icon: Clock,
    label: "Hours",
    value: "Mon–Sat: 6pm – 10pm",
    sub: "Limited weekend support",
  },
];

const WHY_US = [
  "Customised solution architecture",
  "Transparent pricing — no hidden fees",
  "Direct access to senior engineers",
  "Rapid prototype & demo delivery",
  "Post-launch support included",
  "Dedicated WhatsApp account manager",
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", company: "", subject: "", message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    toast({ title: "Message received", description: "We'll get back to you within 24 hours." });
    setFormData({ name: "", email: "", company: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-white pt-32 pb-16 lg:pt-40 lg:pb-20 border-b border-gray-100">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(37,99,235,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(37,99,235,0.03)_1px,transparent_1px)] bg-[size:48px_48px]" />
        <div className="absolute top-0 right-0 w-[500px] h-[400px] bg-gradient-to-bl from-blue-50 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <span className="text-xs font-semibold uppercase tracking-widest mb-4 block" style={{ color: PRIMARY }}>
              Get In Touch
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Let's Start a
              <br />
              <span style={{ color: PRIMARY }}>Conversation</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed">
              Ready to modernise your business operations? Our specialists will map out the right
              platform for your exact workflow — no obligation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Contact info strip ───────────────────────────────────────────── */}
      <section className="py-10 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {CONTACT_INFO.map((info, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-4"
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(37,99,235,0.08)" }}>
                  <info.icon className="w-4 h-4" style={{ color: PRIMARY }} />
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

      {/* ── Form + Sidebar ───────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 lg:p-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(37,99,235,0.1)" }}>
                    <Send className="w-4 h-4" style={{ color: PRIMARY }} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Send us a message</h2>
                    <p className="text-sm text-gray-500">We'll respond within 24 hours.</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name <span className="text-red-400">*</span></Label>
                      <Input
                        id="name" name="name" required
                        value={formData.name} onChange={handleChange}
                        placeholder="John Doe"
                        className="h-11 rounded border-gray-200 bg-white text-sm focus:border-blue-300 focus:ring-blue-200"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address <span className="text-red-400">*</span></Label>
                      <Input
                        id="email" name="email" type="email" required
                        value={formData.email} onChange={handleChange}
                        placeholder="john@company.com"
                        className="h-11 rounded border-gray-200 bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <Label htmlFor="company" className="text-sm font-medium text-gray-700">Company</Label>
                      <Input
                        id="company" name="company"
                        value={formData.company} onChange={handleChange}
                        placeholder="Acme Corp"
                        className="h-11 rounded border-gray-200 bg-white text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="subject" className="text-sm font-medium text-gray-700">Subject <span className="text-red-400">*</span></Label>
                      <Input
                        id="subject" name="subject" required
                        value={formData.subject} onChange={handleChange}
                        placeholder="Demo Request"
                        className="h-11 rounded border-gray-200 bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="message" className="text-sm font-medium text-gray-700">Message <span className="text-red-400">*</span></Label>
                    <Textarea
                      id="message" name="message" required
                      value={formData.message} onChange={handleChange}
                      placeholder="Tell us about your business and what you'd like to achieve..."
                      className="min-h-[130px] rounded border-gray-200 bg-white text-sm resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 rounded font-semibold text-sm text-white shadow-md disabled:opacity-60"
                    style={{ background: PRIMARY }}
                  >
                    {isSubmitting ? (
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
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-5"
            >
              {/* Why choose us */}
              <div className="bg-gray-900 rounded-xl p-7 text-white">
                <h3 className="font-bold text-base mb-5">Why Choose {PLATFORM_CONFIG.name}?</h3>
                <ul className="space-y-3">
                  {WHY_US.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-300">
                      <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: PRIMARY }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Location */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(37,99,235,0.1)" }}>
                  <Globe className="w-5 h-5" style={{ color: PRIMARY }} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Based in Tiruppur</h3>
                  <p className="text-sm" style={{ color: PRIMARY }}>SR Nagar, Tamil Nadu, India</p>
                  <p className="text-xs text-gray-400 mt-1">Serving clients across India and beyond.</p>
                </div>
              </div>

              {/* WhatsApp quick connect */}
              <div className="border rounded-xl p-6" style={{ borderColor: "rgba(37,99,235,0.2)", background: "rgba(37,99,235,0.04)" }}>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-5 h-5" style={{ color: PRIMARY }} />
                  <h3 className="font-bold text-gray-900">Quick Connect</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Prefer a direct conversation? Chat with us on WhatsApp for instant support.
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-10 rounded border font-semibold text-sm"
                  style={{ borderColor: PRIMARY, color: PRIMARY }}
                >
                  <a
                    href="https://wa.me/919047736612?text=Hello!%20I%20would%20like%20to%20chat."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    Chat on WhatsApp <ArrowRight className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-[#EFF6FF] border-t border-blue-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Start Your Journey Today
            </h2>
            <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto">
              Explore our full product lineup and see how SmartSeyali fits your business.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                asChild size="lg"
                className="bg-[#2563EB] hover:bg-blue-700 text-white h-12 px-8 rounded font-semibold text-sm shadow-md"
              >
                <Link to="/products">
                  Explore Products <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild variant="outline" size="lg"
                className="border-blue-200 text-[#2563EB] hover:bg-blue-50 h-12 px-8 rounded font-semibold text-sm"
              >
                <Link to="/login">Sign In to Dashboard</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
