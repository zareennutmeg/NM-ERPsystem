import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Clock, CalendarDays } from "lucide-react";
import './AdminDashboard.css';

const adminModules = [
  {
        title: "OnBoardDesk",
        description: "Manage your onboarding documents.",
        icon: <UserPlus className="text-primary" size={40} />,  // Blue
        link: "/onboard-desk",
        color: "bg-light",
      },
  {
        title: "Timesheet",
        description: "Fill and submit your timesheets.",
        icon: <Clock className="text-success" size={40} />,  // Green
        link: "/admin/timesheet",
        color: "bg-light",
      },
      
      {
        title: "Leave",
        description: "Apply for leave and check leave status.",
        icon: <CalendarDays className="text-danger" size={40} />,  // Red
        link: "/admin/leave",
        color: "bg-light",
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