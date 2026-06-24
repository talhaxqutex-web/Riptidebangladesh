import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import logoUrl from '../../assets/images/logo_1781086957751.png';

export default function Footer() {
  return (
    <footer className="bg-stone-50/60 border-t border-stone-200 mt-16 pt-10 pb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Company Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white rounded-full p-1 inline-flex items-center justify-center border border-stone-100 shadow-xs">
                <img src={logoUrl} alt="Riptide Logo" className="w-6 h-6 object-contain rounded-full mix-blend-multiply" />
              </div>
              <h3 className="text-xs font-black tracking-[0.12em] text-[#593A1B] uppercase">
                Riptide
              </h3>
            </div>
            <p className="text-[10.5px] text-stone-400 leading-relaxed font-light max-w-sm">
              Your premium destination for natural, safe, and quality products. We curate the best items for our customers, ensuring quality and satisfaction.
            </p>
            <div className="flex space-x-2 pt-1">
              <a href="#" className="w-7 h-7 rounded-full bg-white border border-stone-200/40 flex items-center justify-center text-stone-400 hover:bg-[#593A1B] hover:text-white transition-colors" title="Facebook">
                <Facebook size={12} />
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-white border border-stone-200/40 flex items-center justify-center text-stone-400 hover:bg-[#593A1B] hover:text-white transition-colors" title="Twitter">
                <Twitter size={12} />
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-white border border-stone-200/40 flex items-center justify-center text-stone-400 hover:bg-[#593A1B] hover:text-white transition-colors" title="Instagram">
                <Instagram size={12} />
              </a>
              <a href="#" className="w-7 h-7 rounded-full bg-white border border-stone-200/40 flex items-center justify-center text-stone-400 hover:bg-[#593A1B] hover:text-white transition-colors" title="Youtube">
                <Youtube size={12} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#593A1B] mb-3.5">Quick Links</h4>
            <ul className="space-y-1.5 text-[10.5px]">
              <li><Link to="/" className="text-stone-400 hover:text-[#593A1B] transition-colors font-light tracking-wide">Home</Link></li>
              <li><Link to="/" className="text-stone-400 hover:text-[#593A1B] transition-colors font-light tracking-wide">Shop</Link></li>
              <li><Link to="/" className="text-stone-400 hover:text-[#593A1B] transition-colors font-light tracking-wide">About Us</Link></li>
              <li><a href="https://wa.me/8801721929231" target="_blank" rel="noopener noreferrer" className="text-[#593A1B] hover:underline transition-colors font-semibold tracking-wide">Contact (WhatsApp)</a></li>
              <li><Link to="/" className="text-stone-400 hover:text-[#593A1B] transition-colors font-light tracking-wide">FAQs</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#593A1B] mb-3.5">Customer Services</h4>
            <ul className="space-y-1.5 text-[10.5px]">
              <li><Link to="/" className="text-stone-400 hover:text-[#593A1B] transition-colors font-light tracking-wide">Shipping Policy</Link></li>
              <li><Link to="/" className="text-stone-400 hover:text-[#593A1B] transition-colors font-light tracking-wide">Returns & Exchanges</Link></li>
              <li><Link to="/" className="text-stone-400 hover:text-[#593A1B] transition-colors font-light tracking-wide">Order Tracking</Link></li>
              <li><Link to="/" className="text-stone-400 hover:text-[#593A1B] transition-colors font-light tracking-wide">Size Guide</Link></li>
              <li><Link to="/" className="text-stone-400 hover:text-[#593A1B] transition-colors font-light tracking-wide">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#593A1B] mb-3.5">Contact Us</h4>
            <ul className="space-y-2 text-[10.5px]">
              <li className="flex items-start gap-2">
                <MapPin className="text-[#593A1B] shrink-0 mt-0.5" size={12} />
                <span className="text-stone-400 font-light tracking-wide">Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="text-[#593A1B] shrink-0" size={12} />
                <a href="https://wa.me/8801721929231" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-[#593A1B] transition-colors font-semibold tracking-wide">
                  +8801721929231
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="text-[#593A1B] shrink-0" size={12} />
                <span className="text-stone-400 font-light tracking-wide">support@riptide-shop.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-200/50 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-[9.5px] text-stone-400 font-light tracking-wider">
            &copy; {new Date().getFullYear()} Riptide. All rights reserved. Registered premium storefront.
          </p>
          <div className="flex gap-2.5">
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-3 object-contain grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Mastercard_logo.svg" alt="Mastercard" className="h-3 object-contain grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-3 object-contain grayscale opacity-30 hover:grayscale-0 hover:opacity-100 transition-all" />
          </div>
        </div>
      </div>
    </footer>
  );
}
