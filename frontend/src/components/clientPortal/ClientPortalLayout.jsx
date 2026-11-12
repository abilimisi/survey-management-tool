
import { useState } from "react";
import { Outlet } from "react-router-dom";

import ClientPortalRoute from "../../pages/clientPortal/ClientPortalRoute";
import ClientPortalNavbar from "./ClientPortalNavbar";
import ClientPortalSidebar from "./ClientPortalSidebar";

import "./ClientPortalLayout.css";

export default function ClientPortalLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed((previous) => !previous);
  };

  const openNotifications = () => {
    setShowNotifications(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("client_portal_access_token");
    localStorage.removeItem("client_portal_user");

    window.location.href = "/client-portal/login";
  };

  return (
    <ClientPortalRoute>
      <div
        className={`client-portal-layout ${
          isCollapsed ? "sidebar-collapsed" : ""
        }`}
      >
        <ClientPortalSidebar
          isCollapsed={isCollapsed}
          toggleSidebar={toggleSidebar}
          onNotificationsClick={openNotifications}
          onLogout={handleLogout}
        />

        <div className="client-portal-content">
          <ClientPortalNavbar
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
          />

          <main className="client-portal-main">
            <Outlet />
          </main>
        </div>
      </div>
    </ClientPortalRoute>
  );
}
