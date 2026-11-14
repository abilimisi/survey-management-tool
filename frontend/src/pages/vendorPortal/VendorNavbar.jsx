
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  UserCircle,
  ChevronDown,
  Bell,
  CheckCheck,
  X,
  LogOut,
} from "lucide-react";

import {
  getVendorNotifications,
  markVendorNotificationRead,
  markAllVendorNotificationsRead,
  getVendorProfile,
} from "../../api/vendorPortalApi";

import "./VendorNavbar.css";

function VendorNavbar() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const [vendorName, setVendorName] = useState("Vendor");
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await getVendorNotifications();

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error("Failed to load vendor notifications:", error);
    }
  };

  // Poll notifications every 12 seconds
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 12000);

    return () => clearInterval(interval);
  }, []);

  // Fetch vendor profile information
  useEffect(() => {
    let cancelled = false;

    const fetchVendorDetails = async () => {
      try {
        const response = await getVendorProfile();

        if (cancelled) return;

        const user = response.data?.user || {};

        const fullName = [user.first_name, user.last_name]
          .filter(Boolean)
          .join(" ");

        setVendorName(
          fullName || user.company_name || "Vendor"
        );
      } catch (error) {
        console.error("Failed to load vendor details:", error);
      }
    };

    fetchVendorDetails();

    return () => {
      cancelled = true;
    };
  }, []);

  // Mark individual notification as read
  const handleNotificationClick = async (notification) => {
    if (notification.is_read) return;

    try {
      await markVendorNotificationRead(notification.id);

      setNotifications((previous) =>
        previous.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      );

      setUnreadCount((previous) => Math.max(0, previous - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    try {
      await markAllVendorNotificationsRead();

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          is_read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("vendor_portal_access_token");
    navigate("/vendor/login", { replace: true });
  };

  // Toggle notification dropdown
  const toggleNotifications = async () => {
    const nextState = !showNotifications;

    setShowNotifications(nextState);
    setShowAccountMenu(false);

    if (nextState) {
      setLoadingNotifications(true);
      await fetchNotifications();
      setLoadingNotifications(false);
    }
  };

  // Toggle account dropdown
  const toggleAccountMenu = () => {
    setShowAccountMenu((previous) => !previous);
    setShowNotifications(false);
  };

  return (
    <header className="vendor-dashboard-topbar">
      <div className="vendor-navbar-inner">

        {/* Company Logo */}
        <Link
          to="/vendor/dashboard"
          className="vendor-topbar-logo"
        >
          <img
            src="/logo_ob.jpg"
            alt="Opinion Bunch"
          />
        </Link>

        {/* Right-side actions */}
        <div className="vendor-topbar-actions">

          {/* Notifications */}
          <div className="vendor-notification-wrapper">
            <button
              type="button"
              className={`vendor-notification-button ${
                showNotifications ? "active" : ""
              }`}
              aria-label="Notifications"
              aria-expanded={showNotifications}
              onClick={toggleNotifications}
            >
              <Bell size={21} />

              {unreadCount > 0 && (
                <span className="vendor-notification-count">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="vendor-notification-dropdown">
                <div className="vendor-notification-header">
                  <div>
                    <strong>Notifications</strong>
                    <small>{unreadCount} unread</small>
                  </div>

                  <div className="vendor-notification-header-actions">
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        title="Mark all as read"
                      >
                        <CheckCheck size={17} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowNotifications(false)}
                      title="Close notifications"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="vendor-notification-list">
                  {loadingNotifications ? (
                    <p className="vendor-notification-empty">
                      Loading notifications...
                    </p>
                  ) : notifications.length === 0 ? (
                    <p className="vendor-notification-empty">
                      You're all caught up!
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        className={`vendor-notification-item ${
                          notification.is_read ? "" : "unread"
                        }`}
                        onClick={() =>
                          handleNotificationClick(notification)
                        }
                      >
                        <span className="vendor-notification-item-dot" />

                        <span className="vendor-notification-item-content">
                          <strong>{notification.title}</strong>

                          <span>{notification.message}</span>

                          <small>
                            {new Date(
                              notification.created_at
                            ).toLocaleString()}
                          </small>
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Vendor Account Dropdown */}
          <div className="vendor-account-wrapper">
            <button
              type="button"
              className="vendor-account-button"
              onClick={toggleAccountMenu}
              aria-expanded={showAccountMenu}
              aria-label="Vendor account menu"
            >
              <UserCircle size={23} />

              <span className="vendor-account-welcome">
                Welcome, <strong>{vendorName}</strong>
              </span>

              <ChevronDown
                size={18}
                className={`vendor-account-chevron ${
                  showAccountMenu ? "open" : ""
                }`}
              />
            </button>

            {showAccountMenu && (
              <div className="vendor-account-dropdown">
                <Link
                  to="/vendor/profile"
                  onClick={() => setShowAccountMenu(false)}
                >
                  <UserCircle size={16} />
                  Company Profile
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}

export default VendorNavbar;
