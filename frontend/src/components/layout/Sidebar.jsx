import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Sidebar({ isCollapsed, toggleSidebar }) {
  const isSuperuser =
  localStorage.getItem("is_superuser") === "true";

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Clients", path: "/clients", icon: Building2 },
    { name: "Vendors", path: "/vendors", icon: Users },
    { name: "Projects", path: "/projects", icon: FolderKanban },
    { name: "Reports", path: "/reports", icon: BarChart3 },
    { name: "Panelists", path: "/panelists", icon: Users },

    ...(isSuperuser
      ? [{ name: "Users", path: "/users", icon: Users }]
      : []),
  ];
  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {isCollapsed ? "ST" : "Survey Tool"}
        </div>

        <button
          className="sidebar-collapse-btn"
          onClick={toggleSidebar}
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.name}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              <Icon size={20} />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;