
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Users,
  Calendar,
  Activity,
  Globe,
  ArrowRight
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: "Message Received",
      description: "Our team will review your inquiry and get back to you shortly.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      company: "",
      subject: "",
      message: ""
    });
    setIsSubmitting(false);
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Support",
      value: `support@${PLATFORM_CONFIG.name.toLowerCase().replace(/\s+/g, '')}.com`,
      description: "Send us a detailed inquiry anytime."
    },
    {
      icon: Phone,
      title: "Phone Line",
      value: "+91 90477 36612",
      description: "Available Mon-Sun for urgent queries."
    },
    {
      icon: MapPin,
      title: "Main Office",
      value: "Tiruppur, TN, India",
      description: "Nethaji Third St, SR Nagar"
    },
    {
      icon: Clock,
      title: "Business Hours",
      value: "Mon - Sat: 6pm - 10pm",
      description: "Limited weekend availability."
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary-600 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-slate-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-center gap-3">
              <MessageSquare className="w-5 h-5 text-primary-600" />
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest italic">Get In Touch</span>
            </div>

            <h1 className="text-4xl md:text-7xl font-bold text-gray-900 tracking-tight leading-tight">
              Let's Start a <br /> <span className="text-primary-600">Conversation</span>
            </h1>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed italic font-medium">
              Ready to take your business to the next level? Our specialists are here to help you navigate your technical journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-24">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <Card className="rounded-[3rem] border-none bg-slate-50 p-10 lg:p-14 shadow-inner">
                  <CardContent className="p-0 space-y-10">
                    <div className="space-y-2">
                      <h2 className="text-3xl font-bold text-gray-900 leading-tight">Send a Inquiry</h2>
                      <p className="text-gray-500 font-medium italic">Fill out the form below and we'll respond within 24 hours.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label htmlFor="name" className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            className="h-14 rounded-xl bg-white border-gray-200 focus:ring-2 focus:ring-primary-500 shadow-sm font-medium"
                            placeholder="e.g. John Doe"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="email" className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="h-14 rounded-xl bg-white border-gray-200 focus:ring-2 focus:ring-primary-500 shadow-sm font-medium"
                            placeholder="e.g. john@company.com"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                          <Label htmlFor="company" className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Company Name</Label>
                          <Input
                            id="company"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className="h-14 rounded-xl bg-white border-gray-200 focus:ring-2 focus:ring-primary-500 shadow-sm font-medium"
                            placeholder="e.g. Acme Corp"
                          />
                        </div>
                        <div className="space-y-3">
                          <Label htmlFor="subject" className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Subject</Label>
                          <Input
                            id="subject"
                            name="subject"
                            required
                            value={formData.subject}
                            onChange={handleInputChange}
                            className="h-14 rounded-xl bg-white border-gray-200 focus:ring-2 focus:ring-primary-500 shadow-sm font-medium"
                            placeholder="e.g. Project Consultation"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="message" className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-2">Message Description</Label>
                        <Textarea
                          id="message"
                          name="message"
                          required
                          value={formData.message}
                          onChange={handleInputChange}
                          className="min-h-[160px] rounded-2xl bg-white border-gray-200 focus:ring-2 focus:ring-primary-500 shadow-sm font-medium resize-none"
                          placeholder="Tell us more about your requirements..."
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-16 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold text-lg transition-all shadow-xl shadow-primary-600/20"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">Sending... <Activity className="w-4 h-4 animate-spin" /></span>
                        ) : (
                          <span className="flex items-center gap-2">Send Message <ArrowRight className="w-5 h-5" /></span>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Contact Info Grid */}
            <div className="space-y-16">
              <div className="space-y-10">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4">Our Presence</h3>
                <div className="space-y-10">
                  {contactInfo.map((info, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-6 group"
                    >
                      <div className="w-12 h-12 bg-slate-50 border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-all shadow-sm">
                        <info.icon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-gray-300 italic">{info.title}</h4>
                        <p className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors leading-tight">{info.value}</p>
                        <p className="text-xs font-medium text-gray-400 italic mt-1">{info.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 rounded-[2.5rem] p-10 space-y-6 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/20 blur-3xl transform group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-xl font-bold tracking-tight relative z-10">Why Consult Us?</h3>
                <ul className="space-y-4 relative z-10">
                  {[
                    "Customized solution architecture",
                    "Transparent pricing models",
                    "Direct access to lead engineers"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-medium text-gray-400 italic">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Geolocated Hub */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative group">
              <div className="bg-white rounded-[3rem] h-[32rem] shadow-2xl relative z-10 border border-white flex flex-col items-center justify-center text-center p-12 overflow-hidden">
                <div className="absolute inset-0 bg-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <Globe className="w-16 h-16 text-primary-600 mx-auto mb-8 animate-pulse" />
                <h3 className="text-3xl font-bold text-gray-900 mb-4">Strategic Location</h3>
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs italic mb-4">SR NAGAR, TIRUPPUR, TAMILNADU, IN</p>
                <p className="text-gray-400 text-sm italic max-w-xs mx-auto">Providing high-end software solutions to the global technical corridor from our regional node.</p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="space-y-6">
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">Visit Our <br /><span className="text-primary-600">Headquarters</span></h2>
                <p className="text-lg text-gray-500 font-medium italic leading-relaxed">
                  Our development center is located in the heart of the technical corridor, enabling high-frequency collaboration and rapid deployment cycles.
                </p>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm border-l-8 border-l-primary-600">
                <p className="text-xl font-bold italic text-gray-900 mb-2">"Quality communication is the foundation of high-performance engineering."</p>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-300 italic">— Lead Architect</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-32 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="bg-primary-600 rounded-[3rem] p-16 md:p-24 text-white space-y-8 relative overflow-hidden shadow-2xl">
            <h2 className="text-4xl md:text-6xl font-bold leading-tight">Start Your Journey</h2>
            <p className="text-xl text-primary-50 max-w-2xl mx-auto opacity-90 italic">Creating modern solutions for complex business problems. Let's discuss your roadmap today.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Button asChild size="lg" className="h-16 px-12 rounded-xl bg-white text-primary-600 hover:bg-gray-100 font-bold text-lg">
                <Link to="/contact">Initialize Project</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-16 px-12 rounded-xl border-white/20 text-white hover:bg-white/10 font-bold text-lg backdrop-blur-sm">
                <Link to="/login">Login Access</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
