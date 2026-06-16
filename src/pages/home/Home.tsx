import { Helmet } from 'react-helmet-async';
import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ProductCard from '../../components/product/ProductCard';
import ProductSkeleton from '../../components/product/ProductSkeleton';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { ShoppingBag, ChevronRight, ArrowRight, ShieldCheck, Truck, Sparkles, Flame, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { getTranslation } from '../../utils/translate';

export default function Home() {
  const { language, searchQuery, setSearchQuery } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Listen to firestore products collection in real-time
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prods: any[] = [];
      snapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      setProducts(prods);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter products based on selectedCategory and searchQuery
  const filteredProducts = products.filter(product => {
    // Resolve matches for category
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

    // Resolve matches for search
    const searchLower = searchQuery.toLowerCase();
    const nameBn = (product.nameBn || '').toLowerCase();
    const nameEn = (product.nameEn || '').toLowerCase();
    const fallbackName = (product.name || '').toLowerCase();
    const descBn = (product.descriptionBn || '').toLowerCase();
    const descEn = (product.descriptionEn || '').toLowerCase();
    const categoryName = (product.category || '').toLowerCase();
    
    const matchesSearch = !searchQuery || 
      nameBn.includes(searchLower) ||
      nameEn.includes(searchLower) ||
      fallbackName.includes(searchLower) ||
      descBn.includes(searchLower) ||
      descEn.includes(searchLower) ||
      categoryName.includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  // Unique categories list with localized display mappings for circles
  const circleCategories = [
    { 
      key: 'all', 
      labelBn: 'সব প্রোডাক্ট', 
      labelEn: 'All Products', 
      image: 'https://images.unsplash.com/photo-1472851294608-062f824d296e?q=80&w=200' 
    },
    { 
      key: 'Hot Sell', 
      labelBn: 'হট সেল 🔥', 
      labelEn: 'Hot Sell', 
      image: 'https://images.unsplash.com/photo-1540747737956-37872404447a?q=80&w=200' 
    },
    { 
      key: 'Digital Product', 
      labelBn: 'ডিজিটাল প্রোডাক্ট ⚡', 
      labelEn: 'Digital Product', 
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200' 
    },
    { 
      key: 'Unique Product', 
      labelBn: 'ইউনিক প্রোডাক্ট ✨', 
      labelEn: 'Unique Product', 
      image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?q=80&w=200' 
    },
    { 
      key: 'Gadget', 
      labelBn: 'গ্যাজেট 🔌', 
      labelEn: 'Gadget', 
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=200' 
    },
    { 
      key: 'Fashion', 
      labelBn: 'ফ্যাশন 👕', 
      labelEn: 'Fashion', 
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=200' 
    }
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF9] flex flex-col font-sans select-none">
      <Helmet>
        <title>Riptide - {language === 'bn' ? 'ডিজিটাল, ইউনিক এবং হট সেলিং প্রোডাক্টস' : 'Digital, Unique & Hot Selling Store'}</title>
        <meta name="description" content="Shop verified digital keys, unique artifacts, and ultimate hot selling products on Riptide Bangladesh." />
      </Helmet>
      
      <Header />

      {/* Main Container */}
      <main className="flex-1 pb-24 md:pb-12">
        
        {/* Beautiful Rounded Hero Banner Section (Kholos Style Coffee-Cream theme) */}
        <section className="relative rounded-3xl mx-4 mt-6 overflow-hidden bg-[#2D1B0F] border border-amber-950/10 shadow-lg max-w-7xl xl:mx-auto select-none p-8 md:p-14 min-h-[280px] md:min-h-[420px] flex items-center">
          {/* Subtle abstract background */}
          <div className="absolute inset-0 bg-cover bg-center brightness-[0.25]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#2D1B0F] via-[#2D1B0F]/90 to-transparent"></div>

          {/* Banner content */}
          <div className="relative z-10 max-w-2xl text-left">
            <span className="inline-flex items-center gap-1 bg-[#F2AF5B] text-amber-950 text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4 shadow-sm">
              <Sparkles size={11} className="fill-amber-950" />
              {language === 'bn' ? 'ব্র্যান্ড নিউ আপডেট' : 'E-COMMERCE ENHANCED'}
            </span>
            
            <h1 className="text-3.5xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-none mb-3 font-mono">
              {getTranslation(language, 'bannerTitle')}
            </h1>
            
            <p className="text-stone-300 text-xs md:text-base mb-6 font-normal max-w-xl leading-relaxed">
              {getTranslation(language, 'bannerSubtitle')}
            </p>

            <button 
              onClick={() => {
                setSelectedCategory('all');
                window.scrollTo({ top: 400, behavior: 'smooth' });
              }}
              className="bg-[#F2AF5B] hover:bg-[#ffbe6c] text-[#2D1B0F] font-black py-2.5 px-6 md:py-3.5 md:px-8 rounded-xl transition-all shadow-md text-xs md:text-sm flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              {getTranslation(language, 'shopNow')}
              <ArrowRight size={16} strokeWidth={2.5} />
            </button>
          </div>

          {/* Floating badge for eye candy */}
          <div className="hidden lg:flex absolute right-16 top-1/2 -translate-y-1/2 w-48 h-48 bg-[#4C3018]/50 rounded-full border border-amber-900/10 items-center justify-center text-center p-6 backdrop-blur-xs shadow-inner">
            <div className="text-[#F3C082] flex flex-col items-center">
              <Percent size={32} className="mb-2 text-[#FFE3C1]" />
              <span className="text-xs uppercase tracking-widest font-black">UP TO</span>
              <span className="text-3xl font-black tracking-normal mt-0.5">70% OFF</span>
              <span className="text-[9px] text-[#CDB296] block mt-1 font-semibold">ALL PRODUCTS IN STOCK</span>
            </div>
          </div>
        </section>

        {/* Feature Icons Strip */}
        <section className="bg-[#FAF7F2] border-y border-amber-900/5 py-5.5 mt-8 max-w-7xl mx-auto rounded-none lg:rounded-2xl px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-stone-800">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="p-2.5 bg-[#FAF3E9] text-[#5C3E21] rounded-xl border border-amber-950/5">
                <Truck size={20} strokeWidth={2} />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold tracking-wide text-stone-800 uppercase">{language === 'bn' ? 'দ্রুত ডেলিভারি' : 'Fast Delivery'}</h4>
                <p className="text-[10px] text-stone-500 font-medium mt-0.5">{language === 'bn' ? 'সমগ্র বাংলাদেশ ক্যাশ অন ডেলিভারি' : 'Super express courier support'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="p-2.5 bg-[#FAF3E9] text-[#5C3E21] rounded-xl border border-amber-950/5">
                <ShieldCheck size={20} strokeWidth={2} />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold tracking-wide text-stone-800 uppercase">{language === 'bn' ? 'নিরাপদ পেমেন্ট' : 'Secure Verification'}</h4>
                <p className="text-[10px] text-stone-500 font-medium mt-0.5">{language === 'bn' ? 'বিকাশ, নগদ ও ট্রানজেকশন ID চেক' : 'Double verified safe audits'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="p-2.5 bg-[#FAF3E9] text-[#5C3E21] rounded-xl border border-amber-950/5">
                <Flame size={20} strokeWidth={2} />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold tracking-wide text-stone-800 uppercase">{language === 'bn' ? 'সেরা ডিল' : 'Special Bargains'}</h4>
                <p className="text-[10px] text-stone-500 font-medium mt-0.5">{language === 'bn' ? 'হট সেল ও লিমিটেড ইউনিক অফার' : 'Curated premium product items'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <div className="p-2.5 bg-[#FAF3E9] text-[#5C3E21] rounded-xl border border-amber-950/5">
                <Sparkles size={20} strokeWidth={2} />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-bold tracking-wide text-stone-800 uppercase">{language === 'bn' ? '১০০% অরিজিনাল' : 'Genuine Products'}</h4>
                <p className="text-[10px] text-stone-500 font-medium mt-0.5">{language === 'bn' ? 'সম্পূর্ণ নিরাপদ ও গ্যারান্টিড পণ্য' : 'Direct from official suppliers'}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section with circular avatars from Screenshot style */}
        <section className="max-w-7xl mx-auto px-4 mt-12 mb-16 text-left">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-1.5 font-mono uppercase">
              {getTranslation(language, 'allCategories')}
              <ChevronRight size={20} className="text-[#8B6E53]" />
            </h3>
          </div>
          
          {/* Avatar categories grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-6 justify-center">
            {circleCategories.map((circle) => {
              const isActive = selectedCategory === circle.key;
              const title = language === 'bn' ? circle.labelBn : circle.labelEn;
              return (
                <button
                  key={circle.key}
                  onClick={() => setSelectedCategory(circle.key)}
                  className="flex flex-col items-center group focus:outline-none cursor-pointer"
                >
                  <div className={`relative rounded-full p-1.5 w-20 h-20 md:w-24 md:h-24 mb-3 border-2 transition-all flex items-center justify-center bg-white shadow-xs ${
                    isActive 
                      ? 'border-[#3E2511] ring-4 ring-[#F2AF5B]/20 scale-105' 
                      : 'border-amber-900/5 group-hover:border-[#F2AF5B]/70'
                  }`}>
                    <img 
                      src={circle.image} 
                      alt={title} 
                      className="w-full h-full object-cover rounded-full" 
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors rounded-full"></div>
                  </div>
                  <h4 className={`font-extrabold text-xs text-center transition-colors break-words max-w-[120px] ${
                    isActive ? 'text-[#3E2511]' : 'text-stone-600 group-hover:text-stone-950'
                  }`}>
                    {title}
                  </h4>
                </button>
              );
            })}
          </div>
        </section>

        {/* Product Listing Main Arena */}
        <section className="max-w-7xl mx-auto px-4 text-left">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-amber-900/5">
            <div>
              <h3 className="text-2xl font-black text-stone-900 tracking-tight uppercase font-mono">
                {getTranslation(language, 'latestArrivals')}
              </h3>
              {searchQuery && (
                <p className="text-xs font-semibold text-stone-500 mt-1">
                  {language === 'bn' ? `"${searchQuery}" এর জন্য অনুসন্ধানকৃত ফলাফল:` : `Search results matching "${searchQuery}":`}
                </p>
              )}
            </div>

            {/* Category Filter Pills on Desktop */}
            <div className="flex items-center gap-1.5 bg-[#FAF7F2] p-1.5 rounded-xl border border-amber-900/5 overflow-x-auto max-w-full">
              {['all', 'Hot Sell', 'Digital Product', 'Unique Product'].map((tab) => {
                const isActive = selectedCategory === tab;
                const label = tab === 'all' 
                  ? (language === 'bn' ? 'সব পণ্য' : 'All')
                  : (tab === 'Hot Sell' ? getTranslation(language, 'hotSell')
                  : (tab === 'Digital Product' ? getTranslation(language, 'digitalProduct')
                  : getTranslation(language, 'uniqueProduct')));
                  
                return (
                  <button
                    key={tab}
                    onClick={() => setSelectedCategory(tab)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive 
                        ? 'bg-[#3E2511] text-white shadow-xs' 
                        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Main Grid containing products */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
             <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-amber-900/10 shadow-xs max-w-md mx-auto flex flex-col justify-center items-center px-6">
                <ShoppingBag className="h-14 w-14 text-stone-300 mb-4" />
                <p className="text-stone-500 font-bold text-sm tracking-wide">
                  {getTranslation(language, 'noProducts')}
                </p>
                {(selectedCategory !== 'all' || searchQuery) && (
                  <button
                    onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
                    className="mt-4 bg-[#FAF6F0] hover:bg-[#F2AF5B] text-[#5C3E21] hover:text-amber-950 font-extrabold text-xs py-2 px-4 rounded-xl border border-amber-900/10 transition-colors cursor-pointer"
                  >
                    {language === 'bn' ? 'সব প্রোডাক্ট লোড করুন' : 'Load All Products'}
                  </button>
                )}
             </div>
          )}

        </section>
      </main>

      <Footer />

      {/* Fixed Bottom Navigation for Mobile (Safe Area Support) to look identical to Screenshot footer */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-stone-200 flex justify-around p-3.5 z-50 pb-[env(safe-area-inset-bottom)] shadow-xl select-none">
        <Link to="/" className="flex flex-col items-center justify-center w-full text-[#3E2511]">
          <span className="text-[11px] font-black tracking-wide uppercase">{getTranslation(language, 'home')}</span>
        </Link>
        <button 
          onClick={() => { setSelectedCategory('all'); window.scrollTo({ top: 400, behavior: 'smooth' }); }}
          className="flex flex-col items-center justify-center w-full text-stone-500 hover:text-[#3E2511] font-bold"
        >
          <span className="text-[11px] font-black tracking-wide uppercase">{getTranslation(language, 'shop')}</span>
        </button>
        <Link to="/cart" className="flex flex-col items-center justify-center w-full text-stone-500 hover:text-[#3E2511]">
          <span className="text-[11px] font-black tracking-wide uppercase">{getTranslation(language, 'cart')}</span>
        </Link>
        <Link to="/orders" className="flex flex-col items-center justify-center w-full text-stone-500 hover:text-[#3E2511]">
          <span className="text-[11px] font-black tracking-wide uppercase">{getTranslation(language, 'myOrders').split(' ')[0]}</span>
        </Link>
        <Link to="/auth" className="flex flex-col items-center justify-center w-full text-stone-500 hover:text-[#3E2511]">
          <span className="text-[11px] font-black tracking-wide uppercase">{getTranslation(language, 'profile')}</span>
        </Link>
      </nav>
    </div>
  );
}
