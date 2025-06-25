
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaTachometerAlt, FaUserPlus } from "react-icons/fa"; 

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const adminMenu = [
    { path: "/admin", label: "Dashboard", icon: <FaTachometerAlt className="me-2" /> },
    { path: "admin/onboard-desk", label: "Onboard Desk", icon: <FaUserPlus className="me-2" /> }
  ];
  const memberMenu = [
    { path: "/member", label: "Dashboard", icon: <FaTachometerAlt className="me-2" /> },
    { path: "member/onboard-desk", label: "Onboard Desk", icon: <FaUserPlus className="me-2" /> }
  ];
  const menu = user.role === "admin" ? adminMenu : memberMenu;

  return (
    <div className="d-flex vh-100">
    {/* Sidebar */}
    <div className="d-flex flex-column bg-primary text-white p-3 shadow" style={{ width: '250px' }}>
      <div className="mb-4 text-center border-bottom pb-3">
        <h4 className="fw-bold">NMERP SYSTEM</h4>
      </div>

        <nav className="flex-grow-1">
          <ul className="nav flex-column">
            {menu.map((item) => (
              <li className="nav-item mb-2" key={item.path}>
                <Link
                  to={item.path}
                  className={`nav-link d-flex align-items-center fw-medium ${
                    location.pathname === item.path ? 'bg-light text-primary rounded px-2' : 'text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-top pt-3">
          <div className="mb-2 text-center small">
            <strong>{user.name}</strong><br />
            <span>{user.email}</span><br />
               </div>
         <button
  onClick={handleLogout}
  className="btn btn-outline-danger w-100"
  style={{ backgroundColor: 'white', color: 'red' }}
>
  Logout
</button>

        </div>
      </div>

      {/* Main Content */}
      <main className="flex-grow-1 p-4 bg-white" style={{ overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;