import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { doc, getDoc, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { useStore } from '../../store';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import toast from 'react-hot-toast';
import { Star, ShoppingCart, ArrowLeft, UserRound } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, addToCart } = useStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  
  // New review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchReviews();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const docRef = doc(db, 'products', id!);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProduct({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('productId', '==', id)
      );
      const snapshot = await getDocs(q);
      const reviewList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort client-side to avoid needing a composite index
      reviewList.sort((a: any, b: any) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });
      setReviews(reviewList);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please log in to submit a review');
      return;
    }
    if (!comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    setSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: id,
        userId: user.uid,
        userEmail: user.email,
        rating,
        comment,
        createdAt: serverTimestamp()
      });
      toast.success('Review submitted successfully!');
      setComment('');
      setRating(5);
      fetchReviews(); // refresh
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      toast.success(`${product.name} added to cart!`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto w-full animate-pulse">
          <div className="w-40 h-6 bg-gray-200 rounded mb-8"></div>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              <div className="bg-gray-200 aspect-square md:aspect-auto"></div>
              <div className="p-8 md:p-12 flex flex-col justify-center gap-6">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-12 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-10 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-32 bg-gray-200 rounded w-full"></div>
                <div className="h-16 bg-gray-200 rounded w-full md:w-48 mt-4"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Link to="/" className="text-[#593A1B] font-bold hover:underline">Return to Home</Link>
        </div>
      </div>
    );
  }

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 py-8 px-4 md:px-8 max-w-7xl mx-auto w-full">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-[#593A1B] font-medium mb-8">
          <ArrowLeft size={20} /> Back to browsing
        </Link>
        
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            {/* Image */}
            <div className="bg-gray-100 aspect-square md:aspect-auto flex items-center justify-center relative">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-400">No Image Available</span>
              )}
            </div>
            
            {/* Details */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              {product.category && (
                <span className="text-sm font-bold tracking-widest text-[#593A1B] uppercase mb-4 opacity-80">
                  {product.category}
                </span>
              )}
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                 <div className="flex gap-1 text-yellow-400">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <Star key={star} size={20} fill={star <= averageRating ? "currentColor" : "none"} className={star <= averageRating ? "text-yellow-400" : "text-gray-300"} />
                   ))}
                 </div>
                 <span className="text-gray-500 font-medium text-sm">
                   {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                 </span>
              </div>
              
              <div className="text-4xl font-extrabold text-[#3B220B] mb-8">
                ৳{product.price.toFixed(2)}
              </div>
              
              <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                {product.description}
              </p>
              
              <button 
                onClick={handleAddToCart}
                className="bg-[#593A1B] hover:bg-[#3B220B] text-white font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 w-full md:w-auto text-lg"
              >
                <ShoppingCart size={24} />
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
           <div className="flex flex-col md:flex-row gap-12">
             
             {/* Left Column: Review Form */}
             <div className="md:w-1/3 border-b-2 md:border-b-0 md:border-r-2 border-gray-100 pb-8 md:pb-0 md:pr-12">
               <h3 className="text-2xl font-bold text-gray-900 mb-6">Write a Review</h3>
               
               {user ? (
                 <form onSubmit={submitReview} className="flex flex-col gap-5">
                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                     <div className="flex gap-2">
                       {[1, 2, 3, 4, 5].map(num => (
                         <button 
                           key={num} 
                           type="button" 
                           onClick={() => setRating(num)}
                           className="text-2xl focus:outline-none transform hover:scale-110 transition-transform"
                         >
                           <Star size={32} fill={rating >= num ? "currentColor" : "none"} className={rating >= num ? "text-yellow-400" : "text-gray-300"} />
                         </button>
                       ))}
                     </div>
                   </div>
                   
                   <div>
                     <label className="block text-sm font-bold text-gray-700 mb-2">Your Comment</label>
                     <textarea 
                       required
                       value={comment}
                       onChange={e => setComment(e.target.value)}
                       placeholder="What did you like or dislike?"
                       rows={4}
                       className="w-full border border-gray-300 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-[#593A1B] focus:border-transparent resize-none bg-gray-50 hover:bg-white transition-colors"
                     />
                   </div>
                   
                   <button 
                     type="submit" 
                     disabled={submittingReview}
                     className="bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl transition-colors disabled:opacity-50"
                   >
                     {submittingReview ? 'Submitting...' : 'Post Review'}
                   </button>
                 </form>
               ) : (
                 <div className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100">
                   <UserRound className="mx-auto text-gray-400 mb-3" size={32} />
                   <p className="text-gray-600 mb-4 font-medium">Please log in to share your thoughts.</p>
                   <Link to={`/auth?redirect=/product/${id}`} className="inline-block bg-[#593A1B] hover:bg-[#3B220B] text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
                     Log In to Review
                   </Link>
                 </div>
               )}
             </div>

             {/* Right Column: Review List */}
             <div className="md:w-2/3">
               <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                 Customer Reviews
                 <span className="bg-gray-100 text-gray-600 text-sm py-1 px-3 rounded-full font-bold">
                    {reviews.length}
                 </span>
               </h3>
               
               {reviewsLoading ? (
                 <div className="flex justify-center p-12">
                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#593A1B]"></div>
                 </div>
               ) : reviews.length === 0 ? (
                 <div className="text-center bg-gray-50 py-16 rounded-2xl border border-gray-100 border-dashed">
                   <p className="text-gray-500 font-medium text-lg">No reviews yet. Be the first to share your experience!</p>
                 </div>
               ) : (
                 <div className="space-y-6">
                   {reviews.map(review => (
                     <div key={review.id} className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                       <div className="flex items-start justify-between mb-3">
                         <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-gradient-to-br from-[#593A1B] to-[#3B220B] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                             {review.userEmail?.charAt(0).toUpperCase() || 'U'}
                           </div>
                           <div>
                             <p className="font-bold text-gray-900">{review.userEmail?.split('@')[0] || 'Anonymous User'}</p>
                             <div className="flex gap-0.5 text-yellow-400 mt-0.5">
                               {[1, 2, 3, 4, 5].map((star) => (
                                 <Star key={star} size={14} fill={star <= review.rating ? "currentColor" : "none"} className={star <= review.rating ? "text-yellow-400" : "text-gray-300"} />
                               ))}
                             </div>
                           </div>
                         </div>
                         <span className="text-xs text-gray-400 font-medium">
                           {review.createdAt?.toDate ? new Date(review.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                         </span>
                       </div>
                       <p className="text-gray-600 leading-relaxed ml-13">{review.comment}</p>
                     </div>
                   ))}
                 </div>
               )}
             </div>
             
           </div>
        </section>
        
      </main>
      
      <Footer />
    </div>
  );
}
