import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
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
      toast.success('Login Successful!', {
        position: "top-right",
        autoClose: 2000,
        theme: "light",
      });
      setTimeout(() => {
        navigate('/otp');
      }, 2000);
    } catch (error) {
      console.error('Firebase Login Error:', error);
      toast.error('Login failed: ' + error.message, {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
      <ToastContainer transition={Slide} />

      {/* Title outside card */}
      <div className="text-center mb-4">
        <h1 className="fw-bold text-primary">NutMeg ERP System</h1>
        
      </div>

     {/* Login Card */}
<div className="card shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
  <div className="card-body">
    <h2 className="h4 mb-3">Sign In</h2>
    <p className="text-secondary mb-4">
      Please sign in with your NutMeg official email
    </p>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="name@nmsolutions.co.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-3 text-end">
              <Link to="/forgot-password" className="text-decoration-none text-primary">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
              {isLoading && (
                <AiOutlineLoading3Quarters className="me-2 spinner-border spinner-border-sm" />
              )}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 border-top pt-3 text-center text-muted small">
            Protected by Multi-Factor Authentication
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
