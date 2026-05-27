// function Topbar() {
//   return (
//     <header className="topbar">
//       <div>
//         <h2>Survey Management System</h2>
//         <p>Client, Vendor, Project and Respondent Tracking</p>
//       </div>

//       <div className="topbar-user">
//         Admin
//       </div>
//     </header>
//   );
// }

// export default Topbar;


import { Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Topbar({ toggleSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <Menu size={22} />
        </button>

        <div>
          <h2>Survey Management System</h2>
          <p>Client, Vendor, Project and Respondent Tracking</p>
        </div>
      </div>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </header>
  );
}

export default Topbar;