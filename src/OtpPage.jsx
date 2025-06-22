import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';

function OtpPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user, role, otpVerified, setOtpVerified, setRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setEmail(firebaseUser.email);
      } else {
        navigate('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  // After both OTP verified and role fetched, navigate to dashboard
 useEffect(() => {
    if (otpVerified && role) {
      if (role === 'admin') {
        navigate('/admin-dashboard');
      } else if (role === 'member') {
        navigate('/member-dashboard');
      } else {
        navigate('/');
      }
    }
  }, [otpVerified, role, navigate]);
  
  const sendOtp = async () => {
    try {
      await axios.post('http://13.48.244.216:5000/api/email/send-otp', { email });
      toast.success('OTP sent to your email', { position: 'bottom-right', autoClose: 3000 });
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send OTP', { position: 'bottom-right', autoClose: 3000 });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await axios.post('http://13.48.244.216:5000/api/email/verify-otp', { email, otp });
      if (res.data.verified) {
        toast.success('OTP verified successfully', { position: 'bottom-right', autoClose: 2000 });
        setOtpVerified(true);
      } else {
        toast.error('Invalid OTP', { position: 'bottom-right', autoClose: 3000 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error verifying OTP', { position: 'bottom-right', autoClose: 3000 });
    }
    setIsVerifying(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
      <ToastContainer transition={Slide} />
      
      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="display-4 fw-bold text-primary">NutMeg ERP System</h1>
       
      </div>

      {/* Card */}
      <div className="card shadow-lg" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body">
          <h2 className="h4 mb-3 text-start">{otpSent ? 'Verify OTP' : 'Send OTP'}</h2>
          <p className="text-secondary mb-4 text-start">
            {otpSent
              ? 'Enter the OTP sent to your email'
              : 'Click below to send an OTP to your registered email'}
          </p>

          {!otpSent ? (
            <div className="mb-4">
              <button className="btn btn-primary w-100" onClick={sendOtp}>
                Send OTP
              </button>
            </div>
          ) : (
            <form onSubmit={handleOtpSubmit}>
              <div className="mb-3">
                <label htmlFor="otp" className="form-label">OTP</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP"
                  required
                  className="form-control"
                />
              </div>

              <button type="submit" className="btn btn-primary w-100" disabled={isVerifying}>
                {isVerifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </form>
          )}

          <div className="mt-4 text-center">
            <button className="btn btn-link" onClick={() => navigate("/login")}>
              Back to login
            </button>
          </div>

          <div className="border-top pt-3 mt-3 text-center text-muted small">
            Protected by Multi-Factor Authentication
          </div>
        </div>
      </div>
    </div>
  );
}

export default OtpPage;