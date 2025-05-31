import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const API_URL = 'http://51.21.245.98:4000'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      onLogin(res.data.token);
      alert("Login successful");
      navigate("/gallery");
    } catch (e) {
      alert(e.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="input-field"
      />
      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="input-field"
      />
      <button onClick={login} className="btn">
        Login
      </button>
      <p>
        Don't have an account? <Link to="/register">Register here</Link>.
      </p>
    </div>
  );
}
