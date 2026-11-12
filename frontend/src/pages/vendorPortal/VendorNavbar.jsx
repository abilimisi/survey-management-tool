
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  LogOut,
  Bell,
  CheckCheck,
  X,
} from "lucide-react";
import {
  getVendorNotifications,
  markVendorNotificationRead,
  markAllVendorNotificationsRead,
} from "../../api/vendorPortalApi";
import "./VendorNavbar.css";

function VendorNavbar() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const response = await getVendorNotifications();

      setNotifications(response.data.notifications || []);
      setUnreadCount(response.data.unread_count || 0);
    } catch (error) {
      console.error("Failed to load vendor notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 12000);

    return () => clearInterval(interval);
  }, []);

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

  const handleMarkAllRead = async () => {
    try {
      await markAllVendorNotificationsRead();

      setNotifications((previous) =>
        previous.map((item) => ({ ...item, is_read: true }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("vendor_portal_access_token");
    navigate("/vendor/login", { replace: true });
  };

  const toggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);

    if (nextState) {
      setLoadingNotifications(true);
      await fetchNotifications();
      setLoadingNotifications(false);
    }
  };

  return (
    <header className="vendor-dashboard-topbar">
      <Link to="/vendor/dashboard" className="vendor-brand">
        <span className="vendor-brand-icon">
          <Building2 size={23} />
        </span>
        <span>
          <strong>Vendor Portal</strong>
          <small>PanelSphere</small>
        </span>
      </Link>

      <div className="vendor-topbar-actions">
        <span className="vendor-account-email">
          <ShieldCheck size={16} />
          Vendor Account
        </span>

        <div className="vendor-notification-wrapper">
          <button
            type="button"
            className="vendor-notification-button"
            aria-label="Notifications"
            aria-expanded={showNotifications}
            onClick={toggleNotifications}
          >
            <Bell size={19} />

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
                  <small>
                    {unreadCount} unread
                  </small>
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

        <button
          type="button"
          className="vendor-topbar-logout"
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </header>
  );
}

export default VendorNavbar;
