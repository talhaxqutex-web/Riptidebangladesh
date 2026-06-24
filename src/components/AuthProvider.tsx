import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useStore } from '../store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useStore(state => state.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          const isAdmin = userDoc.exists() ? userDoc.data().isAdmin : false;
          setUser(currentUser, isAdmin);
        } catch (error) {
          console.error("Error fetching user role", error);
          setUser(currentUser, false);
        }
      } else {
        setUser(null, false);
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  return <>{children}</>;
}
