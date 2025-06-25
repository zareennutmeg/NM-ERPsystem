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
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <Router>
      <Routes>
       <Route path="/" element={<Navigate to="/login" />} />
       <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route path="/otp" element={<OtpPage setRole={setRole} setIsAuthenticated={setIsAuthenticated} />} />

        {/* No PrivateRoute, just render Layout directly */}
        <Route path="/*" element={<Layout role={role} />} >
            <Route index element={<Dashboard role={role} />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="admin/onboard-desk" element={<MemberOnboarding />} />
          <Route path="member" element={<MemberDashboard />} />
         <Route path="member/onboard-desk" element={<MemberOnboarding />} />
         
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
