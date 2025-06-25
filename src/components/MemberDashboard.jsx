import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, FileText, CalendarDays } from "lucide-react";
import { useAuth } from '../context/AuthContext';
import './MemberDashboard.css';  // You can create the CSS file based on your previous style

function MemberDashboard() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { user, role } = useAuth(); 

  // Member modules configuration
   const memberModules = [
    {
      title: "OnBoardDesk",
      description: "Manage your onboarding documents.",
      icon: <UserPlus className="text-primary" size={40} />,  // Blue
      link: "/member/onboard-desk",
      color: "bg-light",
    },
    
    {
      title: "Payslips",
      description: "View and download your payslips.",
      icon: <FileText className="text-warning" size={40} />,  // Yellow
      link: "/member/payslips",
      color: "bg-light",
    },
    {
      title: "Leave",
      description: "Apply for leave and check leave status.",
      icon: <CalendarDays className="text-danger" size={40} />,  // Red
      link: "/member/leave",
      color: "bg-light",
    }
  ];
  useEffect(() => {
    axios.get('http://13.48.244.216:5000/api/message')
      .then(res => setMessage(res.data.message))
      .catch(() => setMessage('Error fetching message'));
  }, []);

  const handleModuleClick = (link) => {
    navigate(link);
  };
  const getInitial = (name) => {
    return name && name.length > 0 ? name.charAt(0).toUpperCase() : '?';
  };

  return (
      <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header d-flex justify-content-between align-items-center mb-4">
        <h2>Welcome, {user?.name?.split('@')[0]}</h2>

        <div className="d-flex align-items-center">
          <div className="me-3 text-muted">Role: {role}</div>
          <div className="user-avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
            {getInitial(user?.email)}
          </div>
        </div>
      </div>
      <p>{message}</p>

      <div className="tiles-container">
        {memberModules.map(({ title, description, icon, link, color }) => (
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

export default MemberDashboard;
