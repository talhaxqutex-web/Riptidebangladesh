import { create } from 'zustand';
import { User } from 'firebase/auth';
import { Product, CartItem } from './types';

interface AppState {
  user: User | null;
  isAdmin: boolean;
  isOwner: boolean;
  language: 'bn' | 'en';
  searchQuery: string;
  cart: CartItem[];
  setUser: (user: User | null, isAdmin?: boolean) => void;
  setLanguage: (lang: 'bn' | 'en') => void;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product, selectedVariants: Record<string, string>, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isAdmin: false,
  isOwner: false,
  language: 'bn', // Default to Bangla as requested
  searchQuery: '',
  cart: [],
  
  setUser: (user, isAdmin = false) => {
    const isOwner = user?.email === 'talhaxqutex@gmail.com';
    set({ 
      user, 
      isAdmin: isAdmin || isOwner, 
      isOwner 
    });
  },
  
  setLanguage: (lang) => set({ language: lang }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  addToCart: (product, selectedVariants, quantity = 1) => set((state) => {
    const variantKey = Object.entries(selectedVariants)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    const cartItemId = `${product.id}-${variantKey}`;
    
    const existing = state.cart.find(item => item.id === cartItemId);
    if (existing) {
      return {
        cart: state.cart.map(item => 
          item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
        )
      };
    }
    
    const newItem: CartItem = {
      id: cartItemId,
      product,
      quantity,
      selectedVariants
    };
    
    return { cart: [...state.cart, newItem] };
  }),
  
  removeFromCart: (cartItemId) => set((state) => ({
    cart: state.cart.filter(item => item.id !== cartItemId)
  })),
  
  updateQuantity: (cartItemId, quantity) => set((state) => ({
    cart: state.cart.map(item => 
      item.id === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item
    )
  })),
  
  clearCart: () => set({ cart: [] })
}));
