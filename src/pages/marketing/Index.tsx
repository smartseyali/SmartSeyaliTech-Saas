
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowRight, Code, Smartphone, Monitor, Zap, Users, Award, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import PLATFORM_CONFIG from "@/config/platform";

const Index = () => {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("system_modules")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true })
          .limit(3);

        if (error) throw error;
        if (data && data.length > 0) {
          setServices(data.map(mod => ({
            icon: Code,
            title: mod.name,
            description: mod.tagline || mod.description
          })));
        } else {
          setServices(STATIC_SERVICES);
        }
      } catch (err) {
        setServices(STATIC_SERVICES);
      }
    };
    fetchServices();
  }, []);

  const STATIC_SERVICES = [
    {
      icon: Code,
      title: "Web Development",
      description: "Modern, responsive web applications built with cutting-edge technologies."
    },
    {
      icon: Smartphone,
      title: "Mobile Development",
      description: "Native and cross-platform mobile apps for iOS and Android."
    },
    {
      icon: Monitor,
      title: "Desktop Applications",
      description: "Powerful Windows desktop applications for enterprise solutions."
    }
  ];

  const features = [
    "Custom Software Development",
    "24/7 Technical Support",
    "Scalable Architecture",
    "Agile Development Process"
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-slate-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Innovative Solutions for{" "}
                <span className="text-primary-600">Smarter Businesses</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                {PLATFORM_CONFIG.name} Tech develops cutting-edge software products that transform
                businesses across all domains. We specialize in web, mobile, and Windows
                applications designed to solve real-world problems.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-primary-600 hover:bg-primary-700 h-14 px-8 rounded-lg shadow-lg shadow-primary-600/20 text-white font-semibold">
                  <Link to="/contact">
                    Initialize <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 px-8 rounded-lg border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold">
                  <Link to="/login">Login Access</Link>
                </Button>
              </div>
            </div>
            <div className="animate-slide-in-up">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop"
                alt="Software development workspace"
                className="rounded-2xl shadow-2xl border border-gray-100"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Core Services
            </h2>
            <div className="h-1.5 w-20 bg-primary-600 mx-auto rounded-full mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto line-height-relaxed">
              We deliver comprehensive software solutions tailored to your unique business requirements
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} className="border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-xl group overflow-hidden">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-primary-50 text-primary-600 rounded-lg mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                    <service.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-md font-bold text-gray-900 mb-4">
                    {service.title}
                  </h3>
                  <Link to="/services" className="text-primary-600 text-xs font-semibold inline-flex items-center hover:gap-2 transition-all">
                    Learn More <ArrowRight className="ml-1.5 h-3 w-3" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                  Why Choose {PLATFORM_CONFIG.name} Tech?
                </h2>
                <p className="text-lg text-gray-600">
                  We combine technical expertise with deep business insight to deliver
                  robust solutions that drive real results for your organization.
                </p>
              </div>
              <div className="grid gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="bg-primary-100 p-2 rounded-full">
                      <CheckCircle className="h-5 w-5 text-primary-600" />
                    </div>
                    <span className="text-gray-900 font-semibold">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-8">
                <Card className="border border-gray-100 shadow-md rounded-2xl p-8 hover:shadow-lg transition-shadow bg-white text-center">
                  <Zap className="h-10 w-10 text-primary-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 text-lg">Fast Delivery</h3>
                </Card>
                <Card className="border border-gray-100 shadow-md rounded-2xl p-8 hover:shadow-lg transition-shadow bg-white text-center">
                  <Award className="h-10 w-10 text-primary-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 text-lg">Quality Assured</h3>
                </Card>
              </div>
              <div className="space-y-8 mt-12">
                <Card className="border border-gray-100 shadow-md rounded-2xl p-8 hover:shadow-lg transition-shadow bg-white text-center">
                  <Users className="h-10 w-10 text-primary-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 text-lg">Expert Team</h3>
                </Card>
                <Card className="border border-gray-100 shadow-md rounded-2xl p-8 hover:shadow-lg transition-shadow bg-white text-center">
                  <Code className="h-10 w-10 text-primary-600 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900 text-lg">Modern Tech</h3>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary-600 rounded-3xl p-12 lg:p-20 text-center text-white relative overflow-hidden shadow-2xl">
            {/* Abstract background elements */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-primary-700/50 rounded-full blur-3xl"></div>

            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                Ready to Transform Your Business?
              </h2>
              <p className="text-xl text-primary-50 max-w-2xl mx-auto">
                Let's discuss how our innovative solutions can help your business grow
                and succeed in today's competitive market.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
                <Button asChild size="lg" className="bg-white text-primary-600 hover:bg-gray-100 h-16 px-12 rounded-xl font-bold text-lg shadow-xl">
                  <Link to="/contact">Initialize Project</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 h-16 px-12 rounded-xl font-bold text-lg backdrop-blur-sm">
                  <Link to="/login">Login Securely</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
