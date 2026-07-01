
import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

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

        <div className="page-content">
          {children}
        </div>

        <Footer />
      </main>
    </div>
  );
}

export default MainLayout;