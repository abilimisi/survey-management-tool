import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Layers,
  FileText,
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileCode2,
  ListChecks,
  Map,
  LogOut,
  ChevronDown,
} from "lucide-react";

import "./ClientPortalSidebar.css";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/client-portal/dashboard",
    icon: LayoutDashboard,
    end: true,
  },
  {
    label: "My Studies",
    path: "/client-portal/studies",
    icon: Layers,
    end: true,
  },
  {
    label: "Quotations",
    path: "/client-portal/dashboard#quotations",
    icon: FileText,
  },
  {
    label: "Notifications",
    action: "notifications",
    icon: Bell,
  },
  {
    label: "Company Profile",
    path: "/client-portal/company-profile",
    icon: Building2,
    end: true,
  },
  {
    label: "End Pages",
    action: "client-modal",
    modal: "end-pages",
    icon: FileCode2,
  },
  {
    label: "Status Rules & Build Notes",
    action: "client-modal",
    modal: "status-rules",
    icon: ListChecks,
  },
  {
    label: "Client Road Map",
    action: "client-modal",
    modal: "roadmap",
    icon: Map,
  },
];

export default function ClientPortalSidebar({
  isCollapsed,
  toggleSidebar,
  onNotificationsClick,
  onLogout,
}) {
  const location = useLocation();
  const navigate = useNavigate();
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

  const clientRole =
    storedUser.role ||
    storedUser.designation ||
    "Client";
  return (
    <aside
      className={`client-portal-sidebar ${
        isCollapsed ? "collapsed" : ""
      }`}
    >
      {/* Sidebar Header */}
      <div className="client-sidebar-header">
        <div className="client-sidebar-logo">
          PanelSphere
        </div>

        <button
          type="button"
          className="client-sidebar-collapse-btn"
          onClick={toggleSidebar}
          aria-label={
            isCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          title={
            isCollapsed ? "Expand sidebar" : "Collapse sidebar"
          }
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav
        className="client-sidebar-navigation"
        aria-label="Client portal navigation"
      >
        {navigationItems.map((item) => {
          const Icon = item.icon;

          if (item.action === "client-modal") {
            return (
              <button
                key={item.label}
                type="button"
                title={isCollapsed ? item.label : undefined}
                className="client-sidebar-link"
                onClick={() =>
                  navigate("/client-portal/dashboard", {
                    state: { openClientModal: item.modal },
                  })
                }
              >
                <Icon size={20} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            );
          }

          // Notifications opens the shared Navbar popup.
          if (item.action === "notifications") {
            return (
              <button
                key={item.label}
                type="button"
                title={isCollapsed ? item.label : undefined}
                className="client-sidebar-link"
                onClick={onNotificationsClick}
              >
                <Icon size={20} strokeWidth={1.8} />
                <span>{item.label}</span>
              </button>
            );
          }

          const [path, hash] = item.path.split("#");

          const isActive = hash
            ? location.pathname === path &&
              location.hash === `#${hash}`
            : location.pathname === path;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.end}
              title={isCollapsed ? item.label : undefined}
              className={`client-sidebar-link ${
                isActive ? "active" : ""
              }`}
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="client-sidebar-footer">

        <button
          type="button"
          className="client-sidebar-logout"
          onClick={onLogout}
          title="Logout"
        >
          <LogOut size={19} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
