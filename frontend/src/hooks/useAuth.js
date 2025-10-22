import { useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../firebase/config';
import useStore from '../store/useStore'; // Import your store

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get store actions
  const { setIsLoggedIn, setUserName, setAuthView } = useStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      
      // Sync with Zustand store
      if (user) {
        setIsLoggedIn(true);
        setUserName(user.email?.split('@')[0] || 'User');
      } else {
        setIsLoggedIn(false);
        setAuthView('login');
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, [setIsLoggedIn, setUserName, setAuthView]);

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  return { user, loading, signup, login, logout };
};