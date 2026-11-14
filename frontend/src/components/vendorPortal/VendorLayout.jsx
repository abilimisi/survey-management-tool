
import { useState } from "react";
import { Outlet } from "react-router-dom";
import VendorNavbar from "../../pages/vendorPortal/VendorNavbar";

function VendorLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed((current) => !current);
  };

  return (
    <div
      className={`vendor-layout-root ${
        sidebarCollapsed ? "vendor-sidebar-is-collapsed" : ""
      }`}
    >
      <VendorNavbar />

      <Outlet
        context={{
          sidebarCollapsed,
          toggleSidebar,
        }}
      />
    </div>
  );
}

export default VendorLayout;
