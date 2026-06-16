import { Helmet } from 'react-helmet-async';
import React, { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import ProductCard from '../../components/product/ProductCard';
import ProductSkeleton from '../../components/product/ProductSkeleton';
import { db } from '../../firebase';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { ArrowRight, Truck, Shield, Clock, CreditCard, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const categories = [
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=400&auto=format&fit=crop' },
  { name: 'Fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=400&auto=format&fit=crop' },
  { name: 'Home & Living', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=400&auto=format&fit=crop' },
  { name: 'Beauty', image: 'https://images.unsplash.com/photo-1596462502278-27bf85033e5a?q=80&w=400&auto=format&fit=crop' },
  { name: 'Sports', image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop' },
  { name: 'Kids & Toys', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=400&auto=format&fit=crop' },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400&auto=format&fit=crop' },
];

const bannerSlides = [
  {
    id: 1,
    tag: 'Next-Gen Smart Living',
    title: "Premium Modern Gadgets",
    serifTitle: "Cutting-Edge Smart Tech",
    subtitle: "High Performance Accessories & Devices",
    description: "Upgrade your lifestyle with state-of-the-art smartwatches, premium active-noise-canceling earbuds, and ultimate high-speed smart living gadgets.",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=2000&auto=format&fit=crop",
    linkText: "Explore Gadgets",
    accentBg: "bg-slate-900"
  },
  {
    id: 2,
    tag: 'Premium Apparel & Design',
    title: "Luxury Style & Comfort",
    serifTitle: "Trendsetting Fashion Collection",
    subtitle: "Curated Styles Crafted for Elegance",
    description: "Express yourself with our premium designer apparel, luxury streetwear, and custom casual wear made from the highest quality sustainable fabrics.",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2000&auto=format&fit=crop",
    linkText: "Shop Fashion Trends",
    accentBg: "bg-indigo-950"
  },
  {
    id: 3,
    tag: 'Ultra Premium Acoustics',
    title: "Studio Sound Everyday",
    serifTitle: "Audiophile Audio Gear",
    subtitle: "Listen with pure high-fidelity precision",
    description: "Immerse yourself into professional-grade acoustic headphones, custom noise isolation, and smart portable sound systems crafted by sound engineers.",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2000&auto=format&fit=crop",
    linkText: "Discover Premium Audio",
    accentBg: "bg-amber-950"
  }
];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const handlePrevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + bannerSlides.length) % bannerSlides.length);
  };

  const handleNextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % bannerSlides.length);
  };

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
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

  return (
    <div className="min-h-screen bg-light flex flex-col">
      <Helmet>
        <title>Riptide - Premium Tech & Fashion Store</title>
        <meta name="description" content="Shop the best premium gadgets, luxury fashion, and lifestyle accessories at Riptide." />
      </Helmet>
      
      <Header />

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0">
        
        {/* Static Banner/Hero Section (no auto-flicker or rotation animation) */}
        <section className="relative rounded-3xl mx-4 mt-6 overflow-hidden bg-gray-900 border border-gray-100 shadow-xl max-w-7xl xl:mx-auto select-none group h-[380px] md:h-[500px]">
          
          {/* Images background viewport */}
          {bannerSlides.map((slide, index) => (
            <div 
              key={slide.id}
              className={`absolute inset-0 w-full h-full ${
                index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img 
                src={slide.image} 
                alt={slide.title} 
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/55 to-transparent bg-opacity-80"></div>
            </div>
          ))}
          
          {/* Slides content overlay */}
          <div className="relative z-20 h-full px-8 py-12 md:px-16 md:py-20 flex flex-col justify-center items-start max-w-3xl">
            {bannerSlides.map((slide, index) => (
              <div 
                key={slide.id}
                className={`${
                  index === currentSlide ? 'block' : 'hidden'
                }`}
              >
                <span className="inline-block py-1 px-3 md:py-1.5 md:px-4 rounded-full bg-[#E8B351] text-gray-900 text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
                  {slide.tag}
                </span>
                
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-extrabold text-white tracking-tight mb-2 leading-tight">
                  {slide.title}
                </h1>
                
                <h2 className="text-2xl md:text-3xl lg:text-4.5xl font-serif italic text-amber-200 tracking-wide mb-4 md:mb-5">
                  {slide.serifTitle}
                </h2>
                
                <p className="text-sm md:text-lg text-gray-200 mb-6 md:mb-8 max-w-xl leading-relaxed font-sans font-light">
                  {slide.description}
                </p>

                <div className="flex gap-4">
                  <button className="bg-amber-500 hover:bg-amber-600 font-sans text-gray-950 font-extrabold py-2.5 px-6 md:py-3.5 md:px-8 rounded-xl transition-colors shadow-md text-xs md:text-sm">
                    {slide.linkText}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Left Arrow Button */}
          <button 
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-[#593A1B] text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10 opacity-0 group-hover:opacity-100"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6" />
          </button>

          {/* Right Arrow Button */}
          <button 
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-[#593A1B] text-white flex items-center justify-center transition-colors cursor-pointer border border-white/10 opacity-0 group-hover:opacity-100"
            aria-label="Next Slide"
          >
            <ChevronRight size={20} className="md:w-6 md:h-6" />
          </button>

          {/* Manual Slide Dots Indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2.5">
            {bannerSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all focus:outline-none cursor-pointer ${
                  index === currentSlide 
                    ? 'bg-[#E8B351] w-8 shadow-sm' 
                    : 'bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-[#FAF8F5] border-y border-stone-100 py-6">
           <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                 <Truck size={18} className="text-[#593A1B] shrink-0" strokeWidth={1.5} />
                 <div>
                    <h4 className="text-[11px] md:text-xs font-bold tracking-widest text-stone-800 uppercase">Free Shipping</h4>
                    <p className="text-[10px] md:text-xs text-stone-500 font-light mt-0.5">On orders over ৳5000</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                 <Shield size={18} className="text-[#593A1B] shrink-0" strokeWidth={1.5} />
                 <div>
                    <h4 className="text-[11px] md:text-xs font-bold tracking-widest text-stone-800 uppercase">Secure Payment</h4>
                    <p className="text-[10px] md:text-xs text-stone-500 font-light mt-0.5">100% secure checkout</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                 <Clock size={18} className="text-[#593A1B] shrink-0" strokeWidth={1.5} />
                 <div>
                    <h4 className="text-[11px] md:text-xs font-bold tracking-widest text-stone-800 uppercase">24/7 Support</h4>
                    <p className="text-[10px] md:text-xs text-stone-500 font-light mt-0.5">Dedicated assistance</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                 <CreditCard size={18} className="text-[#593A1B] shrink-0" strokeWidth={1.5} />
                 <div>
                    <h4 className="text-[11px] md:text-xs font-bold tracking-widest text-stone-800 uppercase">Easy Returns</h4>
                    <p className="text-[10px] md:text-xs text-stone-500 font-light mt-0.5">30 days return policy</p>
                 </div>
              </div>
           </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Categories Section */}
          <div className="mb-16">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Shop by Category</h3>
                <Link to="/" className="text-[#593A1B] font-medium hover:underline flex items-center gap-1">
                  View All <ArrowRight size={16} />
                </Link>
             </div>
             <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
                {categories.map((cat, idx) => (
                   <Link to="/" key={idx} className="group cursor-pointer flex flex-col items-center">
                      <div className="relative rounded-full overflow-hidden w-20 h-20 md:w-24 md:h-24 mb-3 border border-gray-100 group-hover:border-[#593A1B] group-hover:shadow-md shadow-sm transition-all bg-white">
                         <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                         <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors"></div>
                      </div>
                      <h4 className="font-semibold text-xs md:text-sm text-gray-800 text-center group-hover:text-[#593A1B] transition-colors">{cat.name}</h4>
                   </Link>
                ))}
             </div>
          </div>

          {/* Latest Arrivals */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Latest Arrivals</h3>
              <Link to="/" className="text-[#593A1B] font-medium hover:underline flex items-center gap-1">
                  View All <ArrowRight size={16} />
              </Link>
            </div>
            
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {/* Render 4 skeleton cards */}
                {[...Array(4)].map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
               <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500">
                  No products found. Check back later!
               </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Fixed Bottom Navigation for Mobile (Safe Area Support) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-50 pb-[env(safe-area-inset-bottom)]">
        <Link to="/" className="flex flex-col items-center justify-center w-full text-[#593A1B]">
          <span className="text-sm font-medium">Home</span>
        </Link>
        <Link to="/" className="flex flex-col items-center justify-center w-full text-gray-500 hover:text-[#593A1B]">
          <span className="text-sm font-medium">Shop</span>
        </Link>
        <Link to="/cart" className="flex flex-col items-center justify-center w-full text-gray-500 hover:text-[#593A1B]">
          <span className="text-sm font-medium">Cart</span>
        </Link>
        <Link to="/auth" className="flex flex-col items-center justify-center w-full text-gray-500 hover:text-[#593A1B]">
          <span className="text-sm font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
}
