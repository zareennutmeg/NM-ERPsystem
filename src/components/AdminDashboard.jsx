import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

function AdminDashboard() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://13.48.244.216:5000/api/message')
      .then(res => setMessage(res.data.message))
      .catch(() => setMessage('Error fetching message'));
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>{message}</p>
    </div>
  );
}

export default AdminDashboard;
