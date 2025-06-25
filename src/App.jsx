import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import OtpPage from './pages/OtpPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import MemberOnboarding from './pages/MemberOnboarding';
//import Payslips from './pages/Payslips';
//import LeaveModule from './pages/LeaveModule';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/otp" element={<OtpPage />} />

        {/* Protected Routes wrapped in Layout with Sidebar */}
        <Route path="/*" element={<Layout />}>
          <Route index element={<Dashboard />} /> {/* Automatically redirects based on role */}
          <Route path="admin" element={<AdminDashboard />} />
          <Route path="admin/onboard-desk" element={<MemberOnboarding />} />
          <Route path="member" element={<MemberDashboard />} />
          <Route path="member/onboard-desk" element={<MemberOnboarding />} />
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
