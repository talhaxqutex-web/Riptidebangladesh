import React from 'react';
import { ShoppingBag, Star, Flame } from 'lucide-react';
import { useStore } from '../../store';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { getTranslation } from '../../utils/translate';

interface ProductCardProps {
  key?: React.Key;
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { language, addToCart } = useStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Choose default variant options if any exist
    const defaultVariants: Record<string, string> = {};
    if (product.variants && product.variants.length > 0) {
      product.variants.forEach(v => {
        if (v.options && v.options.length > 0) {
          defaultVariants[v.name] = v.options[0];
        }
      });
    }

    addToCart(product, defaultVariants, 1);
    const resolvedName = language === 'bn' ? (product.nameBn || product.name) : (product.nameEn || product.name);
    toast.success(`${resolvedName} ${language === 'bn' ? 'কার্টে যোগ করা হয়েছে!' : 'added to cart!'}`);
  };

  // Safe checks for rendering
  const resolvedName = language === 'bn' ? (product.nameBn || product.name) : (product.nameEn || product.name);
  const resolvedDesc = language === 'bn' ? (product.descriptionBn || product.description) : (product.descriptionEn || product.description);
  
  // Resolve Pricing
  const isDiscounted = product.specialPrice && product.specialPrice < product.price;
  const displayPrice = isDiscounted ? product.specialPrice! : product.price;
  
  // Calculate discount percent helper if missing but special price exists
  const calculatedDiscount = isDiscounted 
    ? Math.round(((product.price - product.specialPrice!) / product.price) * 100) 
    : 0;
  const finalDiscountPercent = product.discountPercent || calculatedDiscount;

  // Resolve Category Display
  const resolvedCategory = () => {
    if (!product.category) return '';
    if (product.category === 'Digital Product') return getTranslation(language, 'digitalProduct');
    if (product.category === 'Unique Product') return getTranslation(language, 'uniqueProduct');
    if (product.category === 'Hot Sell') return getTranslation(language, 'hotSell');
    return product.category;
  };

  return (
    <div className="bg-white rounded-2xl p-3 shadow-xs border border-amber-900/5 hover:border-[#F2AF5B]/50 hover:shadow-md transition-all flex flex-col h-full relative group overflow-hidden">
      
      {/* Product Highlight / Sale Badge */}
      {isDiscounted ? (
        <span className="absolute top-3 left-3 z-10 bg-rose-600 text-white font-black text-[10px] md:text-xs px-2.5 py-1 rounded-lg shadow-sm">
          -{finalDiscountPercent}%
        </span>
      ) : null}

      {/* Product Category Label in right corner if Special */}
      {product.category === 'Hot Sell' ? (
        <span className="absolute top-3 right-3 z-10 bg-amber-500 text-amber-950 font-extrabold text-[9px] px-2 py-0.5 rounded-md flex items-center gap-0.5 animate-pulse">
          <Flame size={10} className="fill-amber-950" />
          HOT
        </span>
      ) : null}

      <Link to={`/product/${product.id}`} className="absolute inset-0 z-20"></Link>
      
      {/* Image container with rounded borders */}
      <div className="aspect-square bg-[#FDFBF7] rounded-xl mb-3 overflow-hidden relative border border-amber-900/5 flex items-center justify-center select-none">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={resolvedName} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1531403009284-440f080d1e12';
            }}
          />
        ) : (
          <div className="text-stone-300 text-xs font-bold font-sans">
            No Image
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col z-10 select-none">
        
        {/* Category */}
        {product.category && (
          <span className="text-[10px] font-black uppercase text-[#8B6E53] tracking-widest mb-1 block">
            {resolvedCategory()}
          </span>
        )}
        
        {/* Title */}
        <h3 className="font-extrabold text-[#3E2511] text-xs md:text-base leading-tight mb-1 group-hover:text-[#4A2E1B] transition-colors line-clamp-1">
          {resolvedName}
        </h3>
        
        {/* Sub-description snippet - clamped tighter on mobile */}
        <p className="text-[10px] md:text-xs text-stone-500 line-clamp-1 md:line-clamp-2 mb-2 md:mb-3 font-normal leading-relaxed">
          {resolvedDesc}
        </p>
        
        {/* Custom Sales Count Indicator as requested! */}
        {product.customSalesCount && product.customSalesCount > 0 ? (
          <div className="flex items-center gap-1 bg-amber-50 rounded-lg py-0.5 px-1.5 mb-2 md:mb-3 border border-amber-100 w-fit">
            <Flame size={10} className="text-amber-600 fill-amber-500 md:w-3.5 md:h-3.5" />
            <span className="text-[8.5px] md:text-[10px] font-bold text-amber-900">
              {language === 'bn' ? `${(product.customSalesCount || 0).toLocaleString('bn')}+ ` : `${product.customSalesCount || 0}+ `}
              {getTranslation(language, 'soldCountPostfix')}
            </span>
          </div>
        ) : null}

        {/* Pricing Layout matching Reference Image */}
        <div className="mt-auto flex items-center justify-between gap-1.5 overflow-hidden">
          
          <div className="flex flex-col">
            {/* Regular price with strikethrough if discounted */}
            {isDiscounted && (
              <span className="text-[10px] md:text-[11px] text-stone-400 font-bold line-through -mb-0.5">
                ৳{(product.price || 0).toLocaleString()}
              </span>
            )}
            <span className="font-black text-stone-900 text-sm md:text-lg">
              ৳{(displayPrice || 0).toLocaleString()}
            </span>
          </div>

          {/* Elegant Circular Bag button - beautifully scaled on mobile */}
          <button 
            onClick={handleAddToCart}
            className="relative z-30 w-8.5 h-8.5 md:w-10 md:h-10 rounded-full bg-[#FAF6F0] hover:bg-[#F2AF5B] border border-amber-900/10 hover:border-transparent text-[#5C3E21] hover:text-amber-950 flex items-center justify-center shadow-xs transition-all cursor-pointer grow-0 shrink-0 select-none focus:outline-none focus:ring-1.5 focus:ring-[#F2AF5B]"
            title={getTranslation(language, 'addToCart')}
          >
            <ShoppingBag size={14} className="md:hidden block" />
            <ShoppingBag size={18} className="hidden md:block" />
          </button>
          
        </div>

      </div>

    </div>
  );
}
