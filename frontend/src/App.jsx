import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Gallery from "./pages/Gallery";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Routes>
      <Route
        path="/register"
        element={token ? <Navigate to="/gallery" replace /> : <Register />}
      />
      <Route
        path="/login"
        element={token ? <Navigate to="/gallery" replace /> : <Login onLogin={handleLogin} />}
      />
      <Route
        path="/gallery"
        element={token ? <Gallery onLogout={handleLogout} /> : <Navigate to="/login" replace />}
      />
      <Route
        path="*"
        element={<Navigate to={token ? "/gallery" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;
