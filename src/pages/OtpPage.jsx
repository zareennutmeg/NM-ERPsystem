import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';

function OtpPage() {
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user, role, otpVerified, setOtpVerified } = useAuth();
  const navigate = useNavigate();

 

  useEffect(() => {
  if (otpVerified && role) {
    navigate('/');
  }
}, [otpVerified, role, navigate]);

  const sendOtp = async () => {
    try {
      await axios.post('http://13.48.244.216:5000/api/email/send-otp', { email: user.email });
      toast.success('OTP sent to your email', { position: 'top-right', autoClose: 3000 });
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send OTP', { position: 'top-right', autoClose: 3000 });
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await axios.post('http://13.48.244.216:5000/api/email/verify-otp', { email: user.email, otp });
      if (res.data.verified) {
        toast.success('OTP verified successfully', { position: 'top-right', autoClose: 2000 });
        setOtpVerified(true);
      } else {
        toast.error('Invalid OTP', { position: 'top-right', autoClose: 3000 });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error verifying OTP', { position: 'top-right', autoClose: 3000 });
    }
    setIsVerifying(false);
  };

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
     <ToastContainer position="top-right" transition={Slide} />


      <div className="text-center mb-4">
        <h1 className="h3 fw-normal text-primary">NutMeg ERP System</h1>
      </div>

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
