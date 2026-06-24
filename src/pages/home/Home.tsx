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
import neckFanBannerUrl from '../../assets/images/neck_fan_banner_1781614379903.jpg';

export default function Home() {
  const { language, searchQuery, setSearchQuery } = useStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Custom high-quality slides focusing on Tech Categories & Unique Products (No watches)
  const heroSlides = [
    {
      id: 1,
      titleEn: "SMART 5-SPEED NECK HANGING FAN",
      titleBn: "স্মার্ট ৫-স্পিড নেক হ্যাঙ্গিং ফ্যান",
      subtitleEn: "Beat the heat with hands-free cooling, rapid wind speeds, and a long-lasting rechargeable battery.",
      subtitleBn: "হাত না রেখেই পান চমৎকার শীতল বাতাস! ৫ স্পিড সেটিংস এবং দীর্ঘস্থায়ী রিচার্জেবল ব্যাটারি লাইফ।",
      badgeEn: "SUMMER HOT SELLER ❄️",
      badgeBn: "গ্রীষ্মের বেস্ট সেলার ❄️",
      image: neckFanBannerUrl,
      bgGradient: "from-[#0E1B26] via-[#050D14] to-[#122332]",
      btnAction: () => {
        setSelectedCategory('Hot Sell');
        const el = document.getElementById('products-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 2,
      titleEn: "UNIQUE HIGH-TECH GADGETS HUB",
      titleBn: "ইউনিক হাই-টেক গ্যাজেটস হাব",
      subtitleEn: "Elevate your lifestyle with our premium selected devices & top-trending smart electronics.",
      subtitleBn: "জীবনযাত্রাকে সহজ করুন আধুনিক ও দুর্দান্ত ফিচারের ট্রেন্ডিং সব স্মার্ট ইলেকট্রনিক্স কালেকশন থেকে।",
      badgeEn: "PREMIUM SELECTION",
      badgeBn: "প্রিমিয়াম সংগ্রহ",
      image: "https://images.unsplash.com/photo-1608156639585-b3a032ef9689?q=80&w=600",
      bgGradient: "from-[#1E2022] via-[#0F1011] to-[#2B2D2F]",
      btnAction: () => {
        setSelectedCategory('Unique Product');
        const el = document.getElementById('products-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      id: 3,
      titleEn: "UNIQUE & DIGITAL PRODUCTS HUB",
      titleBn: "ডিজিটাল ও ইউনিক প্রিমিয়াম সার্ভিস",
      subtitleEn: "100% verified genuine products, digital licenses and utility hubs with premium support.",
      subtitleBn: "১০০% ভেরিফাইড এবং বিশ্বস্ত ইউনিক ডিজিটাল ডিলসমূহ দ্রুততম পেমেন্ট ভেরিফিকেশনে।",
      badgeEn: "100% GENUINE",
      badgeBn: "১০০% আসল প্রোডাক্ট",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=600",
      bgGradient: "from-[#1F122C] via-[#0E0716] to-[#2F1C42]",
      btnAction: () => {
        setSelectedCategory('Digital Product');
        const el = document.getElementById('products-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  useEffect(() => {
    // Auto-advance banner slides every 5.5 seconds
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [heroSlides.length]);

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

  // Unique categories list with localized display mappings for 3D circle style
  const circleCategories = [
    { 
      key: 'all', 
      labelBn: 'সব প্রোডাক্ট', 
      labelEn: 'All Products', 
      image: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?q=80&w=350',
      bgColor: '#EADBC8' // Sand camel
    },
    { 
      key: 'Hot Sell', 
      labelBn: 'হট সেল 🔥', 
      labelEn: 'Hot Sell', 
      image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?q=80&w=350',
      bgColor: '#F9ACAC' // Soft vivid coral
    },
    { 
      key: 'Digital Product', 
      labelBn: 'ডিজিটাল প্রোডাক্ট ⚡', 
      labelEn: 'Digital Product', 
      image: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=350',
      bgColor: '#96D2D9' // Deep clear turquoise/teal
    },
    { 
      key: 'Unique Product', 
      labelBn: 'ইউনিক প্রোডাক্ট ✨', 
      labelEn: 'Unique Product', 
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=350',
      bgColor: '#EAA9A9' // Dusty terracotta/rose
    },
    { 
      key: 'Gadget', 
      labelBn: 'গ্যাজেট 🔌', 
      labelEn: 'Gadget', 
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=350',
      bgColor: '#A9C4D2' // Steel blue/slate
    },
    { 
      key: 'Fashion', 
      labelBn: 'ফ্যাশন 👕', 
      labelEn: 'Fashion', 
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=350',
      bgColor: '#E3C19C' // Warm light gold
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
        
        {/* Beautiful Auto-Sliding Hero Banner Carousel (Visually Matches the Reference Screenshot) */}
        <section className="relative rounded-2xl md:rounded-3xl mx-3 md:mx-4 mt-4 md:mt-6 overflow-hidden border border-amber-950/10 shadow-lg max-w-7xl xl:mx-auto select-none min-h-[220px] md:min-h-[420px] flex items-center bg-[#1A0E05]">
          
          <div className="absolute inset-0 flex transition-transform duration-700 ease-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {heroSlides.map((slide) => (
              <div key={slide.id} className={`w-full shrink-0 flex items-center relative p-6 md:p-14 bg-gradient-to-r ${slide.bgGradient}`}>
                {/* Background decorative image with low opacity */}
                <div className="absolute right-0 top-0 bottom-0 w-full md:w-1/2 bg-cover bg-center brightness-[0.25] mix-blend-lighten" style={{ backgroundImage: `url(${slide.image})` }}></div>
                
                {/* Banner content */}
                <div className="relative z-10 max-w-xl text-left flex flex-col justify-center">
                  <span className="inline-flex items-center gap-1 bg-[#F2AF5B] text-[#2D1B0F] text-[9px] md:text-xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 md:py-1 rounded-full mb-3 md:mb-4 shadow-sm w-fit">
                    <Sparkles size={10} className="fill-[#2D1B0F]" />
                    {language === 'bn' ? slide.badgeBn : slide.badgeEn}
                  </span>
                  
                  <h1 className="text-xl md:text-5xl font-black text-white tracking-tighter leading-snug md:leading-tight mb-2 md:mb-3 font-mono">
                    {language === 'bn' ? slide.titleBn : slide.titleEn}
                  </h1>
                  
                  <p className="text-stone-300 text-[10px] md:text-base mb-4 md:mb-6 font-normal max-w-sm md:max-w-xl leading-relaxed">
                    {language === 'bn' ? slide.subtitleBn : slide.subtitleEn}
                  </p>

                  <button 
                    onClick={slide.btnAction}
                    className="bg-[#F2AF5B] hover:bg-[#ffbe6c] text-[#2C180A] font-black py-2 md:py-3 px-4 md:px-7 rounded-lg md:rounded-xl transition-all shadow-md text-[11px] md:text-sm flex items-center gap-1.5 md:gap-2 cursor-pointer focus:outline-none w-fit shrink-0 uppercase tracking-wider"
                  >
                    {language === 'bn' ? 'স্টোর দেখুন' : 'View Store Offer'}
                    <ArrowRight size={13} md:size={15} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Right side product beautiful preview in double-column for tablet/desktop */}
                <div className="hidden md:flex absolute right-16 top-1/2 -translate-y-1/2 w-72 h-72 rounded-3xl overflow-hidden border border-white/10 shadow-2xl items-center justify-center bg-stone-900/40 backdrop-blur-md">
                  <img src={slide.image} alt="Slide Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="text-[9px] font-bold text-[#F2AF5B] uppercase tracking-widest block mb-0.5">TRENDING GADGET</span>
                    <span className="text-white text-xs font-black truncate block">{language === 'bn' ? slide.titleBn : slide.titleEn}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dot indicators, styled exactly like the screenshot with the warm active state */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {heroSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full focus:outline-none ${
                  currentSlide === idx 
                    ? 'w-6 h-2 bg-[#F2AF5B]' 
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
                title={`Go to slide ${idx + 1}`}
              ></button>
            ))}
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
        <section id="categories-section" className="max-w-7xl mx-auto px-4 mt-8 md:mt-12 mb-10 md:mb-16 text-left">
          <div className="flex items-center justify-between mb-4 md:mb-8">
            <h3 className="text-base md:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-1 font-mono uppercase">
              {getTranslation(language, 'allCategories')}
              <ChevronRight size={16} className="text-[#8B6E53] md:block hidden" />
            </h3>
          </div>
          
          {/* Avatar categories grid */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-6 justify-center">
            {circleCategories.map((circle) => {
              const isActive = selectedCategory === circle.key;
              const title = language === 'bn' ? circle.labelBn : circle.labelEn;
              return (
                <button
                  key={circle.key}
                  onClick={() => setSelectedCategory(circle.key)}
                  className="flex flex-col items-center group focus:outline-none cursor-pointer"
                >
                  {/* Premium 3D Studio Display Stack */}
                  <div className="relative w-16 h-16 md:w-28 md:h-28 mb-3 flex items-center justify-center select-none">
                    
                    {/* 3D Round Backdrop Disk */}
                    <div 
                      className={`absolute w-14 h-14 md:w-24 md:h-24 rounded-full transition-all duration-500 shadow-inner ${
                        isActive 
                          ? 'ring-2 md:ring-4 ring-[#593A1B]/30 scale-105 shadow-md' 
                          : 'opacity-95 group-hover:opacity-100 group-hover:scale-[1.02]'
                      }`}
                      style={{ backgroundColor: circle.bgColor }}
                    />
                    
                    {/* 3D Marble Pedestal Base */}
                    <div 
                      className={`absolute bottom-0 w-11 md:w-20 h-2.5 md:h-4 bg-gradient-to-b from-white to-stone-200/90 border-b-2 border-stone-300/80 border-x border-stone-200 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.06)] z-10 transition-all duration-500 ${
                        isActive ? 'scale-105' : 'group-hover:scale-[1.03]'
                      }`}
                    />
                    
                    {/* Overlapping Product (Transparent Blend via mix-blend-multiply) */}
                    <img 
                      src={circle.image} 
                      alt={title} 
                      referrerPolicy="no-referrer"
                      className={`absolute bottom-1 md:bottom-2 w-[85%] h-[85%] object-contain z-20 mix-blend-multiply select-none transition-all duration-500 ease-out transform ${
                        isActive 
                          ? '-translate-y-2.5 scale-115 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.12)]' 
                          : 'group-hover:-translate-y-2 group-hover:scale-110 active:scale-95'
                      }`}
                    />
                    
                  </div>

                  {/* Text label underneath */}
                  <h4 className={`font-black text-[10px] md:text-xs text-center tracking-wide transition-colors duration-300 break-words max-w-[100px] md:max-w-[120px] pb-1 border-b-2 ${
                    isActive 
                      ? 'text-[#593A1B] border-[#593A1B]' 
                      : 'text-stone-500 border-transparent group-hover:text-stone-900 group-hover:border-stone-300'
                  }`}>
                    {title}
                  </h4>
                </button>
              );
            })}
          </div>
        </section>

        {/* Product Listing Main Arena */}
        <section id="products-section" className="max-w-7xl mx-auto px-3 md:px-4 text-left">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 md:gap-4 mb-5 md:mb-8 pb-3 border-b border-amber-900/5">
            <div>
              <h3 className="text-lg md:text-2xl font-black text-stone-900 tracking-tight uppercase font-mono">
                {getTranslation(language, 'latestArrivals')}
              </h3>
              {searchQuery && (
                <p className="text-[11px] md:text-xs font-semibold text-stone-500 mt-0.5">
                  {language === 'bn' ? `"${searchQuery}" এর জন্য অনুসন্ধানকৃত ফলাফল:` : `Search results matching "${searchQuery}":`}
                </p>
              )}
            </div>

            {/* Category Filter Pills on Desktop/Mobile */}
            <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-amber-900/5 overflow-x-auto max-w-full">
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
                    className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-[10.5px] md:text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6">
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
    </div>
  );
}
