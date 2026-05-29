// import { Menu } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// function Topbar({ toggleSidebar }) {
//   const navigate = useNavigate();

//   const username =
//     localStorage.getItem("username") || "Admin";

//   const handleLogout = () => {
//     localStorage.removeItem("access_token");
//     localStorage.removeItem("refresh_token");
//     localStorage.removeItem("username");

//     navigate("/login");
//   };

//   return (
//     <header className="topbar">
//       <div className="topbar-left">
//         <button
//           className="sidebar-toggle-btn"
//           onClick={toggleSidebar}
//         >
//           <Menu size={22} />
//         </button>

//         <div>
//           <h2>Survey Management System</h2>
//           <p>
//             Client, Vendor, Project and Respondent Tracking
//           </p>
//         </div>
//       </div>

//       <div
//         style={{
//           display: "flex",
//           alignItems: "center",
//           gap: "15px",
//         }}
//       >
//         <span
//           style={{
//             fontWeight: "600",
//             color: "#374151",
//           }}
//         >
//           Welcome, {username}
//         </span>

//         <button
//           className="logout-btn"
//           onClick={handleLogout}
//         >
//           Logout
//         </button>
//       </div>
//     </header>
//   );
// }

// export default Topbar;

import { useNavigate } from "react-router-dom";

function Topbar() {
  const navigate = useNavigate();

  const username = localStorage.getItem("username") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");

    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <h2>Survey Management System</h2>
          <p>Client, Vendor, Project and Respondent Tracking</p>
        </div>
      </div>

      <div className="topbar-user">
        <span>Welcome, {username}</span>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Topbar;