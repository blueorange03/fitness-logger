import React, { useEffect, useState } from "react";
import api from "../api";

export default function Dashboard() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    api.get("/workouts").then(res => setWorkouts(res.data.workouts || []));
  }, []);

  return (
    <div className="card">
      <h2>Dashboard</h2>
      <p>Total Workouts: {workouts.length}</p>
      <ul>
        {workouts.slice(0, 3).map((w, i) => (
          <li key={i}>{w.type || "Workout"} - {new Date(w.createdAt).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}
