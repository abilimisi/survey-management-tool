import { Outlet } from "react-router-dom";

import ClientPortalRoute from "../../pages/clientPortal/ClientPortalRoute";
import ClientPortalNavbar from "./ClientPortalNavbar";

export default function ClientPortalLayout() {
  return (
    <ClientPortalRoute>
      <div className="client-portal-layout">
        <ClientPortalNavbar />

        <main className="client-portal-main">
          <Outlet />
        </main>
      </div>
    </ClientPortalRoute>
  );
}