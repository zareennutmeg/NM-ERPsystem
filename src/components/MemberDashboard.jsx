import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, FileText, Clock, CalendarDays } from "lucide-react";
import './MemberDashboard.css';  // You can create the CSS file based on your previous style

function MemberDashboard() {
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Member modules configuration
  const memberModules = [
    {
      title: "OnBoardDesk",
      description: "Manage your onboarding documents.",
      icon: <UserPlus className="h-10 w-10 text-nutmeg-600" />,
      link: "/member/onboard-desk",
      color: "bg-nutmeg-50",
    },
    {
      title: "Timesheet",
      description: "Fill and submit your timesheets.",
      icon: <Clock className="h-10 w-10 text-nutmeg-600" />,
      link: "/member/timesheet",
      color: "bg-nutmeg-50",
    },
    {
      title: "Payslips",
      description: "View and download your payslips.",
      icon: <FileText className="h-10 w-10 text-nutmeg-600" />,
      link: "/member/payslips",
      color: "bg-nutmeg-50",
    },
    {
      title: "Leave",
      description: "Apply for leave and check leave status.",
      icon: <CalendarDays className="h-10 w-10 text-nutmeg-600" />,
      link: "/member/leave",
      color: "bg-nutmeg-50",
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

  return (
    <div className="dashboard-container">
      <h1>Member Dashboard</h1>
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
