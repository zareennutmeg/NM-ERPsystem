import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import axios from 'axios';

function OtpPage() {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (otp !== '123456') {
      return alert('Invalid OTP');
    }

    const user = auth.currentUser;
    if (!user) return alert('User not logged in');

    try {
      const res = await axios.get(`http://13.48.244.216/api/users/role/${user.uid}`);
      const role = res.data.role;

      if (role === 'admin') navigate('/admin');
      else if (role === 'member') navigate('/member');
      else navigate('/');
    } catch (err) {
      alert('Error fetching role: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleOtpSubmit}>
      <h2>Enter OTP</h2>
      <input value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" />
      <button type="submit">Verify</button>
    </form>
  );
}

export default OtpPage;
