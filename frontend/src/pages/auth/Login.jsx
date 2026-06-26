import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import "./Login.css";
import logo from "../../assets/logo_ob.jpg";
import loginIllustration from "../../assets/bili.png";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

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
      localStorage.setItem("is_superuser", data.is_superuser);

      navigate("/dashboard");
    } catch (error) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-container">
      {/* LEFT SIDE - form */}
      <div className="login-left">
        <div className="login-left-inner">
          <div className="login-brand">
            <img src={logo} alt="Opinion Bunch" className="brand-logo" />
            <span className="brand-name">Opinion Bunch</span>
          </div>

          <div className="login-form-card">
          <form className="login-card" onSubmit={handleSubmit}>
            <h1>Welcome back</h1>
            <p className="subtitle">Login to continue</p>

            {error && <div className="error-box">{error}</div>}

            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((s) => !s)}
                  tabIndex={-1}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <button type="submit" className="primary-btnn full-btn">
              Sign in
            </button>
          </form>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - illustration */}
      <div className="login-right">
        <img
          src={loginIllustration}
          alt="Login illustration"
          className="login-illustration"
        />
      </div>
    </div>
  );
}

export default Login;
