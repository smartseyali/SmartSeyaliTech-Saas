
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Code, 
  Smartphone, 
  Monitor, 
  Globe, 
  Database, 
  Cloud, 
  Shield, 
  Zap,
  Users,
  CheckCircle,
  ArrowRight
} from "lucide-react";

const Services = () => {
  const mainServices = [
    {
      icon: Code,
      title: "Web Application Development",
      description: "Custom web applications built with modern frameworks and technologies.",
      features: [
        "Responsive Design",
        "Progressive Web Apps",
        "E-commerce Solutions",
        "Content Management Systems",
        "API Development & Integration"
      ],
      technologies: ["React", "Node.js", "Python", "PHP", "Angular"],
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600&h=400&fit=crop"
    },
    {
      icon: Smartphone,
      title: "Mobile Application Development",
      description: "Native and cross-platform mobile apps for iOS and Android devices.",
      features: [
        "Native iOS & Android Apps",
        "Cross-platform Solutions",
        "UI/UX Design",
        "App Store Optimization",
        "Push Notifications & Analytics"
      ],
      technologies: ["React Native", "Flutter", "Swift", "Kotlin", "Xamarin"],
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop"
    },
    {
      icon: Monitor,
      title: "Windows/Desktop Application Development",
      description: "Powerful desktop applications for Windows and cross-platform solutions.",
      features: [
        "Enterprise Desktop Apps",
        "Legacy System Modernization",
        "Database Integration",
        "Custom Business Tools",
        "Performance Optimization"
      ],
      technologies: [".NET", "C#", "WPF", "Electron", "Java"],
      image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop"
    }
  ];

  const additionalServices = [
    {
      icon: Database,
      title: "Database Design & Management",
      description: "Scalable database solutions and optimization services."
    },
    {
      icon: Cloud,
      title: "Cloud Solutions",
      description: "Migration, deployment, and management of cloud-based applications."
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Comprehensive security audits and compliance implementation."
    },
    {
      icon: Users,
      title: "Consulting & Strategy",
      description: "Technology consulting and digital transformation guidance."
    }
  ];

  const benefits = [
    "Reduced operational costs",
    "Improved efficiency",
    "Enhanced user experience",
    "Scalable architecture",
    "Future-proof solutions",
    "Ongoing support & maintenance"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive software development services designed to transform your 
              business ideas into powerful, scalable solutions.
            </p>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-20">
            {mainServices.map((service, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-6">
                    <service.icon className="h-8 w-8 text-primary-600 mr-3" />
                    <h2 className="text-3xl font-bold text-gray-900">{service.title}</h2>
                  </div>
                  <p className="text-lg text-gray-600 mb-6">{service.description}</p>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features:</h3>
                    <ul className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center space-x-3">
                          <CheckCircle className="h-4 w-4 text-primary-600" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Technologies:</h3>
                    <div className="flex flex-wrap gap-2">
                      {service.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Button asChild className="bg-primary-600 hover:bg-primary-700">
                    <Link to="/contact">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
                
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <img 
                    src={service.image}
                    alt={service.title}
                    className="rounded-lg shadow-lg w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Additional Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Complete technology solutions to support your entire digital transformation journey.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalServices.map((service, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
                    <service.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Benefits of Working with Us
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                When you choose Smartseyali Tech, you're not just getting software development – 
                you're getting a strategic partner committed to your success.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-primary-600" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <Card className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <Zap className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                  <p className="text-gray-600 text-sm">Agile development for quick results</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <Globe className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Global Standards</h3>
                  <p className="text-gray-600 text-sm">International quality practices</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <Shield className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Secure Solutions</h3>
                  <p className="text-gray-600 text-sm">Enterprise-grade security</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-lg">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-primary-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Expert Team</h3>
                  <p className="text-gray-600 text-sm">Skilled professionals</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Let's discuss your project requirements and how we can help bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/contact">Contact Us Today</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
              <Link to="/products">View Our Work</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
