import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { db } from '../../firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useStore } from '../../store';
import { Package, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function OrdersPage() {
  const { user } = useStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const orderList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(orderList);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-light flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Please log in to view your orders.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light flex flex-col">
      <Helmet>
        <title>My Orders - Riptide</title>
      </Helmet>
      
      <Header />
      
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-8">My Orders</h1>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#593A1B]"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <Package size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-8 max-w-sm">You haven't placed any orders yet.</p>
            <Link to="/" className="bg-[#593A1B] hover:bg-[#422A14] text-white font-bold py-3 px-8 rounded-full transition-all shadow-md">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50 p-4 md:p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex gap-8">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Order Placed</p>
                      <p className="text-sm font-medium text-gray-900">
                        {order.createdAt?.toDate().toLocaleDateString() || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Total</p>
                      <p className="text-sm font-medium text-gray-900">৳{(order.total || 0).toFixed(2)}</p>
                    </div>
                    <div className="hidden md:block">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Order #</p>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{order.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">Status:</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold capitalize ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {order.status === 'delivered' ? <CheckCircle size={14} /> : <Clock size={14} />}
                      {order.status || 'Processing'}
                    </span>
                  </div>
                </div>
                
                <div className="p-4 md:p-6">
                  <div className="space-y-4">
                    {order.items?.map((item: any, index: number) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 mt-2 rounded"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link to={`/product/${item.id}`} className="text-base font-bold text-gray-900 hover:text-[#593A1B] transition-colors line-clamp-1">
                            {item.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-bold text-gray-900">৳{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
