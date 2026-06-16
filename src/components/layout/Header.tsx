import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Settings, LogOut, Bell, Package, Globe, ShieldCheck } from 'lucide-react';
import { useStore } from '../../store';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useState } from 'react';
import logoUrl from '../../assets/images/logo_1781086957751.png';
import { getTranslation } from '../../utils/translate';

export default function Header() {
  const { cart, user, isAdmin, isOwner, language, setLanguage, searchQuery, setSearchQuery, setUser } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null, false);
      toast.success(language === 'bn' ? 'লগআউট সফল হয়েছে!' : 'Logged out successfully!');
      navigate('/');
    } catch (error) {
      toast.error(language === 'bn' ? 'লগআউট ব্যর্থ হয়েছে!' : 'Failed to log out');
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'bn' ? 'en' : 'bn';
    setLanguage(nextLang);
    toast.success(nextLang === 'bn' ? 'ভাষা পরিবর্তন করে বাংলা করা হয়েছে' : 'Language switched to English');
  };

  return (
    <>
      {/* Top Bar with deep coffee style */}
      <div className="bg-[#2D1A0C] text-[#E5C6A3] text-xs py-2 px-4 shadow-sm z-50 relative select-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="font-semibold tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            {language === 'bn' ? 'Riptide-এ আপনাকে স্বাগতম!' : 'Welcome to Riptide store!'}
          </div>
          <div className="flex items-center gap-4">
            {/* Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 cursor-pointer text-[#E5C6A3] hover:text-white transition-colors font-bold uppercase bg-[#3E2714] px-2.5 py-0.5 rounded border border-amber-900/30"
            >
              <Globe size={12} />
              {language === 'bn' ? 'English' : 'বাংলা'}
            </button>
            <Link to="/orders" className="hover:text-white transition-colors">{getTranslation(language, 'trackOrder')}</Link>
            <Link to="/" className="hover:text-white transition-colors">{getTranslation(language, 'support')}</Link>
          </div>
        </div>
      </div>

      {/* Main Header with deep brown theme and gold text accents */}
      <header className="sticky top-0 z-40 bg-[#3E2511] shadow-lg px-4 py-3 md:py-4 transition-all border-b border-[#2C180A]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="bg-white rounded-full p-1.5 inline-flex items-center justify-center shadow-md border border-[#F3C082]/20 group-hover:scale-105 transition-all">
              <img 
                src={logoUrl} 
                alt="Riptide" 
                className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-full mix-blend-multiply" 
                onError={(e) => {
                  // Fallback if image isn't loaded
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=100';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="text-2xl md:text-3xl font-black text-[#F3C082] tracking-tighter group-hover:text-white transition-colors uppercase font-mono">
                Riptide
              </span>
              <span className="text-[9px] text-[#CDB296] tracking-widest font-bold -mt-1 uppercase">
                {language === 'bn' ? 'ডিজিটাল ও ইউনিক ডিল' : 'Digital & Unique Hub'}
              </span>
            </div>
          </Link>
          
          {/* Search Bar matching Reference Image layout */}
          <div className="w-full md:w-1/2 relative bg-[#FAF6F0] rounded-full overflow-hidden flex items-center border border-[#F3C082]/20 focus-within:ring-2 focus-within:ring-[#F3C082] transition-all">
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={getTranslation(language, 'searchPlaceholder')} 
              className="w-full bg-transparent pl-5 pr-14 py-2.5 outline-none text-gray-800 placeholder-amber-900/40 text-sm font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-14 text-sm font-bold text-amber-950/40 hover:text-amber-950 hover:bg-amber-100 bg-transparent rounded-full w-5 h-5 flex items-center justify-center mr-1"
              >
                ×
              </button>
            )}
            <button className="absolute right-0 top-0 bottom-0 px-4 bg-[#F2AF5B] text-amber-950 flex justify-center items-center rounded-r-full hover:bg-amber-400 transition-colors cursor-pointer border-l border-amber-900/10">
              <Search size={18} strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Navigation Items */}
          <div className="flex items-center gap-4 text-[#E5C6A3] shrink-0 w-full md:w-auto justify-between md:justify-end">
            
            {/* Account & Dropdown Trigger */}
            <div className="relative">
              {user ? (
                <div 
                  className="flex items-center gap-2 cursor-pointer border border-[#F3C082]/20 px-4 py-1.5 rounded-full hover:bg-[#2C180A]/80 hover:text-white transition-all bg-[#4C3018] shadow-inner select-none"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  onMouseLeave={() => setDropdownOpen(false)}
                  onMouseEnter={() => setDropdownOpen(true)}
                >
                  <User size={16} className="text-[#F3C082]" />
                  <span className="text-xs text-white font-semibold truncate max-w-[120px]">
                    {user.email?.split('@')[0]}
                  </span>
                  
                  {/* Role Badges */}
                  {isOwner ? (
                    <span className="bg-red-500/20 text-red-300 font-extrabold text-[9px] px-1.5 py-0.5 rounded border border-red-500/30 font-mono">OWNER</span>
                  ) : isAdmin ? (
                    <span className="bg-amber-500/20 text-amber-300 font-extrabold text-[9px] px-1.5 py-0.5 rounded border border-amber-500/30 font-mono">ADMIN</span>
                  ) : null}

                  {dropdownOpen && (
                    <div className="absolute right-0 top-full pt-2 w-52 z-50 text-left">
                      <div className="bg-white rounded-2xl shadow-2xl border border-amber-900/10 py-1.5 overflow-hidden text-gray-800">
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-amber-50 text-amber-950 font-semibold hover:text-[#3E2511] transition-colors">
                            <Settings size={15} /> 
                            {getTranslation(language, 'adminDashboard')}
                          </Link>
                        )}
                        <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-amber-50 text-amber-950 font-semibold hover:text-[#3E2511] transition-colors">
                          <Package size={15} /> 
                          {getTranslation(language, 'myOrders')}
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-rose-600 font-semibold hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut size={15} /> 
                          {getTranslation(language, 'logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="flex items-center gap-1.5 border border-[#F3C082]/20 px-4 py-1.5 rounded-full hover:bg-[#2C180A] hover:text-white transition-all bg-[#4C3018] shadow-inner">
                  <User size={16} className="text-[#F3C082]" />
                  <span className="text-xs font-bold text-white tracking-wide">
                    {getTranslation(language, 'loginRegister')}
                  </span>
                </Link>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications Mock Icon */}
              <button className="hover:text-white transition-colors cursor-pointer relative p-1">
                <Bell size={21} />
                <span className="absolute top-0.5 right-0.5 bg-amber-500 w-2.5 h-2.5 rounded-full border-2 border-[#3E2511]"></span>
              </button>

              {/* Order Box / Package Track Icon */}
              <Link to="/orders" title="Track Orders" className="hover:text-white transition-colors relative p-1">
                <Package size={21} />
              </Link>

              {/* Cart Drawer Icon */}
              <Link to="/cart" className="hover:text-white transition-colors relative p-1 bg-[#F2AF5B]/10 hover:bg-[#F2AF5B]/20 rounded-full border border-[#F3C082]/20 font-bold flex items-center justify-center">
                <ShoppingCart size={20} className="text-[#F3C082]" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#E65F17] text-white text-[9px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-lg border-2 border-[#3E2511]">
                    {cartItemCount}
                  </span>
                )}
              </Link>
            </div>

          </div>
        </div>
      </header>
    </>
  );
}
