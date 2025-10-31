import { useState, useEffect } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';
import useStore from '../store/useStore'; // Remove the { } - it's default export

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get store actions
  const setIsLoggedIn = useStore((state) => state.setIsLoggedIn);
const setUserName = useStore((state) => state.setUserName);
const setAuthView = useStore((state) => state.setAuthView);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      if (user) {
        setIsLoggedIn(true);
        setUserName(user.email?.split('@')[0] || 'User');
        // set the userId in the global store for backend usage
        const setUserId = useStore.getState().setUserId;
        if (typeof setUserId === 'function') setUserId(user.uid || user.uid === 0 ? user.uid : user.uid);
      } else {
        setIsLoggedIn(false);
        setAuthView('login');
        const setUserId = useStore.getState().setUserId;
        if (typeof setUserId === 'function') setUserId(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [setIsLoggedIn, setUserName, setAuthView]);

  const signup = (email, password) => createUserWithEmailAndPassword(auth, email, password);
  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  return { user, uid: user?.uid || null, loading, signup, login, logout };
};