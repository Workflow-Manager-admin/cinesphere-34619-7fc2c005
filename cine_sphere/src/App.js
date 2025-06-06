import React, { useState, useEffect } from "react";
import "./App.css";
import CineSphereMainContainer from "./CineSphereMainContainer";
import LoginSignup from "./LoginSignup";
import ProtectedRoute from "./ProtectedRoute";

// Language/region configuration sync with CineSphereMainContainer
const CINE_COLUMNS = [
  {
    key: "hollywood",
    label: "Hollywood",
    language: "en",
    regionLabel: "USA/English",
    tmdbRegions: { lang: "en", region: "US" },
  },
  {
    key: "bollywood",
    label: "Bollywood",
    language: "hi",
    regionLabel: "India/Hindi",
    tmdbRegions: { lang: "hi", region: "IN" },
  },
  {
    key: "kollywood",
    label: "Kollywood",
    language: "ta",
    regionLabel: "India/Tamil",
    tmdbRegions: { lang: "ta", region: "IN" },
  },
  {
    key: "tollywood",
    label: "Tollywood",
    language: "te",
    regionLabel: "India/Telugu",
    tmdbRegions: { lang: "te", region: "IN" },
  },
  {
    key: "sandalwood",
    label: "Sandalwood",
    language: "kn",
    regionLabel: "India/Kannada",
    tmdbRegions: { lang: "kn", region: "IN" },
  },
  {
    key: "mollywood",
    label: "Mollywood",
    language: "ml",
    regionLabel: "India/Malayalam",
    tmdbRegions: { lang: "ml", region: "IN" },
  },
];

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

  // Track selected language/region column (persist per session optionally)
  const [selectedRegion, setSelectedRegion] = useState(null);

  // On login/signup, receive user object and set auth
  function handleAuth(user) {
    setAuth(user);
    setSelectedRegion(null); // On re-login, reset region selection
  }
  // Allow logout
  function handleLogout() {
    setAuth(null);
    localStorage.removeItem("cinesphere_auth");
    setSelectedRegion(null);
  }

  // If not authenticated, render only authentication component (protects all routes/features)
  if (!auth) {
    return <LoginSignup onAuth={handleAuth} />;
  }

  // Language/Region selection UI
  if (!selectedRegion) {
    return (
      <div className="app" style={{ background: "#fcfcfc", minHeight: "100vh" }}>
        <nav className="navbar" style={{ background: "#1f1f47" }}>
          <div className="container">
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
              <div className="logo" style={{ color: "#f394ff" }}>
                <span className="logo-symbol" style={{ color: "#f394ff" }}>*</span> CineSphere
              </div>
              <div>
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
        <main style={{ paddingTop: 110, minHeight: "80vh" }}>
          <div style={{ maxWidth: 920, margin: "0 auto", padding: "0 12px" }}>
            <h1 style={{
              textAlign: "center",
              color: "#1f1f47",
              fontWeight: 800,
              fontSize: "2.6rem",
              marginBottom: 24,
              marginTop: 0,
              letterSpacing: "1px",
            }}>Choose your Movie World</h1>
            <div style={{
              textAlign: "center",
              color: "#8473a5",
              fontSize: "1.12rem",
              marginBottom: 32,
              fontWeight: 500,
            }}>
              Select a language/region to explore CineSphere's games and movie discovery features for that cinema!
            </div>
            <div
              className="cinesphere-feature-grid sixcol-grid"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 22,
                flexWrap: "wrap",
              }}
            >
              {CINE_COLUMNS.map(region => (
                <button
                  key={region.key}
                  className="cinesphere-feature-col sixcol"
                  type="button"
                  style={{
                    cursor: "pointer",
                    boxShadow: "0 2px 13px #1f1f4733",
                    border: "2.5px solid #f394ff",
                    background: "#fcfcfc",
                    minHeight: 130,
                    alignItems: "center",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    transition: "transform 0.12s cubic-bezier(.4,1,.3,1), box-shadow 0.12s",
                  }}
                  onClick={() => setSelectedRegion(region)}
                  tabIndex={0}
                  aria-label={`Choose ${region.label}`}
                >
                  <span className="cinesphere-feature-region-label" style={{
                    fontWeight: 800, fontSize: "1.29rem", marginBottom: 0, marginTop: 10,
                  }}>
                    {region.label}
                  </span>
                  <span className="cinesphere-feature-region-sub" style={{ fontSize: "0.99rem", marginTop: 8 }}>
                    {region.regionLabel}
                  </span>
                  <span style={{
                    marginTop: 15,
                    color: "#f394ff",
                    fontSize: "1.01rem",
                    background: "#1f1f47",
                    borderRadius: 16,
                    padding: "3px 12px",
                    fontWeight: 500,
                    letterSpacing: "0.2px"
                  }}>
                    Enter
                  </span>
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app" style={{ background: "#fcfcfc" }}>
      <nav className="navbar" style={{ background: "#1f1f47" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <div className="logo" style={{ color: "#f394ff" }}>
              <span className="logo-symbol" style={{ color: "#f394ff" }}>*</span> CineSphere
            </div>
            <div style={{ display: "flex", alignItems: "center" }}>
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
                  marginRight: 11
                }}
                onClick={handleLogout}
              >
                Logout
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  background: "#fcfcfc",
                  color: "#f394ff",
                  fontWeight: 600,
                  border: "1.5px solid #f394ff",
                  fontSize: "0.97rem",
                  borderRadius: 6,
                  padding: "7px 9px"
                }}
                onClick={() => setSelectedRegion(null)}
                title="Back to region/language selection"
              >
                Change Region
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div style={{ maxWidth: 1300, margin: "0 auto", paddingTop: 90 }}>
          <ProtectedRoute isAuthenticated={!!auth}>
            <CineSphereMainContainer selectedRegion={selectedRegion} />
          </ProtectedRoute>
        </div>
      </main>
    </div>
  );
}

export default App;