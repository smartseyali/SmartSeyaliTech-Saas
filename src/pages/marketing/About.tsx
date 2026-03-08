
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Users, Lightbulb, Award, Rocket } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We constantly push boundaries and embrace new technologies to deliver cutting-edge solutions."
    },
    {
      icon: Users,
      title: "Collaboration",
      description: "We work closely with our clients to understand their needs and deliver tailored solutions."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "We are committed to delivering high-quality software that exceeds expectations."
    },
    {
      icon: Rocket,
      title: "Growth",
      description: "We help businesses scale and grow through technology that drives efficiency and innovation."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              About Smartseyali Tech
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We are a passionate team of technology innovators dedicated to creating 
              software solutions that make a real difference in how businesses operate and grow.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Smartseyali Tech was founded with a simple yet powerful vision: to bridge 
                  the gap between complex business challenges and innovative technology solutions. 
                  We recognized that many businesses struggle to leverage technology effectively, 
                  often due to generic solutions that don't address their specific needs.
                </p>
                <p>
                  Our journey began when our founders, experienced software developers and 
                  business strategists, decided to create a company that would focus on 
                  understanding the unique requirements of each client and delivering 
                  custom solutions that truly make a difference.
                </p>
                <p>
                  Today, we continue to grow and evolve, always staying at the forefront 
                  of technology trends while maintaining our core commitment to delivering 
                  exceptional value to our clients across all industries.
                </p>
              </div>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop"
                alt="Team collaboration"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Target className="h-8 w-8 text-primary-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To empower businesses with innovative software solutions that drive 
                  efficiency, growth, and success. We are committed to understanding 
                  our clients' unique challenges and delivering technology that transforms 
                  their operations and enhances their competitive advantage.
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-6">
                  <Eye className="h-8 w-8 text-primary-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-900">Our Vision</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  To become the leading technology partner for businesses seeking 
                  innovative software solutions. We envision a future where every 
                  organization, regardless of size, can harness the power of 
                  technology to achieve their goals and create lasting impact.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              These fundamental principles guide everything we do and shape how we work 
              with our clients and each other.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 rounded-full mb-4">
                    <value.icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">What Makes Us Different</h2>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              We don't just write code – we create solutions that understand your business, 
              solve real problems, and grow with your success.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-200 mb-2">100%</div>
              <h3 className="text-lg font-semibold mb-3">Custom Solutions</h3>
              <p className="text-primary-100">
                Every project is tailored specifically to your business needs and requirements.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-200 mb-2">24/7</div>
              <h3 className="text-lg font-semibold mb-3">Support Available</h3>
              <p className="text-primary-100">
                Our team is always ready to help you when you need it most.
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-200 mb-2">10+</div>
              <h3 className="text-lg font-semibold mb-3">Years Experience</h3>
              <p className="text-primary-100">
                Decades of combined experience in software development and business strategy.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
