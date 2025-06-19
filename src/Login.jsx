import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from './firebase';
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/otp');
    } catch (error) {
      console.error('Firebase Login Error:', error);
      alert('Login failed: ' + error.message + '\nError Code: ' + error.code);
    }
    setIsLoading(false);
  };

return (
    <div className="d-flex align-items-center justify-content-center vh-100" 
         style={{ background: 'linear-gradient(to bottom right, #f5faff, #e0ecff)' }}>
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px' }}>
        <div className="text-center mb-3">
          <h3 className="fw-bold mb-0">NMERP SYSTEM</h3>
           </div>
        <h5 className="mb-3 fw-semibold">Sign In</h5>
        <p className="text-muted small mb-3">Please sign in with your NutMeg official email</p>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="name@nmsolutions.co.in" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="mb-2">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Enter Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <div className="text-end mb-3">
            <Link to="/forgot-password" className="text-decoration-none">Forgot password?</Link>
          </div>

          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <p className="text-center text-muted small mb-0">
          Protected by Multi-Factor Authentication
        </p>
      </div>
    </div>
  );
}

export default Login;