import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';
import './OtpPage.css';

function OtpPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleOtpSubmit = async () => {
    if (otp === '123456') {
      setOtpVerified(true);

      try {
        const response = await axios.get(`http://13.48.244.216:5000/api/users/role/${user.uid}`);
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
      alert('Invalid OTP');
    }
  };

  if (loading) return <div>Loading...</div>;

  if (!otpVerified) {
    return (
      <div>
        <h2>Enter OTP</h2>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
        />
        <button onClick={handleOtpSubmit}>Submit</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Verifying role...</h2>
    </div>
  );
}

export default OtpPage;
