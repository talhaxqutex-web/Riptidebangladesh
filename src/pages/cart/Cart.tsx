import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Shield, Check } from 'lucide-react';
import { getTranslation } from '../../utils/translate';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, language } = useStore();
  const navigate = useNavigate();

  // Helper pricing selector
  const itemActivePrice = (item: any) => {
    const prod = item.product;
    return prod.specialPrice && prod.specialPrice < prod.price ? prod.specialPrice : prod.price;
  };

  const subtotal = cart.reduce((sum, item) => sum + itemActivePrice(item) * item.quantity, 0);
  
  // Flat shipping charge of 100 Bangladesh Taka
  const shippingCharge = subtotal > 0 ? 100 : 0;
  const total = subtotal + shippingCharge;

  return (
    <div className="min-h-screen bg-[#FCFAF7] flex flex-col text-stone-900 text-left">
      <Helmet>
        <title>{getTranslation(language, 'shoppingCart')} - Riptide Bangladesh</title>
      </Helmet>
      
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 select-none">
        <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight mb-8 uppercase font-mono">
          {getTranslation(language, 'shoppingCart')}
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-amber-900/5 shadow-xs flex flex-col items-center px-4 max-w-xl mx-auto">
            <div className="w-16 h-16 bg-[#FAF6F1] rounded-full flex items-center justify-center text-[#8B6E53] mb-4 border border-amber-900/5">
              <ShoppingBag size={28} />
            </div>
            <h2 className="text-xl font-extrabold text-stone-900 mb-2">
              {language === 'bn' ? 'আপনার শপিং কার্ট খালি!' : 'Your Cart is empty'}
            </h2>
            <p className="text-stone-400 text-xs mb-8 max-w-xs mx-auto leading-relaxed">
              {getTranslation(language, 'emptyCart')}
            </p>
            <Link to="/" className="bg-[#3E2511] hover:bg-stone-950 text-white font-extrabold text-xs py-3.5 px-8 rounded-xl transition-all shadow-md uppercase tracking-wider">
               {language === 'bn' ? 'প্রোডাক্ট ব্রাউজ করুন' : 'Start Browsing'}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Cart products list columns */}
            <div className="lg:col-span-8 space-y-4">
              {cart.map((item) => {
                const prod = item.product;
                const title = language === 'bn' ? (prod.nameBn || prod.name) : (prod.nameEn || prod.name);
                const activePrice = itemActivePrice(item);
                
                return (
                  <div key={item.id} className="bg-white p-4 rounded-2xl border border-amber-900/5 shadow-xs flex gap-4 items-center">
                    
                    {/* Cover image */}
                    <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl overflow-hidden bg-[#FAF9F5] border border-stone-100 flex items-center justify-center p-1">
                      <img 
                        src={prod.imageUrl || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=150'} 
                        alt={title} 
                        className="w-full h-full object-cover rounded-lg" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=150';
                        }}
                      />
                    </div>
                    
                    {/* Item parameters & variation choices representation */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-base font-extrabold text-stone-900 truncate mb-0.5">{title}</h3>
                      
                      {/* Selected Custom Variants if registered */}
                      {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {Object.entries(item.selectedVariants).map(([k, v]) => (
                            <span key={k} className="text-[9px] bg-stone-50 text-stone-500 rounded border border-stone-150 px-1.5 py-0.2 font-semibold">
                              {k}: {v as string}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-4">
                        
                        {/* Increments / Decrements custom quantity triggers */}
                        <div className="flex items-center border border-[#F2AF5B]/20 rounded-lg bg-[#FAF8F5] p-0.5">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-amber-950 font-bold bg-white rounded shadow-xs hover:bg-[#FAF6F1] disabled:opacity-40 select-none border border-stone-100"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={12} />
                          </button>
                          
                          <span className="w-8 text-center font-black text-stone-900 text-xs">
                            {language === 'bn' ? (item.quantity || 0).toLocaleString('bn') : item.quantity}
                          </span>
                          
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-amber-950 font-bold bg-white rounded shadow-xs hover:bg-[#FAF6F1] select-none border border-stone-100"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        
                        {/* Trash trigger */}
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
                          title={getTranslation(language, 'remove')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="font-extrabold text-stone-900 text-sm md:text-base text-right pl-2 whitespace-nowrap">
                      <span>৳{(activePrice || 0).toLocaleString()}</span>
                      <span className="block text-[10px] text-stone-400 font-bold mt-0.5 font-mono">Total: ৳{((activePrice || 0) * (item.quantity || 0)).toLocaleString()}</span>
                    </div>

                  </div>
                )})}
              </div>

              {/* Right panel summary sticky card */}
              <div className="lg:col-span-4 sticky top-24">
                <div className="bg-white p-6 rounded-3xl border border-amber-900/5 shadow-xs text-left">
                  <h3 className="text-base font-black text-stone-900 tracking-tight pb-3 border-b border-stone-50 mb-6 uppercase">
                    {getTranslation(language, 'orderSummary')}
                  </h3>
                  
                  <div className="space-y-4 mb-6 text-xs text-[#5C3E21] font-medium">
                    <div className="flex justify-between">
                      <span>{getTranslation(language, 'subtotal')}</span>
                      <span className="font-extrabold text-stone-900">৳{(subtotal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{getTranslation(language, 'shippingCharge')}</span>
                      <span className="font-extrabold text-stone-900">৳{(shippingCharge || 0).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-stone-150 pt-4 flex justify-between items-center text-stone-900">
                      <span className="text-sm font-black uppercase">{getTranslation(language, 'total')}</span>
                      <span className="text-xl font-black text-[#5C3E21]">৳{(total || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => navigate('/checkout')}
                    className="w-full bg-[#3E2511] hover:bg-stone-950 text-white font-extrabold py-4 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group mb-4 uppercase text-xs tracking-wider cursor-pointer"
                  >
                    {getTranslation(language, 'checkout')} 
                    <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  
                  <p className="text-[10px] text-stone-400 text-center flex items-center justify-center gap-1 uppercase tracking-wider font-bold">
                    <Shield size={12} className="text-[#8B6E53]" /> SSL SECURE VERIFIED
                  </p>
                </div>
              </div>

          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
