import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import Footer from "./Footer";

const OVERLAY_BREAKPOINT = 1023; // px — below this, sidebar overlays

function MainLayout({ children }) {

  // On overlay devices: start hidden. On desktop: start open.
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(
    () => window.innerWidth <= OVERLAY_BREAKPOINT
  );

  // Track whether we're in overlay mode right now
  const [isOverlay, setIsOverlay] = useState(
    () => window.innerWidth <= OVERLAY_BREAKPOINT
  );

  // On resize: switch modes and reset sidebar state accordingly
  useEffect(() => {
    const handleResize = () => {
      const overlay = window.innerWidth <= OVERLAY_BREAKPOINT;
      setIsOverlay(overlay);
      // Auto-open on desktop, auto-close on mobile
      setIsSidebarCollapsed(overlay ? true : false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  // Close sidebar when user navigates (clicks a link) — overlay mode only
  const closeSidebarOnNav = useCallback(() => {
    if (isOverlay) setIsSidebarCollapsed(true);
  }, [isOverlay]);

  const showBackdrop = isOverlay && !isSidebarCollapsed;

  return (
    <div
      className={`app-layout ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}
    >
      {/* Sidebar — receives closeSidebarOnNav to wire up nav links */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={toggleSidebar}
        onNavigate={closeSidebarOnNav}
      />

      {/* Dark backdrop — tap to close sidebar on overlay mode */}
      {showBackdrop && (
        <div
          className="sidebar-backdrop"
          onClick={toggleSidebar}
        />
      )}

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
