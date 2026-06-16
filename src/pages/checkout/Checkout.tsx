import { Helmet } from 'react-helmet-async';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Shield, CreditCard, ShoppingBag, Check, Mail, Phone, MapPin, Truck } from 'lucide-react';
import { getTranslation } from '../../utils/translate';

export default function Checkout() {
  const { cart, user, clearCart, language } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');
  
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

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Flat shipping charge inside Bangladesh (100 Taka fallback)
  const shippingCharge = subtotal > 0 ? 100 : 0;
  const total = subtotal + shippingCharge;

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
                <h2 className="text-lg font-black text-stone-900 mb-6 flex items-center gap-2.5 pb-2 border-b border-stone-50">
                  <span className="w-7 h-7 rounded-full bg-[#FAF6F1] text-[#3E2511] border border-amber-900/10 flex items-center justify-center text-xs font-black font-mono">2</span>
                  {getTranslation(language, 'paymentMethod')}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  
                  <label className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${formData.paymentMethod === 'bkash' ? 'border-[#E2136E] bg-[#E2136E]/5 text-[#E2136E]' : 'border-stone-100 hover:border-stone-200 text-stone-600'}`}>
                    <input type="radio" name="paymentMethod" value="bkash" checked={formData.paymentMethod === 'bkash'} onChange={handleInputChange} className="hidden" />
                    <span className="font-extrabold text-sm tracking-wide">bKash (বিকাশ)</span>
                  </label>

                  <label className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${formData.paymentMethod === 'nagad' ? 'border-[#ED1C24] bg-[#ED1C24]/5 text-[#ED1C24]' : 'border-stone-100 hover:border-stone-200 text-stone-600'}`}>
                    <input type="radio" name="paymentMethod" value="nagad" checked={formData.paymentMethod === 'nagad'} onChange={handleInputChange} className="hidden" />
                    <span className="font-extrabold text-sm tracking-wide">Nagad (নগদ)</span>
                  </label>

                  <label className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${formData.paymentMethod === 'rocket' ? 'border-[#8C3494] bg-[#8C3494]/5 text-[#8C3494]' : 'border-stone-100 hover:border-stone-200 text-stone-600'}`}>
                    <input type="radio" name="paymentMethod" value="rocket" checked={formData.paymentMethod === 'rocket'} onChange={handleInputChange} className="hidden" />
                    <span className="font-extrabold text-sm tracking-wide">Rocket (রকেট)</span>
                  </label>

                  <label className={`border-2 rounded-xl p-3 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${formData.paymentMethod === 'cod' ? 'border-[#3E2511] bg-[#3E2511]/5 text-[#3E2511]' : 'border-stone-100 hover:border-stone-200 text-stone-600'}`}>
                    <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleInputChange} className="hidden" />
                    <span className="font-extrabold text-sm tracking-wide">{language === 'bn' ? 'ক্যাশ অন ডেলিভারি' : 'Cash On Delivery'}</span>
                  </label>

                </div>

                {/* Conditional Payment instruction details rendering */}
                {formData.paymentMethod !== 'cod' ? (
                  <div className="bg-[#FAF8F5] border border-amber-900/10 rounded-2xl p-5 mb-6 text-xs text-stone-700 space-y-2.5">
                    
                    <p className="font-black text-stone-900 border-b border-stone-200 pb-1.5 flex items-center gap-1.5 uppercase tracking-wide text-xs">
                      <CreditCard size={14} className="text-[#3E2511]" />
                      {getTranslation(language, 'mobileInstructions')}
                    </p>

                    <p className="font-medium text-stone-600 dark:text-stone-300">
                      {formData.paymentMethod === 'bkash' && getTranslation(language, 'instructionBkash')}
                      {formData.paymentMethod === 'nagad' && getTranslation(language, 'instructionNagad')}
                      {formData.paymentMethod === 'rocket' && getTranslation(language, 'instructionRocket')}
                    </p>

                    <div className="bg-[#3E2511]/5 rounded-xl p-3 mt-3">
                      <p className="font-semibold text-[11px] text-[#5C3E21]">{language === 'bn' ? 'আমাদের ব্যক্তিগত মোবাইল ব্যাকিং নম্বর:' : 'Official Personal Receiver Mobile details:'}</p>
                      <p className="text-base font-mono font-black text-[#3E2511] tracking-wider mt-0.5">
                        {formData.paymentMethod === 'rocket' ? '০১৭০০-০০০০০-০' : '০১৭০০-০০০০০০'}
                      </p>
                    </div>

                    {/* Inputs panel for Sender number & TrxId */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-stone-200">
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

              {/* Subtotal metrics list */}
              <div className="border-t border-stone-100 pt-4 space-y-3 mb-6 text-xs text-stone-600 font-medium">
                <div className="flex justify-between">
                  <span>{getTranslation(language, 'subtotal')}</span>
                  <span className="font-extrabold text-stone-950">৳{(subtotal || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>{getTranslation(language, 'shippingCharge')}</span>
                  <span className="font-extrabold text-stone-950">৳{(shippingCharge || 0).toLocaleString()}</span>
                </div>
                
                <div className="border-t border-stone-100 pt-3 flex justify-between items-center text-stone-900">
                  <span className="font-black text-sm uppercase">{getTranslation(language, 'total')}</span>
                  <span className="text-xl font-black text-[#5C3E21]">৳{(total || 0).toLocaleString()}</span>
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
