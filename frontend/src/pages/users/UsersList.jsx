import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus, Eye } from "lucide-react";
import Swal from "sweetalert2";
import {
  getUsers,
  deleteUser,createUser,updateUser
} from "../../api/userApi";

function UsersList() {
  
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
  username: "",
  password: "",
  role: "viewer",
});

const [editingUser, setEditingUser] = useState(null);
const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {

      const data = await getUsers();

      setUsers(data);

    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

      if (editingUser) {

        await updateUser(
          editingUser.id,
          formData
        );

        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "User updated successfully",
          confirmButtonText: "OK",
        });

      } else {

        await createUser(formData);

        Swal.fire({
          icon: "success",
          title: "Success",
          text: "User created successfully",
          confirmButtonText: "OK",
        });

      }

      await fetchUsers();

      setShowModal(false);

      setEditingUser(null);

      setFormData({
        username: "",
        password: "",
        role: "viewer",
      });

      } catch (error) {
        console.error(error);

        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Something went wrong!",
        });

      } finally {
        setLoading(false);
      }
     };

   

  const handleChange = (e) => {
    setFormData({
        ...formData,
        [e.target.name]: e.target.value,
    });
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

      fetchUsers();

      Swal.fire({
        icon: "success",
        title: "Deleted",
        text: "User deleted successfully",
      });

    } catch (error) {

      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Unable to delete user",
      });

    }

  };

  const handleEditUser = (user) => {

  setEditingUser(user);

  setFormData({
    username: user.username,
    password: "",
    role: user.role,
  });

  setShowModal(true);
};

  return (
    <div>

      <div className="section-header">
        <h3>Users</h3>
        
        <button
            className="add-supplier-btn"
            onClick={() => {

                setEditingUser(null);

                setFormData({
                    username: "",
                    password: "",
                    role: "viewer",
                });

                setShowModal(true);

                }}
        >
            + Add User
        </button>
      </div>

      <table className="custom-table">

        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>

          {users.map((user) => (

            <tr key={user.id}>

              <td>{user.id}</td>

              <td>{user.username}</td>

              <td>{user.role}</td>

              <td>
                {user.is_active
                  ? "Active"
                  : "Inactive"}
              </td>

              <td>
                <div className="table-actions">

                    <button
                    className="icon-btn"
                    title="Edit"
                    onClick={() => handleEditUser(user)}
                    >
                    <Pencil size={16} />
                    </button>

                    <button
                    className="delete-btn"
                    onClick={() => handleDelete(user.id)}
                    title="Delete"
                    >
                    <Trash2 size={16} />
                    </button>
                    

                </div>
              </td>

            </tr>

          ))}

          {users.length === 0 && (
            <tr>
                <td
                colSpan="5"
                style={{ textAlign: "center" }}
                >
                No users found
                </td>
            </tr>
            )}

        </tbody>

      </table>


      {showModal && (
        <div
            className="modal-overlay"
            onClick={() => setShowModal(false)}
        >
            <div
            className="supplier-modal"
            onClick={(e) => e.stopPropagation()}
            >
            <div className="modal-header">
                <h2>
                   {editingUser ? "Edit User" : "Add User"}
                </h2>

                <button
                className="close-btn"
                onClick={() => setShowModal(false)}
                >
                ✕
                </button>
            </div>

            <form onSubmit={handleCreateUser}>

                <div className="form-group">
                <label>Username</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className="form-group">
                <label>Password</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current password"
                />
                </div>

                <div className="form-group">
                <label>Role</label>

                <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                >
                    <option value="pm">PM</option>
                    <option value="sales">Sales</option>
                    <option value="viewer">Viewer</option>
                </select>
                </div>

               <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingUser
                    ? "Update User"
                    : "Save User"}
              </button>

            </form>

            </div>
        </div>
        )}
    </div>
  );
}

export default UsersList;