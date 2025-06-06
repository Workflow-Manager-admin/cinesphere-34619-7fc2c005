import React, { useState, useEffect } from "react";
import "./App.css";
import CineSphereMainContainer from "./CineSphereMainContainer";
import LoginSignup from "./LoginSignup";
import ProtectedRoute from "./ProtectedRoute";

// PUBLIC_INTERFACE
function App() {
  // Determine auth state using localStorage 
  const [auth, setAuth] = useState(() => {
    const storedAuth = localStorage.getItem("cinesphere_auth");
    try {
      if (storedAuth) {
        const parsed = JSON.parse(storedAuth);
        if (parsed && parsed.username) return parsed;
      }
    } catch {}
    return null;
  });

  // On login/signup, receive user object and set auth
  function handleAuth(user) {
    setAuth(user);
  }
  // Allow logout
  function handleLogout() {
    setAuth(null);
    localStorage.removeItem("cinesphere_auth");
  }

  // If not authenticated, render only authentication component (protects all routes/features)
  if (!auth) {
    return <LoginSignup onAuth={handleAuth} />;
  }

  return (
    <div className="app" style={{ background: "#fcfcfc" }}>
      <nav className="navbar" style={{ background: "#1f1f47" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div className="logo" style={{ color: "#f394ff" }}>
              <span className="logo-symbol" style={{ color: "#f394ff" }}>*</span> CineSphere
            </div>
            <div>
              {/* Show user username and logout */}
              <span style={{ color: "#f394ff", marginRight: 18, fontWeight: 500, fontSize: "1rem" }}>
                {auth?.username}
              </span>
              <button
                type="button"
                className="btn"
                style={{
                  background: "#f394ff",
                  color: "#1f1f47",
                  fontWeight: 600,
                  fontSize: "1.01rem",
                  borderRadius: 6,
                  padding: "7px 14px",
                }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div style={{ maxWidth: 1300, margin: "0 auto", paddingTop: 90 }}>
          {/* All container logic is inside ProtectedRoute */}
          <ProtectedRoute isAuthenticated={!!auth}>
            <CineSphereMainContainer />
          </ProtectedRoute>
        </div>
      </main>
    </div>
  );
}

export default App;