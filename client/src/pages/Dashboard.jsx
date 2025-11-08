import React, { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    async function fetchWorkouts() {
      try {
        const res = await api.get("/workouts");
        setWorkouts(res.data.workouts || []);
      } catch (err) {
        console.error("❌ Error fetching workouts:", err);
      }
    }
    fetchWorkouts();
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>
        🏋️ Total Workouts: <strong>{workouts.length}</strong>
      </p>

      {workouts.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>No workouts logged yet.</p>
      ) : (
        <>
          <h3>Recent Workouts</h3>
          <ul>
            {workouts.slice(0, 3).map((w, i) => (
              <li key={i}>
                <strong>{w.category}</strong> — {formatDate(w.date)} —{" "}
                {w.duration || "60 min"}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
