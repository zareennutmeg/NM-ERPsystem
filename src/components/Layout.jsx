import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return <div className="d-flex justify-content-center align-items-center vh-100">Loading user...</div>;
  }

  const adminMenu = [
    { path: "/admin", label: "Dashboard" },
    { path: "/onboard-desk", label: "Onboard Desk" }
  ];

  const memberMenu = [
    { path: "/member", label: "Dashboard" },
     { path: "/onboard-desk", label: "Onboard Desk" }
  ];

  const menu = user.role === "admin" ? adminMenu : memberMenu;

  return (
    <div className="d-flex vh-100">
      {/* Sidebar */}
      <div className="d-flex flex-column justify-content-between bg-primary text-white p-3" style={{ width: '250px' }}>
        <div>
          <h2 className="mb-4">NMERP SYSTEM</h2>
          <ul className="nav nav-pills flex-column mb-4">
            {menu.map((item) => (
              <li className="nav-item mb-2" key={item.path}>
                <Link to={item.path} className="nav-link text-white" style={{ borderRadius: '0.375rem' }}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-top pt-3">
          <div className="mb-2">
            <strong>{user.name || 'User'}</strong><br />
            <small>{user.email}</small><br />
            <small>Role: {user.role}</small>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-danger w-100"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
