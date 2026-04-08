
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  ArrowRight,
  Sparkles,
  CheckCircle,
  Globe,
} from "lucide-react";
import PLATFORM_CONFIG from "@/config/platform";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Message Received",
      description: "Our team will review your inquiry and get back to you shortly.",
    });
    setFormData({ name: "", email: "", company: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const contactInfo = [
    { icon: Mail, title: "Email", value: `support@${PLATFORM_CONFIG.name.toLowerCase().replace(/\s+/g, '')}.com`, description: "Send us a detailed inquiry anytime.", color: "from-blue-500 to-cyan-500" },
    { icon: Phone, title: "Phone", value: "+91 90477 36612", description: "Available Mon-Sun for urgent queries.", color: "from-green-500 to-emerald-500" },
    { icon: MapPin, title: "Office", value: "Tiruppur, TN, India", description: "Nethaji Third St, SR Nagar", color: "from-violet-500 to-purple-500" },
    { icon: Clock, title: "Hours", value: "Mon - Sat: 6pm - 10pm", description: "Limited weekend availability.", color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 lg:pt-40 pb-24 bg-gradient-to-br from-gray-950 via-gray-900 to-primary-950 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <motion.div className="absolute top-20 right-[20%] w-72 h-72 bg-primary-600/20 rounded-full blur-[100px]" animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-primary-300 text-sm font-medium">
              <MessageSquare className="w-4 h-4" /> Get In Touch
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1]">
              Let's Start a
              <br />
              <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-transparent">Conversation</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Ready to take your business to the next level? Our specialists are here to help you navigate your technical journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="relative -mt-12 z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xl shadow-black/[0.04] hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group"
              >
                <div className={`w-11 h-11 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  <info.icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-xs font-medium text-gray-400 mb-0.5">{info.title}</p>
                <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{info.value}</p>
                <p className="text-xs text-gray-400 mt-1 hidden sm:block">{info.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-5 gap-16">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-3"
            >
              <div className="bg-gray-50 rounded-3xl p-8 lg:p-12 border border-gray-100">
                <div className="mb-8">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-semibold mb-4">
                    <Send className="w-4 h-4" /> Send Inquiry
                  </span>
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">How can we help?</h2>
                  <p className="text-gray-500 mt-2">Fill out the form below and we'll respond within 24 hours.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl bg-white border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl bg-white border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium transition-all"
                        placeholder="john@company.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company" className="text-sm font-semibold text-gray-700">Company</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl bg-white border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium transition-all"
                        placeholder="Acme Corp"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="h-12 rounded-xl bg-white border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium transition-all"
                        placeholder="Project Consultation"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold text-gray-700">Message</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      className="min-h-[140px] rounded-xl bg-white border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-medium resize-none transition-all"
                      placeholder="Tell us about your requirements..."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-13 rounded-xl bg-primary-600 hover:bg-primary-500 text-white font-semibold text-base shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">Sending... <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-4 h-4 border-2 border-white border-t-transparent rounded-full" /></span>
                    ) : (
                      <span className="flex items-center gap-2">Send Message <ArrowRight className="w-4 h-4" /></span>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Why Consult Us */}
              <div className="bg-gradient-to-br from-gray-900 to-primary-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-6">Why Choose Us?</h3>
                  <ul className="space-y-4">
                    {[
                      "Customized solution architecture",
                      "Transparent pricing models",
                      "Direct access to lead engineers",
                      "Rapid prototype delivery",
                      "Post-launch support included",
                    ].map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 text-sm text-gray-300"
                      >
                        <CheckCircle className="w-4 h-4 text-primary-400 shrink-0" />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 text-center">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Globe className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                </motion.div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Strategic Location</h3>
                <p className="text-sm font-semibold text-primary-600 mb-2">SR Nagar, Tiruppur, Tamil Nadu</p>
                <p className="text-xs text-gray-400">
                  Providing high-end software solutions from our regional development node.
                </p>
              </div>

              {/* Quick Connect */}
              <div className="bg-primary-50 rounded-3xl p-8 border border-primary-100">
                <Sparkles className="w-8 h-8 text-primary-600 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Quick Connect</h3>
                <p className="text-sm text-gray-500 mb-4">Prefer a direct conversation? Reach out via WhatsApp for instant support.</p>
                <Button asChild variant="outline" className="w-full rounded-xl border-primary-200 text-primary-600 hover:bg-primary-100 font-semibold">
                  <a href="https://wa.me/919047736612?text=Hello!%20I%20would%20like%20to%20chat." target="_blank" rel="noopener noreferrer">
                    Chat on WhatsApp <ArrowRight className="ml-2 w-4 h-4" />
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-primary-900 rounded-[2.5rem] p-12 lg:p-20 text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-[100px]" />
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

              <div className="relative z-10 space-y-8">
                <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                  Start Your
                  <br />
                  <span className="bg-gradient-to-r from-primary-400 to-cyan-300 bg-clip-text text-transparent">Journey Today</span>
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                  Creating modern solutions for complex business problems. Let's discuss your roadmap.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button asChild size="lg" className="h-14 px-10 rounded-full bg-primary-600 hover:bg-primary-500 text-white font-semibold shadow-2xl shadow-primary-600/30 group transition-all duration-300 hover:-translate-y-0.5">
                    <Link to="/products">
                      Explore Products <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-10 rounded-full border-white/40 bg-white/5 text-white hover:bg-white/10 font-semibold backdrop-blur-sm transition-all">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
