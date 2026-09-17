import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink } from "react-router-dom";

import "./Sidebar.css";

// onNavigate: called when a link is clicked — closes sidebar on overlay mode
function Sidebar({ isCollapsed, toggleSidebar, onNavigate }) {
  const [openMenu, setOpenMenu] = useState("Analytics Dashboard");
  const isSuperuser = localStorage.getItem("is_superuser") === "true";

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      color: "icon-blue",
    },
    {
      name: "Clients",
      path: "/clients",
      icon: Building2,
      color: "icon-purple",
    },
    {
      name: "Vendors",
      path: "/vendors",
      icon: Users,
      color: "icon-orange",
    },
    {
      name: "Projects",
      path: "/projects",
      icon: FolderKanban,
      color: "icon-green",
    },
    {
      name: "Reports",
      path: "/reports",
      icon: BarChart3,
      color: "icon-cyan",
    },
    {
      name: "Panelists",
      path: "/panelists",
      icon: Users,
      color: "icon-pink",
    },
    {
      name: "Panel Campaigns",
      path: "/panel-campaigns",
      icon: FolderKanban,
      color: "icon-yellow",
    },
    {
      name: "Company Contacts",
      path: "/company-contacts",
      icon: Building2,
      color: "icon-teal",
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: BarChart3,
      color: "icon-indigo",

      children: [
        {
          name: "Project Analytics",
          path: "/analytics/projects",
          icon: FolderKanban,
          color: "icon-green",
        },
        {
          name: "Vendor Analytics",
          path: "/analytics/vendors",
          icon: Users,
          color: "icon-orange",
        },
      ],
    },

    ...(isSuperuser
      ? [
          {
            name: "Users",
            path: "/users",
            icon: Users,
            color: "icon-red",
          },
        ]
      : []),
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>

      <div className="sidebar-header">
        <div className="sidebar-logo">PanelSphere</div>

        <button
          className="sidebar-collapse-btn"
          onClick={toggleSidebar}
          aria-label="Collapse sidebar"
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

          if (item.children) {
            return (
              <div key={item.name} className="sidebar-dropdown">

                <div className="sidebar-link sidebar-dropdown-btn">

                  {/* Main Analytics link */}
                  <NavLink
                    to={item.path}
                    className="analytics-main-link"
                    onClick={() => {
                      setOpenMenu(item.name);

                      if (isCollapsed) {
                        toggleSidebar();
                      }

                      if (onNavigate) {
                        onNavigate();
                      }
                    }}
                  >
                    <Icon
                      size={20}
                      className={item.color}
                    />

                    <span>{item.name}</span>
                  </NavLink>

                  {/* Dropdown arrow */}
                  <button
                    type="button"
                    className="analytics-toggle-btn"
                    onClick={() =>
                      setOpenMenu(
                        openMenu === item.name
                          ? ""
                          : item.name
                      )
                    }
                    aria-label={`Toggle ${item.name} submenu`}
                  >
                    <ChevronRight
                      size={16}
                      className={
                        openMenu === item.name
                          ? "rotate"
                          : ""
                      }
                    />
                  </button>

                </div>

                {/* Analytics submodules */}
                {openMenu === item.name && (
                  <div className="sidebar-submenu">

                    {item.children.map((child) => {
                      const ChildIcon = child.icon;

                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            isActive
                              ? "sidebar-sublink active"
                              : "sidebar-sublink"
                          }
                          onClick={onNavigate}
                        >
                          <ChildIcon
                            size={16}
                            className={child.color}
                          />

                          <span>{child.name}</span>
                        </NavLink>
                      );
                    })}

                  </div>
                )}

              </div>
            );
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={onNavigate}
            >
              <Icon
                size={20}
                className={item.color}
              />

              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

    </aside>
  );
}

export default Sidebar;