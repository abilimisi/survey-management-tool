import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  ClipboardList,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  UserRound,
  Store,
  BookOpen,
  ClipboardCheck,
   ContactRound,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { isAdmin } from "../../pages/utils/auth";

import "./Sidebar.css";

function Sidebar({ isCollapsed, toggleSidebar, onNavigate }) {
  const isSuperuser = isAdmin();

  // Each dropdown has its own open/close state.
  const [openMenus, setOpenMenus] = useState({
    "DIY Clients": true,
    "DIY Vendors": true,
    Analytics: true,
  });

  const menuItems = [
    // =================================
    // INTERNAL PANEL
    // =================================
    { type: "section", name: "INTERNAL PANEL" },

    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      color: "icon-blue",
    },

    // Internal clients only
    {
      name: "Clients",
      path: "/clients",
      icon: Building2,
      color: "icon-purple",
    },

    // Internal vendors only
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
      icon: ContactRound,
      color: "icon-teal",
    },

    // =================================
    // DIY PORTAL
    // =================================
    { type: "section", name: "DIY PORTAL" },

    // DIY CLIENTS
    {
      name: "DIY Clients",
      path: "/clients/registered",
      icon: ClipboardList,
      color: "icon-teal",
      children: [
        ...(isSuperuser
          ? [
              {
                name: "Registered Clients",
                path: "/clients/registered",
                icon: UserRound,
                color: "icon-purple",
              },
            ]
          : []),

        {
          name: "All Studies",
          path: "/diy/studies",
          icon: BookOpen,
          color: "icon-teal",
        },

        {
          name: "Pending Reviews",
          path: "/diy/reviews",
          icon: ClipboardCheck,
          color: "icon-orange",
        },
      ],
    },

    // DIY VENDORS
    ...(isSuperuser
      ? [
          {
            name: "DIY Vendors",
            path: "/vendors/registered",
            icon: Store,
            color: "icon-orange",
            children: [
              {
                name: "Registered Vendors",
                path: "/vendors/registered",
                icon: UserRound,
                color: "icon-orange",
              },
              {
                name: "Vendor Applications",
                path: "/vendors/applications",
                icon: ClipboardList,
                color: "icon-orange",
              },
            ],
          },
        ]
      : []),

    // =================================
    // ANALYTICS
    // =================================
    { type: "section", name: "ANALYTICS" },

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
  ];

  // Toggle one dropdown without affecting the others.
  const toggleMenu = (menuName) => {
    setOpenMenus((previous) => ({
      ...previous,
      [menuName]: !previous[menuName],
    }));
  };

  const handleParentNavigation = (item) => {
    if (isCollapsed) {
      toggleSidebar();
    }

    if (onNavigate) {
      onNavigate();
    }
  };

  const handleChildNavigation = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>

      {/* SIDEBAR HEADER */}
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

      {/* SIDEBAR MENU */}
      <nav className="sidebar-menu">

        {menuItems.map((item) => {

          // SECTION HEADINGS
          if (item.type === "section") {
            return (
              <div
                key={item.name}
                className="sidebar-section-label"
              >
                {item.name}
              </div>
            );
          }

          const Icon = item.icon;

          // DROPDOWN MENU ITEMS
          if (item.children) {
            return (
              <div key={item.name} className="sidebar-dropdown">

                <div
                  className="sidebar-link sidebar-dropdown-btn"
                  onClick={() => {
                    if (isCollapsed) {
                      toggleSidebar();
                    }

                    toggleMenu(item.name);
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();

                      if (isCollapsed) {
                        toggleSidebar();
                      }

                      toggleMenu(item.name);
                    }
                  }}
                >
                  <div className="analytics-main-link">
                    <Icon
                      size={20}
                      className={item.color}
                    />

                    <span>{item.name}</span>
                  </div>

                  <ChevronRight
                    size={16}
                    className={
                      openMenus[item.name] ? "rotate" : ""
                    }
                  />
                </div>

                {/* SUBMENU */}
                {openMenus[item.name] && !isCollapsed && (
                  <div className="sidebar-submenu">

                    {item.children.map((child) => {
                      const ChildIcon = child.icon;

                      return (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          end
                          className={({ isActive }) =>
                            isActive
                              ? "sidebar-sublink active"
                              : "sidebar-sublink"
                          }
                          onClick={handleChildNavigation}
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

          // NORMAL MENU ITEMS
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end
              className={({ isActive }) =>
                isActive
                  ? "sidebar-link active"
                  : "sidebar-link"
              }
              onClick={onNavigate}
            >
             <Icon
                size={item.name === "Company Contacts" ? 26 : 20}
                strokeWidth={2}
                className={`${item.color} ${
                  item.name === "Company Contacts" ? "company-contact-icon" : ""
                }`}
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