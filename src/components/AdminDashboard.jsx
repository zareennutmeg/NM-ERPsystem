import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // for routing

  useEffect(() => {
    axios.get('http://13.48.244.216:5000/api/message')
      .then(res => setMessage(res.data.message))
      .catch(() => setMessage('Error fetching message'));
  }, []);

  const handleOnboardClick = () => {
    navigate('/admin/onboard-desk'); // adjust route based on your setup
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <p>{message}</p>

      <div className="tiles-container">
        <div className="tile" onClick={handleOnboardClick}>
          <h2>Onboard Desk</h2>
          <p>Manage new member onboarding, document uploads, and verification.</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
