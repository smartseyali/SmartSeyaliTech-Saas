
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { 
  ExternalLink, 
  Github, 
  Code, 
  Smartphone, 
  Monitor, 
  Globe,
  Database,
  Cloud,
  Zap,
  Users,
  ShoppingCart,
  BarChart3
} from "lucide-react";

const Products = () => {
  const featuredProducts = [
    {
      title: "SmartCRM Pro",
      category: "Web Application",
      description: "A comprehensive customer relationship management system designed for small to medium businesses. Features advanced analytics, automation workflows, and seamless integrations.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
      status: "In Development",
      technologies: ["React", "Node.js", "PostgreSQL", "Redis"],
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "RetailSync Mobile",
      category: "Mobile Application",
      description: "Advanced inventory management mobile app for retail businesses. Real-time stock tracking, barcode scanning, and automated reordering capabilities.",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop",
      status: "Coming Soon",
      technologies: ["React Native", "Express", "MongoDB", "AWS"],
      icon: ShoppingCart,
      color: "bg-green-500"
    },
    {
      title: "DataViz Desktop",
      category: "Desktop Application",
      description: "Powerful data visualization and analysis tool for Windows. Create interactive dashboards, generate reports, and perform complex data operations with ease.",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=600&h=400&fit=crop",
      status: "Planning Phase",
      technologies: [".NET", "C#", "SQLite", "WPF"],
      icon: BarChart3,
      color: "bg-purple-500"
    }
  ];

  const productCategories = [
    {
      icon: Globe,
      title: "Web Applications",
      count: "12+ Projects",
      description: "Modern, responsive web applications built with cutting-edge technologies."
    },
    {
      icon: Smartphone,
      title: "Mobile Apps",
      count: "8+ Projects",
      description: "Native and cross-platform mobile applications for iOS and Android."
    },
    {
      icon: Monitor,
      title: "Desktop Software",
      count: "6+ Projects",
      description: "Powerful Windows desktop applications for enterprise and business use."
    },
    {
      icon: Cloud,
      title: "Cloud Solutions",
      count: "10+ Projects",
      description: "Scalable cloud-based applications and microservices architecture."
    }
  ];

  const upcomingFeatures = [
    "AI-powered analytics dashboard",
    "Advanced reporting capabilities",
    "Multi-platform synchronization",
    "Enhanced security features",
    "Integration marketplace",
    "Mobile-first design approach"
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Our Products
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Innovative software products designed to solve real business challenges 
              and drive efficiency across various industries.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Take a look at our current and upcoming product lineup designed to 
              transform how businesses operate.
            </p>
          </div>

          <div className="space-y-16">
            {featuredProducts.map((product, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:grid-flow-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-4">
                    <div className={`inline-flex items-center justify-center w-10 h-10 ${product.color} rounded-lg mr-3`}>
                      <product.icon className="h-5 w-5 text-white" />
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {product.category}
                    </Badge>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{product.title}</h3>
                  <p className="text-lg text-gray-600 mb-6">{product.description}</p>
                  
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <span className="text-sm font-medium text-gray-900 mr-2">Status:</span>
                      <Badge 
                        variant={product.status === 'In Development' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {product.status}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {product.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      asChild 
                      className="bg-primary-600 hover:bg-primary-700"
                      disabled={product.status !== 'In Development'}
                    >
                      <Link to="/contact">
                        Learn More <ExternalLink className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" disabled>
                      <Github className="mr-2 h-4 w-4" />
                      View Demo
                    </Button>
                  </div>
                </div>
                
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <div className="relative">
                    <img 
                      src={product.image}
                      alt={product.title}
                      className="rounded-lg shadow-lg w-full"
                    />
                    <div className="absolute inset-0 bg-primary-600/10 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Categories */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Product Categories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We develop products across multiple platforms and technologies to meet 
              diverse business requirements.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {productCategories.map((category, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
                    <category.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-primary-600 font-medium text-sm mb-3">
                    {category.count}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                What's Coming Next
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                We're constantly innovating and adding new features to our product lineup. 
                Here's what we're working on for the future.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {upcomingFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Zap className="h-4 w-4 text-primary-600" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop"
                alt="Future technology"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Custom Product Development */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Need a Custom Solution?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Don't see exactly what you're looking for? We specialize in creating 
            custom software products tailored to your specific business needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link to="/contact">
                Discuss Your Project
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary-600">
              <Link to="/services">
                View Our Services
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
