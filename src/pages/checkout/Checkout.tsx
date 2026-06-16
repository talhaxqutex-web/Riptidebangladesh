import { Helmet } from 'react-helmet-async';
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useStore } from '../../store';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { auth, db } from '../../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { Shield, CreditCard, ShoppingBag, Check, Upload, Image as ImageIcon } from 'lucide-react';

export default function Checkout() {
  const { cart, user, clearCart } = useStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentProof, setPaymentProof] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'BD', // default to Bangladesh
    paymentMethod: 'bkash', // default to bkash
    transactionId: ''
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 || subtotal === 0 ? 0 : 10;
  const total = subtotal + shipping;

  // Redirect to cart if empty and not in success state
  if (cart.length === 0 && !success) {
    navigate('/cart');
    return null;
  }

  // Not logged in -> ask to login
  if (!user && !success) {
    return (
      <div className="min-h-screen bg-light flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
           <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
              <ShoppingBag size={48} className="mx-auto text-gray-400 mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Almost there!</h2>
              <p className="text-gray-600 mb-8">Please log in or create an account to complete your checkout.</p>
              <Link to="/auth?redirect=/checkout" className="block w-full bg-[#593A1B] hover:bg-[#422A14] text-white font-bold py-3 px-4 rounded-xl transition-all shadow-md">
                 Log In to Continue
              </Link>
           </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit check
        toast.error('Image size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentProof && !formData.transactionId) {
       toast.error('Please provide a Transaction ID or upload a screenshot of your payment.');
       return;
    }

    setLoading(true);

    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const orderData = {
        userId: user!.uid,
        userEmail: user!.email,
        items: cart,
        shippingDetails: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        paymentDetails: {
           method: formData.paymentMethod,
           transactionId: formData.transactionId,
           paymentProof: paymentProof
        },
        subtotal,
        shipping,
        total,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      try {
        await fetch('/api/send-order-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            orderId: docRef.id,
            totalAmount: total.toFixed(2),
          }),
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email', emailError);
      }
      
      clearCart();
      setSuccess(true);
      toast.success('Order placed successfully!');
      window.scrollTo(0, 0);

    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error('Failed to process order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-light flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
           <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 max-w-lg w-full text-center">
              <div className="w-20 h-20 bg-green-100 text-[#593A1B] rounded-full flex items-center justify-center mx-auto mb-6">
                 <Check size={40} strokeWidth={3} />
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Payment Successful!</h1>
              <p className="text-gray-600 mb-8 text-lg">Thank you for your order. We've sent a confirmation email to {formData.email}.</p>
              
              <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Order Status</p>
                <p className="font-bold text-gray-900">Pending (Awaiting Admin Approval)</p>
              </div>

              <div className="flex gap-4">
                <Link to="/orders" className="flex-1 bg-[#593A1B] hover:bg-[#422A14] text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-md text-center">
                  View Orders
                </Link>
                <Link to="/" className="flex-1 bg-white hover:bg-gray-50 text-gray-900 font-bold py-3.5 px-4 rounded-xl border border-gray-200 transition-all text-center">
                  Continue Shopping
                </Link>
              </div>
           </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light flex flex-col">
      <Helmet>
        <title>Secure Checkout - Riptide</title>
      </Helmet>
      
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">Secure Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <form onSubmit={handleCheckout} className="space-y-8">
              
              {/* Shipping Information */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm">1</span>
                  Shipping Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#593A1B] focus:ring-1 focus:ring-[#593A1B]" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#593A1B] focus:ring-1 focus:ring-[#593A1B]" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input required type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#593A1B] focus:ring-1 focus:ring-[#593A1B]" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#593A1B] focus:ring-1 focus:ring-[#593A1B]" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input required type="text" name="postalCode" value={formData.postalCode} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#593A1B] focus:ring-1 focus:ring-[#593A1B]" />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select name="country" value={formData.country} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#593A1B] focus:ring-1 focus:ring-[#593A1B] bg-white">
                      <option value="BD">Bangladesh</option>
                      <option value="US">United States</option>
                      <option value="GB">United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-sm">2</span>
                  Payment Method
                </h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <label className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${formData.paymentMethod === 'bkash' ? 'border-[#E2136E] bg-[#E2136E]/5 text-[#E2136E] ring-1 ring-[#E2136E]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="paymentMethod" value="bkash" checked={formData.paymentMethod === 'bkash'} onChange={handleInputChange} className="hidden" />
                    <span className="font-bold">bKash</span>
                  </label>
                  <label className={`border rounded-xl p-4 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all ${formData.paymentMethod === 'nagad' ? 'border-[#ED1C24] bg-[#ED1C24]/5 text-[#ED1C24] ring-1 ring-[#ED1C24]' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="paymentMethod" value="nagad" checked={formData.paymentMethod === 'nagad'} onChange={handleInputChange} className="hidden" />
                    <span className="font-bold">Nagad</span>
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-xl p-4 mb-6 text-sm">
                  <p className="font-bold mb-2 text-base">Payment Instruction:</p>
                  <p className="mb-2">1. Go to your {formData.paymentMethod === 'bkash' ? 'bKash' : 'Nagad'} App or Dial USSD code.</p>
                  <p className="mb-2">2. Choose <strong>Send Money</strong> option.</p>
                  <p className="mb-2">3. Enter our Personal Number: <span className="font-bold tracking-wider text-base bg-white px-2 py-1 rounded inline-block ml-1">01721929231</span></p>
                  <p className="mb-2">4. Enter the exact amount: <strong>৳{total.toFixed(2)}</strong></p>
                  <p className="mb-3">5. After completing the send money process, copy the <strong>Transaction ID (TrxID)</strong> or take a <strong>Screenshot</strong>.</p>
                  <p className="mt-2 text-xs opacity-80">Enter your transaction ID or upload a screenshot of your payment below to submit your order request.</p>
                </div>

                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID (Optional if screenshot provided)</label>
                    <input type="text" name="transactionId" value={formData.transactionId} onChange={handleInputChange} placeholder="e.g. 8A3F9X2" className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-[#593A1B] focus:ring-1 focus:ring-[#593A1B]" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Screenshot (Max 1MB)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-[#593A1B] transition-colors relative overflow-hidden group bg-gray-50">
                      {paymentProof ? (
                        <div className="absolute inset-0 w-full h-full">
                          <img src={paymentProof} alt="Payment Proof" className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center backdrop-blur-sm transition-all">
                             <p className="text-white font-bold flex items-center gap-2"><Upload size={20} /> Click to change</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600 justify-center">
                            <span className="relative cursor-pointer bg-transparent rounded-md font-medium text-[#593A1B] hover:text-[#422A14] focus-within:outline-none">
                              <span>Upload a file</span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF up to 1MB</p>
                        </div>
                      )}
                      <input id="paymentProof" name="paymentProof" type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#593A1B] hover:bg-[#422A14] text-white font-bold py-4 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 group disabled:opacity-70"
                >
                  {loading ? 'Processing...' : `Place Request ৳${total.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h3>
              
              <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ShoppingBag className="w-full h-full p-4 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-[#593A1B]">৳{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900">৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="font-bold text-gray-900">{shipping === 0 ? 'Free' : `৳${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-extrabold text-[#593A1B]">৳{total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="lg:hidden">
                 <button 
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-[#593A1B] hover:bg-[#422A14] text-white font-bold py-4 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                 >
                    {loading ? 'Processing...' : `Place Request ৳${total.toFixed(2)}`}
                 </button>
              </div>

              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1 mt-4">
                <Shield size={14} className="text-[#593A1B]" /> Safe and secure checkout
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
