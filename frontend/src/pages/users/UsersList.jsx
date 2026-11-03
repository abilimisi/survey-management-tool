
import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import {
  getUsers,
  deleteUser,
  createUser,
  updateUser,
} from "../../api/userApi";

const ROLE_OPTIONS = [
  { value: "pm", label: "Project Manager" },
  { value: "sales", label: "Sales" },
  { value: "support", label: "Support" },
  { value: "accounts_pay", label: "Accounts Pay" },
  { value: "account_manager", label: "Account Manager" },
  { value: "panel_manager", label: "Panel Manager" },
  { value: "team_leader", label: "Team Leader" },
  { value: "affiliate_manager", label: "Affiliate Manager" },
  { value: "content_manager", label: "Content Manager" },
  { value: "dashboard_manager", label: "Dashboard Manager" },
  { value: "viewer", label: "Viewer" },
];

const EMPTY_FORM = {
  username: "",
  password: "",
  role: "viewer",
  mobile: "",
  dob: "",
  joining_date: "",
  email: "",
  is_active: true,
};

const getRoleLabel = (role) =>
  ROLE_OPTIONS.find((item) => item.value === role)?.label || role || "No Role";

function UsersList() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Unable to load users:", error);
      Swal.fire("Error", "Unable to load users. Please check your login and API.", "error");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({ ...EMPTY_FORM });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: name === "is_active" ? value === "true" : value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    const username = formData.username.trim();
    const mobile = formData.mobile.trim();
    const email = formData.email.trim();
    const password = formData.password;

    if (!/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
      Swal.fire(
        "Invalid Username",
        "Use 3–30 characters: letters, numbers, or underscores.",
        "warning"
      );
      return;
    }

    if (mobile && !/^\+?[0-9]{10,15}$/.test(mobile)) {
      Swal.fire(
        "Invalid Mobile",
        "Enter 10–15 digits, optionally starting with +.",
        "warning"
      );
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Swal.fire("Invalid Email", "Enter a valid email address.", "warning");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);

    if (formData.dob && formData.dob > today) {
      Swal.fire("Invalid DOB", "Date of birth cannot be in the future.", "warning");
      return;
    }

    if (!editingUser && password.length < 8) {
      Swal.fire(
        "Invalid Password",
        "Password must contain at least 8 characters.",
        "warning"
      );
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        username: formData.username.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
      };

      if (editingUser) {
        if (!payload.password) {
          delete payload.password;
        }

        await updateUser(editingUser.id, payload);
      } else {
        await createUser(payload);
      }

      await fetchUsers();
      closeModal();

      await Swal.fire({
        icon: "success",
        title: "Success",
        text: editingUser
          ? "User updated successfully."
          : "User created successfully.",
      });
    } catch (error) {
      console.error("Unable to save user:", error);

      const responseData = error.response?.data;
      const message =
        responseData?.error ||
        responseData?.detail ||
        (typeof responseData === "string" ? responseData : null) ||
        "Unable to save user. Check the required fields and try again.";

      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: "Are you sure you want to delete this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, Delete",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteUser(id);
      await fetchUsers();

      await Swal.fire(
        "Deleted",
        "User deleted successfully.",
        "success"
      );
    } catch (error) {
      console.error("Unable to delete user:", error);
      Swal.fire(
        "Error",
        error.response?.data?.detail ||
          error.response?.data?.error ||
          "Unable to delete user.",
        "error"
      );
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);

    setFormData({
      username: user.username || "",
      password: "",
      role: user.role || "viewer",
      mobile: user.mobile || "",
      dob: user.dob || "",
      joining_date: user.joining_date || "",
      email: user.email || "",
      is_active: user.is_active ?? true,
    });

    setShowModal(true);
  };

    
  const visibleUsers = users.filter((user) => {
    const isVisible =
      user.username?.toLowerCase() !== "hp" &&
      user.role?.toLowerCase() !== "admin";

    const search = searchTerm.toLowerCase().trim();

    const matchesSearch = [
      user.username,
      user.role,
      user.mobile,
      user.dob,
      user.joining_date,
      user.email,
      user.is_active ? "active" : "inactive",
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(search)
    );

    return isVisible && matchesSearch;
  });

  const totalPages = Math.max(
    1,
    Math.ceil(visibleUsers.length / pageSize)
  );
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedUsers = visibleUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  const maxPageButtons = 5;

  const startPage =
    Math.floor((currentPage - 1) / maxPageButtons) *
      maxPageButtons +
    1;

  const endPage = Math.min(
    startPage + maxPageButtons - 1,
    totalPages
  );

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );


  return (
    <div>
      <div className="section-header">
        <h3>Users</h3>

        <button
          type="button"
          className="add-supplier-btn"
          onClick={() => {
            setEditingUser(null);
            setFormData({ ...EMPTY_FORM });
            setShowModal(true);
          }}
        >
          + Add User
        </button>
      </div>

      <div
        className="users-table-card"
        style={{
          overflowX: "auto",
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
        }}
      >
      
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            padding: "14px 16px",
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
            borderBottom: "none",
            borderRadius: "10px 10px 0 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              color: "#334155",
            }}
          >
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              style={{
                padding: "8px",
                border: "1px solid #dbe2ea",
                borderRadius: "6px",
                backgroundColor: "#fff",
              }}
              aria-label="Entries per page"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries per page</span>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              color: "#334155",
            }}
          >
            <label htmlFor="user-search">Search:</label>
            <input
              id="user-search"
              type="search"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              style={{
                width: "220px",
                maxWidth: "100%",
                padding: "10px 12px",
                border: "1px solid #dbe2ea",
                borderRadius: "6px",
                outlineColor: "#64748b",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        <table
          className="custom-table"
          style={{
            width: "100%",
            borderCollapse: "collapse",
            backgroundColor: "#ffffff",
            fontSize: "13px",
            color: "#1e293b",
          }}
        >
          <thead
            style={{
              backgroundColor: "#e5e7eb",
              color: "#111827",
            }}
          >

            <tr>
              <th
                style={{
                  padding: "12px 14px",
                  textAlign: "left",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid #d1d5db",
                }}>User Group</th>
              <th
                style={{
                  padding: "12px 14px",
                  textAlign: "left",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid #d1d5db",
                }}>Username</th>
              <th
                style={{
                  padding: "12px 14px",
                  textAlign: "left",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid #d1d5db",
                }}>User Mobile</th>
              <th
                style={{
                  padding: "12px 14px",
                  textAlign: "left",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid #d1d5db",
                }}>DOB</th>
              <th
                style={{
                  padding: "12px 14px",
                  textAlign: "left",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid #d1d5db",
                }}>Join Date</th>
              <th
                style={{
                  padding: "12px 14px",
                  textAlign: "left",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid #d1d5db",
                }}>User Email</th>
              <th
                style={{
                  padding: "12px 14px",
                  textAlign: "left",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid #d1d5db",
                }}>User Status</th>
              <th
                style={{
                  padding: "12px 14px",
                  textAlign: "left",
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  borderBottom: "1px solid #d1d5db",
                }}>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((user) => (
              <tr key={user.id}>
                <td style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #e5e7eb",
                  whiteSpace: "nowrap",
                }}>{getRoleLabel(user.role)}</td>
                <td style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #e5e7eb",
                  whiteSpace: "nowrap",
                }}>{user.username}</td>
                <td style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #e5e7eb",
                  whiteSpace: "nowrap",
                }}>{user.mobile || "—"}</td>
                <td style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #e5e7eb",
                  whiteSpace: "nowrap",
                }}>{user.dob || "—"}</td>
                <td style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #e5e7eb",
                  whiteSpace: "nowrap",
                }}>{user.joining_date || "—"}</td>
                <td style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #e5e7eb",
                  whiteSpace: "nowrap",
                }}>{user.email || "—"}</td>
                <td style={{
                  padding: "12px 14px",
                  borderBottom: "1px solid #e5e7eb",
                  whiteSpace: "nowrap",
                }}>{user.is_active ? "Active" : "Inactive"}</td>
                <td>
                  <div className="table-actions">
                    <button
                      type="button"
                      className="icon-btn"
                      title="Edit"
                      onClick={() => handleEditUser(user)}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      type="button"
                      className="delete-btn"
                      title="Delete"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {visibleUsers.length === 0 && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "14px 16px",
          backgroundColor: "#ffffff",
          border: "1px solid #e5e7eb",
          borderTop: "none",
          borderRadius: "0 0 10px 10px",
          fontSize: "13px",
          color: "#475569",
        }}
      >
        <span>
          Showing{" "}
          {visibleUsers.length === 0
            ? 0
            : (currentPage - 1) * pageSize + 1}
          {" "}to{" "}
          {Math.min(currentPage * pageSize, visibleUsers.length)}
          {" "}of {visibleUsers.length} entries
        </span>

        
        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            style={{
              padding: "7px 12px",
              border: "1px solid #dbe2ea",
              borderRadius: "6px",
              background: "#fff",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            Previous
          </button>

          {pageNumbers.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              aria-current={currentPage === page ? "page" : undefined}
              style={{
                minWidth: "34px",
                padding: "7px 10px",
                border: "1px solid",
                borderColor: currentPage === page ? "#111827" : "#dbe2ea",
                borderRadius: "6px",
                background: currentPage === page ? "#111827" : "#fff",
                color: currentPage === page ? "#fff" : "#334155",
                cursor: "pointer",
                fontWeight: currentPage === page ? 600 : 400,
              }}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            style={{
              padding: "7px 12px",
              border: "1px solid #dbe2ea",
              borderRadius: "6px",
              background: "#fff",
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
              opacity: currentPage >= totalPages ? 0.5 : 1,
            }}
          >
            Next
          </button>
        </div>

      </div>


      {showModal && (
        <div
          className="modal-overlay"
          onClick={closeModal}
        >
          <div
            className="supplier-modal"
            style={{
              width: "min(900px, 95vw)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px 32px",
              boxSizing: "border-box",
              borderRadius: "16px",
              backgroundColor: "#ffffff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
           
            <div
              className="modal-header"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "4px 0 20px",
                marginBottom: "24px",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "21px",
                  fontWeight: 700,
                  color: "#1f2937",
                }}
              >
                {editingUser ? "Edit User" : "Add User"}
              </h2>

              <button
                type="button"
                className="close-btn"
                onClick={closeModal}
                aria-label="Close user form"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "36px",
                  height: "36px",
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  fontSize: "25px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>


            <form onSubmit={handleCreateUser}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label>Group Member *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    {ROLE_OPTIONS.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    autoComplete="username"
                    minLength={3}
                    maxLength={30}
                    pattern="[a-zA-Z0-9_]+"
                    title="Use 3–30 characters: letters, numbers, and underscores only."
                    placeholder="e.g. john_smith"
                    required
                  />

                </div>

                <div className="form-group">
                  <label>User Mobile</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    maxLength={16}
                    pattern="\+?[0-9]{10,15}"
                    title="Enter 10–15 digits, optionally starting with +."
                    placeholder="e.g. +919876543210"
                  />

                </div>

                <div className="form-group">
                  <label>DOB</label>
                  
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    max={new Date().toISOString().slice(0, 10)}
                  />

                </div>

                <div className="form-group">
                  <label>Join Date</label>
                 
                  <input
                    type="date"
                    name="joining_date"
                    value={formData.joining_date}
                    onChange={handleChange}
                  />

                </div>

                <div className="form-group">
                  <label>User Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Password {editingUser ? "(leave blank to keep current)" : "*"}
                  </label>
                  
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                    minLength={8}
                    placeholder={
                      editingUser
                        ? "Leave blank to keep current password"
                        : "Enter at least 8 characters"
                    }
                    required={!editingUser}
                  />

                </div>

                <div className="form-group">
                  <label>User Status *</label>
                  <select
                    name="is_active"
                    value={String(formData.is_active)}
                    onChange={handleChange}
                    required
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "24px",
                }}
              >
                <button
                  type="submit"
                  className="primary-btn"
                  disabled={loading}
                  style={{
                    backgroundColor: "#111827",
                    color: "#ffffff",
                    border: "1px solid #111827",
                    borderRadius: "10px",
                    padding: "10px 22px",
                    fontSize: "15px",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading
                    ? "Saving..."
                    : editingUser
                      ? "Update User"
                      : "Save"}
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#ef4444",
                    border: "1px solid #ef4444",
                    borderRadius: "10px",
                    padding: "10px 22px",
                    fontSize: "15px",
                    fontWeight: 500,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersList;
