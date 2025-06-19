import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function OtpPage({ setRole, setIsAuthenticated }) { 
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
      toast.success('OTP sent to your email');
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send OTP');
    }
  };

  const handleOtpSubmit = async () => {
    try {
      const verifyResponse = await axios.post('http://13.48.244.216:5000/api/email/verify-otp', { email, otp });

      if (verifyResponse.data.verified) {
        const roleResponse = await axios.get(`http://13.48.244.216:5000/api/users/role/${firebaseUid}`);
        const role = roleResponse.data.role;

        toast.success('OTP verified successfully');
        setRole(role);
        setIsAuthenticated(true);

        setTimeout(() => {
          if (role === 'admin') {
            navigate('/admin');
          } else if (role === 'member') {
            navigate('/member');
          } else {
            toast.error('Unknown role');
          }
        }, 1000); // small delay after success
      } else {
        toast.error('Invalid OTP');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error verifying OTP');
    }
  };

  if (loading) return <div>Loading...</div>;

   return (
    <div className="d-flex align-items-center justify-content-center vh-100" 
         style={{ background: 'linear-gradient(to bottom right, #f5faff, #e0ecff)' }}>
      <ToastContainer />
      <div className="card shadow-lg p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: '15px' }}>
        <div className="text-center mb-3">
          <h3 className="fw-bold mb-0">NutMeg TPPL</h3>
          <small className="text-muted">Enterprise Management System</small>
        </div>

        <h5 className="mb-3 fw-semibold">Verify OTP</h5>
        <p className="text-muted small mb-3">Enter the one-time password sent to your email</p>

        {!otpSent ? (
          <div className="d-grid mb-3">
            <button className="btn btn-primary" onClick={sendOtp}>Send OTP</button>
          </div>
        ) : (
          <div>
            <div className="mb-3">
              <label className="form-label">One-Time Password</label>
              <input 
                type="text" 
                className="form-control" 
                value={otp}
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="Enter OTP"
              />
            </div>

            <div className="d-grid mb-3">
              <button className="btn btn-primary" onClick={handleOtpSubmit}>Verify OTP</button>
            </div>
          </div>
        )}

        <div className="text-center mb-0">
          <button className="btn btn-link" onClick={() => navigate('/login')}>Back to login</button>
        </div>

        <p className="text-center text-muted small mt-3 mb-0">
          Protected by Multi-Factor Authentication
        </p>
      </div>
    </div>
  );
}

export default OtpPage;