import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";  // adjust the path based on where your AuthContext file is

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Optional loading state (in case user is not loaded yet)
  if (!user) {
    return <div>Loading user...</div>;
  }

  const adminMenu = [
    { path: "/admin", label: "Dashboard" },
    { path: "/onboard-desk", label: "Onboard Desk" }
  ];

  const memberMenu = [
    { path: "/member", label: "Dashboard" }
  ];

  const menu = user.role === "admin" ? adminMenu : memberMenu;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <div
        style={{
          width: "250px",
          backgroundColor: "#1e293b",
          color: "white",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <div>
          <h2>NMERP SYSTEM</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {menu.map((item) => (
              <li key={item.path}>
                <Link
                  style={{
                    color: "white",
                    textDecoration: "none",
                    display: "block",
                    marginBottom: "15px"
                  }}
                  to={item.path}
                >
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
          <button
            onClick={handleLogout}
            style={{
              marginTop: "10px",
              padding: "10px 20px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "5px"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ flexGrow: 1, padding: "20px" }}>{children}</div>
    </div>
  );
};

export default Layout;
