import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';
import './OtpPage.css';

function OtpPage() {
  const [loading, setLoading] = useState(true);
  const [firebaseUid, setFirebaseUid] = useState(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUid(user.uid);
        setEmail(user.email);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);
  const sendOtp = async () => {
    try {
      await axios.post('http://13.48.244.216:5000/api/email/send-otp', { email });
      alert('OTP sent to your email');
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      alert('Failed to send OTP');
    }
  };

const handleOtpSubmit = async () => {
    try {
      const verifyResponse = await axios.post('http://13.48.244.216:5000/api/email/verify-otp', { email, otp });

      if (verifyResponse.data.verified) {
        // OTP verified, now get role
        const roleResponse = await axios.get(`http://13.48.244.216:5000/api/users/role/${firebaseUid}`);
        const role = roleResponse.data.role;

        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'member') {
          navigate('/member');
        } else {
          alert('Unknown role');
        }
      } else {
        alert('Invalid OTP');
      }
    } catch (err) {
      console.error(err);
      alert('Error verifying OTP');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="otp-container">
      <div className="otp-card">
        <h2>OTP Verification</h2>
        <p>Email: {email}</p>

        {!otpSent ? (
          <button className="otp-button" onClick={sendOtp}>Send OTP</button>
        ) : (
          <div className="otp-input-section">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="otp-input"
            />
            <button className="otp-button" onClick={handleOtpSubmit}>Verify OTP</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default OtpPage;