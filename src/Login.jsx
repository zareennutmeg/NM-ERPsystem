import React, { useState } from 'react';

function Login({ onSuccess }) {
  const [otp, setOtp] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp === '123456') {
      onSuccess();
    } else {
      alert('Invalid OTP');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enter OTP</h2>
      <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
