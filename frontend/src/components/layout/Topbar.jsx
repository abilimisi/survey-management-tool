import { useNavigate } from "react-router-dom";
import {
  LogOut,
  UserCircle2,
  CalendarDays,
} from "lucide-react";

import "./TopBar.css";

function Topbar() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");

    navigate("/login");
  };

  const today = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="topbar">

      {/* LEFT SIDE */}
      <div className="topbar-left">
        <h2>Survey Management System</h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="topbar-right">

        
        {/* WELCOME USER */}
        <div className="welcome-text">
          <UserCircle2 size={18} />
          <span>
            Welcome, <strong>{username}</strong>
          </span>
        </div>

        {/* LOGOUT */}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

      </div>
    </header>
  );
}

export default Topbar;