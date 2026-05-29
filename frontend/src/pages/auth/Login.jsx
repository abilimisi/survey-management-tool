import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser(formData.username, formData.password);

      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      localStorage.setItem("username", formData.username);

      navigate("/dashboard");
    } catch (error) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Survey Tool</h1>
        <p>Login to continue</p>

        {error && <div className="error-box">{error}</div>}

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            name="username"
            required
            value={formData.username}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="primary-btn full-btn">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;