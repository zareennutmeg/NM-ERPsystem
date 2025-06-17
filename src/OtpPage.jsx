import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';
import './OtpPage.css';

function OtpPage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const firebaseUid = user.uid;
        console.log('Firebase UID:', firebaseUid);

        try {
          const response = await axios.get(`http://13.48.244.216:5000/api/users/role/${firebaseUid}`);
          const role = response.data.role;

          console.log('User role:', role);

          if (role === 'admin') {
            navigate('/admin');
          } else if (role === 'member') {
            navigate('/member');
          } else {
            alert('Unknown role');
          }
        } catch (err) {
          console.error(err);
          alert('Error fetching user role');
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Verifying...</h2>
    </div>
  );
}

export default OtpPage;
