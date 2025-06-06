import React from "react";

// PUBLIC_INTERFACE
// Enforces children to only render if authenticated; else triggers redirect logic.
function ProtectedRoute({ isAuthenticated, children }) {
  // If not authenticated, just render nothing (App will show login page)
  if (!isAuthenticated) return null;
  return children;
}

export default ProtectedRoute;
