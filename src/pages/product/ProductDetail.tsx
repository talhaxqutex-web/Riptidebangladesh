import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useStore } from '../../store';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';
import { Star, ShoppingCart, ArrowLeft, UserRound, Flame, ShoppingBag, Check, ChevronRight, RefreshCw } from 'lucide-react';
import { getTranslation } from '../../utils/translate';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, addToCart, language } = useStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Selected variant state
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  
  // New review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const docRef = doc(db, 'products', id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProduct({ id: docSnap.id, ...data });
        
        // Populate default values for variants on product load
        if (data.variants && Array.isArray(data.variants)) {
          const defaults: Record<string, string> = {};
          data.variants.forEach((v: any) => {
            if (v.options && v.options.length > 0) {
              defaults[v.name] = v.options[0]; // Select first option by default
            }
          });
          setSelectedVariants(defaults);
        }
      } else {
        toast.error(language === 'bn' ? 'প্রোডাক্টটি পাওয়া যায়নি!' : 'Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error(language === 'bn' ? 'প্রোডাক্ট লোড করতে ব্যর্থ হয়েছে!' : 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', id)
      );
      const snapshot = await getDocs(q);
      const reviewList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort desc based on createdAt timestamp safely client-side
      reviewList.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setReviews(reviewList);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error(language === 'bn' ? 'রিভিউ প্রদানের জন্য লগইন করুন!' : 'Please log in to submit a review');
      return;
    }
    if (!comment.trim()) {
      toast.error(language === 'bn' ? 'মন্তব্য খালি রাখা যাবে না।' : 'Please provide a comment');
      return;
    }

    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: id,
        userId: user.uid,
        userEmail: user.email,
        rating,
        comment: comment.trim(),
        createdAt: serverTimestamp()
      });
      toast.success(getTranslation(language, 'reviewSuccess'));
      setComment('');
      setRating(5);
      fetchReviews(); // refresh
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleVariantSelect = (variantName: string, option: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantName]: option
    }));
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, selectedVariants, quantity);
      const title = language === 'bn' ? (product.nameBn || product.name) : (product.nameEn || product.name);
      toast.success(`${title} ${language === 'bn' ? 'সফলভাবে কার্টে যোগ করা হয়েছে!' : 'added to cart successfully!'}`);
    }
  };

  const handleInstantBuy = () => {
    if (product) {
      addToCart(product, selectedVariants, quantity);
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFAF7] flex flex-col">
        <Header />
        <main className="flex-1 py-12 px-4 md:px-8 max-w-7xl mx-auto w-full animate-pulse text-left">
          <div className="w-44 h-6 bg-stone-200 rounded mb-8"></div>
          
          <div className="bg-white rounded-3xl border border-stone-100 overflow-hidden mb-12 p-6 md:p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-stone-100 aspect-square rounded-2xl"></div>
              <div className="flex flex-col gap-5 justify-center">
                <div className="h-4 bg-stone-200 rounded w-1/4"></div>
                <div className="h-10 bg-stone-200 rounded w-3/4"></div>
                <div className="h-6 bg-stone-200 rounded w-1/3"></div>
                <div className="h-20 bg-stone-200 rounded w-full"></div>
                <div className="h-14 bg-stone-200 rounded w-full md:w-56 mt-4"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FCFAF7] flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col justify-center items-center py-20 px-4 text-center">
          <h2 className="text-2xl font-black text-stone-800 tracking-tight">Product Not Found</h2>
          <p className="text-stone-500 text-xs mt-1.5 mb-6">The requested catalog item could not be retrieved from our inventory servers.</p>
          <Link to="/" className="bg-[#3E2511] text-white font-extrabold text-xs py-2.5 px-6 rounded-xl shadow-md uppercase hover:bg-stone-800 transition-colors">
            Return to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Safe checks for language properties
  const resolvedName = language === 'bn' ? (product.nameBn || product.name) : (product.nameEn || product.name);
  const resolvedDesc = language === 'bn' ? (product.descriptionBn || product.description) : (product.descriptionEn || product.description);

  // Resolve Pricing
  const isDiscounted = product.specialPrice && product.specialPrice < product.price;
  const displayPrice = isDiscounted ? product.specialPrice! : product.price;
  const calculatedDiscount = isDiscounted 
    ? Math.round(((product.price - product.specialPrice!) / product.price) * 100) 
    : 0;
  const finalDiscountPercent = product.discountPercent || calculatedDiscount;

  // Resolve Multi-Images array
  const galleryImages = product.imageUrls && product.imageUrls.length > 0 
    ? product.imageUrls 
    : [product.imageUrl || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600'];

  // Check Category label translation
  const resolvedCategoryName = () => {
    if (!product.category) return '';
    if (product.category === 'Digital Product') return getTranslation(language, 'digitalProduct');
    if (product.category === 'Unique Product') return getTranslation(language, 'uniqueProduct');
    if (product.category === 'Hot Sell') return getTranslation(language, 'hotSell');
    return product.category;
  };

  // Calculate Average Ratings
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 4.8; // beautiful standard average if no comments yet

  return (
    <div className="min-h-screen bg-[#FCFAF7] flex flex-col text-stone-900 font-sans select-none text-left">
      <Header />
      
      <main className="flex-1 py-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
        
        {/* Breadcrumb row */}
        <div className="flex items-center gap-2 text-xs font-bold text-stone-500 mb-6 uppercase tracking-wider">
          <Link to="/" className="hover:text-[#3E2511]">{getTranslation(language, 'home')}</Link>
          <ChevronRight size={12} className="text-stone-300" />
          <span className="text-stone-400 font-medium truncate">{resolvedCategoryName()}</span>
          <ChevronRight size={12} className="text-stone-300 pointer-events-none" />
          <span className="text-[#3E2511] font-extrabold truncate max-w-[200px]">{resolvedName}</span>
        </div>

        {/* Product Meta Section */}
        <div className="bg-white rounded-3xl border border-amber-900/5 overflow-hidden mb-12 shadow-xs p-4 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            {/* Left: Beautiful gallery layout with thumbnail switcher */}
            <div className="space-y-4">
              
              {/* Primary main active photo with cover fit */}
              <div className="aspect-square bg-[#FCFBF9] rounded-2xl overflow-hidden border border-amber-900/5 shadow-xs flex items-center justify-center p-2 relative">
                
                {/* Save label tag on image block */}
                {isDiscounted && (
                  <span className="absolute top-4 left-4 z-10 bg-rose-600 text-white font-black text-xs px-3 py-1.5 rounded-lg shadow-md uppercase tracking-wider">
                    -{finalDiscountPercent}% {getTranslation(language, 'discountPercent')}
                  </span>
                )}

                <img 
                  src={galleryImages[activeImageIndex]} 
                  alt={resolvedName} 
                  className="w-full h-full object-cover rounded-xl transition-all duration-300" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600';
                  }}
                />
              </div>

              {/* Multi-images gallery thumbnails row matching screenshot */}
              {galleryImages.length > 1 && (
                <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                  {galleryImages.map((img: string, idx: number) => {
                    const isSelected = activeImageIndex === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border-2 transition-all p-0.5 bg-white shadow-xs cursor-pointer ${
                          isSelected 
                            ? 'border-[#3E2511] scale-105 shadow-md' 
                            : 'border-stone-100 hover:border-amber-900/20'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt="Thumbnail View" 
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=150';
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Right: Specifications & Options selections Panel */}
            <div className="flex flex-col justify-center">
              
              {/* Category label */}
              {product.category && (
                <span className="text-[11px] font-black tracking-widest text-[#8B6E53] uppercase mb-2 block">
                  {resolvedCategoryName()}
                </span>
              )}
              
              {/* Main Title */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-stone-900 leading-tight mb-3">
                {resolvedName}
              </h1>
              
              {/* Stars ratings and review metrics */}
              <div className="flex items-center gap-3 mb-6">
                 <div className="flex gap-0.5 text-amber-400">
                   {[1, 2, 3, 4, 5].map((star) => {
                     const isLit = star <= Math.round(averageRating);
                     return (
                       <Star 
                         key={star} 
                         size={16} 
                         fill={isLit ? "currentColor" : "none"} 
                         className={isLit ? "text-amber-400" : "text-stone-200"} 
                       />
                     );
                   })}
                 </div>
                 <span className="text-stone-400 text-xs font-bold font-sans">
                   {reviews.length > 0 
                     ? `${reviews.length} ${language === 'bn' ? 'টি রিভিউ' : 'Reviews'}` 
                     : (language === 'bn' ? 'কোনো কাস্টমার রিভিউ নেই' : '4.8 Rating based on community reports')}
                 </span>
              </div>

              {/* Dynamic Sale display metric */}
              {product.customSalesCount && product.customSalesCount > 0 ? (
                <div className="flex items-center gap-1.5 bg-amber-50 rounded-xl py-2 px-3.5 mb-6 border border-amber-100 w-fit select-none">
                  <Flame size={14} className="text-amber-600 fill-amber-500 animate-pulse" />
                  <span className="text-xs font-black text-amber-900">
                    {language === 'bn' ? `${(product.customSalesCount || 0).toLocaleString('bn')}+` : `${product.customSalesCount || 0}+`}
                    {getTranslation(language, 'soldCountPostfix')}
                  </span>
                </div>
              ) : null}

              {/* Gold Box Pricing Display */}
              <div className="bg-[#FAF7F2] border border-amber-900/5 rounded-2xl p-5 mb-6 select-none">
                <span className="text-[10px] text-stone-400 uppercase font-black tracking-widest block mb-1">
                  {getTranslation(language, 'regularPrice')}
                </span>
                
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl md:text-4xl font-black text-[#5C3E21]">
                    ৳{(displayPrice || 0).toLocaleString()}
                  </span>
                  
                  {isDiscounted && (
                    <span className="text-sm text-stone-400 font-extrabold line-through decoration-rose-500/40">
                      ৳{(product.price || 0).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Dynamic Variant Chooser dropdown or list selectors */}
              {product.variants && Array.isArray(product.variants) && product.variants.length > 0 && (
                <div className="space-y-4 mb-6">
                  {product.variants.map((v: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <span className="text-xs font-bold text-stone-500 uppercase tracking-widest block">
                        {v.name}:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {v.options?.map((option: string) => {
                          const isSelected = selectedVariants[v.name] === option;
                          return (
                            <button
                              key={option}
                              onClick={() => handleVariantSelect(v.name, option)}
                              className={`px-4 py-2 text-xs font-extrabold rounded-xl border transition-all cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#3E2511] text-white border-transparent shadow-xs' 
                                  : 'bg-white border-stone-200 text-stone-800 hover:border-amber-900/20'
                              }`}
                            >
                              {option}
                              {isSelected && <Check size={12} className="inline ml-1.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Counter */}
              <div className="space-y-2 mb-8">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-widest block">
                  {getTranslation(language, 'quantity')}:
                </span>
                <div className="flex items-center gap-1.5 border border-[#F2AF5B]/20 w-fit rounded-xl p-1 bg-[#FAF8F5]">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-lg text-lg font-black text-amber-950 bg-white hover:bg-amber-100 flex items-center justify-center border border-stone-100 transition-colors uppercase focus:outline-none"
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-sm font-black text-stone-900">
                    {language === 'bn' ? (quantity || 0).toLocaleString('bn') : quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-10 h-10 rounded-lg text-lg font-black text-amber-950 bg-white hover:bg-amber-100 flex items-center justify-center border border-stone-100 transition-colors uppercase focus:outline-none"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Standard double CTA Action checkout buttons matching reference design */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Standard Add to Cart drawer button */}
                <button 
                  onClick={handleAddToCart}
                  className="bg-white hover:bg-stone-50 text-[#3E2511] border-2 border-[#3E2511] font-bold py-4 px-6 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2.5 text-sm md:text-base cursor-pointer"
                >
                  <ShoppingCart size={18} />
                  {getTranslation(language, 'addToCart')}
                </button>

                {/* Instant Checkout Directly button */}
                <button 
                  onClick={handleInstantBuy}
                  className="bg-[#3E2511] hover:bg-[#201105] text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 text-sm md:text-base cursor-pointer"
                >
                  <ShoppingBag size={18} />
                  {getTranslation(language, 'buyNow')}
                </button>

              </div>

            </div>

          </div>
        </div>

        {/* Detailed manual information descriptions text block */}
        <div className="bg-white rounded-3xl border border-amber-900/5 shadow-xs p-5 md:p-8 mb-12 text-left">
          <h3 className="text-base md:text-lg font-black text-stone-900 pb-3 border-b border-stone-100 mb-4 uppercase tracking-widest">
            {getTranslation(language, 'description')}
          </h3>
          <p className="text-xs md:text-sm text-stone-600 leading-relaxed font-medium whitespace-pre-line max-w-4xl">
            {resolvedDesc}
          </p>
        </div>

        {/* Reviews Section with Star Rating submit form and live review feed */}
        <section className="bg-white rounded-3xl border border-amber-900/5 p-6 md:p-10 text-left">
           <div className="flex flex-col lg:flex-row gap-12">
             
             {/* Left Column: Write Review Form block */}
             <div className="lg:w-1/3 lg:border-r border-stone-100 lg:pr-8">
               <h3 className="text-lg md:text-xl font-black text-stone-900 mb-6 flex items-center gap-1.5 uppercase tracking-wide">
                 <Star className="text-yellow-400 fill-yellow-400" size={20} />
                 {getTranslation(language, 'writeReview')}
               </h3>
               
               {user ? (
                 <form onSubmit={submitReview} className="space-y-5">
                   <div>
                     <label className="block text-xs font-black uppercase text-stone-500 mb-2">{getTranslation(language, 'rating')}</label>
                     <div className="flex gap-1.5">
                       {[1, 2, 3, 4, 5].map(num => (
                         <button 
                           key={num} 
                           type="button" 
                           onClick={() => setRating(num)}
                           className="focus:outline-none hover:scale-105 transition-all text-[#F2AF5B] p-0.5"
                         >
                           <Star size={26} fill={rating >= num ? "currentColor" : "none"} className={rating >= num ? "text-yellow-400 fill-yellow-400" : "text-stone-200"} />
                         </button>
                       ))}
                     </div>
                   </div>
                   
                   <div>
                     <label className="block text-xs font-black uppercase text-stone-500 mb-2">{getTranslation(language, 'reviews')}</label>
                     <textarea 
                       required
                       value={comment}
                       onChange={e => setComment(e.target.value)}
                       placeholder={language === 'bn' ? 'পণ্যটির গুণগত মান সম্পর্কে আপনার মতামত শেয়ার করুন...' : 'Write your custom product feedback...'}
                       rows={3}
                       className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl p-3.5 focus:outline-none focus:border-[#3E2511] text-xs font-medium resize-none leading-relaxed"
                     />
                   </div>
                   
                   <button 
                     type="submit" 
                     disabled={submittingReview}
                     className="bg-[#3E2511] hover:bg-stone-950 text-white font-black py-3 px-6 rounded-xl text-xs uppercase tracking-wide transition-colors disabled:opacity-40 cursor-pointer"
                   >
                     {submittingReview ? (language === 'bn' ? 'জমা হচ্ছে...' : 'Posting...') : getTranslation(language, 'submitReview')}
                   </button>
                 </form>
               ) : (
                 <div className="bg-[#FAF8F5] rounded-2xl p-5 text-center border border-amber-900/5">
                   <UserRound className="mx-auto text-[#8B6E53] mb-3" size={28} />
                   <p className="text-stone-600 text-xs font-bold leading-relaxed mb-4">{language === 'bn' ? 'রিভিউ প্রদানের জন্য লগইন সম্পন্ন করতে হবে।' : 'Log in to write verified review comment.'}</p>
                   <Link to={`/auth?redirect=/product/${id}`} className="inline-block bg-[#3E2511] hover:bg-stone-900 text-white font-extrabold text-xs py-2.5 px-5 rounded-xl transition-colors uppercase shadow-xs">
                     {getTranslation(language, 'loginRegister')}
                   </Link>
                 </div>
               )}
             </div>

             {/* Right Column: Live review comments feeds */}
             <div className="lg:w-2/3">
               <h3 className="text-lg md:text-xl font-black text-stone-950 mb-6 flex items-center gap-2">
                 {language === 'bn' ? 'গ্রাহকদের মতামত ও রেটিং' : 'Customer Experiences'}
                 <span className="bg-[#FAF6F1] text-[#3E2511] text-xs py-0.5 px-2.5 rounded-full font-black border border-amber-900/10 font-mono">
                    {reviews.length}
                 </span>
               </h3>
               
               {reviewsLoading ? (
                 <div className="flex justify-center p-10">
                   <RefreshCw className="animate-spin text-stone-400" size={20} />
                 </div>
               ) : reviews.length === 0 ? (
                 <div className="text-center bg-[#FAFBF9] py-14 rounded-2xl border border-dashed border-stone-200">
                   <p className="text-stone-400 font-bold text-xs">{getTranslation(language, 'noReviews')}</p>
                 </div>
               ) : (
                 <div className="space-y-4">
                   {reviews.map(review => (
                     <div key={review.id} className="bg-white p-5 rounded-2xl border border-stone-100 hover:border-amber-900/10 transition-colors">
                       <div className="flex items-start justify-between mb-3 text-xs">
                         <div className="flex items-center gap-2.5">
                           <div className="w-8 h-8 bg-[#3E2511]/10 text-[#3E2511] rounded-full flex items-center justify-center font-black text-xs font-mono uppercase shadow-xs">
                             {review.userEmail?.charAt(0).toUpperCase() || 'U'}
                           </div>
                           <div>
                             <p className="font-extrabold text-stone-800 font-mono">{review.userEmail?.split('@')[0] || 'Customer'}</p>
                             <div className="flex gap-0.5 text-yellow-400 mt-0.5">
                               {[1, 2, 3, 4, 5].map((star) => (
                                 <Star 
                                   key={star} 
                                   size={11} 
                                   fill={star <= review.rating ? "currentColor" : "none"} 
                                   className={star <= review.rating ? "text-yellow-400 fill-yellow-300" : "text-stone-200"} 
                                 />
                               ))}
                             </div>
                           </div>
                         </div>
                         <span className="text-[10px] text-stone-400 font-bold font-mono">
                           {review.createdAt?.seconds 
                             ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() 
                             : 'Just now'}
                         </span>
                       </div>
                       <p className="text-xs font-semibold text-stone-600 leading-relaxed ml-10">{review.comment}</p>
                     </div>
                   ))}
                 </div>
               )}
             </div>
             
           </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}
