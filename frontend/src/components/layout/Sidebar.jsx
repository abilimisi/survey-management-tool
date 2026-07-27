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
  const [openMenu, setOpenMenu] = useState("Analytics");
  const isSuperuser = localStorage.getItem("is_superuser") === "true";

  const menuItems = [
    { name: "Dashboard",        path: "/dashboard",        icon: LayoutDashboard },
    { name: "Clients",          path: "/clients",          icon: Building2 },
    { name: "Vendors",          path: "/vendors",          icon: Users },
    { name: "Projects",         path: "/projects",         icon: FolderKanban },
    { name: "Reports",          path: "/reports",          icon: BarChart3 },
    { name: "Panelists",        path: "/panelists",        icon: Users },
    { name: "Panel Campaigns",  path: "/panel-campaigns",  icon: FolderKanban },
    { name: "Company Contacts", path: "/company-contacts", icon: Building2 },
    { name: "Analytics", icon: BarChart3,
      children: [
        {
          name: "Dashboard",
          path: "/analytics",
          icon: BarChart3,
        },
        {
          name: "Project Analytics",
          path: "/analytics/projects",
          icon: FolderKanban,
        },
        {
          name: "Vendor Analytics",
          path: "/analytics/vendors",
          icon: Users,
        },
      ],
    },

    ...(isSuperuser
      ? [{ name: "Users", path: "/users", icon: Users }]
      : []),
  ];

  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>

      <div className="sidebar-header">
        <div className="sidebar-logo">Survey Tool</div>

        {/* Internal collapse btn — only visible on desktop (hidden via CSS on mobile) */}
        <button
          className="sidebar-collapse-btn"
          onClick={toggleSidebar}
          aria-label="Collapse sidebar"
        >
          {isCollapsed
            ? <ChevronRight size={18} />
            : <ChevronLeft size={18} />
          }
        </button>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => {

  const Icon = item.icon;

  if (item.children) {
    return (
      <div key={item.name} className="sidebar-dropdown">

        <button
          className="sidebar-link sidebar-dropdown-btn"
          onClick={() =>
            setOpenMenu(
              openMenu === item.name
                ? ""
                : item.name
            )
          }
        >
          <Icon size={20}/>
          <span>{item.name}</span>

          <ChevronRight
            size={16}
            className={
              openMenu === item.name
                ? "rotate"
                : ""
            }
          />
        </button>

        {openMenu === item.name && (

          <div className="sidebar-submenu">

            {item.children.map((child)=>{

              const ChildIcon = child.icon;

              return (

                <NavLink
                  key={child.path}
                  to={child.path}
                  className={({isActive}) =>
                    isActive
                      ? "sidebar-sublink active"
                      : "sidebar-sublink"
                  }
                >
                  <ChildIcon size={16}/>
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
      className={({isActive}) =>
        isActive
          ? "sidebar-link active"
          : "sidebar-link"
      }
      onClick={onNavigate}
    >
      <Icon size={20}/>
      <span>{item.name}</span>
    </NavLink>

  );

})}
      </nav>

    </aside>
  );
}

export default Sidebar;
