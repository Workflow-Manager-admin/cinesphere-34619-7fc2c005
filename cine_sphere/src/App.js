import React from 'react';
import './App.css';
import CineSphereMainContainer from './CineSphereMainContainer';

// PUBLIC_INTERFACE
function App() {
  return (
    <div className="app" style={{ background: "#fcfcfc" }}>
      <nav className="navbar" style={{ background: "#1f1f47" }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo" style={{ color: "#f394ff" }}>
              <span className="logo-symbol" style={{ color: "#f394ff" }}>*</span> CineSphere
            </div>
            {/* Could add global controls or branding here */}
          </div>
        </div>
      </nav>

      <main>
        <div style={{ maxWidth: 1300, margin: '0 auto', paddingTop: 90 }}>
          <CineSphereMainContainer />
        </div>
      </main>
    </div>
  );
}

export default App;