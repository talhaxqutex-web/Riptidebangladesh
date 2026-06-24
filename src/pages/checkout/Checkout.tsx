import { Helmet } from 'react-helmet-async';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Shield, CreditCard, ShoppingBag, Check, Mail, Phone, MapPin, Truck, Tag, RefreshCw, XCircle, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { getTranslation } from '../../utils/translate';

export default function Checkout() {
  const { cart, user, clearCart, language } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  
  // Coupon state
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);

  // Delivery Area State
  const [deliveryArea, setDeliveryArea] = useState<'inside' | 'outside'>('inside');
  const [shippingRates, setShippingRates] = useState({ insideDhakaCharge: 70, outsideDhakaCharge: 130 });
  const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
  
  // Custom shipping variables
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    division: 'Dhaka',
    notes: '',
    paymentMethod: 'bkash', // default payment
    mobileNumber: '',       // sender mobile number
    transactionId: ''        // transaction reference
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { doc, getDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setShippingRates({
            insideDhakaCharge: data.insideDhakaCharge || 70,
            outsideDhakaCharge: data.outsideDhakaCharge || 130
          });
        }
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    };
    fetchSettings();
  }, []);

  const subtotal = cart.reduce((sum, item) => {
    const activePrice = item.product.specialPrice && item.product.specialPrice < item.product.price 
      ? item.product.specialPrice 
      : item.product.price;
    return sum + activePrice * item.quantity;
  }, 0);
  
  const shippingCharge = subtotal > 0 ? (deliveryArea === 'inside' ? shippingRates.insideDhakaCharge : shippingRates.outsideDhakaCharge) : 0;
  const discount = Math.min(subtotal, appliedCoupon?.discountAmount || 0);
  const total = subtotal + shippingCharge - discount;

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setApplyingCoupon(true);
    try {
      const q = query(
        collection(db, 'coupons'), 
        where('code', '==', couponCodeInput.trim().toUpperCase()),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        toast.error(language === 'bn' ? 'অবৈধ কুপন কোড' : 'Invalid coupon code');
        setAppliedCoupon(null);
      } else {
        const couponData = snapshot.docs[0].data();
        if (!couponData.isActive) {
          toast.error(language === 'bn' ? 'এই কুপনটি এখন নিষ্ক্রিয়' : 'This coupon is currently inactive');
          setAppliedCoupon(null);
        } else {
          setAppliedCoupon({ code: couponData.code, discountAmount: couponData.discountAmount });
          toast.success(language === 'bn' ? 'কুপন সফলভাবে প্রয়োগ করা হয়েছে!' : 'Coupon applied successfully!');
        }
      }
    } catch (e) {
      console.error("Error applying coupon", e);
      toast.error(language === 'bn' ? 'কুপন যাচাই করতে সমস্যা হয়েছে' : 'Error validating coupon');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
  };

  // Render logins panel if unauthenticated
  if (!user && !success) {
    return (
      <div className="min-h-screen bg-[#FCFAF7] flex flex-col text-stone-900 text-left">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-16">
           <div className="bg-white p-8 md:p-10 rounded-3xl border border-amber-900/5 max-w-md w-full text-center shadow-xs">
              <ShoppingBag size={48} className="mx-auto text-[#8B6E53] mb-5" />
              <h2 className="text-xl md:text-2xl font-black text-stone-900 mb-2">
                {language === 'bn' ? 'অর্ডার করতে অ্যাকাউন্ট প্রয়োজন!' : 'Authentication Required'}
              </h2>
              <p className="text-stone-500 text-xs mb-6 max-w-xs mx-auto">
                {language === 'bn' ? 'নিরাপদ চেকআউট সম্পন্ন করতে দয়া করে আপনার প্রোফাইলে লগইন করুন।' : 'Please log in or register a customer account with Riptide to process orders.'}
              </p>
              <Link to="/auth?redirect=/checkout" className="block w-full bg-[#3E2511] hover:bg-[#201105] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl transition-all shadow-md uppercase tracking-wider">
                 {getTranslation(language, 'loginRegister')}
              </Link>
           </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle inputs change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Checks validations
    if (!formData.firstName.trim() || !formData.phone.trim() || !formData.address.trim() || !formData.city.trim()) {
      toast.error(language === 'bn' ? 'তারকা চিহ্নিত সকল ডেলিভারি ক্ষেত্র পূরণ করুন!' : 'Please fill all required shipping fields');
      return;
    }

    if (formData.paymentMethod !== 'cod') {
      if (!formData.mobileNumber.trim() || !formData.transactionId.trim()) {
        toast.error(language === 'bn' ? 'মোবাইল ব্যাকিং পেমেন্টের জন্য প্রেরক নম্বর এবং TrxID প্রদান করুন!' : 'Sender Number and Transaction ID are required for mobile banking payments!');
        return;
      }
    }

    setLoading(true);

    try {
      // Map cart items into standard structure to prevent nested circular references
      const orderedItems = cart.map(item => ({
        productId: item.product.id,
        nameBn: item.product.nameBn || item.product.name,
        nameEn: item.product.nameEn || item.product.name,
        price: item.product.specialPrice && item.product.specialPrice < item.product.price ? item.product.specialPrice : item.product.price,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants,
        imageUrl: item.product.imageUrl || ''
      }));

      const orderPayload = {
        userId: user!.uid,
        userEmail: user!.email || 'anonymous',
        items: orderedItems,
        totalAmount: total,
        subTotalAmount: subtotal,
        discountAmount: discount,
        couponCode: appliedCoupon?.code || '',
        shippingCharge: shippingCharge,
        deliveryArea: deliveryArea,
        status: 'pending',
        shippingDetails: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city.trim(),
          division: formData.division,
          notes: formData.notes.trim()
        },
        paymentMethod: formData.paymentMethod,
        paymentDetails: formData.paymentMethod !== 'cod' ? {
          mobileNumber: formData.mobileNumber.trim(),
          transactionId: formData.transactionId.trim()
        } : {},
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add to Firestore database
      const docRef = await addDoc(collection(db, 'orders'), orderPayload);
      setCreatedOrderId(docRef.id);
      
      // Send confirmation email
      if (user?.email) {
        try {
          await fetch('/api/send-order-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: user.email,
              firstName: formData.firstName.trim(),
              lastName: formData.lastName.trim(),
              orderId: docRef.id,
              totalAmount: total
            })
          });
        } catch (err) {
          console.error('Failed to send confirmation email:', err);
        }
      }

      clearCart();
      setSuccess(true);
      toast.success(getTranslation(language, 'orderSuccess'));
      window.scrollTo(0, 0);

    } catch (error: any) {
      console.error('Checkout submit error:', error);
      toast.error(language === 'bn' ? 'অর্ডার সম্পন্ন করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।' : 'Failed to register order. Please verify input fields.');
    } finally {
      setLoading(false);
    }
  };

  // Render Order Success Panel
  if (success) {
    return (
      <div className="min-h-screen bg-[#FCFAF7] flex flex-col text-[#3E2511] text-left">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4 py-16">
           <div className="bg-white p-8 md:p-12 rounded-3xl border border-amber-900/5 max-w-xl w-full text-center shadow-md">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
                 <Check size={32} strokeWidth={3} />
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-stone-900 mb-3">
                {language === 'bn' ? 'অর্ডার সফলভাবে সাবমিট হয়েছে!' : 'Order Placed Comfortably!'}
              </h1>
              
              <p className="text-stone-500 text-xs mb-6 max-w-md mx-auto leading-relaxed">
                {getTranslation(language, 'orderSuccessDetails')}
              </p>
              
              {createdOrderId && (
                <div className="bg-[#FAF8F4] rounded-2xl p-4 mb-8 text-left border border-amber-900/5 select-all">
                  <span className="text-[10px] text-stone-400 uppercase font-black block mb-0.5">Riptide Order Tracking Code</span>
                  <p className="font-mono text-sm font-black text-stone-800 break-all">{createdOrderId}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/orders" className="flex-1 bg-[#3E2511] hover:bg-[#201105] text-white font-extrabold text-xs py-3.5 px-4 rounded-xl transition-all shadow-md text-center uppercase tracking-wider">
                  {getTranslation(language, 'myOrders')}
                </Link>
                <Link to="/" className="flex-1 bg-white hover:bg-stone-50 text-[#3E2511] font-extrabold text-xs py-3.5 px-4 rounded-xl border border-stone-200 transition-all text-center uppercase tracking-wider">
                  {language === 'bn' ? 'শপিং অব্যাহত রাখুন' : 'Return to Store'}
                </Link>
              </div>
           </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFAF7] flex flex-col text-[#3E2511] text-left">
      <Helmet>
        <title>{getTranslation(language, 'checkoutTitle')} - Riptide Bangladesh</title>
      </Helmet>
      
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 select-none">
        
        <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight mb-8 uppercase font-mono">
          {getTranslation(language, 'checkoutTitle')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel structure: Form */}
          <div className="lg:col-span-8">
            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
              
              {/* Shipping Address Forms */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-amber-900/5 shadow-xs">
                <h2 className="text-lg font-black text-stone-900 mb-6 flex items-center gap-2.5 pb-2 border-b border-stone-50">
                  <span className="w-7 h-7 rounded-full bg-[#FAF6F1] text-[#3E2511] border border-amber-900/10 flex items-center justify-center text-xs font-black font-mono">1</span>
                  {getTranslation(language, 'shippingDetails')}
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-1.5">{getTranslation(language, 'firstName')} *</label>
                    <input 
                      required 
                      type="text" 
                      name="firstName" 
                      value={formData.firstName} 
                      onChange={handleInputChange} 
                      placeholder="আশরাফুল"
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] text-stone-800 text-sm font-semibold" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-1.5">{getTranslation(language, 'lastName')}</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      value={formData.lastName} 
                      onChange={handleInputChange} 
                      placeholder="ইসলাম (ঐচ্ছিক)"
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] text-stone-800 text-sm font-semibold" 
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-black uppercase text-stone-500 mb-1.5">{getTranslation(language, 'phone')} *</label>
                  <input 
                    required 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleInputChange} 
                    placeholder="যেমন: ০১৭০০-০০০০০১"
                    className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] text-stone-800 text-sm font-semibold font-mono" 
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-xs font-black uppercase text-stone-500 mb-1.5">{getTranslation(language, 'address')} *</label>
                  <input 
                    required 
                    type="text" 
                    name="address" 
                    value={formData.address} 
                    onChange={handleInputChange} 
                    placeholder="হোল্ডিং নম্বর, গ্রাম/রোড, থানা"
                    className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] text-stone-800 text-sm font-semibold" 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-1.5">{getTranslation(language, 'city')} *</label>
                    <input 
                      required 
                      type="text" 
                      name="city" 
                      value={formData.city} 
                      onChange={handleInputChange} 
                      placeholder="ঢাকা / কসবা / মিরপুর"
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] text-stone-800 text-sm font-semibold" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black uppercase text-stone-500 mb-1.5">{getTranslation(language, 'division')}</label>
                    <select 
                      name="division" 
                      value={formData.division} 
                      onChange={handleInputChange} 
                      className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] text-stone-800 text-sm font-semibold cursor-pointer"
                    >
                      <option value="Dhaka">{language === 'bn' ? 'ঢাকা (Dhaka)' : 'Dhaka'}</option>
                      <option value="Chittagong">{language === 'bn' ? 'চট্টগ্রাম (Chittagong)' : 'Chittagong'}</option>
                      <option value="Sylhet">{language === 'bn' ? 'সিলেট (Sylhet)' : 'Sylhet'}</option>
                      <option value="Khulna">{language === 'bn' ? 'খুলনা (Khulna)' : 'Khulna'}</option>
                      <option value="Barisal">{language === 'bn' ? 'বরিশাল (Barisal)' : 'Barisal'}</option>
                      <option value="Rajshahi">{language === 'bn' ? 'রাজশাহী (Rajshahi)' : 'Rajshahi'}</option>
                      <option value="Rangpur">{language === 'bn' ? 'রংপুর (Rangpur)' : 'Rangpur'}</option>
                      <option value="Mymensingh">{language === 'bn' ? 'ময়মনসিংহ (Mymensingh)' : 'Mymensingh'}</option>
                    </select>
                  </div>
                </div>

                {/* Delivery Area Selection */}
                <div className="mt-4">
                  <label className="block text-xs font-black uppercase text-stone-500 mb-1.5">{language === 'bn' ? 'ডেলিভারি এরিয়া' : 'Delivery Area'}</label>
                  <div className="flex gap-4">
                    <label className={`flex-1 border-2 rounded-xl p-3 flex items-center justify-center gap-2 transition-all cursor-pointer ${deliveryArea === 'inside' ? 'border-[#3E2511] bg-[#3E2511] text-white' : 'border-stone-100 bg-[#FAF9F5] hover:border-stone-200 text-stone-700'}`}>
                      <input type="radio" name="deliveryArea" value="inside" checked={deliveryArea === 'inside'} onChange={(e) => setDeliveryArea(e.target.value as 'inside' | 'outside')} className="hidden" />
                      <span className="font-bold text-sm tracking-wide">{language === 'bn' ? 'ঢাকার ভিতরে' : 'Inside Dhaka'}</span>
                    </label>
                    <label className={`flex-1 border-2 rounded-xl p-3 flex items-center justify-center gap-2 transition-all cursor-pointer ${deliveryArea === 'outside' ? 'border-[#3E2511] bg-[#3E2511] text-white' : 'border-stone-100 bg-[#FAF9F5] hover:border-stone-200 text-stone-700'}`}>
                      <input type="radio" name="deliveryArea" value="outside" checked={deliveryArea === 'outside'} onChange={(e) => setDeliveryArea(e.target.value as 'inside' | 'outside')} className="hidden" />
                      <span className="font-bold text-sm tracking-wide">{language === 'bn' ? 'ঢাকার বাইরে' : 'Outside Dhaka'}</span>
                    </label>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-xs font-black uppercase text-stone-500 mb-1.5">{getTranslation(language, 'deliveryNotes')}</label>
                  <textarea 
                    name="notes" 
                    value={formData.notes} 
                    onChange={handleInputChange} 
                    rows={2}
                    placeholder="ডেলিভারি সংক্রান্ত বিশেষ কোনো বার্তা থাকলে লিখতে পারেন..."
                    className="w-full bg-[#FAF9F5] border border-amber-900/10 rounded-xl px-4 py-3 outline-none focus:border-[#3E2511] text-stone-800 text-xs font-semibold leading-relaxed" 
                  />
                </div>
              </div>

              {/* Payment Methods Selections Row */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-amber-900/5 shadow-xs">
                <h2 className="text-lg font-black text-stone-900 mb-6 flex items-center gap-2.5">
                  <CreditCard className="text-[#482b13]" size={20} />
                  {getTranslation(language, 'paymentMethod')}
                </h2>
                
                <div className="mb-6 relative">
                  <div 
                    onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
                    className="flex justify-between items-center w-full border-2 border-[#482b13] rounded-2xl px-5 py-4 cursor-pointer bg-white group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold text-[#482b13] text-[15px]">
                        {formData.paymentMethod === 'bkash' && 'bKash Payment'}
                        {formData.paymentMethod === 'nagad' && 'Nagad Payment'}
                        {formData.paymentMethod === 'rocket' && 'Rocket Payment'}
                      </span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 group-hover:bg-stone-200 transition-colors">
                      {isPaymentDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                  </div>

                  {isPaymentDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-3xl shadow-lg z-50 overflow-hidden divide-y divide-stone-100">
                      
                      <div className="p-2">
                        <label className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-colors ${formData.paymentMethod === 'bkash' ? 'bg-stone-50' : 'hover:bg-stone-50'}`}>
                          <input type="radio" name="paymentMethod" value="bkash" checked={formData.paymentMethod === 'bkash'} onChange={(e) => { handleInputChange(e); setIsPaymentDropdownOpen(false); }} className="hidden" />
                          <span className="font-extrabold text-[#482b13] tracking-wide">bKash Payment</span>
                        </label>
                      </div>

                      <div className="p-2">
                        <label className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-colors ${formData.paymentMethod === 'nagad' ? 'bg-stone-50' : 'hover:bg-stone-50'}`}>
                          <input type="radio" name="paymentMethod" value="nagad" checked={formData.paymentMethod === 'nagad'} onChange={(e) => { handleInputChange(e); setIsPaymentDropdownOpen(false); }} className="hidden" />
                          <span className="font-extrabold text-[#482b13] tracking-wide">Nagad Payment</span>
                        </label>
                      </div>

                      <div className="p-2">
                        <label className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-colors ${formData.paymentMethod === 'rocket' ? 'bg-stone-50' : 'hover:bg-stone-50'}`}>
                          <input type="radio" name="paymentMethod" value="rocket" checked={formData.paymentMethod === 'rocket'} onChange={(e) => { handleInputChange(e); setIsPaymentDropdownOpen(false); }} className="hidden" />
                          <span className="font-extrabold text-[#482b13] tracking-wide">Rocket Payment</span>
                        </label>
                      </div>

                    </div>
                  )}
                </div>

                {/* Conditional Payment instruction details rendering */}
                {formData.paymentMethod !== 'cod' ? (
                  <div className="mb-6 space-y-4">
                    {/* Payment Instruction Card styled exactly like the reference */}
                    <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-sm bg-white">
                      <div className="bg-[#482b13] text-white font-bold py-3 text-center text-[10px] md:text-xs tracking-[0.15em] uppercase">
                        {language === 'bn' ? 'পেমেন্ট নির্দেশিকা' : 'Payment Instructions'}
                      </div>
                      
                      <div className="p-5 md:p-6 space-y-5">
                        
                        {/* Step 1 */}
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#482b13] text-white flex items-center justify-center font-bold text-[11px] shrink-0">1</div>
                          <p className="text-stone-700 text-xs font-medium">
                            {language === 'bn' 
                              ? `আপনার ${formData.paymentMethod === 'bkash' ? 'বিকাশ' : formData.paymentMethod === 'nagad' ? 'নগদ' : 'রকেট'} অ্যাপ এ যান।` 
                              : `Go to your ${formData.paymentMethod === 'bkash' ? 'bKash' : formData.paymentMethod === 'nagad' ? 'Nagad' : 'Rocket'} Payment App.`}
                          </p>
                        </div>
                        
                        {/* Step 2 */}
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#482b13] text-white flex items-center justify-center font-bold text-[11px] shrink-0">2</div>
                          <div className="text-stone-700 text-xs font-medium flex items-center gap-2">
                            {language === 'bn' ? 'এই অপশনটি সিলেক্ট করুন:' : 'Select Option:'} 
                            <span className="bg-stone-100/80 border border-stone-200 text-stone-800 px-2.5 py-1 rounded-md font-bold shadow-xs">
                              {language === 'bn' ? 'সেন্ড মানি' : 'Send Money'}
                            </span>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#482b13] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</div>
                          <div className="flex-1">
                            <p className="text-stone-700 text-xs font-medium mb-2">
                              {language === 'bn' ? 'এই নম্বরটি দিন:' : 'Enter this Number:'}
                            </p>
                            <div className="flex items-stretch w-full max-w-xs shadow-xs rounded-xl">
                              <div className="flex-1 bg-[#FDFBF9] border border-stone-200 border-r-0 rounded-l-xl px-4 py-2 flex items-center">
                                <span className="text-[15px] md:text-base font-black text-[#482b13] tracking-widest">
                                  01721929231
                                </span>
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText('01721929231');
                                  toast.success(language === 'bn' ? 'নম্বর কপি হয়েছে!' : 'Number copied!');
                                }}
                                className="bg-[#482b13] text-white px-4 rounded-r-xl text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#341d0b] transition-colors border border-[#482b13]"
                              >
                                <Copy size={13} className="shrink-0" />
                                {language === 'bn' ? 'কপি' : 'Copy'}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[#482b13] text-white flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">4</div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-stone-700 text-xs font-medium mb-2">
                              {language === 'bn' ? 'অ্যামাউন্ট দিন:' : 'Enter Amount:'}
                              <span className="bg-[#482b13]/10 text-[#482b13] font-bold px-2 py-0.5 rounded-md text-[9px] uppercase tracking-wider whitespace-nowrap">
                                {language === 'bn' ? 'শুধুমাত্র ডেলিভারি চার্জ' : 'Delivery Charge Only'}
                              </span>
                            </div>
                            <div className="flex items-stretch w-full max-w-xs shadow-xs rounded-xl">
                              <div className="flex-1 bg-[#FDFBF9] border border-stone-200 border-r-0 rounded-l-xl px-4 py-2 flex items-center">
                                <span className="text-[15px] md:text-base font-black text-[#482b13] tracking-widest">
                                  {shippingCharge} BDT
                                </span>
                              </div>
                              <button 
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(shippingCharge.toString());
                                  toast.success(language === 'bn' ? 'অ্যামাউন্ট কপি হয়েছে!' : 'Amount copied!');
                                }}
                                className="bg-[#482b13] text-white px-4 rounded-r-xl text-[11px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#341d0b] transition-colors border border-[#482b13]"
                              >
                                <Copy size={13} className="shrink-0" />
                                {language === 'bn' ? 'কপি' : 'Copy'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Inputs panel for Sender number & TrxId */}
                    <div className="bg-[#FAF8F5] border border-amber-900/10 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-black uppercase text-stone-500 mb-1.5">{getTranslation(language, 'senderNumber')}</label>
                        <input 
                          type="text" 
                          name="mobileNumber" 
                          required={formData.paymentMethod !== 'cod'}
                          value={formData.mobileNumber} 
                          onChange={handleInputChange} 
                          placeholder="যেমন: ০১৭১১-২২৩৩৪৪" 
                          className="w-full bg-white border border-amber-900/10 rounded-xl px-4 py-2.5 outline-none focus:border-[#3E2511] text-stone-800 font-mono font-bold text-xs" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-[10px] font-black uppercase text-stone-500 mb-1.5">{getTranslation(language, 'transactionId')} (TrxID)</label>
                        <input 
                          type="text" 
                          name="transactionId" 
                          required={formData.paymentMethod !== 'cod'}
                          value={formData.transactionId} 
                          onChange={handleInputChange} 
                          placeholder="যেমন: BKA48X9K82" 
                          className="w-full bg-white border border-amber-900/10 rounded-xl px-4 py-2.5 outline-none focus:border-[#3E2511] text-[#3E2511] font-mono font-black text-xs uppercase" 
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#F0FDF4] border border-emerald-100 rounded-2xl p-5 mb-6 text-xs text-emerald-800 flex items-start gap-2.5">
                    <Truck className="shrink-0 mt-0.5 text-emerald-600" size={16} />
                    <div>
                      <p className="font-black uppercase tracking-wide">{language === 'bn' ? 'ক্যাশ অন ডেলিভারি (COD)' : 'Cash On Delivery Option Selected'}</p>
                      <p className="mt-1 font-medium leading-relaxed">
                        {language === 'bn' 
                          ? 'এই বুকিং পদ্ধতিতে কোনো অগ্রিম পেমেন্ট করার প্রয়োজন নেই। ডেলিভারিম্যান আপনার গন্তব্যে পৌঁছালে পণ্য বুঝে পেয়ে মোট মূল্য টাকা পরিশোধ করুন।' 
                          : 'Zero upfront financial transactions required. Pay our Courier handler upon safely receiving and inspecting products at your doorstep.'}
                      </p>
                    </div>
                  </div>
                )}

              </div>

              {/* Desktop checkout place triggers button */}
              <div className="hidden lg:block">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#3E2511] hover:bg-[#2C180A] text-white font-extrabold text-xs py-4 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (language === 'bn' ? 'প্রসেস হচ্ছে...' : 'Registering bookings...') : `${getTranslation(language, 'placeOrder')} (৳${(total || 0).toLocaleString()})`}
                </button>
              </div>

            </form>
          </div>

          {/* Right layout sticky summary card */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 select-none">
            
            <div className="bg-white p-6 rounded-3xl border border-amber-900/5 shadow-xs text-stone-900 text-left">
              <h3 className="text-base font-black text-stone-900 tracking-tight pb-3 border-b border-stone-50 mb-6 uppercase">
                {getTranslation(language, 'orderSummary')}
              </h3>
              
              {/* Product list */}
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-1">
                {cart.map((item) => {
                  const title = language === 'bn' ? (item.product.nameBn || item.product.name) : (item.product.nameEn || item.product.name);
                  const activePrice = item.product.specialPrice && item.product.specialPrice < item.product.price ? item.product.specialPrice : item.product.price;
                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden bg-stone-50 border border-stone-100">
                        <img 
                          src={item.product.imageUrl || 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=100'} 
                          alt={title} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=100';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center text-xs">
                        <p className="font-bold text-stone-900 truncate">{title}</p>
                        
                        {/* Variant traits labels if selected */}
                        {item.selectedVariants && Object.keys(item.selectedVariants).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-0.5">
                            {Object.entries(item.selectedVariants).map(([k, v]) => (
                              <span key={k} className="text-[9px] bg-stone-100 px-1 py-0.2 rounded border border-stone-200 font-semibold max-w-[100px] truncate">
                                {k}: {v as string}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[10px] text-stone-400 font-bold">Qty: {item.quantity}</span>
                          <span className="font-extrabold text-stone-900">৳{((activePrice || 0) * (item.quantity || 0)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Section */}
              <div className="mb-6">
                {!appliedCoupon ? (
                  <div className="flex gap-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Tag size={16} className="text-stone-400" />
                    </div>
                    <input
                      type="text"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2.5 outline-none focus:border-[#3E2511] text-stone-900 font-mono font-bold text-xs uppercase"
                      placeholder={language === 'bn' ? 'কুপন কোড দিন' : 'ENter coupon code'}
                      value={couponCodeInput}
                      onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    />
                    <button
                      type="button"
                      disabled={applyingCoupon || !couponCodeInput.trim()}
                      onClick={handleApplyCoupon}
                      className="bg-[#3E2511] hover:bg-[#2C180A] disabled:bg-stone-300 text-white font-black text-[10px] px-4 rounded-xl uppercase tracking-wider transition-colors shrink-0 flex items-center justify-center gap-1.5"
                    >
                      {applyingCoupon && <RefreshCw size={12} className="animate-spin" />}
                      {language === 'bn' ? 'প্রয়োগ' : 'Apply'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-700">
                      <Check size={16} />
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider">{appliedCoupon.code}</p>
                        <p className="text-[10px] font-bold opacity-80">{language === 'bn' ? 'কুপন প্রয়োগ করা হয়েছে' : 'Coupon applied successfully'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-stone-400 hover:text-red-500 transition-colors"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                )}
              </div>

              {/* Subtotal metrics list */}
              <div className="border-t border-stone-100 pt-4 space-y-3 mb-6 text-xs text-stone-600 font-medium">
                <div className="flex justify-between">
                  <span>{getTranslation(language, 'subtotal')}</span>
                  <span className="font-extrabold text-stone-950">৳{(subtotal || 0).toLocaleString()}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>{language === 'bn' ? 'কুপন ডিসকাউন্ট' : 'Coupon Discount'}</span>
                    <span>-৳{(discount || 0).toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{getTranslation(language, 'shippingCharge')}</span>
                  <span className="font-extrabold text-stone-950">৳{(shippingCharge || 0).toLocaleString()}</span>
                </div>
                
                <div className="border-t border-stone-100 pt-3 flex justify-between items-center text-stone-900">
                  <span className="font-black text-sm uppercase">{getTranslation(language, 'total')}</span>
                  <span className="text-xl font-black text-[#5C3E21]">৳{(total || 0).toLocaleString()}</span>
                </div>
              </div>
              
              {/* Special Delivery & Confirmation Notice requested by user */}
              <div className="bg-amber-50/70 border border-amber-900/15 rounded-2xl p-4 mb-5 text-xs text-[#5C3E21] flex items-start gap-2.5">
                <Truck className="shrink-0 mt-0.5 text-amber-700" size={16} />
                <div className="leading-relaxed font-bold">
                  {language === 'bn' ? (
                    <span>তিন থেকে পাঁচ দিনের মধ্যে ডেলিভারি হবে এবং কল দিয়ে অর্ডার কনফার্ম করা হবে।</span>
                  ) : (
                    <span>Delivery will be completed in 3-5 days, and we will call you to confirm your order.</span>
                  )}
                </div>
              </div>
              
              {/* Mobile CTA drawer triggers */}
              <div className="lg:hidden">
                 <button 
                    onClick={handleCheckoutSubmit}
                    disabled={loading}
                    className="w-full bg-[#3E2511] hover:bg-[#2C180A] text-white font-extrabold text-xs py-4 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 uppercase tracking-wide disabled:opacity-50 cursor-pointer"
                 >
                    {loading ? (language === 'bn' ? 'প্রসেস হচ্ছে...' : 'Processing...') : `${getTranslation(language, 'placeOrder')} (৳${(total || 0).toLocaleString()})`}
                 </button>
              </div>

              <div className="flex items-center justify-center gap-1 mt-4 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                <Shield size={12} className="text-[#8B6E53]" /> 256-BIT SSL {language === 'bn' ? 'সুরক্ষিত চেকআউট' : 'Enforced checkout Encryption'}
              </div>
            </div>

          </div>

        </div>
      </main>
      
      <Footer />
    </div>
  );
}
