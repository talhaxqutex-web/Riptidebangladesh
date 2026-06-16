import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { db } from '../../firebase';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  setDoc 
} from 'firebase/firestore';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Edit, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Filter, 
  Copy, 
  Plus, 
  RefreshCw, 
  Clock, 
  Eye, 
  ShieldAlert, 
  UserPlus, 
  LayoutGrid, 
  FileCheck, 
  ChevronDown, 
  Flame, 
  Tag 
} from 'lucide-react';
import { getTranslation } from '../../utils/translate';

export default function AdminDashboard() {
  const { user, isAdmin, isOwner, language } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Active Tab: 'overview' | 'products' | 'orders' | 'roles'
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'roles'>('overview');

  // Order Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Product Filters
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Advanced Product Form State (with billing and multi-variant / translation configuration)
  const [formData, setFormData] = useState({
    nameEn: '',
    nameBn: '',
    price: '',
    specialPrice: '',
    discountPercent: '',
    descriptionEn: '',
    descriptionBn: '',
    category: 'Hot Sell',
    stockCount: '',
    customSalesCount: '',
    productImages: [] as string[], // Image data URIs or URLs
    colorVariantsText: '', // Comma separated options, e.g. "Chocolate, Golden, Ruby Red"
    sizeVariantsText: '',  // Comma separated options, e.g. "M, L, XL, Universal"
  });

  // Owner Privilege Email Form State
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');

  // Proof Modal Picture State
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  // Route protection
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isAdmin && !isOwner) {
      toast.error("You are not authorized to view the admin controls.");
      navigate('/');
    }
  }, [user, isAdmin, isOwner, navigate]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const orderList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(orderList);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const productList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setProducts(productList);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsersList(users);
    } catch (e) {
      console.error("Error loading users:", e);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || isOwner) {
      fetchOrders();
      fetchProducts();
      if (isOwner) {
        fetchUsers();
      }
    }
  }, [isAdmin, isOwner]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status, updatedAt: serverTimestamp() });
      toast.success(language === 'bn' ? `অর্ডার স্ট্যাটাস পরিবর্তন করা হয়েছে: ${status}` : `Order state transitioned to: ${status}`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error('Failed to change status');
    }
  };

  // Modify roles (Owner exclusive)
  const handleSetUserRole = async (userId: string, targetEmail: string, makeAdmin: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, { isAdmin: makeAdmin });
      toast.success(language === 'bn' ? `${targetEmail} কে সফলভাবে আপডেট করা হয়েছে!` : `Status updated successfully for ${targetEmail}!`);
      fetchUsers();
    } catch (e) {
      // If document doesn't exist, try setting it or using targetEmail input
      try {
        await setDoc(doc(db, 'users', userId), {
          email: targetEmail,
          isAdmin: makeAdmin,
          createdAt: serverTimestamp()
        });
        toast.success(language === 'bn' ? `ইউজার অ্যাডমিন রোল নিযুক্ত হয়েছে!` : `Role provisioned successfully!`);
        fetchUsers();
      } catch (err) {
        console.error("Failed setting user document role:", err);
        toast.error("Process failed. Please verify credentials.");
      }
    }
  };

  const handleGrantAdminByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmailInput.trim()) {
      toast.error(language === 'bn' ? "দয়া করে একটি সঠিক ইমেল প্রবেশ করান।" : "Enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      // Find user document matching email
      const emailLower = newAdminEmailInput.trim().toLowerCase();
      // Generate standard target clean placeholder ID using email, or set doc based on email characters
      const customUserId = emailLower.replace(/[^a-zA-Z0-0]/g, "_");
      
      await setDoc(doc(db, 'users', customUserId), {
        email: emailLower,
        isAdmin: true,
        createdAt: serverTimestamp()
      }, { merge: true });

      toast.success(language === 'bn' ? `${emailLower} কে অ্যাডমিন হিসেবে যোগ করা হয়েছে!` : `${emailLower} has been recruited as Admin!`);
      setNewAdminEmailInput('');
      fetchUsers();
    } catch (error) {
      console.error("Owner role assignment error:", error);
      toast.error("Failed to provision Admin role.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const confirmation = language === 'bn' 
      ? window.confirm("আপনি কি নিশ্চিতভাবে এই প্রোডাক্টটি চিরতরে মুছে ফেলতে চান?") 
      : window.confirm("Are you sure you want to permanently delete this product listing?");
    if (!confirmation) return;

    try {
      await deleteDoc(doc(db, 'products', productId));
      toast.success(language === 'bn' ? 'প্রোডাক্টটি সফলভাবে ডিলিট করা হয়েছে!' : 'Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error('Failed to delete product');
    }
  };

  const handleEditProductClick = (product: any) => {
    setEditingProduct(product);
    
    // Parse variants back to texts
    let colorsText = '';
    let sizesText = '';
    if (product.variants && Array.isArray(product.variants)) {
      const colorObject = product.variants.find((v: any) => v.name.toLowerCase() === 'color' || v.name === 'রঙ');
      const sizeObject = product.variants.find((v: any) => v.name.toLowerCase() === 'size' || v.name === 'সাইজ');
      if (colorObject && colorObject.options) colorsText = colorObject.options.join(', ');
      if (sizeObject && sizeObject.options) sizesText = sizeObject.options.join(', ');
    }

    setFormData({
      nameEn: product.nameEn || product.name || '',
      nameBn: product.nameBn || product.name || '',
      price: (product.price || '').toString(),
      specialPrice: (product.specialPrice || '').toString(),
      discountPercent: (product.discountPercent || '').toString(),
      descriptionEn: product.descriptionEn || product.description || '',
      descriptionBn: product.descriptionBn || product.description || '',
      category: product.category || 'Hot Sell',
      stockCount: (product.stockCount || 0).toString(),
      customSalesCount: (product.customSalesCount || '').toString(),
      productImages: (product.imageUrls && product.imageUrls.length > 0) ? product.imageUrls : (product.imageUrl ? [product.imageUrl] : []),
      colorVariantsText: colorsText,
      sizeVariantsText: sizesText,
    });
    
    // Scroll smoothly to form container
    const formElement = document.getElementById('product-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Form Val
    if (!formData.nameBn.trim() || !formData.nameEn.trim()) {
      toast.error(language === 'bn' ? "বাংলা এবং ইংরেজি উভয় ভাষার টাইটেল আবশ্যক।" : "Both Bangla and English titles are required.");
      setLoading(false);
      return;
    }

    const regularPriceNum = parseFloat(formData.price);
    if (isNaN(regularPriceNum) || regularPriceNum <= 0) {
      toast.error(language === 'bn' ? "একটি সঠিক মূল্য নির্ধারণ করুন।" : "Please specify a valid numeric price.");
      setLoading(false);
      return;
    }

    // Process multi images split by line
    const imageUrls = formData.productImages.filter(url => url.trim().length > 0);

    const primaryCoverUrl = imageUrls.length > 0 ? imageUrls[0] : 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=300';

    // Parse color and size variants
    const variants: any[] = [];
    if (formData.colorVariantsText.trim()) {
      variants.push({
        name: language === 'bn' ? 'রঙ' : 'Color',
        options: formData.colorVariantsText.split(',').map(o => o.trim()).filter(o => o.length > 0)
      });
    }
    if (formData.sizeVariantsText.trim()) {
      variants.push({
        name: language === 'bn' ? 'সাইজ' : 'Size',
        options: formData.sizeVariantsText.split(',').map(o => o.trim()).filter(o => o.length > 0)
      });
    }

    const payload: any = {
      name: formData.nameBn, // fallback
      nameEn: formData.nameEn.trim(),
      nameBn: formData.nameBn.trim(),
      price: regularPriceNum,
      specialPrice: formData.specialPrice ? parseFloat(formData.specialPrice) : null,
      discountPercent: formData.discountPercent ? parseInt(formData.discountPercent, 10) : null,
      description: formData.descriptionBn, // fallback
      descriptionEn: formData.descriptionEn.trim(),
      descriptionBn: formData.descriptionBn.trim(),
      category: formData.category,
      stockCount: parseInt(formData.stockCount || '0', 10),
      customSalesCount: formData.customSalesCount ? parseInt(formData.customSalesCount, 10) : null,
      imageUrl: primaryCoverUrl,
      imageUrls: imageUrls,
      variants: variants,
      updatedAt: serverTimestamp()
    };

    try {
      if (editingProduct) {
        // Edit Action
        const productRef = doc(db, 'products', editingProduct.id);
        await updateDoc(productRef, payload);
        toast.success(language === 'bn' ? "প্রোডাক্ট বিবরণী সফলভাবে আপডেট হয়েছে!" : "Product updated successfully!");
        setEditingProduct(null);
      } else {
        // Create Action
        payload.createdAt = serverTimestamp();
        await addDoc(collection(db, 'products'), payload);
        toast.success(language === 'bn' ? "নতুন প্রোডাক্ট সফলভাবে যুক্ত হয়েছে!" : "Product added to Riptide store!");
      }
      
      // Reset Form fields
      setFormData({
        nameEn: '',
        nameBn: '',
        price: '',
        specialPrice: '',
        discountPercent: '',
        descriptionEn: '',
        descriptionBn: '',
        category: 'Hot Sell',
        stockCount: '',
        customSalesCount: '',
        productImages: [],
        colorVariantsText: '',
        sizeVariantsText: '',
      });
      fetchProducts();
    } catch (error) {
      console.error("Error saving product record:", error);
      toast.error("Failed to save product details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      nameEn: '',
      nameBn: '',
      price: '',
      specialPrice: '',
      discountPercent: '',
      descriptionEn: '',
      descriptionBn: '',
      category: 'Hot Sell',
      stockCount: '',
      customSalesCount: '',
      productImages: [],
      colorVariantsText: '',
      sizeVariantsText: '',
    });
  };

  // Calculations for Admin Analytics
  const totalCompletedSales = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalPendingSales = orders
    .filter(o => o.status === 'pending' || o.status === 'processing')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalStockCount = products.reduce((sum, p) => sum + (p.stockCount || 0), 0);

  // Filter products table lists
  const filteredProductsTable = products.filter(p => {
    const searchLower = productSearch.toLowerCase();
    const matchesSearch = 
      (p.nameEn || '').toLowerCase().includes(searchLower) ||
      (p.nameBn || '').toLowerCase().includes(searchLower) ||
      (p.name || '').toLowerCase().includes(searchLower) ||
      (p.category || '').toLowerCase().includes(searchLower);
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter orders tracking lists
  const filteredOrdersTable = orders.filter(o => {
    const searchLower = orderSearch.toLowerCase();
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesSearch = 
      (o.id || '').toLowerCase().includes(searchLower) ||
      (o.userEmail || '').toLowerCase().includes(searchLower) ||
      (o.shippingDetails?.firstName || '').toLowerCase().includes(searchLower) ||
      (o.shippingDetails?.phone || '').toLowerCase().includes(searchLower) ||
      (o.paymentDetails?.transactionId || '').toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const handleResetDatabase = async () => {
    const confirmation = window.confirm(
      language === 'bn' 
        ? "আপনি কি নিশ্চিত যে আপনি সমস্ত প্রোডাক্ট এবং অর্ডার ডিলিট করতে চান? এই কাজ পরিবর্তন করা যাবে না।"
        : "Are you sure you want to PERMANENTLY wipe all products and order data? This cannot be undone."
    );
    
    if (!confirmation) return;
    
    const doubleCheck = window.confirm("Final Warning: Proceed with wiping database?");
    if (!doubleCheck) return;

    try {
      // Wipe Products
      const pSnapshot = await getDocs(collection(db, 'products'));
      for (const d of pSnapshot.docs) {
        await deleteDoc(d.ref);
      }
      
      // Wipe Orders
      const oSnapshot = await getDocs(collection(db, 'orders'));
      for (const d of oSnapshot.docs) {
        await deleteDoc(d.ref);
      }
      
      toast.success(language === 'bn' ? "সমস্ত ডেটা সফলভাবে ডিলিট হয়েছে!" : "Database wiped successfully.");
      fetchProducts();
      fetchOrders();
    } catch (e) {
      console.error(e);
      toast.error('Failed to wipe database');
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF7] flex flex-col font-sans select-none text-stone-900">
      
      <Header />

      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:py-8">
        
        {/* Banner with Coffee / Gold Aesthetics */}
        <div className="bg-[#3E2511] text-white rounded-3xl p-6 md:p-8 mb-8 border border-amber-950/10 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md mb-2 inline-block font-mono tracking-widest">
              RIPTIDE CONTROL STATION [SSL SECURE]
            </span>
            <h2 className="text-2.5xl md:text-3xl font-black text-[#F3C082] tracking-tight">
              {isOwner ? getTranslation(language, 'ownerView') : getTranslation(language, 'adminDashboard')}
            </h2>
            <p className="text-stone-300 text-xs mt-1.5 font-medium max-w-xl">
              {language === 'bn' 
                ? 'প্রোডাক্ট বিবরণী আপডেট করুন, ওনার অ্যাকাউন্ট থেকে কাস্টম অ্যাসাইনমেন্ট দিন, ট্রানজেকশন কাস্টমাইজেশন ও কার্ট অর্ডার ভেরিফাই সম্পন্ন করুন।' 
                : 'Modify localized products listings, grant secure multi-languages assets, authorize cash-outs payments alerts and assign privilege levels.'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-stone-300 text-xs font-mono font-bold uppercase">
              {language === 'bn' ? 'ওনার কানেক্টেড' : 'Owner Connection Live'}
            </span>
          </div>
          
          <button 
            onClick={handleResetDatabase}
            className="md:mt-0 mt-4 bg-red-600 hover:bg-red-700 text-white text-xs font-black px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <Trash2 size={16} />
            {language === 'bn' ? 'সব ডেটা ডিলিট করুন' : 'Wipe All Data'}
          </button>
        </div>

        {/* Tab Selection Row (Aesthetics Coffee Dark style) */}
        <div className="flex flex-wrap items-center gap-2 mb-8 bg-[#FAF6F1] p-1.5 rounded-2xl border border-amber-900/5 shadow-xs">
          
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-[#3E2511] text-white shadow-md' 
                : 'text-stone-600 hover:text-[#3E2511] hover:bg-stone-50'
            }`}
          >
            <TrendingUp size={16} />
            {getTranslation(language, 'overviewStats')}
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'products' 
                ? 'bg-[#3E2511] text-white shadow-md' 
                : 'text-stone-600 hover:text-[#3E2511] hover:bg-stone-50'
            }`}
          >
            <Package size={16} />
            {getTranslation(language, 'productManagement')}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-[#3E2511] text-white shadow-md' 
                : 'text-stone-600 hover:text-[#3E2511] hover:bg-stone-50'
            }`}
          >
            <FileCheck size={16} />
            {getTranslation(language, 'orderManagement')}
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="bg-[#E65F17] text-white text-[9px] px-1.5 py-0.5 rounded-full font-sans font-black">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>

          {/* Owner Role Privilege Tab - visible to EVERYONE but locked to Owner for clean representation or just checking isOwner */}
          {isOwner && (
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer ${
                activeTab === 'roles' 
                  ? 'bg-rose-700 text-white shadow-md border border-rose-800' 
                  : 'text-rose-600 hover:text-white hover:bg-rose-600/10'
              }`}
            >
              <ShieldAlert size={16} />
              {getTranslation(language, 'userManagement')}
            </button>
          )}

        </div>

        {/* ==================== TAB 1: OVERVIEW STATS ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-white p-6 rounded-3xl border border-amber-900/5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-stone-500 uppercase tracking-widest">{language === 'bn' ? 'মোট ডেলিভারি ডিল' : 'Completed Revenue'}</span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <DollarSign size={20} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-[#5C3E21]">৳{(totalCompletedSales || 0).toLocaleString()}</h3>
                <p className="text-[10px] text-[#A59280] font-semibold mt-1">{language === 'bn' ? 'ডেলিভারি সম্পন্ন অর্ডারসমূহ' : 'Only accounts for delivered orders'}</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-amber-900/5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-stone-500 uppercase tracking-widest">{language === 'bn' ? 'অপেক্ষমান পেমেন্ট' : 'Pending Intake'}</span>
                  <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                    <Clock size={20} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-stone-800">৳{(totalPendingSales || 0).toLocaleString()}</h3>
                <p className="text-[10px] text-[#A59280] font-semibold mt-1">{language === 'bn' ? 'যাচাইযোগ্য পেন্ডিং / প্রসেসিং' : 'Incomplete payment confirmations'}</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-amber-900/5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-stone-500 uppercase tracking-widest">{language === 'bn' ? 'মোট বুকিং অর্ডার' : 'Total Bookings'}</span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <CheckCircle size={20} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-stone-800">{orders.length}</h3>
                <p className="text-[10px] text-[#A59280] font-semibold mt-1">{language === 'bn' ? 'সকল সফল ও বাতিলকৃত অর্ডার্স' : 'All total logs generated'}</p>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-amber-900/5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-stone-500 uppercase tracking-widest">{language === 'bn' ? 'ক্যাটালগ আইটেম' : 'Store Catalog Inventories'}</span>
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <LayoutGrid size={20} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-stone-800">{products.length} {language === 'bn' ? 'টি' : 'products'}</h3>
                <p className="text-[10px] text-[#A59280] font-semibold mt-1">{language === 'bn' ? `মোট ভলিউম: ${totalStockCount} পিস ইনভেন্টরি` : `Accumulated units: ${totalStockCount} pieces`}</p>
              </div>

            </div>

            {/* Quick Warning / Helper Alert if things are running thin */}
            <div className="bg-amber-50 text-amber-900 border border-amber-200/90 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="shrink-0 mt-0.5 text-amber-600" size={18} />
              <div className="text-left text-xs">
                <span className="font-bold underline">{language === 'bn' ? 'গুরুত্বপূর্ণ সতর্কতা:' : 'Fulfillment Instructions:'}</span>
                <p className="mt-1 leading-relaxed">
                  {language === 'bn' 
                    ? 'গ্রাহকরা অর্ডার দেওয়ার পর ট্রানজেকশন আইডি প্রদান করেন। টাকা বিকাশে প্রাপ্তি নিশ্চিত করার পরই কেবল স্ট্যাটাস "পেন্ডিং" থেকে "প্রসেসিং" এবং তারপর "ডেলিভারি সম্পন্ন" করুন।' 
                    : 'Analyze transactions TrxID in dynamic lists below safely inside order items. Cross-check your mobile bKash logs prior to transferring goods.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: PRODUCT MANAGEMENT & FORM ==================== */}
        {activeTab === 'products' && (
          <div className="space-y-8 text-left">
            
            {/* Form card - with rounded borders */}
            <div id="product-form-container" className="bg-white rounded-3xl border border-amber-900/5 shadow-sm p-6 md:p-8">
              <h3 className="text-lg md:text-xl font-black text-[#3E2511] mb-6 flex items-center gap-2 pb-3 border-b border-stone-100">
                <Plus className="text-[#F2AF5B]" size={20} />
                {editingProduct ? getTranslation(language, 'editProduct') : getTranslation(language, 'addProduct')}
              </h3>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                
                {/* Titles translation Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-2">{getTranslation(language, 'productNameBn')} *</label>
                    <input 
                      type="text"
                      required
                      value={formData.nameBn}
                      onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                      placeholder="যেমন: লেদার ডেকো বেল্ট (প্রিমিয়াম কালেকশন)"
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] focus:bg-white text-stone-800 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-2">{getTranslation(language, 'productNameEn')} *</label>
                    <input 
                      type="text"
                      required
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="e.g. Handmade Leather Belt (Premium Edition)"
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] focus:bg-white text-stone-800 text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* Pricing, Stocks and Sale customized counters row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-2">{getTranslation(language, 'productPrice')} *</label>
                    <input 
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="1200"
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] focus:bg-white text-stone-800 text-sm font-semibold text-center"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-2">{getTranslation(language, 'specialPriceLabel')} ৳</label>
                    <input 
                      type="number"
                      value={formData.specialPrice}
                      onChange={(e) => setFormData({ ...formData, specialPrice: e.target.value })}
                      placeholder="950"
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] focus:bg-white text-[#E65F17] text-sm font-semibold text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-2">{getTranslation(language, 'discountPercentLabel')} %</label>
                    <input 
                      type="number"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      placeholder="20"
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] focus:bg-white text-rose-600 text-sm font-semibold text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-2">{getTranslation(language, 'stockCountLabel')} (Quantity)</label>
                    <input 
                      type="number"
                      value={formData.stockCount}
                      onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                      placeholder="150"
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] focus:bg-white text-stone-800 text-sm font-semibold text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-2">{getTranslation(language, 'customSalesLabel')}</label>
                    <input 
                      type="number"
                      value={formData.customSalesCount}
                      onChange={(e) => setFormData({ ...formData, customSalesCount: e.target.value })}
                      placeholder="120"
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] focus:bg-white text-amber-700 text-sm font-semibold text-center"
                    />
                  </div>
                </div>

                {/* Categories & Variants Configurations row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-2">{getTranslation(language, 'categoryLabel')} *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] focus:bg-white text-stone-800 text-sm font-semibold"
                    >
                      <option value="Hot Sell">{language === 'bn' ? 'হট সেলিং প্রোডাক্ট (Hot Sell)' : 'Hot Sell'}</option>
                      <option value="Digital Product">{language === 'bn' ? 'ডিজিটাল প্রোডাক্ট (Digital Product)' : 'Digital Product'}</option>
                      <option value="Unique Product">{language === 'bn' ? 'ইউনিক প্রোডাক্ট (Unique Product)' : 'Unique Product'}</option>
                      <option value="Gadget">{language === 'bn' ? 'গ্যাজেট (Gadget)' : 'Gadget'}</option>
                      <option value="Fashion">{language === 'bn' ? 'ফ্যাশন (Fashion)' : 'Fashion'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-2">
                      {language === 'bn' ? 'রঙ ভেরিয়েন্ট (Color)' : 'Colors Configuration'}
                    </label>
                    <input 
                      type="text"
                      value={formData.colorVariantsText}
                      onChange={(e) => setFormData({ ...formData, colorVariantsText: e.target.value })}
                      placeholder="e.g. Crimson, Coffee Brown, Matte Blue"
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] focus:bg-white text-stone-800 text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-2">
                      {language === 'bn' ? 'সাইজ ভেরিয়েন্ট (Size)' : 'Sizes Configuration'}
                    </label>
                    <input 
                      type="text"
                      value={formData.sizeVariantsText}
                      onChange={(e) => setFormData({ ...formData, sizeVariantsText: e.target.value })}
                      placeholder="e.g. M, L, XL, XXL"
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] focus:bg-white text-stone-800 text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* Visual Image Uploader & Viewer */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-black uppercase text-stone-500">
                      {getTranslation(language, 'uploadImages')} *
                    </label>
                    <span className="text-[10px] text-amber-700 font-extrabold font-mono pointer-events-none uppercase bg-amber-50 px-2 py-0.5 rounded">
                      {language === 'bn' ? '১ম এন্ট্রি প্রধান ছবি হিসেবে লোড হবে' : '1st entry matches cover imageUrl'}
                    </span>
                  </div>
                  
                  <div className="bg-[#FAF9F5] border border-amber-900/10 rounded-xl p-4">
                    <div className="flex flex-wrap gap-3 mb-4">
                      {formData.productImages.map((img, idx) => (
                        <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-stone-200">
                          <img src={img} alt={`Product ${idx}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = [...formData.productImages];
                              newImages.splice(idx, 1);
                              setFormData(prev => ({ ...prev, productImages: newImages }));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-md transition-colors"
                            title="Remove image"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      
                      <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-stone-300 rounded-lg cursor-pointer hover:border-[#3E2511] hover:bg-white transition-colors group">
                        <Plus className="text-stone-400 group-hover:text-[#3E2511] mb-1" size={20} />
                        <span className="text-[10px] font-bold text-stone-500 group-hover:text-[#3E2511]">{language === 'bn' ? 'ছবি যুক্ত করুন' : 'Add Image'}</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          className="hidden" 
                          onChange={(e) => {
                            const files = e.target.files;
                            if (!files) return;
                            
                            Array.from(files).forEach((file: File) => {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const img = new Image();
                                img.onload = () => {
                                  const canvas = document.createElement('canvas');
                                  const MAX_WIDTH = 800;
                                  const MAX_HEIGHT = 800;
                                  let width = img.width;
                                  let height = img.height;

                                  if (width > height) {
                                    if (width > MAX_WIDTH) {
                                      height = Math.round((height * MAX_WIDTH) / width);
                                      width = MAX_WIDTH;
                                    }
                                  } else {
                                    if (height > MAX_HEIGHT) {
                                      width = Math.round((width * MAX_HEIGHT) / height);
                                      height = MAX_HEIGHT;
                                    }
                                  }

                                  canvas.width = width;
                                  canvas.height = height;
                                  const ctx = canvas.getContext('2d');
                                  ctx?.drawImage(img, 0, 0, width, height);
                                  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                                  
                                  setFormData(prev => ({
                                    ...prev,
                                    productImages: [...prev.productImages, dataUrl]
                                  }));
                                };
                                img.src = event.target?.result as string;
                              };
                              reader.readAsDataURL(file);
                            });
                          }}
                        />
                      </label>
                    </div>
                    
                    {/* Manual URL Input */}
                    <div className="flex gap-2">
                       <input 
                         type="url" 
                         placeholder={language === 'bn' ? 'অথবা ছবির লিঙ্ক পেস্ট করুন...' : 'Or paste image URL here...'}
                         className="flex-1 text-xs px-3 py-2 border border-stone-200 rounded-lg outline-none focus:border-[#3E2511]"
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             e.preventDefault();
                             const val = e.currentTarget.value.trim();
                             if (val) {
                               setFormData(prev => ({ ...prev, productImages: [...prev.productImages, val] }));
                               e.currentTarget.value = '';
                             }
                           }
                         }}
                       />
                       <button 
                         type="button"
                         onClick={(e) => {
                             const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                             const val = input.value.trim();
                             if (val) {
                               setFormData(prev => ({ ...prev, productImages: [...prev.productImages, val] }));
                               input.value = '';
                             }
                         }}
                         className="px-4 py-2 bg-stone-200 text-stone-700 text-xs font-bold rounded-lg hover:bg-stone-300 transition-colors uppercase tracking-wider"
                       >
                         {language === 'bn' ? 'যুক্ত করুন' : 'Add URL'}
                       </button>
                    </div>
                  </div>
                </div>

                {/* Bilingual descriptions Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-2">{getTranslation(language, 'descriptionBnLabel')} *</label>
                    <textarea 
                      rows={4}
                      required
                      value={formData.descriptionBn}
                      onChange={(e) => setFormData({ ...formData, descriptionBn: e.target.value })}
                      placeholder="প্রোডাক্টের বৈশিষ্ট্য ও মূল উপকারীতাগুলো বিস্তারিত বাংলায় লিখুন..."
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] focus:bg-white text-stone-800 text-sm font-medium leading-relaxed"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-2">{getTranslation(language, 'descriptionEnLabel')} *</label>
                    <textarea 
                      rows={4}
                      required
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      placeholder="Explain product specifics, dimensions and advantages beautifully in English..."
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] focus:bg-white text-stone-800 text-sm font-medium leading-relaxed"
                    ></textarea>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                  {editingProduct && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-5 py-2.5 rounded-xl border border-stone-200 text-xs font-black text-stone-500 uppercase hover:bg-stone-50 hover:text-stone-700 cursor-pointer"
                    >
                      {getTranslation(language, 'cancel')}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#3E2511] hover:bg-[#2C180A] text-white px-8 py-3 rounded-xl text-xs font-black uppercase tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {loading && <RefreshCw size={14} className="animate-spin" />}
                    {editingProduct ? getTranslation(language, 'saveChanges') : (language === 'bn' ? 'প্রোডাক্ট সংরক্ষণ করুন' : 'Confirm Product addition')}
                  </button>
                </div>

              </form>
            </div>

            {/* Existing products checklist & filters */}
            <div className="bg-white rounded-3xl border border-amber-900/5 shadow-xs p-6">
              
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <h4 className="text-base font-extrabold text-stone-900">
                  {language === 'bn' ? 'সকল তালিকাভুক্ত প্রোডাক্টস' : 'All Listed Core Products'} ({filteredProductsTable.length})
                </h4>
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                    <input 
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder={language === 'bn' ? 'খুঁজুন...' : 'Search listed...'}
                      className="pl-9 pr-4 py-2 w-full sm:w-56 bg-stone-50 border border-amber-900/10 rounded-xl outline-none focus:border-[#3E2511] focus:bg-white text-xs font-semibold"
                    />
                  </div>

                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="py-2 px-3 border border-amber-900/10 bg-stone-50 rounded-xl outline-none focus:border-[#3E2511] text-xs font-black text-stone-600"
                  >
                    <option value="all">{language === 'bn' ? 'সব ক্যাটাগরি' : 'All categories'}</option>
                    <option value="Hot Sell">Hot Sell</option>
                    <option value="Digital Product">Digital Product</option>
                    <option value="Unique Product">Unique Product</option>
                    <option value="Gadget">Gadget</option>
                    <option value="Fashion">Fashion</option>
                  </select>
                </div>
              </div>

              {/* Responsive products table list */}
              {productsLoading ? (
                <div className="text-center py-10 text-stone-500 font-bold">{language === 'bn' ? 'প্রোডাক্ট লোড হচ্ছে...' : 'Loading products...'}</div>
              ) : filteredProductsTable.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-stone-100">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F2] text-stone-500 text-[10px] font-black uppercase border-b border-stone-100">
                        <th className="py-4 px-4">{language === 'bn' ? 'ছবি ও প্রোডাক্ট' : 'Product info/Image'}</th>
                        <th className="py-4 px-4">{language === 'bn' ? 'ক্যাটাগরি' : 'Category'}</th>
                        <th className="py-4 px-4 text-center">{language === 'bn' ? 'মূল্য (৳)' : 'Price (৳)'}</th>
                        <th className="py-4 px-4 text-center">{language === 'bn' ? 'অফার মূল্য' : 'Discount Price'}</th>
                        <th className="py-4 px-4 text-center">{language === 'bn' ? 'স্টক' : 'Stock'}</th>
                        <th className="py-4 px-4 text-center">{language === 'bn' ? 'কাস্টম সেল' : 'Custom Sales'}</th>
                        <th className="py-4 px-4 text-center">{language === 'bn' ? 'অ্যাকশন' : 'Control actions'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50 text-xs font-semibold">
                      {filteredProductsTable.map(p => {
                        const hasSpec = p.specialPrice && p.specialPrice < p.price;
                        return (
                          <tr key={p.id} className="hover:bg-amber-50/10 transition-colors">
                            <td className="py-3.5 px-4 flex items-center gap-3">
                              <img 
                                src={p.imageUrl || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=100'} 
                                alt={p.nameEn} 
                                className="w-10 h-10 object-cover rounded-lg border border-stone-100 shrink-0" 
                              />
                              <div className="max-w-[180px] md:max-w-xs">
                                <h5 className="font-extrabold text-stone-900 line-clamp-1">{language === 'bn' ? p.nameBn : p.nameEn}</h5>
                                <span className="text-[10px] text-stone-400 font-mono block mt-0.5 truncate">{p.id}</span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-bold text-amber-800">
                              {p.category}
                            </td>
                            <td className="py-3.5 px-4 text-center text-stone-900 font-bold whitespace-nowrap">
                              ৳{p.price}
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold text-rose-600 whitespace-nowrap">
                              {hasSpec ? `৳${p.specialPrice}` : <span className="text-stone-300">-</span>}
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold font-mono">
                              {p.stockCount <= 5 ? (
                                <span className="text-rose-600 w-fit font-black bg-rose-50 px-2 py-1 rounded-md">{p.stockCount} ({language === 'bn' ? 'সীমিত' : 'Low'})</span>
                              ) : (
                                <span className="text-stone-700">{p.stockCount}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center font-bold font-mono text-amber-700">
                              {p.customSalesCount ? `${p.customSalesCount}+` : <span className="text-stone-300">-</span>}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <div className="inline-flex items-center gap-1">
                                <button 
                                  onClick={() => handleEditProductClick(p)}
                                  className="p-1 px-2.5 rounded-lg border border-amber-900/10 text-[#5C3E21] hover:bg-[#F2AF5B] hover:text-amber-950 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Edit size={12} />
                                  {language === 'bn' ? 'এডিট' : 'Edit'}
                                </button>
                                <button 
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1 px-2.5 rounded-lg border border-red-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-1 cursor-pointer"
                                >
                                  <Trash2 size={12} />
                                  {language === 'bn' ? 'ডিলিট' : 'Del'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 font-bold text-stone-400">{language === 'bn' ? 'কোনো লিস্টেড প্রোডাক্ট পাওয়া যায়নি!' : 'No product listings matched matching criteria'}</div>
              )}

            </div>

          </div>
        )}

        {/* ==================== TAB 3: ORDER FULFILLMENT & MONEY CHECKS ==================== */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl border border-amber-900/5 shadow-xs p-6 md:p-8 text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <h4 className="text-base font-extrabold text-stone-900">
                {language === 'bn' ? 'ইনভয়েস অর্ডার রিকোয়েস্ট ট্র্যাকিং' : 'Payment Verification Desk'}
              </h4>
              
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={14} />
                  <input 
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder={language === 'bn' ? 'অর্ডার ID / ফোন নম্বর / TrxID...' : 'Search order, mobile, transaction...'}
                    className="pl-9 pr-4 py-2 w-full sm:w-64 bg-stone-50 border border-amber-900/10 rounded-xl outline-none focus:border-[#3E2511] focus:bg-white text-xs font-semibold"
                  />
                </div>

                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="py-2 px-3 border border-amber-900/10 bg-stone-50 font-semibold rounded-xl outline-none focus:border-[#3E2511] text-xs text-stone-600"
                >
                  <option value="all">{language === 'bn' ? 'সব অর্ডার্স' : 'All states'}</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {ordersLoading ? (
              <div className="text-center py-20 text-stone-500 font-bold">{language === 'bn' ? 'অর্ডার হিস্ট্রি লোড হচ্ছে...' : 'Querying invoice database...'}</div>
            ) : filteredOrdersTable.length > 0 ? (
              <div className="space-y-4">
                {filteredOrdersTable.map(order => {
                  const isExpanded = !!expandedOrders[order.id];
                  
                  // Status tag colors
                  const getStatusTag = (status: string) => {
                    switch (status) {
                      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
                      case 'processing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
                      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
                      case 'delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
                      case 'cancelled': return 'bg-rose-100 text-rose-800 border-rose-200';
                      default: return 'bg-stone-100 text-stone-800 border-stone-200';
                    }
                  };

                  return (
                    <div key={order.id} className="border border-stone-100 rounded-2xl bg-white overflow-hidden shadow-xs hover:border-[#F3C082]/30 transition-colors">
                      {/* Accordion header */}
                      <div 
                        onClick={() => setExpandedOrders({ ...expandedOrders, [order.id]: !isExpanded })}
                        className="p-4 cursor-pointer hover:bg-stone-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-colors text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-stone-900 font-mono text-sm uppercase">#{order.id.slice(0, 10)}</span>
                            <span className="text-stone-400 font-medium">|</span>
                            <span className="text-stone-600 font-semibold">{order.userEmail}</span>
                          </div>
                          <div className="text-stone-500 font-medium flex items-center gap-1.5 flex-wrap">
                            <span>{new Date(order.createdAt?.seconds * 1000 || Date.now()).toLocaleString()}</span>
                            <span>•</span>
                            <span className="text-amber-950 font-bold uppercase">{order.paymentMethod}</span>
                            {order.paymentDetails?.transactionId && (
                              <>
                                <span>•</span>
                                <span className="bg-amber-50 text-[#8B6E53] px-2 py-0.5 rounded border border-amber-200/50 font-mono font-bold tracking-wider">TrxID: {order.paymentDetails.transactionId}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right">
                            <span className="text-xs text-stone-400 font-bold block mb-0.5">{language === 'bn' ? 'সর্বমোট মূল্য' : 'Grand Total'}</span>
                            <span className="text-base font-black text-stone-950">৳{(order.totalAmount || 0).toLocaleString()}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`px-3 py-1.5 rounded-lg font-black text-[10px] md:text-xs uppercase tracking-wide border ${getStatusTag(order.status)}`}>
                              {order.status === 'pending' ? getTranslation(language, 'statusPending')
                               : order.status === 'processing' ? getTranslation(language, 'statusProcessing')
                               : order.status === 'shipped' ? getTranslation(language, 'statusShipped')
                               : order.status === 'delivered' ? getTranslation(language, 'statusDelivered')
                               : getTranslation(language, 'statusCancelled')}
                            </span>
                            <ChevronDown className={`text-stone-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} size={16} />
                          </div>
                        </div>
                      </div>

                      {/* Accordion detail */}
                      {isExpanded && (
                        <div className="border-t border-stone-100 p-5 bg-stone-50/50 text-xs text-stone-700 leading-relaxed grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                          
                          {/* Left: Goods Items Purchased */}
                          <div className="lg:col-span-6 space-y-3">
                            <h5 className="font-extrabold text-stone-900 border-b border-stone-100 pb-2 uppercase tracking-wider">{language === 'bn' ? 'ক্রয়কৃত প্রোডাক্ট আইটেমসমূহ:' : 'Cart Items purchased:'}</h5>
                            {order.items?.map((item: any, i: number) => {
                              const title = language === 'bn' ? (item.nameBn || item.name) : (item.nameEn || item.name);
                              return (
                                <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-stone-100">
                                  <img 
                                    src={item.imageUrl || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=100'} 
                                    className="w-10 h-10 object-cover rounded-lg border border-stone-100" 
                                    alt={title} 
                                  />
                                  <div className="flex-1">
                                    <h6 className="font-extrabold text-[#3E2511] line-clamp-1">{title}</h6>
                                    
                                    {/* Variant options labels if configured */}
                                    {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {Object.entries(item.selectedVariants).map(([k, v]) => (
                                          <span key={k} className="bg-stone-100 text-stone-600 text-[9px] px-1.5 py-0.5 rounded border border-stone-200">
                                            {k}: {v as string}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="text-right shrink-0">
                                    <span className="font-bold text-stone-800 text-xs block">৳{item.price} × {item.quantity}</span>
                                    <span className="font-black text-stone-900 font-mono text-xs block mt-0.5">৳{((item.price || 0) * (item.quantity || 0)).toLocaleString()}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Middle: Billing Customer Delivery Adress */}
                          <div className="lg:col-span-3 space-y-2">
                            <h5 className="font-extrabold text-stone-900 border-b border-stone-100 pb-2 uppercase tracking-wider">{language === 'bn' ? 'ডেলিভারি ঠিকানা ও তথ্য:' : 'Fulfillment Address:'}</h5>
                            <div className="bg-white p-4 rounded-xl border border-stone-100 space-y-1.5 text-[11px] text-stone-600">
                              <p className="font-extrabold text-stone-900 text-xs">
                                {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}
                              </p>
                              <p className="font-mono font-bold text-indigo-700 bg-indigo-50 py-1 px-2.5 rounded w-fit text-xs border border-indigo-100">
                                📞 {order.shippingDetails?.phone}
                              </p>
                              <p className="font-medium mt-1">
                                {order.shippingDetails?.address}
                              </p>
                              <p className="font-bold text-stone-700">
                                {order.shippingDetails?.city}, {order.shippingDetails?.division}
                              </p>
                              {order.shippingDetails?.notes && (
                                <p className="bg-amber-50 text-amber-900 p-2.5 rounded border border-amber-100 mt-2 font-normal text-[10px] leading-relaxed">
                                  <strong>Notes:</strong> {order.shippingDetails.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Payment Method, TrxID validation, Status transition engine */}
                          <div className="lg:col-span-3 space-y-4">
                            <h5 className="font-extrabold text-stone-900 border-b border-stone-100 pb-2 uppercase tracking-wider">{language === 'bn' ? 'পেমেন্ট ও স্ট্যাটাস বদল:' : 'Status Transition:'}</h5>
                            <div className="bg-white p-4 rounded-xl border border-stone-100 space-y-3.5 text-[11px]">
                              
                              <div>
                                <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">Pay Method</span>
                                <span className="bg-amber-100 text-amber-950 px-2 py-1.5 rounded font-black text-xs inline-block tracking-wider uppercase border border-amber-200">
                                  {order.paymentMethod}
                                </span>
                              </div>

                              {order.paymentDetails?.mobileNumber && (
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-stone-400 block mb-0.5">{language === 'bn' ? 'প্রেরক নম্বর' : 'Sender Number'}</span>
                                  <span className="font-semibold text-stone-900 block font-mono text-xs">{order.paymentDetails.mobileNumber}</span>
                                </div>
                              )}

                              {order.paymentDetails?.transactionId && (
                                <div>
                                  <span className="text-[10px] font-bold uppercase text-stone-400 block mb-0.5">TrxID Proof code</span>
                                  <span className="font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 font-mono text-xs tracking-wider inline-block">
                                    {order.paymentDetails.transactionId}
                                  </span>
                                </div>
                              )}

                              {/* Status Action controls */}
                              <div className="pt-2 border-t border-stone-50 space-y-1.5">
                                <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1">{getTranslation(language, 'changeStatus')}</span>
                                <select 
                                  value={order.status}
                                  onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                  className="w-full bg-stone-50 border border-[#F2AF5B]/40 focus:border-[#3E2511] font-black rounded-lg px-2.5 py-1.5 text-xs text-stone-800 cursor-pointer outline-none"
                                >
                                  <option value="pending">Pending (পেন্ডিং)</option>
                                  <option value="processing">Processing (প্রসেসিং)</option>
                                  <option value="shipped">Shipped (ডেলিভারি চলমান)</option>
                                  <option value="delivered">Delivered (ডেলিভারি সম্পন্ন)</option>
                                  <option value="cancelled">Cancelled (বাতিলকৃত)</option>
                                </select>
                              </div>

                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 font-bold text-stone-400">{language === 'bn' ? 'অনুসন্ধানকৃত ডিজাইনে কোনো অর্ডার বুকিং নেই!' : 'No matching order invoices found.'}</div>
            )}
           
          </div>
        )}

        {/* ==================== TAB 4: OWNER PRIVILEGE CONTROL HUB ==================== */}
        {activeTab === 'roles' && isOwner && (
          <div className="space-y-8 text-left">
            
            {/* Form Box - Recruiting new Admins */}
            <div className="bg-white rounded-3xl border border-rose-950/10 shadow-sm p-6 md:p-8">
              <h3 className="text-lg font-black text-rose-800 mb-4 flex items-center gap-2 pb-2 border-b border-rose-50">
                <UserPlus size={20} className="text-rose-600" />
                {language === 'bn' ? 'ইউজারকে অ্যাডমিন হিসেবে প্রনয়ন করুন' : 'Appoint New Staff Member (Admin)'}
              </h3>
              
              <p className="text-stone-500 text-xs leading-relaxed mb-6">
                {language === 'bn' 
                  ? 'এই প্যানেলের মাধ্যমে আপনি যেকোনো সাধারণ নিবন্ধিত ইউজারকে ইমেলের মাধ্যমে প্রমোশন দিয়ে "অ্যাডমিন" বানাতে পারবেন। অ্যাডমিনরা প্রোডাক্ট এডিট বা নতুন প্রোডাক্ট যোগ করতে পারে কিন্তু ওনার প্যানেলের অ্যাক্সেস পাবে না।' 
                  : 'Appointed administrators acquire direct capabilities to add catalogs, update prices and modify checkout processes. Rest easy - they cannot alter other admin roles.'}
              </p>

              <form onSubmit={handleGrantAdminByEmail} className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:flex-1">
                  <input
                    type="email"
                    required
                    value={newAdminEmailInput}
                    onChange={(e) => setNewAdminEmailInput(e.target.value)}
                    placeholder="যেমন: asraf_admin@gmail.com"
                    className="w-full bg-rose-50/50 border border-rose-950/15 focus:border-rose-600 outline-none rounded-xl px-4 py-3 text-sm font-semibold text-stone-800 placeholder-rose-950/30"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto bg-rose-700 hover:bg-rose-800 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                >
                  {loading ? <RefreshCw className="animate-spin" size={14} /> : <UserPlus size={15} />}
                  {getTranslation(language, 'makeAdmin')}
                </button>
              </form>
            </div>

            {/* Live registered user roles grid database */}
            <div className="bg-white rounded-3xl border border-stone-100 shadow-xs p-6">
              <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-stone-100">
                <h4 className="text-base font-extrabold text-stone-900">
                  {language === 'bn' ? 'সাইটের নিবন্ধিত ইউজার তালিকা ও অ্যাক্সেস রোল' : 'Site Verified Privileged Accounts'}
                </h4>
                <button 
                  onClick={fetchUsers} 
                  disabled={usersLoading}
                  className="p-1 px-3 text-[10px] uppercase font-bold text-stone-500 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 rounded-lg border border-stone-200 cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw size={11} className={usersLoading ? 'animate-spin' : ''} />
                  {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
                </button>
              </div>

              {usersLoading ? (
                <div className="text-center py-10 font-bold text-stone-400">{language === 'bn' ? 'লোড হচ্ছে...' : 'Querying verified users database...'}</div>
              ) : usersList.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-stone-150">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#FFF8F8] text-rose-950/60 text-[10px] font-bold uppercase border-b border-rose-950/5">
                        <th className="py-3 px-4">{getTranslation(language, 'userEmail')}</th>
                        <th className="py-3 px-4">{getTranslation(language, 'userRole')}</th>
                        <th className="py-3 px-4 text-center">{language === 'bn' ? 'অ্যাডমিন স্ট্যাটাস অ্যাকশন' : 'Apppointment Toggle Action'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50 text-xs font-semibold">
                      {usersList.map((usr, i) => {
                        const isThisOwner = usr.email === 'talhaxqutex@gmail.com';
                        const isThisAdmin = usr.isAdmin || isThisOwner;
                        
                        return (
                          <tr key={usr.id || i} className="hover:bg-rose-50/10 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-stone-800">
                              {usr.email} <span className="text-[10px] text-stone-400 font-normal">({usr.id})</span>
                            </td>
                            <td className="py-3.5 px-4">
                              {isThisOwner ? (
                                <span className="bg-rose-200 text-rose-900 border-rose-300 border font-extrabold text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">{getTranslation(language, 'ownerLabel')}</span>
                              ) : isThisAdmin ? (
                                <span className="bg-amber-100 text-amber-950 border-amber-200 border font-bold text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">{getTranslation(language, 'adminLabel')}</span>
                              ) : (
                                <span className="bg-stone-100 text-stone-500 border-stone-200 border text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">{getTranslation(language, 'customerLabel')}</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              {isThisOwner ? (
                                <span className="text-stone-300 font-bold italic text-[11px]">{language === 'bn' ? 'মালিকানা অপরিবর্তনশীল' : 'Founder (Immutable)'}</span>
                              ) : isThisAdmin ? (
                                <button
                                  onClick={() => handleSetUserRole(usr.id, usr.email, false)}
                                  className="px-3 py-1 rounded-lg border border-red-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-[#5C3E21] cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  <XCircle size={12} />
                                  {getTranslation(language, 'revokeAdmin')}
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleSetUserRole(usr.id, usr.email, true)}
                                  className="px-3 py-1 rounded-lg border border-amber-950/20 text-amber-950 hover:bg-amber-100 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                                >
                                  <CheckCircle size={12} />
                                  {getTranslation(language, 'makeAdmin')}
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-stone-50 p-6 rounded-2xl border border-dashed border-stone-300 text-center font-bold text-stone-500 py-10">
                  <LayoutGrid size={32} className="mx-auto text-stone-300 mb-2" />
                  {language === 'bn' ? 'কোনো নিবন্ধিত ইউজার এখনও নেই। ওনার হিসেবে আপনি উপরে ইমেল টাইপ করে যেকোনো সঠিক অ্যাকাউন্টে সরাসরি অ্যাডমিন রোল প্রদান করতে পারেন।' : 'No registered profiles listed. Type target email above to manually recruit admins.'}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      <Footer />

    </div>
  );
}
