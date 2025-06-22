import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase';
import { Link } from 'react-router-dom';


function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (error) {
      console.error('Reset Password Error:', error);
      setMessage('Failed to send reset email: ' + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="title">Forgot Password</h1>
        <form onSubmit={handleReset} className="form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="name@nmsolutions.co.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit">Send Reset Email</button>
        </form>
        {message && <p className="message-text">{message}</p>}
        <div className="forgot-password">
          <Link to="/">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
