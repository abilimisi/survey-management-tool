
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  UserCircle2,
  Menu,
  ChevronDown,
  LogOut,
} from "lucide-react";
import "./TopBar.css";
import logo from "../../assets/logo_ob.jpg";

import {
  logoutUser,
  getAdminNotifications,
  markAdminNotificationAsRead,
  markAllAdminNotificationsAsRead,
  getVendorAdminNotifications,
  markVendorAdminNotificationAsRead,
  markAllVendorAdminNotificationsAsRead,
} from "../../api/authApi";

function Topbar({ toggleSidebar }) {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Admin";
  const isSuperuser = localStorage.getItem("is_superuser") === "true";
  const rawRole = isSuperuser
    ? "admin"
    : localStorage.getItem("role") || "user";

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

  const userRole = roleLabels[rawRole.toLowerCase()] || rawRole;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      const [clientResponse, vendorResponse] = await Promise.all([
        getAdminNotifications(),
        getVendorAdminNotifications(),
      ]);

      const clientNotifications = (
        clientResponse.data.notifications || []
      ).map((item) => ({
        ...item,
        source: "client",
        recordId: item.study_id,
        recordLabel: "Study ID",
        notificationKey: `client-${item.id}`,
      }));

      const vendorNotifications = (
        vendorResponse.data.notifications || []
      ).map((item) => ({
        ...item,
        source: "vendor",
        recordId: item.vendor_id,
        notificationKey: `vendor-${item.id}`,
      }));

      const combined = [
        ...clientNotifications,
        ...vendorNotifications,
      ].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );

      setNotifications(combined);

      const clientUnread = clientResponse.data.unread_count || 0;
      const vendorUnread = vendorResponse.data.unread_count || 0;

      setUnreadCount(clientUnread + vendorUnread);
    } catch (error) {
      console.error("Unable to load notifications:", error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 12000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        if (notification.source === "vendor") {
          await markVendorAdminNotificationAsRead(notification.id);
        } else {
          await markAdminNotificationAsRead(notification.id);
        }

        setNotifications((previous) =>
          previous.map((item) =>
            item.notificationKey === notification.notificationKey
              ? { ...item, is_read: true }
              : item
          )
        );

        setUnreadCount((previous) => Math.max(0, previous - 1));
      }

      setNotificationOpen(false);

      // Preserve existing client notification navigation.
      if (notification.source === "client") {
        if (notification.study_id) {
          navigate(`/diy/studies/${notification.study_id}`);
        }
        return;
      }

      // Vendor application notifications.
      if (notification.application_id) {
        navigate("/vendors/applications");
        return;
      }

      // Vendor project notifications.
      if (notification.project_id) {
        navigate(`/projects/${notification.project_id}`);
        return;
      }
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all([
        markAllAdminNotificationsAsRead(),
        markAllVendorAdminNotificationsAsRead(),
      ]);

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
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }

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
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
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

      <div className="topbar-right">
        <div
          className="admin-notification-wrapper"
          ref={notificationRef}
        >
          <button
            type="button"
            className={`admin-notification-btn ${
              notificationOpen ? "active" : ""
            }`}
            onClick={() =>
              setNotificationOpen((previous) => !previous)
            }
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
                  <p>Client and vendor activity updates will appear here.</p>
                </div>
              ) : (
                <div className="admin-notification-list">
                  {notifications.map((notification) => (
                    <button
                      type="button"
                      key={notification.notificationKey}
                      className={`admin-notification-item ${
                        notification.is_read ? "read" : "unread"
                      }`}
                      onClick={() =>
                        handleNotificationClick(notification)
                      }
                    >
                      <div className="admin-notification-heading">
                        <strong className="admin-notification-title">
                          {notification.title}
                        </strong>

                        <div className="notification-source-details">
                          <span
                            className={`notification-source-label ${notification.source}`}
                          >
                            {notification.source === "vendor" ? "Vendor" : "Client"}
                          </span>

                          <span className="notification-record-id">
                            {notification.recordLabel || "ID"}: {notification.recordId ?? "N/A"}
                          </span>
                        </div>
                      </div>

                      <span>{notification.message}</span>

                      <small>
                        {new Date(
                          notification.created_at
                        ).toLocaleString()}
                      </small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="profile-dropdown" ref={dropdownRef}>
          <button
            type="button"
            className="welcome-text"
            onClick={() =>
              setDropdownOpen((previous) => !previous)
            }
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
          >
            <UserCircle2 size={18} />

            <span>
              Welcome, <strong>{userRole} {username}</strong>
            </span>

            <ChevronDown
              size={16}
              className={
                dropdownOpen
                  ? "dropdown-arrow open"
                  : "dropdown-arrow"
              }
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
