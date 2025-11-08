import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchWorkouts() {
      const res = await api.get("/workouts");
      const data = res.data.workouts || [];
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setWorkouts(data);
    }
    fetchWorkouts();
  }, []);

  const grouped = workouts.reduce((acc, w) => {
    const d = new Date(w.date);
    const key = d.toLocaleString("default", { month: "long", year: "numeric" });
    acc[key] = acc[key] || [];
    acc[key].push(w);
    return acc;
  }, {});

  const formatDay = (date) => {
    const d = new Date(date);
    return d.toLocaleString("en-US", { weekday: "short", day: "numeric" });
  };

  return (
    <div className="workout-log">
      <h2 className="log-title">Log</h2>
      {Object.entries(grouped).map(([month, items]) => (
        <div key={month} className="month-section">
          <div className="month-header">
            <span>{month}</span>
            <span>{items.length} Workouts</span>
          </div>

          {items.map((w) => (
            <div
              key={w._id}
              className="workout-card"
              onClick={() => navigate(`/workout/${w._id}`)}
            >
              <div className="workout-header">
                <div className="date-box">{formatDay(w.date)}</div>
                <div className="workout-info">
                  <div className="workout-type">{w.category}</div>
                  <div className="duration">{w.duration}</div>
                </div>
              </div>
              <div className="exercise-list">
                {(w.exercises || []).slice(0, 3).map((ex, j) => (
                  <p key={j}>{ex}</p>
                ))}
                {w.exercises?.length > 3 && <p style={{ color: "#60a5fa" }}>+ more</p>}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
