import React from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { useStore } from '../../store';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  key?: string;
  product: {
    id: string;
    name: string;
    price: number;
    description: string;
    imageUrl?: string;
    category?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useStore(state => state.addToCart);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full relative group">
      <Link to={`/product/${product.id}`} className="absolute inset-0 z-0"></Link>
      <div className="aspect-square bg-gray-50 rounded-xl mb-4 overflow-hidden relative pointer-events-none">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <button 
        onClick={handleAddToCart}
        className="absolute z-10 bottom-36 right-6 lg:opacity-0 lg:-translate-y-2 lg:group-hover:opacity-100 lg:group-hover:translate-y-0 transition-all duration-300 bg-white p-3 text-[#593A1B] rounded-full shadow-lg hover:bg-[#593A1B] hover:text-white"
      >
        <Plus size={20} />
      </button>
      
      <div className="flex-1 flex flex-col z-10 pointer-events-none">
        {product.category && (
          <span className="text-xs font-bold tracking-wider text-gray-400 uppercase mb-1">
            {product.category}
          </span>
        )}
        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2 flex-1">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto pointer-events-auto">
          <span className="font-bold text-lg text-[#3B220B]">
            ৳{product.price.toFixed(2)}
          </span>
          <button 
            onClick={handleAddToCart}
            className="flex items-center gap-2 text-sm font-bold text-[#593A1B] hover:text-[#3B220B]"
          >
            <ShoppingCart size={16} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
