import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import OtpPage from './OtpPage';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import MemberOnboarding from './MemberOnboarding';

function App() {
  const [role, setRole] = useState(null);  // Role will be set after OTP verification
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Track login status

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Pass setter functions to OtpPage to update role & authentication */}
        <Route path="/otp" element={<OtpPage setRole={setRole} setIsAuthenticated={setIsAuthenticated} />} />

        {isAuthenticated ? (
          <Route path="/*" element={<Layout role={role} />}>
            {role === 'admin' && <Route path="admin" element={<AdminDashboard />} />}
            {role === 'member' && <Route path="member" element={<MemberDashboard />} />}
            <Route path="onboard-desk" element={<MemberOnboarding />} />         
          </Route>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;