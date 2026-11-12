import { Outlet } from "react-router-dom";
import VendorNavbar from "../../pages/vendorPortal/VendorNavbar";

function VendorLayout() {
  return (
    <>
      <VendorNavbar />
      <Outlet />
    </>
  );
}

export default VendorLayout;