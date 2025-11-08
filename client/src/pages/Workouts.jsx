import React, { useEffect, useState } from "react";
import api from "../api";

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  useEffect(() => {
    api.get("/workouts").then(res => setWorkouts(res.data.workouts || []));
  }, []);
  return (
    <div className="card">
      <h2>My Workouts</h2>
      <ul>
        {workouts.map((w, i) => (
          <li key={i}>{w.type || "Workout"} — {new Date(w.createdAt).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
}
