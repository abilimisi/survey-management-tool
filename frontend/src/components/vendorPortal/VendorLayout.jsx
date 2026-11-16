
import { useState } from "react";
import { Outlet } from "react-router-dom";

import VendorNavbar from "../../pages/vendorPortal/VendorNavbar";
import Footer from "../layout/Footer";

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

      <div className="vendor-layout-outlet">
        <Outlet
          context={{
            sidebarCollapsed,
            toggleSidebar,
          }}
        />
      </div>

      <Footer />
    </div>
  );
}

export default VendorLayout;
