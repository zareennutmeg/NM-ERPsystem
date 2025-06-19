import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus } from "lucide-react"; 
import './AdminDashboard.css';

const adminModules = [
  {
    title: "OnBoardDesk",
    description: "Manage new member registration and documents.",
    icon: <UserPlus className="h-10 w-10 text-nutmeg-600" />,
    link: "/admin/onboard-desk",
    color: "bg-nutmeg-50",
  }
];

function AdminDashboard() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate(); // for routing

  useEffect(() => {
    axios.get('http://13.48.244.216:5000/api/message')
      .then(res => setMessage(res.data.message))
      .catch(() => setMessage('Error fetching message'));
  }, []);

  const handleModuleClick = (link) => {
    navigate(link);
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <p>{message}</p>

      <div className="tiles-container">
        {adminModules.map(({ title, description, icon, link, color }) => (
          <div
            key={title}
            className={`tile ${color}`}
            onClick={() => handleModuleClick(link)}
            style={{ cursor: "pointer" }}
          >
            <div className="icon-container">{icon}</div>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;