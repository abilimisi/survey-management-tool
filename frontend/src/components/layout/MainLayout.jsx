// import Sidebar from "./Sidebar";
// import Topbar from "./Topbar";

// function MainLayout({ children }) {
//   return (
//     <div className="app-layout">
//       <Sidebar />

//       <main className="main-section">
//         <Topbar />
//         <div className="page-content">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// }

// export default MainLayout;


import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function MainLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`app-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      <Sidebar isCollapsed={isSidebarCollapsed}
      toggleSidebar={toggleSidebar} />

      <main className="main-section">
        <Topbar toggleSidebar={toggleSidebar} />
        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

export default MainLayout;