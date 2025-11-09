import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function Navbar() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="logo">Fitness Logger</div>

      <div className="links">
        <button id="1" onClick={() => navigate("/dashboard")}>Dashboard</button>
        <button id="2" onClick={() => navigate("/log")}>Log</button>
        <button id="3" onClick={() => navigate("/workouts")}>Workouts</button>
        <button id="4" onClick={() => navigate("/profile")}>Profile</button>
        <button id="5" onClick={() => navigate("/statistics")}>Stats</button>

        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
