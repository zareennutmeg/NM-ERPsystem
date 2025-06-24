import React from 'react';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/AdminDashboard';
import MemberDashboard from '../components/MemberDashboard';

export default function Dashboard() {
  const { role } = useAuth();

  return (
    <>
      {role === 'admin' && <AdminDashboard />}
      {role === 'member' && <MemberDashboard />}
      {!role && <div>Unauthorized</div>}
    </>
  );
}
