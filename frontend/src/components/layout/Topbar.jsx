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

import {
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
} from "../../api/authApi";

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
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const notificationRef = useRef(null);

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

  const loadNotifications = async () => {
    try {
      const response = await getAdminNotifications();

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error("Unable to load admin notifications:", error);
    }
  };

  const handleAdminNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await markAdminNotificationAsRead(notification.id);

        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true }
              : item
          )
        );

        setUnreadCount((previous) => Math.max(0, previous - 1));
      }

      setNotificationOpen(false);

      // Navigate to the relevant DIY study
      navigate(`/diy/studies/${notification.study_id}`);
    } catch (error) {
      console.error("Unable to mark admin notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAdminNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, is_read: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Unable to mark all notifications as read:", error);
    }
  };

  
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

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);


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

        {/* ADMIN NOTIFICATIONS */}
        <div className="admin-notification-wrapper" ref={notificationRef}>
          <button
            type="button"
            className={`admin-notification-btn ${
              notificationOpen ? "active" : ""
            }`}
            onClick={() => setNotificationOpen((previous) => !previous)}
            aria-label="Notifications"
            aria-expanded={notificationOpen}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>

            {unreadCount > 0 && (
              <span className="admin-notification-badge">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notificationOpen && (
            <div className="admin-notification-dropdown">
              <div className="admin-notification-header">
                <strong>Notifications</strong>

                <div className="admin-notification-header-actions">
                  <span>{unreadCount} unread</span>

                  {unreadCount > 0 && (
                    <button
                      type="button"
                      className="admin-mark-all-read"
                      onClick={handleMarkAllAsRead}
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
              </div>

              {notifications.length === 0 ? (
                <div className="admin-notification-empty">
                  <strong>No notifications yet</strong>
                  <p>Client activity updates will appear here.</p>
                </div>
              ) : (
                <div className="admin-notification-list">
                  {notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.id}
                      className={`admin-notification-item ${
                        notification.is_read ? "read" : "unread"
                      }`}
                      onClick={() => handleAdminNotificationClick(notification)}
                    >
                      <strong>{notification.title}</strong>
                      <span>{notification.message}</span>
                      <small>
                        {new Date(notification.created_at).toLocaleString()}
                      </small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* EXISTING PROFILE DROPDOWN */}
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
