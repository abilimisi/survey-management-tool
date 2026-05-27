// import { LayoutDashboard, Users, Building2, FolderKanban, UserPlus, BarChart3 } from "lucide-react";
// import { NavLink } from "react-router-dom";

// const menuItems = [
//   { name: "Dashboard", path: "/", icon: LayoutDashboard },
//   { name: "Clients", path: "/clients", icon: Building2 },
//   { name: "Vendors", path: "/vendors", icon: Users },
//   { name: "Projects", path: "/projects", icon: FolderKanban },
//   // { name: "Assign Suppliers", path: "/assign-suppliers", icon: UserPlus },
//   { name: "Reports", path: "/reports", icon: BarChart3 },
// ];

// function Sidebar() {
//   return (
//     <aside className="sidebar">
//       <div className="sidebar-logo">
//         Survey Tool
//       </div>

//       <nav className="sidebar-menu">
//         {menuItems.map((item) => {
//           const Icon = item.icon;

//           return (
//             <NavLink
//               key={item.path}
//               to={item.path}
//               className={({ isActive }) =>
//                 isActive ? "sidebar-link active" : "sidebar-link"
//               }
//             >
//               <Icon size={18} />
//               <span>{item.name}</span>
//             </NavLink>
//           );
//         })}
//       </nav>
//     </aside>
//   );
// }

// export default Sidebar;

import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  BarChart3,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Clients", path: "/clients", icon: Building2 },
  { name: "Vendors", path: "/vendors", icon: Users },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Reports", path: "/reports", icon: BarChart3 },
];

function Sidebar({ isCollapsed }) {
  return (
    <aside className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="sidebar-logo">
        {isCollapsed ? "ST" : "Survey Tool"}
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