// context/AuthContext.jsx

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

  // Fetch role only after OTP verified
  useEffect(() => {
    if (user && otpVerified) {
      axios.get(`http://13.48.244.216:5000/api/users/role/${user.uid}`)
        .then((res) => setRole(res.data.role))
        .catch((err) => {
          console.error('Role fetch failed:', err);
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
   <AuthContext.Provider value={{ user, role, setRole, otpVerified, setOtpVerified, logout }}>
      {!loading ? children : <div>Loading...</div>}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
