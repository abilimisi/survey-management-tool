
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getClientNotifications,
  markClientNotificationAsRead,
} from "../../api/clientPortalApi";

import "./ClientPortalNavbar.css";

export default function ClientPortalNavbar() {
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("client_portal_access_token");
    localStorage.removeItem("client_portal_user");
    navigate("/client-portal/login");
  };

  const loadNotifications = async () => {
    try {
      const response = await getClientNotifications();

      setUnreadCount(response.data.unread_count || 0);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Unable to load notifications:", error);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await markClientNotificationAsRead(notification.id);

        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id
              ? { ...item, is_read: true }
              : item
          )
        );

        setUnreadCount((previous) => Math.max(0, previous - 1));
      }

      setShowNotifications(false);

      navigate(`/client-portal/studies/${notification.study_id}`);
    } catch (error) {
      console.error("Unable to mark notification as read:", error);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
        if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
        ) {
        setShowNotifications(false);
        }
    };

    const handleEscapeKey = (event) => {
        if (event.key === "Escape") {
        setShowNotifications(false);
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
    <header className="client-portal-navbar">
      <div className="client-navbar-inner">

        {/* Company logo area */}
        <div className="client-navbar-brand">
          <img
            src="/logo_ob.jpg"
            alt="Company Logo"
            className="client-navbar-company-logo"
          />
        </div>

        {/* Right-side actions */}
        <div className="client-navbar-actions">

          {/* Notifications */}
          <div className="client-notification-wrapper" ref={notificationRef}>
            <button
              type="button"
              className={`client-notification-button ${
                showNotifications ? "active" : ""
              }`}
              aria-label="Notifications"
              title="Notifications"
              onClick={() =>
                setShowNotifications((previous) => !previous)
              }
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
                <span className="client-notification-badge">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="client-notification-dropdown">
                <div className="client-notification-header">
                  <div>
                    <h3>Notifications</h3>
                    <p>
                      {unreadCount > 0
                        ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                        : "You're all caught up"}
                    </p>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="client-notification-empty">
                    <strong>No notifications yet</strong>
                    <p>Updates about your studies will appear here.</p>
                  </div>
                ) : (
                  <div className="client-notification-list">
                    {notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        className={`client-notification-item ${
                          notification.is_read ? "read" : "unread"
                        }`}
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                      >
                        <span className="client-notification-dot" />

                        <span className="client-notification-content">
                          <strong>{notification.title}</strong>
                          <span>{notification.message}</span>
                          <small>
                            {new Date(
                              notification.created_at
                            ).toLocaleString()}
                          </small>
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logout */}
          <button
            type="button"
            className="client-navbar-logout"
            onClick={handleLogout}
          >
            Log out
          </button>

        </div>
      </div>
    </header>
  );
}
