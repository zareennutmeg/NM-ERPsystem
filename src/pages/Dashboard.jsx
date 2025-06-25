import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { role, user } = useAuth();
  const navigate = useNavigate();

   useEffect(() => {
    if (!user) {
      navigate('/login');  // Redirect if not logged in
    } else if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'member') {
      navigate('/member');
    }
  }, [role, user, navigate]);

  return <div>Loading your dashboard...</div>;
}
