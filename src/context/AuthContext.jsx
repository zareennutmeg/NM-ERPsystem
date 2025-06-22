import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // Persist OTP verification in localStorage
  const [otpVerified, setOtpVerifiedState] = useState(() => {
    return JSON.parse(localStorage.getItem('otpVerified')) || false;
  });

  const setOtpVerified = (val) => {
    setOtpVerifiedState(val);
    localStorage.setItem('otpVerified', JSON.stringify(val));
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log('Firebase user:', firebaseUser);
      if (firebaseUser) {
        setUser({ uid: firebaseUser.uid, email: firebaseUser.email });

        // Fetch role immediately when Firebase user exists
        axios.get(`http://13.48.244.216:5000/api/users/role/${firebaseUser.uid}`)
          .then((res) => {
            setRole(res.data.role);
            console.log('Fetched role:', res.data.role);
          })
          .catch((err) => {
            console.error('Error fetching role:', err);
            setRole(null);
          });

      } else {
        setUser(null);
        setRole(null);
        setOtpVerified(false);
        localStorage.removeItem('otpVerified');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value = {
    user,
    role,
    otpVerified,
    setOtpVerified,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
}
