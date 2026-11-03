import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import {
  UserCircle2,
  Menu,
  ChevronDown,
  LogOut,
} from "lucide-react";
import "./TopBar.css";
import logo from "../../assets/logo_ob.jpg";
import { logoutUser } from "../../api/authApi";

// toggleSidebar is passed from MainLayout
function Topbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "Admin";
  const isSuperuser = localStorage.getItem("is_superuser") === "true";
  const rawRole = isSuperuser
  ? "admin"
  : (localStorage.getItem("role") || "user");

  const roleLabels = {
    admin: "Administrator",
    pm: "Project Manager",
    sales: "Sales",
    support: "Support",
    accounts_pay: "Accounts Pay",
    account_manager: "Account Manager",
    panel_manager: "Panel Manager",
    team_leader: "Team Leader",
    affiliate_manager: "Affiliate Manager",
    content_manager: "Content Manager",
    dashboard_manager: "Dashboard Manager",
    viewer: "Viewer",
  };

  const userRole =
    roleLabels[rawRole.toLowerCase()] || rawRole;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  
  const handleLogout = async () => {
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    try {
      await logoutUser(accessToken, refreshToken);

      console.log("Backend logout successful.");

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("username");
      localStorage.removeItem("is_superuser");
      localStorage.removeItem("role");

      navigate("/login");

    } catch (error) {
      console.error("Backend logout failed:", error);

      alert(
        "Logout failed. Your account session is still active. Please try again."
      );
    }
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
        <div className="profile-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="welcome-text"
            onClick={() => setDropdownOpen((previous) => !previous)}
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
          >
            <UserCircle2 size={18} />
            <span>
              Welcome, <strong>{userRole} {username}</strong>
            </span>
            <ChevronDown
              size={16}
              className={dropdownOpen ? "dropdown-arrow open" : "dropdown-arrow"}
            />
          </button>

          {dropdownOpen && (
            <div className="profile-dropdown-menu" role="menu">
              
              {isSuperuser && (
                <button
                  type="button"
                  className="dropdown-menu-btn"
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate("/users");
                  }}
                  role="menuitem"
                >
                  <UserCircle2 size={16} />
                  <span>Manage Users</span>
                </button>
              )}


              <button
                type="button"
                className="dropdown-logout-btn"
                onClick={handleLogout}
                role="menuitem"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}

        </div>
      </div>

    </header>
  );
}

export default Topbar;
