import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import logoUrl from '../../assets/images/logo_1781086957751.png';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-white rounded-full p-1 inline-flex items-center justify-center border border-gray-100 shadow-sm">
                <img src={logoUrl} alt="Riptide Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-full mix-blend-multiply" />
              </div>
              <h3 className="text-2xl font-extrabold text-[#593A1B] tracking-tighter">
                Riptide
              </h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your premium destination for natural, safe, and quality products. We curate the best items for our customers, ensuring quality and satisfaction.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-[#593A1B] hover:text-white transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-[#593A1B] hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-[#593A1B] hover:text-white transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-[#593A1B] hover:text-white transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-600 hover:text-[#593A1B] transition-colors">Home</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-[#593A1B] transition-colors">Shop</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-[#593A1B] transition-colors">About Us</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-[#593A1B] transition-colors">Contact</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-[#593A1B] transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-6">Customer Service</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-600 hover:text-[#593A1B] transition-colors">Shipping Policy</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-[#593A1B] transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-[#593A1B] transition-colors">Order Tracking</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-[#593A1B] transition-colors">Size Guide</Link></li>
              <li><Link to="/" className="text-gray-600 hover:text-[#593A1B] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="text-[#593A1B] shrink-0 mt-1" size={20} />
                <span className="text-gray-600">123 Commerce Avenue, Suite 100<br />New York, NY 10012</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-[#593A1B] shrink-0" size={20} />
                <span className="text-gray-600">+1 (800) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-[#593A1B] shrink-0" size={20} />
                <span className="text-gray-600">support@riptideshop.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Riptide. All rights reserved.
          </p>
          <div className="flex gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-6 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Mastercard_logo.svg" alt="Mastercard" className="h-6 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all" />
          </div>
        </div>
      </div>
    </footer>
  );
}
