
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  CircleUserRound,
  ChevronDown,
} from "lucide-react";

import {
  getClientNotifications,
  markClientNotificationAsRead,
} from "../../api/clientPortalApi";

import "./ClientPortalNavbar.css";

export default function ClientPortalNavbar({
  showNotifications,
  setShowNotifications,
}) {
  const navigate = useNavigate();

  const notificationRef = useRef(null);
  const accountRef = useRef(null);

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const storedUser = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("client_portal_user") || "{}"
      );
    } catch {
      return {};
    }
  })();

  const clientName =
    [storedUser.first_name, storedUser.last_name]
      .filter(Boolean)
      .join(" ") ||
    storedUser.name ||
    "Client";

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("client_portal_access_token");
    localStorage.removeItem("client_portal_user");

    navigate("/client-portal/login");
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const response = await getClientNotifications();

      setUnreadCount(response.data.unread_count || 0);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Unable to load notifications:", error);
    }
  };

  // Initial notification loading and automatic refresh
  useEffect(() => {
    loadNotifications();

    const interval = setInterval(loadNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }

      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setShowAccountMenu(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setShowNotifications(false);
        setShowAccountMenu(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [setShowNotifications]);

  // Handle notification click
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

        setUnreadCount((previous) =>
          Math.max(0, previous - 1)
        );
      }

      setShowNotifications(false);

      if (notification.study_id) {
        navigate(
          `/client-portal/studies/${notification.study_id}`
        );
      }
    } catch (error) {
      console.error(
        "Unable to mark notification as read:",
        error
      );
    }
  };

  return (
    <header className="client-portal-navbar">
      <div className="client-navbar-inner">

        {/* Company logo */}
        <div className="client-navbar-brand">
          <img
            src="/logo_ob.jpg"
            alt="Opinion Bunch"
            className="client-navbar-company-logo"
          />
        </div>

        {/* Right-side actions */}
        <div className="client-navbar-actions">

          {/* Notifications */}
          <div
            className="client-notification-wrapper"
            ref={notificationRef}
          >
            <button
              type="button"
              className={`client-notification-button ${
                showNotifications ? "active" : ""
              }`}
              aria-label={`Notifications${
                unreadCount > 0
                  ? `, ${unreadCount} unread`
                  : ""
              }`}
              aria-expanded={showNotifications}
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
                        ? `${unreadCount} unread notification${
                            unreadCount > 1 ? "s" : ""
                          }`
                        : "You're all caught up"}
                    </p>
                  </div>
                </div>

                {notifications.length === 0 ? (
                  <div className="client-notification-empty">
                    <strong>No notifications yet</strong>
                    <p>
                      Updates about your studies will appear here.
                    </p>
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

          {/* Client account dropdown */}
          <div
            className="client-navbar-account"
            ref={accountRef}
          >
            <button
              type="button"
              className="client-navbar-account-button"
              onClick={() =>
                setShowAccountMenu((previous) => !previous)
              }
              aria-expanded={showAccountMenu}
              aria-label="Client account menu"
            >
              <CircleUserRound
                size={21}
                strokeWidth={1.8}
              />

              <span>
                Welcome, <strong>{clientName}</strong>
              </span>

              <ChevronDown
                size={17}
                className={
                  showAccountMenu ? "account-chevron-open" : ""
                }
              />
            </button>

            {showAccountMenu && (
              <div className="client-navbar-account-dropdown">
                <button
                  type="button"
                  onClick={() => {
                    setShowAccountMenu(false);
                    handleLogout();
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
