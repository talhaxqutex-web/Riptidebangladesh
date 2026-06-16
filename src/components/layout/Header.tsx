import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Settings, LogOut, Bell, Package } from 'lucide-react';
import { useStore } from '../../store';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';
import { useState } from 'react';
import logoUrl from '../../assets/images/logo_1781086957751.png';

export default function Header() {
  const { cart, user, isAdmin, setUser } = useStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null, false);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#3B220B] text-[#D1B89C] text-xs py-2 px-4 shadow-sm z-50 relative">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>Welcome to Riptide!</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
              <LogOut size={12} className="rotate-90" /> English
            </span>
            <Link to="/orders" className="hover:text-white transition-colors">Track Order</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Support</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-40 bg-[#593A1B] shadow-md p-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-white rounded-full p-1 inline-flex items-center justify-center shadow-sm">
              <img src={logoUrl} alt="Riptide" className="w-8 h-8 md:w-10 md:h-10 object-contain rounded-full mix-blend-multiply" />
            </div>
            <span className="text-2xl md:text-3xl font-extrabold text-white tracking-tighter">Riptide</span>
          </Link>
          
          {/* Search Bar */}
          <div className="w-full md:w-1/2 relative bg-white rounded-full transition-all group overflow-hidden">
            <input 
              type="text" 
              placeholder="Search in Riptide" 
              className="w-full bg-transparent pl-5 pr-12 py-2.5 outline-none text-gray-800 placeholder-gray-400"
            />
            <button className="absolute right-0 top-0 bottom-0 px-4 bg-[#593A1B] text-white flex justify-center items-center rounded-r-full hover:bg-[#3B220B] border border-[#593A1B] transition-colors">
              <Search size={18} strokeWidth={2.5} />
            </button>
          </div>
          
          {/* Desktop & Mobile Navigation Icons */}
          <div className="flex items-center gap-4 text-[#D1B89C]">
            <div className="relative">
              {user ? (
                <div 
                  className="flex items-center gap-2 cursor-pointer border border-[#D1B89C]/30 px-4 py-1.5 rounded-full hover:bg-[#3B220B] transition-colors bg-[#3A2311]/50 shadow-inner"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <User size={18} />
                  <span className="text-sm text-white font-medium truncate max-w-[100px]">{user.email?.split('@')[0]}</span>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full pt-2 w-48 z-50">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 overflow-hidden text-gray-800">
                        {isAdmin && (
                          <Link to="/admin" className=" flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-[#593A1B] transition-colors">
                            <Settings size={16} /> Admin Dashboard
                          </Link>
                        )}
                        <Link to="/orders" className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 hover:text-[#593A1B] transition-colors">
                          <Package size={16} /> My Orders
                        </Link>
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut size={16} /> Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth" className="flex items-center gap-2 border border-[#D1B89C]/30 px-4 py-1.5 rounded-full hover:bg-[#3B220B] hover:text-white transition-colors bg-[#3A2311]/50 shadow-inner">
                  <User size={18} />
                  <span className="text-sm font-bold tracking-wide">Login / Register</span>
                </Link>
              )}
            </div>

            <Link className="hover:text-white transition-colors cursor-pointer hidden md:block">
              <Bell size={24} />
            </Link>

            <Link to="/orders" className="hover:text-white transition-colors hidden md:block relative">
              <Package size={24} />
            </Link>

            <Link to="/cart" className="hover:text-white transition-colors relative">
              <ShoppingCart size={24} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#F97316] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                  {cartItemCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
