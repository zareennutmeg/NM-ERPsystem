import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';

function OtpPage() {
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const { user, role, otpVerified, setOtpVerified, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Once OTP verified and role fetched, navigate accordingly
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
    if (!user?.email) {
      toast.error('User email not found.');
      return;
    }
    try {
      await axios.post('http://13.48.244.216:5000/api/email/send-otp', { email: user.email });
      toast.success('OTP sent to your email', { position: 'bottom-right' });
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send OTP');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const res = await axios.post('http://13.48.244.216:5000/api/email/verify-otp', { email: user.email, otp });
      if (res.data.verified) {
        toast.success('OTP verified successfully');
        setOtpVerified(true);
      } else {
        toast.error('Invalid OTP');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error verifying OTP');
    }
    setIsVerifying(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container d-flex flex-column justify-content-center align-items-center min-vh-100">
      <ToastContainer transition={Slide} />
      <h1>NutMeg ERP System</h1>
      {!otpSent ? (
        <button className="btn btn-primary" onClick={sendOtp}>Send OTP</button>
      ) : (
        <form onSubmit={handleOtpSubmit}>
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Enter OTP" required />
          <button type="submit" disabled={isVerifying}>{isVerifying ? 'Verifying...' : 'Verify OTP'}</button>
        </form>
      )}
    </div>
  );
}

export default OtpPage;
