import React, { useState } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useStore } from '../../store';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/layout/Header';
import { LogOut, User as UserIcon, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const { user, isAdmin } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  // Email/Pass State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Helper to handle the redirect after login
  const handleRedirect = () => {
    const params = new URLSearchParams(location.search);
    const redirectUrl = params.get('redirect');
    navigate(redirectUrl || '/');
  };

  const handleUserSetup = async (userResult: any) => {
    const userRef = doc(db, 'users', userResult.uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      const isAdminUser = userResult.email === 'talhaxqutex@gmail.com';
      await setDoc(userRef, {
        email: userResult.email,
        isAdmin: isAdminUser,
        createdAt: serverTimestamp()
      });
    } else if (userResult.email === 'talhaxqutex@gmail.com' && !userSnap.data().isAdmin) {
      await setDoc(userRef, { isAdmin: true }, { merge: true });
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      let result;
      if (isLogin) {
        result = await signInWithEmailAndPassword(auth, email, password);
        toast.success('Successfully logged in!');
      } else {
        result = await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully!');
      }
      
      await handleUserSetup(result.user);
      handleRedirect();
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') errorMessage = 'This email is already registered. Please log in.';
      if (error.code === 'auth/invalid-credential') errorMessage = 'Invalid email or password.';
      if (error.code === 'auth/weak-password') errorMessage = 'Password should be at least 6 characters.';
      toast.error(errorMessage || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      await handleUserSetup(result.user);
      
      toast.success('Successfully logged in!');
      handleRedirect();
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="min-h-screen bg-light">
      <Header />
      
      <main className="max-w-md mx-auto p-4 mt-16">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
          {user ? (
            <div>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-[#593A1B]">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <UserIcon size={40} />
                )}
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome Back!</h2>
              <p className="text-gray-600 mb-2">{user.email}</p>
              {isAdmin && (
                <span className="inline-block bg-[#593A1B] text-white text-xs px-3 py-1 rounded-full font-bold mb-6">
                  Admin
                </span>
              )}
              
              <div className="mt-6 flex flex-col gap-3">
                {isAdmin && (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="w-full bg-[#3B220B] hover:bg-[#064e3b] text-white font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    Go to Admin Panel
                  </button>
                )}
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors"
                >
                  <LogOut size={20} />
                  Log Out
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500">
                <UserIcon size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-2">
                {isLogin ? 'Sign In to Riptide' : 'Create an Account'}
              </h2>
              <p className="text-gray-600 mb-8">Access your orders and fast checkout.</p>
              
              <form onSubmit={handleEmailAuth} className="flex flex-col gap-4 text-left mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Mail size={18} />
                    </div>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com" 
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#593A1B] focus:ring-1 focus:ring-[#593A1B]"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock size={18} />
                    </div>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      required
                      minLength={6}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#593A1B] focus:ring-1 focus:ring-[#593A1B]"
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#593A1B] hover:bg-[#3B220B] text-white font-bold py-3 px-4 rounded-xl transition-colors mt-2"
                >
                  {loading ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}
                </button>
              </form>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-sm text-gray-400 font-medium tracking-wide">OR</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
              
              <button 
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-3 mb-6"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
              
              <p className="text-gray-600 text-sm">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button 
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-bold text-[#593A1B] hover:underline focus:outline-none"
                >
                  {isLogin ? 'Sign Up' : 'Log In'}
                </button>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
