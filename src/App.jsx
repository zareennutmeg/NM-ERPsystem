import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import OtpPage from './pages/OtpPage';
import Dashboard from './pages/Dashboard'
import MemberOnboarding from './pages/MemberOnboarding';

function App() {
  const [role, setRole] = useState(null);  
  const [setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/otp" element={<OtpPage setRole={setRole} setIsAuthenticated={setIsAuthenticated} />} />

        {/* No PrivateRoute, just render Layout directly */}
        <Route path="/*" element={<Layout role={role} />} >
            <Route index element={<Dashboard role={role} />} />
          <Route path="onboard-desk" element={<MemberOnboarding />} />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
