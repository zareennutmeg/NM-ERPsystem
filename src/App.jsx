import React, { useState } from 'react';
import Login from './Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import OtpPage from './OtpPage';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/otp" element={<OtpPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/member" element={<MemberDashboard />} />
        <Route path="*" element={<h2>404 - Page not found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;