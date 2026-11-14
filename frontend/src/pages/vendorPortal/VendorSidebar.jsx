
import { Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  ClipboardCheck,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import "./VendorSidebar.css";

function VendorSidebar({
  sidebarCollapsed,
  toggleSidebar,
  isApproved,
}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("vendor_portal_access_token");
    navigate("/vendor/login", { replace: true });
  };

  return (
    <aside
      className={`vendor-dashboard-sidebar ${
        sidebarCollapsed ? "collapsed" : ""
      }`}
      aria-label="Vendor navigation"
    >
      <div className="vendor-sidebar-brand">
        {!sidebarCollapsed && (
          <span className="vendor-sidebar-brand-text">
            <strong>PanelSphere</strong>
          </span>
        )}

        <button
          type="button"
          className="vendor-sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={
            sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <ChevronLeft size={20} />
          )}
        </button>
      </div>

      <nav className="vendor-sidebar-nav">
        <Link
          to="/vendor/dashboard"
          data-tooltip="Dashboard"
          title={sidebarCollapsed ? "Dashboard" : undefined}
        >
          <LayoutDashboard size={18} />
          {!sidebarCollapsed && <span>Dashboard</span>}
        </Link>

        {isApproved && (
          <a
            href="#assigned-projects"
            data-tooltip="My Projects"
            title={sidebarCollapsed ? "My Projects" : undefined}
          >
            <ClipboardCheck size={18} />
            {!sidebarCollapsed && <span>My Projects</span>}
          </a>
        )}

        <a
          href="#vendor-notifications"
          data-tooltip="Notifications"
          title={sidebarCollapsed ? "Notifications" : undefined}
        >
          <Bell size={18} />
          {!sidebarCollapsed && <span>Notifications</span>}
        </a>

        <Link
          to="/vendor/company-profile"
          data-tooltip="Company Profile"
          title={sidebarCollapsed ? "Company Profile" : undefined}
        >
          <Building2 size={18} />
          {!sidebarCollapsed && <span>Company Profile</span>}
        </Link>
      </nav>

      <button
        type="button"
        className="vendor-sidebar-logout"
        onClick={handleLogout}
        title="Log out"
        aria-label="Log out"
      >
        <LogOut size={18} />
        {!sidebarCollapsed && <span>Log out</span>}
      </button>
    </aside>
  );
}

export default VendorSidebar;
