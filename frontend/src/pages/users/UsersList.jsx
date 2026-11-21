import { useEffect, useState } from "react";
import { Pencil, Trash2, ShieldCheck, ShieldOff } from "lucide-react";
import Swal from "sweetalert2";
import {
  getUsers,
  deleteUser,
  createUser,
  updateUser,
} from "../../api/userApi";
import {
  getDIYAccessGrants,
  grantDIYAdminAccess,
  revokeDIYAdminAccess,
} from "../../api/diyAdminApi";

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

const unwrapList = (data) =>
  Array.isArray(data) ? data : data?.results || [];

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString() : "—";

const getGrantStatus = (user, grant) => {
  if (user.is_superuser)
    return { label: "Permanent Access", color: "#166534", bg: "#dcfce7" };

  if (!grant)
    return { label: "No Access", color: "#64748b", bg: "#f1f5f9" };

  if (grant.revoked_at || grant.is_active === false)
    return { label: "Revoked", color: "#991b1b", bg: "#fee2e2" };

  if (grant.expires_at) {
    const expiry = new Date(grant.expires_at);

    if (expiry <= new Date())
      return { label: "Expired", color: "#92400e", bg: "#fef3c7" };

    const daysLeft = (expiry - new Date()) / 86400000;

    if (daysLeft <= 7)
      return { label: "Expires Soon", color: "#92400e", bg: "#fef3c7" };
  }

  return { label: "Active Access", color: "#166534", bg: "#dcfce7" };
};

const getGrantRecordStatus = (grant) => {
  if (grant.revoked_at || grant.is_active === false) {
    return {
      label: "Revoked",
      color: "#991b1b",
      bg: "#fee2e2",
    };
  }

  if (grant.expires_at && new Date(grant.expires_at) <= new Date()) {
    return {
      label: "Expired",
      color: "#92400e",
      bg: "#fef3c7",
    };
  }

  if (!grant.expires_at) {
    return {
      label: "Permanent",
      color: "#166534",
      bg: "#dcfce7",
    };
  }

  return {
    label: "Active",
    color: "#166534",
    bg: "#dcfce7",
  };
};

const buttonStyle = {
  padding: "7px 10px",
  border: "1px solid #cbd5e1",
  borderRadius: "6px",
  background: "#fff",
  color: "#334155",
  fontSize: "12px",
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const fieldStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #dbe2ea",
  borderRadius: "7px",
  boxSizing: "border-box",
};

const tableCellStyle = {
  padding: "12px 14px",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const tableHeaderStyle = {
  padding: "12px 14px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  whiteSpace: "nowrap",
  borderBottom: "1px solid #d1d5db",
};

function UsersList() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // DIY Admin access state
  const [grants, setGrants] = useState([]);
  const [grantModalUser, setGrantModalUser] = useState(null);
  const [grantExpiry, setGrantExpiry] = useState("");
  const [grantExpiryMode, setGrantExpiryMode] = useState("none");
  const [grantNotes, setGrantNotes] = useState("");
  const [grantSaving, setGrantSaving] = useState(false);
  const [showDIYAccessManagement, setShowDIYAccessManagement] = useState(false);
  const [accessHistorySearch, setAccessHistorySearch] = useState("");
  const [accessHistoryFilter, setAccessHistoryFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
    fetchGrants();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : data?.results || []);
    } catch (error) {
      console.error("Unable to load users:", error);
      Swal.fire(
        "Error",
        "Unable to load users. Please check your login and API.",
        "error"
      );
    }
  };

  const fetchGrants = async () => {
    try {
      const data = await getDIYAccessGrants();
      setGrants(unwrapList(data));
    } catch (error) {
      console.error("Unable to load DIY Admin grants:", error);
      Swal.fire(
        "Access Data Error",
        "Unable to load DIY Admin access grants.",
        "error"
      );
    }
  };

  // Latest grant record for each user
  const latestGrantByUser = users.reduce((map, user) => {
    const userGrants = grants
      .filter((grant) => Number(grant.user_id) === Number(user.id))
      .sort(
        (a, b) =>
          new Date(b.granted_at || 0) - new Date(a.granted_at || 0)
      );

    if (userGrants.length) map[user.id] = userGrants[0];
    return map;
  }, {});

  const openGrantModal = (user) => {
    setGrantModalUser(user);
    setGrantExpiry("");
    setGrantExpiryMode("none");
    setGrantNotes("");
  };

  const handleGrantAccess = async (e) => {
    e.preventDefault();
    if (!grantModalUser) return;

    if (
      grantExpiryMode !== "none" &&
      (!grantExpiry || new Date(grantExpiry) <= new Date())
    ) {
      Swal.fire("Invalid Expiry", "Choose a future expiry date and time.", "warning");
      return;
    }

    setGrantSaving(true);

    try {
      const expiresAt =
        grantExpiryMode === "none"
          ? null
          : new Date(grantExpiry).toISOString();

      await grantDIYAdminAccess({
        userId: grantModalUser.id,
        expiresAt,
        notes: grantNotes.trim(),
      });

      await fetchGrants();
      setGrantModalUser(null);

      await Swal.fire({
        icon: "success",
        title: "Access Granted",
        text: `DIY Admin access granted to ${grantModalUser.username}.`,
      });
    } catch (error) {
      const data = error.response?.data;
      const message =
        data?.detail ||
        data?.error ||
        (typeof data === "string"
          ? data
          : "Unable to grant DIY Admin access.");

      Swal.fire("Unable to Grant Access", message, "error");
    } finally {
      setGrantSaving(false);
    }
  };

  const handleRevokeAccess = async (user, grant) => {
    if (!grant?.id) return;

    const result = await Swal.fire({
      title: "Revoke DIY Admin Access?",
      html: `
        <p>Remove DIY Admin access from 
          <strong>${user?.username || grant.username}</strong>?
        </p>
        <p style="font-size:13px;color:#64748b">
          Access will be removed immediately, even if the grant has a future expiry date.
          The user's normal account, role, and other permissions will remain unchanged.
        </p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Revoke Access",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Cancel",
      cancelButtonColor: "#64748b",

      // Fix popup stacking directly with inline styles
      didOpen: () => {
        const container = Swal.getContainer();

        if (container) {
          container.style.setProperty("z-index", "999999", "important");
        }

        const popup = Swal.getPopup();

        if (popup) {
          popup.style.setProperty("z-index", "999999", "important");
        }
      },
    });

    if (!result.isConfirmed) return;

    try {
      await revokeDIYAdminAccess(grant.id);
      await fetchGrants();

      await Swal.fire({
        icon: "success",
        title: "Access Revoked",
        text: "DIY Admin access has been removed. Normal internal access remains unchanged.",
        confirmButtonColor: "#2563eb",
        didOpen: () => {
          const container = Swal.getContainer();

          if (container) {
            container.style.setProperty("z-index", "999999", "important");
          }
        },
      });
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.response?.data?.detail || "Unable to revoke access.",
        icon: "error",
        confirmButtonColor: "#2563eb",
        didOpen: () => {
          const container = Swal.getContainer();

          if (container) {
            container.style.setProperty("z-index", "999999", "important");
          }
        },
      });
    }
  };
  // Existing User CRUD
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
        username: username,
        email,
        mobile,
      };

      if (editingUser) {
        if (!payload.password) delete payload.password;
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

      await Swal.fire("Deleted", "User deleted successfully.", "success");
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
      getGrantStatus(user, latestGrantByUser[user.id]).label,
    ].some((value) => String(value ?? "").toLowerCase().includes(search));

    return isVisible && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(visibleUsers.length / pageSize));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const paginatedUsers = visibleUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const maxPageButtons = 5;
  const startPage =
    Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons + 1;
  const endPage = Math.min(startPage + maxPageButtons - 1, totalPages);

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
  );

  const filteredGrantHistory = grants
    .filter((grant) => {
      const status = getGrantRecordStatus(grant).label;

      const matchesFilter =
        accessHistoryFilter === "all" ||
        status.toLowerCase() === accessHistoryFilter.toLowerCase();

      const search = accessHistorySearch.toLowerCase().trim();

      const matchesSearch = [
        grant.username,
        grant.user_email,
        grant.granted_by_username,
        grant.revoked_by_username,
        grant.notes,
        status,
      ].some((value) =>
        String(value || "").toLowerCase().includes(search)
      );

      return matchesFilter && matchesSearch;
    })
    .sort(
      (a, b) =>
        new Date(b.granted_at || 0) -
        new Date(a.granted_at || 0)
    );

  return (
    <div>
      <div className="section-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <h3 style={{ margin: 0 }}>Users</h3>

          <button
            type="button"
            onClick={() => setShowDIYAccessManagement(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "7px",
              padding: "9px 13px",
              border: "1px solid #c7d2fe",
              borderRadius: "8px",
              background: "#eef2ff",
              color: "#3730a3",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <span>🛡️</span>
            DIY Access Management
          </button>
        </div>

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
              {[5, 10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
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
          <thead style={{ backgroundColor: "#e5e7eb", color: "#111827" }}>
            <tr>
              {[
                "User Group",
                "Username",
                "User Mobile",
                "DOB",
                "Join Date",
                "User Email",
                "User Status",
                "DIY Admin Access",
                "Action",
              ].map((header) => (
                <th key={header} style={tableHeaderStyle}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {paginatedUsers.map((user) => {
              const grant = latestGrantByUser[user.id];
              const accessStatus = getGrantStatus(user, grant);
              const hasRevokableGrant =
                grant &&
                !grant.revoked_at &&
                grant.is_active !== false &&
                !user.is_superuser &&
                (!grant.expires_at || new Date(grant.expires_at) > new Date());

              return (
                <tr key={user.id}>
                  <td style={tableCellStyle}>{getRoleLabel(user.role)}</td>
                  <td style={tableCellStyle}>{user.username}</td>
                  <td style={tableCellStyle}>{user.mobile || "—"}</td>
                  <td style={tableCellStyle}>{user.dob || "—"}</td>
                  <td style={tableCellStyle}>{user.joining_date || "—"}</td>
                  <td style={tableCellStyle}>{user.email || "—"}</td>
                  <td style={tableCellStyle}>
                    {user.is_active ? "Active" : "Inactive"}
                  </td>

                  {/* DIY Admin Access */}
                  <td style={tableCellStyle}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "7px",
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          padding: "5px 9px",
                          borderRadius: "20px",
                          background: accessStatus.bg,
                          color: accessStatus.color,
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        {user.is_superuser ? (
                          <ShieldCheck size={13} />
                        ) : accessStatus.label === "Revoked" ||
                          accessStatus.label === "Expired" ||
                          accessStatus.label === "No Access" ? (
                          <ShieldOff size={13} />
                        ) : (
                          <ShieldCheck size={13} />
                        )}
                        {accessStatus.label}
                      </span>

                      {!user.is_superuser && (
                        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                          {hasRevokableGrant ? (
                            <>
                              <button
                                type="button"
                                style={buttonStyle}
                                onClick={() => openGrantModal(user)}
                              >
                                Manage
                              </button>
                              <button
                                type="button"
                                style={{
                                  ...buttonStyle,
                                  color: "#b91c1c",
                                  borderColor: "#fecaca",
                                }}
                                onClick={() => handleRevokeAccess(user, grant)}
                              >
                                Revoke
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              style={{
                                ...buttonStyle,
                                color: "#166534",
                                borderColor: "#bbf7d0",
                              }}
                              onClick={() => openGrantModal(user)}
                            >
                              {grant ? "Grant Again" : "Grant Access"}
                            </button>
                          )}
                        </div>
                      )}

                      {grant && (
                        <span style={{ fontSize: "10px", color: "#64748b" }}>
                          Granted: {formatDateTime(grant.granted_at)}
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={tableCellStyle}>
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
              );
            })}

            {visibleUsers.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: "center", padding: "24px" }}>
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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
            : (currentPage - 1) * pageSize + 1}{" "}
          to {Math.min(currentPage * pageSize, visibleUsers.length)} of{" "}
          {visibleUsers.length} entries
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            style={{
              ...buttonStyle,
              opacity: currentPage === 1 ? 0.5 : 1,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
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
                ...buttonStyle,
                minWidth: "34px",
                borderColor: currentPage === page ? "#111827" : "#dbe2ea",
                background: currentPage === page ? "#111827" : "#fff",
                color: currentPage === page ? "#fff" : "#334155",
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
              ...buttonStyle,
              opacity: currentPage >= totalPages ? 0.5 : 1,
              cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Existing Add/Edit User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
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
              <h2 style={{ margin: 0, fontSize: "21px", fontWeight: 700, color: "#1f2937" }}>
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
                ×
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

      {/* DIY Admin Access Grant Modal */}
      {grantModalUser && (
        <div className="modal-overlay" onClick={() => setGrantModalUser(null)}>
          <div
            className="supplier-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(560px, 95vw)",
              padding: "26px",
              borderRadius: "16px",
              background: "#fff",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "20px", color: "#111827" }}>
                  DIY Admin Access
                </h2>
                <p style={{ margin: "6px 0 0", color: "#64748b", fontSize: "13px" }}>
                  Grant elevated access to <strong>{grantModalUser.username}</strong> without changing their internal role.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setGrantModalUser(null)}
                aria-label="Close"
                style={{
                  border: 0,
                  background: "transparent",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleGrantAccess}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "7px" }}>
                  Access Duration
                </label>

                <select
                  value={grantExpiryMode}
                  onChange={(e) => {
                    const mode = e.target.value;
                    setGrantExpiryMode(mode);

                    if (["7", "30", "90"].includes(mode)) {
                      setGrantExpiry(
                        new Date(Date.now() + Number(mode) * 86400000)
                          .toISOString()
                          .slice(0, 16)
                      );
                    } else {
                      setGrantExpiry("");
                    }
                  }}
                  style={fieldStyle}
                >
                  <option value="none">No expiry — until revoked</option>
                  <option value="7">7 days</option>
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="custom">Custom date and time</option>
                </select>
              </div>

              {grantExpiryMode !== "none" && (
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "7px" }}>
                    Expiry Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    required
                    value={grantExpiry}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setGrantExpiry(e.target.value)}
                    style={fieldStyle}
                  />
                </div>
              )}

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, marginBottom: "7px" }}>
                  Notes / Reason
                </label>

                <textarea
                  value={grantNotes}
                  onChange={(e) => setGrantNotes(e.target.value)}
                  rows={3}
                  maxLength={500}
                  placeholder="Why is this access being granted? (optional)"
                  style={{ ...fieldStyle, resize: "vertical" }}
                />
              </div>

              {latestGrantByUser[grantModalUser.id] && (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "9px",
                    padding: "12px",
                    fontSize: "12px",
                    color: "#475569",
                    marginBottom: "18px",
                  }}
                >
                  <strong>Previous grant history</strong>

                  <div style={{ marginTop: "6px" }}>
                    Granted by:{" "}
                    {latestGrantByUser[grantModalUser.id].granted_by_username || "—"}
                  </div>

                  <div>
                    Granted:{" "}
                    {formatDateTime(
                      latestGrantByUser[grantModalUser.id].granted_at
                    )}
                  </div>

                  <div>
                    Expires:{" "}
                    {formatDateTime(
                      latestGrantByUser[grantModalUser.id].expires_at
                    )}
                  </div>

                  <div>
                    Notes:{" "}
                    {latestGrantByUser[grantModalUser.id].notes || "—"}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setGrantModalUser(null)}
                  style={buttonStyle}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={grantSaving}
                  style={{
                    padding: "10px 18px",
                    border: "1px solid #111827",
                    borderRadius: "8px",
                    background: "#111827",
                    color: "#fff",
                    fontWeight: 600,
                    cursor: grantSaving ? "wait" : "pointer",
                  }}
                >
                  {grantSaving ? "Granting..." : "Grant DIY Admin Access"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDIYAccessManagement && (
        <div
          className="modal-overlay"
          onClick={() => setShowDIYAccessManagement(false)}
        >
          <div
            className="supplier-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(1200px, 96vw)",
              maxHeight: "90vh",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              padding: "24px",
              borderRadius: "16px",
              background: "#ffffff",
              boxSizing: "border-box",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "16px",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "16px",
                marginBottom: "18px",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "21px", color: "#111827" }}>
                  DIY Admin Access Management
                </h2>

                <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#64748b" }}>
                  Track every access grant, expiry, and revocation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDIYAccessManagement(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: "26px",
                  color: "#64748b",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            {/* Filters */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "12px",
                marginBottom: "16px",
              }}
            >
              <input
                type="search"
                placeholder="Search username, email, admin, notes..."
                value={accessHistorySearch}
                onChange={(e) => setAccessHistorySearch(e.target.value)}
                style={{
                  flex: "1 1 260px",
                  padding: "10px 12px",
                  border: "1px solid #dbe2ea",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                }}
              />

              <select
                value={accessHistoryFilter}
                onChange={(e) => setAccessHistoryFilter(e.target.value)}
                style={{
                  padding: "10px 12px",
                  border: "1px solid #dbe2ea",
                  borderRadius: "8px",
                  background: "#ffffff",
                }}
              >
                <option value="all">All Grants</option>
                <option value="active">Active</option>
                <option value="permanent">Permanent</option>
                <option value="expired">Expired</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>

            {/* Grant history table */}
            <div
              style={{
                overflow: "auto",
                flex: 1,
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "900px",
                  fontSize: "13px",
                }}
              >
                <thead style={{ background: "#f8fafc", position: "sticky", top: 0 }}>
                  <tr>
                    {[
                      "User",
                      "Granted By",
                      "Granted Date",
                      "Expiry",
                      "Status",
                      "Notes",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          borderBottom: "1px solid #e5e7eb",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredGrantHistory.map((grant) => {
                    const status = getGrantRecordStatus(grant);

                    const revokeAvailable =
                      status.label === "Active" ||
                      status.label === "Permanent";

                    const grantUser = users.find(
                      (user) => Number(user.id) === Number(grant.user_id)
                    );

                    return (
                      <tr key={grant.id}>
                        <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9" }}>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>
                            {grant.username || "Unknown User"}
                          </div>
                          <div style={{ color: "#64748b", fontSize: "12px" }}>
                            {grant.user_email || "—"}
                          </div>
                        </td>

                        <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9" }}>
                          {grant.granted_by_username || "—"}
                        </td>

                        <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                          {formatDateTime(grant.granted_at)}
                        </td>

                        <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                          {grant.expires_at
                            ? formatDateTime(grant.expires_at)
                            : "No expiry"}
                        </td>

                        <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "5px 9px",
                              borderRadius: "999px",
                              background: status.bg,
                              color: status.color,
                              fontSize: "11px",
                              fontWeight: 600,
                            }}
                          >
                            {status.label}
                          </span>

                          {grant.revoked_by_username && (
                            <div style={{ marginTop: "5px", fontSize: "11px", color: "#64748b" }}>
                              Revoked by: {grant.revoked_by_username}
                            </div>
                          )}

                          {grant.revoked_at && (
                            <div style={{ marginTop: "3px", fontSize: "11px", color: "#64748b" }}>
                              {formatDateTime(grant.revoked_at)}
                            </div>
                          )}
                        </td>

                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #f1f5f9",
                            maxWidth: "220px",
                          }}
                        >
                          {grant.notes || "—"}
                        </td>

                        <td style={{ padding: "12px", borderBottom: "1px solid #f1f5f9" }}>
                          {revokeAvailable && (
                            <button
                              type="button"
                              onClick={() => handleRevokeAccess(grantUser, grant)}
                              style={{
                                padding: "7px 11px",
                                border: "1px solid #fecaca",
                                borderRadius: "7px",
                                background: "#fff1f2",
                                color: "#b91c1c",
                                fontWeight: 600,
                                fontSize: "12px",
                                cursor: "pointer",
                              }}
                            >
                              Revoke
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}

                  {filteredGrantHistory.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        style={{
                          padding: "35px",
                          textAlign: "center",
                          color: "#64748b",
                        }}
                      >
                        No access grants found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                marginTop: "16px",
                flexWrap: "wrap",
              }}
            >
              <span style={{ fontSize: "12px", color: "#64748b" }}>
                Showing {filteredGrantHistory.length} access grant record(s)
              </span>

              <button
                type="button"
                onClick={() => setShowDIYAccessManagement(false)}
                style={{
                  padding: "9px 16px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "#ffffff",
                  color: "#334155",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersList;