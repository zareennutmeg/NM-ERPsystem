// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Firebase user:', firebaseUser);
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
      } else {
        setUser(null);
        setRole(null);
        setOtpVerified(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && otpVerified) {
      axios.get(`http://13.48.244.216:5000/api/users/role/${user.uid}`)
        .then((res) => {
          console.log("Fetched role:", res.data.role);
          setRole(res.data.role);
        })
        .catch((err) => {
          console.error('Error fetching role:', err);
          setRole(null);
        });
    }
  }, [user, otpVerified]);

  const logout = () => {
    signOut(auth);
    setUser(null);
    setRole(null);
    setOtpVerified(false);
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole, otpVerified, setOtpVerified, logout, loading }}>
      {loading ? <div>Loading Firebase...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
