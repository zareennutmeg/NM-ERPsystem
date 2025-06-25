import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'member') {
      navigate('/member');
    }
  }, [role, navigate]);

  return <div>Loading your dashboard...</div>;
}
