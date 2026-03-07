
import { Link } from "react-router-dom";
import { Code, Smartphone, Monitor, Mail, Phone, MapPin, Facebook, Instagram, Github } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center space-x-1">
               <img src="/favicon.ico" alt="logo" className="h-10 w-10 object-contain" />
              </div>
              <span className="text-xl font-bold">Smartseyali Tech</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Innovative technology startup focused on developing cutting-edge software 
              solutions that help businesses thrive in the digital age. We specialize 
              in web, mobile, and desktop applications.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/smartseyalitech" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/smartseyalitech" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              
              <a href="https://github.com/smartseyali" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-gray-300 hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/products" className="text-gray-300 hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/contact" className="text-gray-300 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary-500" />
                <span className="text-gray-300">smartseyali@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary-500" />
                <span className="text-gray-300">+91 90477 36612</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary-500" />
                <span className="text-gray-300">Nethaji 3rd Street, SR Nagar, Tiruppur, IN</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © {currentYear} Smartseyali Tech. All rights reserved. | Built with innovation and passion.
          </p>
        </div>
      </div>
    </footer>
  );
};
