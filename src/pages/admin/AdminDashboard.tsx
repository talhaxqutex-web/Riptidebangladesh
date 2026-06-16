import React, { useState, useEffect } from 'react';
import { useStore } from '../../store';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import Header from '../../components/layout/Header';
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
  ChevronDown, 
  ChevronUp, 
  Copy, 
  ExternalLink,
  Plus,
  RefreshCw,
  Clock,
  Eye,
  Briefcase,
  X
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAdmin } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  // Active Tab: 'overview', 'products', 'orders'
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders'>('overview');

  // Order Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Product Filters & Editing
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    imageUrl: '',
    category: '',
    stockCount: ''
  });

  // Proof Modal Picture State
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-light">
        <Header />
        <div className="max-w-7xl mx-auto p-4 mt-8 text-center text-red-600 font-bold">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const orderList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setOrders(orderList);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
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
      toast.error("Failed to load products");
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchOrders();
      fetchProducts();
    }
  }, [isAdmin]);

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error('Failed to update status');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, 'products', productId));
      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
       console.error("Error deleting product:", error);
       toast.error('Failed to delete product');
    }
  };

  const handleEditProductClick = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      description: product.description || '',
      imageUrl: product.imageUrl || '',
      category: product.category || 'General',
      stockCount: (product.stockCount || 0).toString()
    });
    // Scroll smoothly to form
    const formElement = document.getElementById('product-form-container');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      description: '',
      imageUrl: '',
      category: '',
      stockCount: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!formData.name || !formData.price || !formData.description) {
         throw new Error("Please fill in all required fields");
      }

      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        imageUrl: formData.imageUrl || '',
        category: formData.category || 'General',
        stockCount: parseInt(formData.stockCount || '0', 10),
        updatedAt: serverTimestamp()
      };

      if (editingProduct) {
        // Update mode
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Product updated successfully!');
        setEditingProduct(null);
      } else {
        // Add mode
        const addData = {
          ...productData,
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'products'), addData);
        toast.success('Product added successfully!');
      }

      fetchProducts();
      setFormData({
        name: '',
        price: '',
        description: '',
        imageUrl: '',
        category: '',
        stockCount: ''
      });
    } catch (error) {
      if(error instanceof Error && error.message.includes("Please fill")) {
         toast.error(error.message);
      } else {
         handleFirestoreError(error, editingProduct ? OperationType.UPDATE : OperationType.CREATE, 'products');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Toggle order details expansion
  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  // Helper calculation metrics
  const activeProductsCount = products.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const processedOrdersCount = orders.filter(o => o.status === 'processing').length;
  const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrdersCount = orders.filter(o => o.status === 'cancelled').length;
  
  // Calculate real metrics
  const totalSales = orders
    .filter(o => o.status === 'delivered' || o.status === 'processing')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const lowStockCount = products.filter(p => !p.stockCount || p.stockCount <= 5).length;

  // Filter products based on search & category
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) || 
                          (p.category || '').toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Filter orders based on search & status
  const filteredOrders = orders.filter(o => {
    const searchLower = orderSearch.toLowerCase();
    const orderIdShort = o.id ? o.id.slice(-6).toLowerCase() : '';
    const matchesSearch = (o.userEmail || '').toLowerCase().includes(searchLower) || 
                          (o.shippingDetails?.firstName || '').toLowerCase().includes(searchLower) ||
                          (o.shippingDetails?.lastName || '').toLowerCase().includes(searchLower) ||
                          orderIdShort.includes(searchLower) ||
                          (o.id || '').toLowerCase().includes(searchLower);
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Sales by category for custom clean SVG indicators
  const categorySalesMap: Record<string, number> = {};
  orders.filter(o => o.status === 'delivered' || o.status === 'processing').forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const cat = item.category || 'General';
        const cost = (item.price || 0) * (item.quantity || 1);
        categorySalesMap[cat] = (categorySalesMap[cat] || 0) + cost;
      });
    }
  });

  const categoryTotals = Object.entries(categorySalesMap).map(([name, val]) => ({ name, value: val }));
  const maxCategorySales = categoryTotals.length > 0 ? Math.max(...categoryTotals.map(c => c.value)) : 1;

  // Static list of unique product categories helper
  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied order ID to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header />
      
      {/* Admin Quick Banner */}
      <div className="bg-[#593A1B] text-white py-6 border-b border-[#3B220B] shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D1B89C]">Premium Control Deck</span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-1">Riptide Admin Suite</h1>
          </div>
          <div className="flex gap-2.5 items-center">
            <button 
              onClick={() => { fetchOrders(); fetchProducts(); toast.success('Data refreshed successfully!'); }}
              className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white flex items-center gap-2 text-sm font-bold border border-white/10"
              title="Refresh Data"
            >
              <RefreshCw size={16} className="animate-hover" />
              Refresh
            </button>
            <div className="bg-green-500/20 text-green-300 text-xs px-3 py-1.5 rounded-full font-bold border border-green-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
              Live Database Connected
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 mt-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 bg-white p-2 rounded-2xl shadow-sm gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'overview'
                ? 'bg-[#593A1B] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={18} />
            Overview & Stats
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'products'
                ? 'bg-[#593A1B] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Package size={18} />
            Manage Products
            <span className="bg-amber-100 text-amber-900 text-xs px-2 py-0.5 rounded-full">
              {activeProductsCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 md:flex-initial flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeTab === 'orders'
                ? 'bg-[#593A1B] text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Clock size={18} />
            Manage Orders
            {pendingOrdersCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-bounce">
                {pendingOrdersCount}
              </span>
            )}
          </button>
        </div>

        {/* ==================== 1. OVERVIEW & ANALYTICS TAB ==================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Sales Revenue */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-amber-50 text-[#593A1B] flex items-center justify-center">
                  <DollarSign size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Delivered Volume</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-0.5">৳{totalSales.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
                  <p className="text-xs text-green-600 font-bold mt-1">Sum of processing & delivered</p>
                </div>
              </div>

              {/* Total Orders */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Clock size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Total Bookings</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-0.5">{orders.length}</h3>
                  <div className="flex gap-2 text-xs font-bold text-gray-500 mt-1">
                    <span className="text-orange-600">{pendingOrdersCount} Pending</span>
                    <span>•</span>
                    <span className="text-green-600">{deliveredOrdersCount} Delivered</span>
                  </div>
                </div>
              </div>

              {/* Active Products */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-xl bg-green-50 text-green-700 flex items-center justify-center">
                  <Package size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Active Listing</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-0.5">{activeProductsCount}</h3>
                  <p className="text-xs text-gray-600 font-semibold mt-1">Available across store catalog</p>
                </div>
              </div>

              {/* Low Stock Watch */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${lowStockCount > 0 ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-400'}`}>
                  <AlertTriangle size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">Low Stock Warning</p>
                  <h3 className={`text-3xl font-extrabold mt-0.5 ${lowStockCount > 0 ? 'text-rose-600 animate-pulse' : 'text-gray-900'}`}>{lowStockCount}</h3>
                  <p className="text-xs text-gray-600 font-semibold mt-1">
                    {lowStockCount > 0 ? 'Requires immediate restock' : 'All listings fully stocked'}
                  </p>
                </div>
              </div>

            </div>

            {/* Custom Visual Analytics Graph Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Category-wise Sales performance */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-extrabold text-xl text-gray-900">Category Contribution</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Real-time revenue distribution across departments</p>
                  </div>
                  <span className="text-xs font-bold uppercase bg-[#593A1B]/5 text-[#593A1B] px-3 py-1 rounded-full">Delivered Volume</span>
                </div>

                {categoryTotals.length === 0 ? (
                  <div className="h-64 flex flex-col justify-center items-center text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-400 text-sm">No sales data generated yet.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {categoryTotals.map((item, idx) => {
                      const percentage = (item.value / totalSales) * 100;
                      const widthPercentage = (item.value / maxCategorySales) * 100;
                      return (
                        <div key={item.name} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-bold text-gray-800 capitalize">{item.name}</span>
                            <div className="flex gap-2">
                              <span className="text-[#593A1B] font-extrabold">৳{item.value.toLocaleString()}</span>
                              <span className="text-gray-400 font-semibold">({percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                          {/* Visual progress bar bar */}
                          <div className="w-full bg-gray-100 h-3.5 rounded-full overflow-hidden flex">
                            <div 
                              className="bg-amber-600 rounded-full transition-all duration-500" 
                              style={{ width: `${widthPercentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Low Stock Alerts & Fast Stats summary */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-xl text-gray-900 mb-4">Stock & System Health</h3>
                  
                  {lowStockCount === 0 ? (
                    <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-start gap-3 mb-6">
                      <CheckCircle className="text-green-600 mt-0.5 shrink-0" size={18} />
                      <div>
                        <h4 className="font-bold text-green-900 text-sm">Perfect Stock Levels</h4>
                        <p className="text-xs text-green-700 mt-0.5">All of your registered products have healthy store inventory levels.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 mb-6 max-h-56 overflow-y-auto pr-1">
                      {products.filter(p => !p.stockCount || p.stockCount <= 5).map(p => (
                        <div key={p.id} className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center justify-between text-xs">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900 truncate">{p.name}</p>
                            <p className="text-gray-500 mt-0.5">Category: {p.category || 'General'}</p>
                          </div>
                          <span className="ml-2 font-bold px-2 py-1 bg-rose-100 text-rose-700 rounded-lg shrink-0">
                            {p.stockCount || 0} left
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-semibold">Total Revenue Capture</span>
                    <span className="font-bold text-gray-900">৳{totalSales.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-semibold">Fulfillment Rate</span>
                    <span className="font-bold text-green-600">
                      {orders.length > 0 ? `${((deliveredOrdersCount / orders.length) * 100).toFixed(0)}%` : '0%'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-semibold">Order Processing Rate</span>
                    <span className="font-bold text-blue-600">
                      {orders.length > 0 ? `${((processedOrdersCount / orders.length) * 100).toFixed(0)}%` : '0%'}
                    </span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ==================== 2. MANAGE PRODUCTS TAB ==================== */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            
            {/* Products catalog list side */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Product search and filter header */}
              <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search name or category string..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full bg-slate-50 pl-11 pr-4 py-2.5 outline-none rounded-xl text-gray-800 placeholder-gray-400 border border-gray-200 focus:border-[#593A1B]"
                  />
                  {productSearch && (
                    <button onClick={() => setProductSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xs bg-gray-200/60 w-5 h-5 rounded-full flex items-center justify-center">×</button>
                  )}
                </div>
                
                <div className="w-full sm:w-48 relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="w-full bg-slate-50 pl-9 pr-8 py-2.5 outline-none rounded-xl text-gray-800 border border-gray-200 focus:border-[#593A1B] text-sm font-bold appearance-none cursor-pointer"
                  >
                    <option value="all">All Category</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>

              {/* Product Listings list */}
              {productsLoading ? (
                 <div className="flex justify-center p-12 bg-white rounded-2xl border border-gray-100">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#593A1B]"></div>
                 </div>
              ) : filteredProducts.length === 0 ? (
                 <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 flex flex-col justify-center items-center">
                   <Package className="h-16 w-16 text-gray-300 mb-3" />
                   <p className="text-gray-500 font-bold">No products match your search/filter.</p>
                   {productSearch || productCategoryFilter !== 'all' ? (
                     <button 
                       onClick={() => { setProductSearch(''); setProductCategoryFilter('all'); }}
                       className="mt-3 text-sm font-bold text-[#593A1B] hover:underline"
                     >
                       Reset All Filters
                     </button>
                   ) : null}
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {filteredProducts.map(product => {
                     const isOut = !product.stockCount || product.stockCount <= 0;
                     const isLow = product.stockCount > 0 && product.stockCount <= 5;
                     
                     return (
                       <div key={product.id} className="bg-white border select-none border-gray-100 rounded-2xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-shadow items-center relative overflow-hidden group">
                         <div className="w-20 h-20 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                           {product.imageUrl ? (
                             <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                           ) : (
                             <span className="text-gray-400 text-xs font-bold">No image</span>
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                             <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-50 text-amber-900 border border-amber-200/50 px-2 py-0.5 rounded-full">
                               {product.category || 'General'}
                             </span>
                             {isOut ? (
                               <span className="text-[9px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-md">Sold Out</span>
                             ) : isLow ? (
                               <span className="text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-md animate-pulse">Low Stock</span>
                             ) : null}
                           </div>
                           <h4 className="font-extrabold text-gray-900 truncate text-base">{product.name}</h4>
                           <div className="flex items-baseline gap-2 mt-1">
                             <p className="text-[#593A1B] font-extrabold text-base">৳{product.price.toFixed(2)}</p>
                             <p className="text-gray-400 text-xs font-semibold">Stock: {product.stockCount || 0}</p>
                           </div>
                         </div>
                         <div className="flex gap-1.5 shrink-0 ml-2">
                           <button
                             onClick={() => handleEditProductClick(product)}
                             className="p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all cursor-pointer"
                             title="Edit Product"
                           >
                             <Edit size={16} />
                           </button>
                           <button
                             onClick={() => handleDeleteProduct(product.id)}
                             className="p-2.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-xl transition-all cursor-pointer"
                             title="Delete Product"
                           >
                             <Trash2 size={16} />
                           </button>
                         </div>
                       </div>
                     );
                   })}
                 </div>
              )}
            </div>

            {/* Add / Edit Form panel side */}
            <div id="product-form-container" className="scroll-mt-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
                <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
                  <h3 className="font-extrabold text-lg text-gray-900">
                    {editingProduct ? 'Update Listing' : 'Publish Product'}
                  </h3>
                  {editingProduct && (
                    <button 
                      onClick={handleCancelEdit}
                      className="text-xs font-bold text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg transition"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Premium Noise Cancelling Headphones"
                      className="w-full border border-gray-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#593A1B]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price (৳) *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="1450"
                        className="w-full border border-gray-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#593A1B]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Stock Count</label>
                      <input
                        type="number"
                        name="stockCount"
                        value={formData.stockCount}
                        onChange={handleInputChange}
                        placeholder="50"
                        className="w-full border border-gray-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#593A1B]"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                    <div className="relative">
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full border border-gray-200 bg-slate-50 rounded-xl pl-4 pr-10 py-2.5 text-sm outline-none focus:border-[#593A1B] appearance-none cursor-pointer"
                      >
                        <option value="">Select Category...</option>
                        <option value="Gadgets">Gadgets</option>
                        <option value="Fashion">Fashion</option>
                        <option value="Accessories">Accessories</option>
                        <option value="General">General/Other</option>
                      </select>
                      <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Product Media (Drag/Upload or paste URL)</label>
                    <div className="space-y-2.5">
                      <div className="relative overflow-hidden w-full border border-gray-200 border-dashed bg-slate-50 p-4 rounded-xl flex flex-col items-center justify-center text-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="pointer-events-none text-xs text-gray-500 space-y-1 font-bold">
                          <p className="text-[#593A1B] hover:underline">Click to upload product image</p>
                          <p className="text-[10px] text-gray-400 font-semibold">(JPEG or PNG formats compressed automatically)</p>
                        </div>
                      </div>
                      <div className="relative flex items-center">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-[10px] font-bold text-gray-400 px-3 shrink-0">OR IMAGE URL</span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                      </div>
                      <input
                        type="url"
                        name="imageUrl"
                        value={formData.imageUrl}
                        onChange={handleInputChange}
                        placeholder="Paste image web address..."
                        className="w-full border border-gray-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#593A1B]"
                      />
                    </div>
                    {formData.imageUrl && (
                      <div className="mt-3 p-2 bg-amber-50 rounded-xl border border-amber-200/50 flex items-center gap-3">
                        <img src={formData.imageUrl} alt="preview" className="w-10 h-10 object-cover rounded-lg shrink-0 border border-gray-200 bg-white" />
                        <span className="text-[10px] font-bold text-green-700">✓ Image media pre-hooked.</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Product Details Description *</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Input complete product description, benefits, origin..."
                      rows={4}
                      className="w-full border border-gray-200 bg-slate-50 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#593A1B]"
                      required
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#593A1B] hover:bg-[#3B220B] text-white font-bold py-3 px-8 rounded-xl transition-colors disabled:opacity-50 cursor-pointer text-sm shadow-md flex items-center justify-center gap-1.5"
                  >
                    {loading ? 'Processing...' : editingProduct ? 'Save Product Changes' : 'Create New Listing'}
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* ==================== 3. MANAGE ORDERS TAB ==================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Orders interactive filter panel */}
            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-xl text-gray-900">Registered Invoices</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Manage customer orders, verify transaction IDs & process delivery</p>
                </div>
                <span className="text-xs font-bold text-gray-400">Total processed bookings: {orders.length}</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search order ID, buyer email or shipping first/last name..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="w-full bg-slate-50 pl-11 pr-4 py-2.5 outline-none rounded-xl text-gray-800 placeholder-gray-400 border border-gray-200 focus:border-[#593A1B] text-sm"
                  />
                  {orderSearch && (
                    <button onClick={() => setOrderSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xs bg-gray-200/60 w-5 h-5 rounded-full flex items-center justify-center">×</button>
                  )}
                </div>
                
                {/* Horizontal status tag indicators filter */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl self-stretch overflow-x-auto min-w-[280px]">
                  {['all', 'pending', 'processing', 'delivered', 'cancelled'].map(st => {
                    const count = st === 'all' ? orders.length : orders.filter(o => o.status === st).length;
                    return (
                      <button
                        key={st}
                        onClick={() => setOrderStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all shrink-0 ${
                          orderStatusFilter === st
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {st} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Orders List */}
            {ordersLoading ? (
              <div className="flex justify-center p-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#593A1B]"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 flex flex-col justify-center items-center">
                <Package className="mx-auto h-16 w-16 text-gray-300 mb-3" />
                <p className="text-gray-500 font-bold">No orders found matching current criteria.</p>
                {orderSearch || orderStatusFilter !== 'all' ? (
                  <button 
                    onClick={() => { setOrderSearch(''); setOrderStatusFilter('all'); }}
                    className="mt-2 text-sm font-bold text-[#593A1B] hover:underline"
                  >
                    Reset Order Filters
                  </button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map(order => {
                  const isExpanded = !!expandedOrders[order.id];
                  
                  return (
                    <div 
                      key={order.id} 
                      className={`bg-white border text-left border-gray-100 rounded-3xl shadow-sm transition-all overflow-hidden ${
                        isExpanded ? 'ring-2 ring-[#593A1B]/10 md:p-1' : ''
                      }`}
                    >
                      {/* Order Summary Header strip */}
                      <div className="p-5 md:p-6 flex flex-col lg:flex-row justify-between gap-4 items-start lg:items-center">
                        <div className="flex flex-wrap items-start md:items-center gap-3">
                          <div className="bg-slate-50 border border-gray-100 p-2.5 rounded-xl font-bold font-mono text-xs flex items-center gap-1">
                            <span className="text-gray-400">ID:</span>
                            <span className="text-gray-900 select-all">#{order.id ? order.id.slice(-6).toUpperCase() : 'N/A'}</span>
                            <button 
                              onClick={() => copyToClipboard(order.id)}
                              className="text-gray-400 hover:text-gray-600 transition p-0.5"
                              title="Copy Full Document ID"
                            >
                              <Copy size={12} />
                            </button>
                          </div>
                          
                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize tracking-wide ${
                            order.status === 'pending' ? 'bg-orange-50 text-orange-700 border border-orange-200/50' :
                            order.status === 'processing' ? 'bg-blue-50 text-blue-700 border border-blue-200/50' :
                            order.status === 'delivered' ? 'bg-green-50 text-green-700 border border-green-200/50' :
                            order.status === 'cancelled' ? 'bg-red-50 text-red-700 border border-red-200/50' :
                            'bg-gray-50 text-gray-700'
                          }`}>
                            {order.status}
                          </span>

                          <span className="text-xs text-gray-400 font-bold">
                            {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Date Pending'}
                          </span>
                        </div>

                        {/* Customer Email & Bill amount */}
                        <div className="flex flex-col md:flex-row lg:items-center gap-4 w-full lg:w-auto self-stretch md:self-auto justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                          <div>
                            <p className="text-xs text-gray-400 font-bold">Customer Account</p>
                            <p className="text-sm font-semibold text-gray-800">{order.userEmail || 'Guest user'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-400 font-bold">Billing Total</p>
                            <p className="text-lg font-black text-[#593A1B]">৳{(order.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                          </div>
                          
                          <button
                            onClick={() => toggleOrderExpand(order.id)}
                            className="bg-slate-50 hover:bg-slate-100 border border-gray-200 text-gray-600 font-bold text-xs py-2 px-3.5 rounded-xl transition flex items-center justify-center gap-1"
                          >
                            {isExpanded ? 'Hide Details' : 'View Details'}
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Dropdown Expanded Details (Items list + Customer shipping details + Payment Proof block) */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 bg-slate-50/50 p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-down">
                          
                          {/* Col 1: Ordered Items details list (Critical, missing from simple admin panel!) */}
                          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/60 shadow-sm space-y-3">
                            <h4 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Products Ordered</h4>
                            
                            {order.items && Array.isArray(order.items) && order.items.length > 0 ? (
                              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                                {order.items.map((item: any, idx: number) => (
                                  <div key={idx} className="flex gap-3 items-center text-xs">
                                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                      {item.imageUrl ? (
                                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px] font-bold text-gray-400">N/A</div>
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-gray-900 truncate">{item.name}</p>
                                      <p className="text-gray-500 mt-0.5">৳{item.price} × {item.quantity}</p>
                                    </div>
                                    <span className="font-bold text-[#593A1B]">৳{(item.price * item.quantity).toLocaleString()}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400">No product item data was recorded for this order.</p>
                            )}

                            <div className="border-t border-gray-100 pt-3 flex flex-col gap-1.5 text-xs">
                              <div className="flex justify-between text-gray-500">
                                <span>Subtotal</span>
                                <span>৳{(order.subtotal || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between text-gray-500">
                                <span>Shipping Charge</span>
                                <span>৳{(order.shipping || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-1.5">
                                <span>Order Total</span>
                                <span>৳{(order.total || 0).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>

                          {/* Col 2: Shipping details info */}
                          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/60 shadow-sm space-y-3.5">
                            <h4 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Shipping Information</h4>
                            
                            <div className="text-xs space-y-2 leading-relaxed">
                              <div>
                                <p className="text-gray-400 font-bold">Recipient Full Name</p>
                                <p className="font-semibold text-gray-900">
                                  {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-400 font-bold">Destination Address Address</p>
                                <p className="font-semibold text-gray-900 block whitespace-pre-wrap">
                                  {order.shippingDetails?.address}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <p className="text-gray-400 font-bold">City / District</p>
                                  <p className="font-semibold text-gray-900">{order.shippingDetails?.city || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 font-bold">Postal Code</p>
                                  <p className="font-semibold text-gray-900">{order.shippingDetails?.postalCode || 'N/A'}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-gray-400 font-bold font-mono">Country Code</p>
                                <p className="font-semibold text-gray-900">{order.shippingDetails?.country || 'Bangladesh'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Col 3: Payment Verification System */}
                          <div className="bg-white p-4.5 rounded-2xl border border-gray-200/60 shadow-sm space-y-3 flex flex-col justify-between">
                            <div className="space-y-3">
                              <h4 className="font-extrabold text-sm text-gray-900 border-b border-gray-100 pb-2">Payment Audit</h4>
                              <div className="text-xs space-y-2">
                                <div className="flex justify-between items-center bg-slate-50 p-2 rounded-xl border border-gray-100">
                                  <span className="text-gray-500 font-bold">Method</span>
                                  <span className="font-extrabold text-[#593A1B] uppercase">{order.paymentDetails?.method || 'Mobile Banking'}</span>
                                </div>
                                
                                {order.paymentDetails?.transactionId ? (
                                  <div>
                                    <p className="text-gray-400 font-bold">Bkash/Nagad Transaction ID</p>
                                    <p className="font-mono font-bold text-gray-900 text-sm bg-slate-100/60 px-2 py-1 rounded-lg select-all border border-gray-200/40">{order.paymentDetails.transactionId}</p>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-gray-400 italic">No transaction code logged.</p>
                                )}

                                {order.paymentDetails?.paymentProof && (
                                  <div className="mt-2.5">
                                    <p className="text-gray-400 font-bold mb-1.5">Payment Screenshot</p>
                                    <button 
                                      onClick={() => setSelectedProofUrl(order.paymentDetails.paymentProof)}
                                      className="relative block w-full h-24 border border-gray-200 rounded-xl overflow-hidden hover:opacity-80 transition cursor-zoom-in bg-slate-50 "
                                    >
                                      <img src={order.paymentDetails.paymentProof} alt="Payment Proof Screen" className="w-full h-full object-cover" />
                                      <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition flex items-center justify-center text-white font-bold text-xs gap-1">
                                        <Eye size={12} />
                                        Click to enlarge
                                      </div>
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status controls buttons inside expand block */}
                            <div className="border-t border-gray-100 pt-3 mt-4 flex flex-col sm:flex-row gap-2">
                              {order.status === 'pending' && (
                                 <button 
                                    onClick={() => updateOrderStatus(order.id, 'processing')}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-blue-700 transition cursor-pointer"
                                 >
                                    <CheckCircle size={14} /> Approve Payment
                                 </button>
                              )}
                              {order.status === 'processing' && (
                                 <button 
                                    onClick={() => updateOrderStatus(order.id, 'delivered')}
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl font-bold text-xs shadow-sm hover:bg-green-700 transition cursor-pointer"
                                 >
                                    <Package size={14} /> Deliver Orders
                                 </button>
                              )}
                              {(order.status === 'pending' || order.status === 'processing') && (
                                 <button 
                                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 text-rose-700 rounded-xl font-bold text-xs hover:bg-rose-100 transition cursor-pointer border border-rose-200"
                                 >
                                    <XCircle size={14} /> Cancel order
                                 </button>
                              )}
                            </div>

                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Payment Proof Lightbox Modal Popup */}
      {selectedProofUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4" onClick={() => setSelectedProofUrl(null)}>
          <div className="relative max-w-2xl w-full max-h-[85vh] bg-neutral-900 border border-neutral-800 rounded-3xl p-1.5 overflow-hidden flex flex-col aspect-auto group" onClick={(e) => e.stopPropagation()}>
            <img src={selectedProofUrl} alt="Enlarged payment screenshot" className="w-full h-full object-contain rounded-2xl max-h-[80vh] bg-black" />
            <button 
              onClick={() => setSelectedProofUrl(null)}
              className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white hover:text-red-400 p-2 rounded-full border border-white/10 transition shadow-md cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

