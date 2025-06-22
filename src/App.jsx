import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './Login';
import ForgotPassword from './ForgotPassword';
import OtpPage from './OtpPage';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';
import MemberOnboarding from './MemberOnboarding';
import PrivateRoute from './PrivateRoute';

function App() {
  const [role, setRole] = useState(null);  
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/otp" element={<OtpPage setRole={setRole} setIsAuthenticated={setIsAuthenticated} />} />

        {/* Protected Layout */}
        <Route 
          path="/*" 
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <Layout role={role} />
            </PrivateRoute>
          }
        >
          {/* Nested routes inside layout */}
          <Route 
            path="admin" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['admin']} userRole={role}>
                <AdminDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="member" 
            element={
              <PrivateRoute isAuthenticated={isAuthenticated} allowedRoles={['member']} userRole={role}>
                <MemberDashboard />
              </PrivateRoute>
            } 
          />
          <Route path="onboard-desk" element={<MemberOnboarding />} />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
