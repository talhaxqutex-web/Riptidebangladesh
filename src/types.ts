export interface Product {
  id: string;
  name: string; // fallback
  nameEn: string; // English title
  nameBn: string; // Bangla title
  price: number; // Regular Price
  specialPrice?: number; // Special Price (Discounted)
  discountPercent?: number; // Discount Percentage (e.g. 45 for 45% off)
  description: string; // fallback
  descriptionEn: string; // English manual description
  descriptionBn: string; // Bangla manual description
  imageUrl: string; // primary cover image
  imageUrls: string[]; // collection of multiple product gallery photos
  category: string; // "Digital Product" (ডিজিটাল প্রোডাক্ট), "Unique Product" (ইউনিক প্রোডাক্ট), "Hot Sell" (হট সেলিং প্রোডাক্ট), "Gadget", "Fashion" etc.
  stockCount: number;
  customSalesCount?: number; // customized number of sales to display to customers (e.g. "১২০+ পিস বিক্রি হয়েছে")
  variants?: { name: string; options: string[] }[]; // list of variants, e.g. Brand, Size, Color
  createdAt: any;
  updatedAt: any;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userEmail: string;
  rating: number; // range 1-5
  comment: string;
  createdAt: any;
}

export interface CartItem {
  id: string; // unique cart item key combining productId and variant choices
  product: Product;
  quantity: number;
  selectedVariants: Record<string, string>; // e.g. { "Size": "M", "Color": "Blue" }
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: {
    productId: string;
    nameBn: string;
    nameEn: string;
    price: number;
    quantity: number;
    selectedVariants: Record<string, string>;
    imageUrl?: string;
  }[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingDetails: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    division: string;
    notes?: string;
  };
  paymentMethod: 'bkash' | 'nagad' | 'rocket' | 'cod';
  paymentDetails?: {
    mobileNumber?: string;
    transactionId?: string;
  };
  createdAt: any;
  updatedAt: any;
}

export interface UserProfile {
  uid: string;
  email: string;
  isAdmin: boolean;
  isOwner?: boolean; // Check if user is owner (e.g. mail is talhaxqutex@gmail.com)
  createdAt: any;
}
