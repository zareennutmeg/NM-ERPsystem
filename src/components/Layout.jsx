import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Layout = ({ role, children }) => {
  const navigate = useNavigate();
  const user = {
  name: firebaseUser.displayName,   // Firebase user name
  email: firebaseUser.email,        // Firebase user email
  role: role,                       // role you fetched after login
};

  const handleLogout = () => {
    navigate("/login");
  };

  const adminMenu = [
    { path: "/admin", label: "Dashboard" },
    { path: "/onboard-desk", label: "Onboard Desk" },
    { path: "/timesheet", label: "Timesheet" },
    { path: "/payroll", label: "Payroll" },
    { path: "/performance", label: "Performance" },
    { path: "/leave", label: "Leave" }
  ];

  const memberMenu = [
    { path: "/member", label: "Dashboard" },
    { path: "/timesheet", label: "Timesheet" },
    { path: "/leave", label: "Leave" }
  ];

  const menu = role === "admin" ? adminMenu : memberMenu;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div style={{
        width: "250px", backgroundColor: "#1e293b", color: "white",
        padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between"
      }}>
        <div>
          <h2>NMERP SYSTEM</h2> 
          <ul style={{ listStyle: "none", padding: 0 }}>
            {menu.map((item) => (
              <li key={item.path}>
                <Link style={{ color: "white", textDecoration: "none", display: "block", marginBottom: "15px" }} to={item.path}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div>
            <strong>{user.name}</strong><br />
            <small>{user.email}</small><br />
            <small>Role: {user.role}</small>
          </div>
          <button onClick={handleLogout} style={{ marginTop: "10px", padding: "10px 20px", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "5px" }}>Logout</button>
        </div>
      </div>

      <div style={{ flexGrow: 1, padding: "20px" }}>
        {children}
      </div>
    </div>
  );
};

export default Layout;
