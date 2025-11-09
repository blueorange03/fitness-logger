import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (!user) {
    return (
      <div className="access-denied" key={Date.now()}>
        <h3>Access Denied</h3>
        <p>Please sign in to continue.</p>
        <a href="/login" className="login-link">Go to Login →</a>
      </div>
    );
  }
  return children;
}
