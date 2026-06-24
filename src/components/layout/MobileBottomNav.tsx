import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Grid, ShoppingCart, Package, User } from 'lucide-react';
import { useStore } from '../../store';
import { getTranslation } from '../../utils/translate';

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, language, user } = useStore();
  
  const cartItemCount = cart.reduce((temp, item) => temp + item.quantity, 0);

  // Navigate to path, or if on Home page, handle scrolling
  const handleNav = (path: string, elementId?: string) => {
    if (path === '/') {
      navigate('/');
      if (elementId) {
        setTimeout(() => {
          const el = document.getElementById(elementId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] z-50 px-4 py-2 flex items-center justify-between pb-safe">
      
      {/* Category button */}
      <button 
        onClick={() => handleNav('/', 'categories-section')}
        className="flex flex-col items-center justify-center flex-1 py-1 text-stone-500 hover:text-[#3E2511] transition-colors focus:outline-none"
      >
        <Grid size={20} className="text-stone-600" />
        <span className="text-[9px] font-bold mt-1 text-stone-500">
          {language === 'bn' ? 'ক্যাটাগরি' : 'Categories'}
        </span>
      </button>

      {/* Cart Button with badge */}
      <button 
        onClick={() => handleNav('/cart')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors focus:outline-none relative ${
          isActive('/cart') ? 'text-[#3E2511]' : 'text-stone-500'
        }`}
      >
        <div className="relative">
          <ShoppingCart size={20} />
          {cartItemCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-[#E65F17] text-white text-[8px] font-black w-4.5 h-4.5 flex items-center justify-center rounded-full">
              {cartItemCount}
            </span>
          )}
        </div>
        <span className="text-[9px] font-bold mt-1">
          {language === 'bn' ? 'কার্ট' : 'Cart'}
        </span>
      </button>

      {/* Raised Center Home Button (Matching Reference Screenshot) */}
      <div className="flex-1 flex justify-center -mt-6">
        <button 
          onClick={() => handleNav('/')}
          className="w-13 h-13 rounded-full bg-[#4C3018] border-4 border-white text-[#F3C082] flex items-center justify-center shadow-lg transform active:scale-95 transition-all focus:outline-none cursor-pointer"
        >
          <Home size={22} className="text-white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Orders button */}
      <button 
        onClick={() => handleNav('/orders')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors focus:outline-none ${
          isActive('/orders') ? 'text-[#3E2511]' : 'text-stone-500'
        }`}
      >
        <Package size={20} />
        <span className="text-[9px] font-bold mt-1">
          {language === 'bn' ? 'অর্ডারসমূহ' : 'Orders'}
        </span>
      </button>

      {/* Profile button */}
      <button 
        onClick={() => handleNav('/auth')}
        className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors focus:outline-none ${
          isActive('/auth') ? 'text-[#3E2511]' : 'text-stone-500'
        }`}
      >
        <User size={20} />
        <span className="text-[9px] font-bold mt-1">
          {user ? (language === 'bn' ? 'প্রোফাইল' : 'Profile') : (language === 'bn' ? 'লগইন' : 'Login')}
        </span>
      </button>

    </div>
  );
}
