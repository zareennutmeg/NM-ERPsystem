import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    axios.get('http://13.48.244.216/api/message')
      .then(res => setMessage(res.data.message))
      .catch(() => setMessage("Error fetching message"));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>{message}</p>
    </div>
  );
}

export default Dashboard;
