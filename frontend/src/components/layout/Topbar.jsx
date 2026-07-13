import { useNavigate } from "react-router-dom";
import { UserCircle2, Menu } from "lucide-react";
import "./TopBar.css";
import logo from "../../assets/logo_ob.jpg";

// toggleSidebar is passed from MainLayout
function Topbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <header className="topbar">

      {/* LEFT SIDE */}
      <div className="topbar-left">

        {/* Hamburger — only visible on tablets/phones (< 1024px) */}
        <button
          className="hamburger-btn"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <Menu size={22} />
        </button>

        <img
          src={logo}
          alt="Opinion Bunch"
          className="topbar-logo"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="topbar-right">

        <div className="welcome-text">
          <UserCircle2 size={18} />
          <span>Welcome, <strong>{username}</strong></span>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

      </div>
    </header>
  );
}

export default Topbar;
