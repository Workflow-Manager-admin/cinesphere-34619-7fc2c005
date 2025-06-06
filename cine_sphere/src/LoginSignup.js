import React, { useState } from "react";
import "./App.css";

// Helper: defaults for themed colors
const THEME = {
  primary: "#1f1f47",
  accent: "#fcfcfc",
  secondary: "#f394ff",
};

function validateEmail(email) {
  // Very basic email 'validation'
  return /\S+@\S+\.\S+/.test(email);
}

// PUBLIC_INTERFACE
function LoginSignup({ onAuth }) {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwRepeat, setPwRepeat] = useState("");
  const [error, setError] = useState("");

  // Simulate sign-up: save to localStorage
  function handleSignup(e) {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Invalid email address.");
      return;
    }
    if (password.length < 4) {
      setError("Password should be at least 4 characters.");
      return;
    }
    if (password !== pwRepeat) {
      setError("Passwords do not match.");
      return;
    }
    // Check if user exists
    const users = JSON.parse(localStorage.getItem("cinesphere_users") || "{}");
    if (users[email]) {
      setError("User already exists. Try logging in.");
      return;
    }
    users[email] = { password };
    localStorage.setItem("cinesphere_users", JSON.stringify(users));
    localStorage.setItem("cinesphere_auth", JSON.stringify({ email }));
    onAuth({ email });
  }

  // Simulate login: check from localStorage
  function handleLogin(e) {
    e.preventDefault();
    setError("");
    if (!validateEmail(email)) {
      setError("Invalid email address.");
      return;
    }
    const users = JSON.parse(localStorage.getItem("cinesphere_users") || "{}");
    if (!users[email] || users[email].password !== password) {
      setError("Incorrect email or password.");
      return;
    }
    localStorage.setItem("cinesphere_auth", JSON.stringify({ email }));
    onAuth({ email });
  }

  // Switch between login/signup UI
  function switchMode() {
    setError("");
    setMode(mode === "login" ? "signup" : "login");
    setEmail("");
    setPassword("");
    setPwRepeat("");
  }

  // Themed input style
  const inputStyle = {
    width: "92%",
    padding: 9,
    fontSize: 16,
    borderRadius: 7,
    border: `1.5px solid ${THEME.secondary}`,
    background: THEME.accent,
    color: THEME.primary,
    marginBottom: 13,
    marginTop: 2,
    outline: "none",
  };

  // Card/container
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        background: THEME.primary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <form
        onSubmit={mode === "signup" ? handleSignup : handleLogin}
        style={{
          background: THEME.accent,
          borderRadius: 16,
          boxShadow: "0 8px 32px #0e0e25bb",
          padding: "38px 30px 26px 30px",
          minWidth: 320,
          width: "96vw",
          maxWidth: 370,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: `2px solid ${THEME.secondary}`,
        }}
        autoComplete="off"
      >
        <div
          className="logo"
          style={{
            color: THEME.secondary,
            fontSize: "2.1rem",
            marginBottom: 18,
            letterSpacing: 1,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <span className="logo-symbol" style={{ color: THEME.secondary, fontSize: "2.6rem" }}>
            *
          </span>{" "}
          CineSphere
        </div>
        <div style={{ color: THEME.primary, fontWeight: 600, fontSize: "1.5rem", marginBottom: 6 }}>
          {mode === "login" ? "Sign In" : "Create Account"}
        </div>
        <div style={{ color: THEME.primary, opacity: 0.80, fontSize: "1.04rem", marginBottom: 14 }}>
          {mode === "login"
            ? "Log in to unlock multi-industry movie discovery!"
            : "Sign up for CineSphere to explore movie features."}
        </div>

        {error && (
          <div
            style={{
              color: "#8d125e",
              background: "#ffe3f2",
              borderRadius: 7,
              padding: "8px 0",
              marginBottom: 5,
              fontSize: "0.99rem",
              fontWeight: 500,
              width: "100%",
              textAlign: "center",
              border: `1.5px solid #f394ff88`,
            }}
          >
            {error}
          </div>
        )}
        <input
          name="email"
          type="email"
          autoComplete="username"
          placeholder="Email"
          style={inputStyle}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          name="password"
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="Password"
          style={inputStyle}
          minLength={4}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {mode === "signup" && (
          <input
            name="pw-repeat"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat Password"
            style={inputStyle}
            value={pwRepeat}
            onChange={(e) => setPwRepeat(e.target.value)}
            required
          />
        )}
        <button
          type="submit"
          className="btn btn-large"
          style={{
            width: "100%",
            margin: "7px 0 11px 0",
            background: THEME.secondary,
            color: THEME.primary,
            fontSize: "1.08rem",
            fontWeight: 600,
            borderRadius: 6,
            boxShadow: "0 2px 9px #8c42a813",
          }}
        >
          {mode === "login" ? "Login" : "Sign Up"}
        </button>
        <div style={{ marginTop: 3, fontSize: "0.98rem" }}>
          {mode === "login" ? (
            <>
              Need an account?{" "}
              <span
                style={{ color: THEME.secondary, cursor: "pointer", fontWeight: 600 }}
                onClick={switchMode}
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already signed up?{" "}
              <span
                style={{ color: THEME.secondary, cursor: "pointer", fontWeight: 600 }}
                onClick={switchMode}
              >
                Login
              </span>
            </>
          )}
        </div>
      </form>
      <div style={{ marginTop: 24, color: THEME.accent, fontSize: "0.99rem", letterSpacing: 0.4 }}>
        <span style={{ color: THEME.secondary }}>*</span> No account info ever leaves your browser.
      </div>
    </div>
  );
}

export default LoginSignup;
