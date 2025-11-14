import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import "./Login.css"; // Import the CSS file

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

  const parseDate = (d) => (d ? new Date(d) : null);

  const formatDate = (dateString) => {
    const d = parseDate(dateString);
    if (!d) return "";
    return d.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const stats = useMemo(() => {
    const totalWorkouts = workouts.length;

    let totalMinutes = 0;
    workouts.forEach((w) => {
      if (typeof w.duration === "number") totalMinutes += w.duration;
      else if (typeof w.duration === "string") {
        const m = parseInt(w.duration, 10);
        if (!isNaN(m)) totalMinutes += m;
      } else {
        totalMinutes += 60;
      }
    });
    const totalHours = +(totalMinutes / 60).toFixed(1);

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    const thisWeek = workouts.filter((w) => {
      const d = parseDate(w.date);
      return d && d >= startOfDay(sevenDaysAgo);
    }).length;

    let calories = 0;
    workouts.forEach((w) => {
      if (w.calories && typeof w.calories === "number") calories += w.calories;
      else calories += (typeof w.duration === "number" ? w.duration / 60 : 1) * 400;
    });

    return { totalWorkouts, totalHours, thisWeek, caloriesBurned: Math.round(calories) };
  }, [workouts]);

  function startOfDay(d) {
    if (!d) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  const recent = useMemo(() => {
    return [...workouts].sort((a, b) => {
      const da = parseDate(a.date) || 0;
      const db = parseDate(b.date) || 0;
      return db - da;
    }).slice(0, 5);
  }, [workouts]);

  const streak = useMemo(() => {
    if (!workouts || workouts.length === 0) return { current: 0, longest: 0, lastDate: null };

    const daySet = new Set();
    workouts.forEach((w) => {
      const d = parseDate(w.date);
      if (!d) return;
      const key = d.toISOString().slice(0, 10);
      daySet.add(key);
    });

    const days = Array.from(daySet).sort((a, b) => (a < b ? 1 : -1));
    let current = 0;
    if (days.length) {
      let prev = new Date(days[0]);
      current = 1;
      for (let i = 1; i < days.length; i++) {
        const d = new Date(days[i]);
        const diffDays = dayDiff(prev, d);
        if (diffDays === 1) {
          current += 1;
          prev = d;
        } else {
          break;
        }
      }
    }

    let longest = 0;
    let running = 0;
    const sortedAsc = Array.from(daySet).sort();
    let prevD = null;
    sortedAsc.forEach((k) => {
      const d = new Date(k);
      if (!prevD) {
        running = 1;
      } else {
        if (dayDiff(d, prevD) === 1) {
          running += 1;
        } else {
          running = 1;
        }
      }
      prevD = d;
      longest = Math.max(longest, running);
    });

    return { current, longest, lastDate: days[0] || null };
  }, [workouts]);

  function dayDiff(a, b) {
    const ad = startOfDay(new Date(a));
    const bd = startOfDay(new Date(b));
    const diffMs = ad - bd;
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  const goals = useMemo(() => {
    const g = [
      { id: 1, text: "Finish 5 workouts this week", progress: stats.thisWeek, target: 5 },
      { id: 2, text: "150 total sets in 30 days (est.)", progress: Math.min(150, recent.length * 6), target: 150 },
      { id: 3, text: "Increase bench press by 5kg", progress: 0, target: 5, unit: "kg" },
    ];
    for (const w of workouts) {
      if (w.exercises && Array.isArray(w.exercises)) {
        for (const ex of w.exercises) {
          if (typeof ex.name === "string" && ex.name.toLowerCase().includes("bench")) {
            if (ex.maxWeight) {
              g[2].progress = Math.max(g[2].progress, ex.maxWeight);
            }
          }
        }
      }
    }
    return g;
  }, [stats.thisWeek, recent, workouts]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2>Dashboard</h2>
        <div style={{ color: "#9ca3af" }}>Welcome back — keep going 💪</div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <StatCard title="Total Workouts" value={stats.totalWorkouts} />
        <StatCard title="Total Hours" value={`${stats.totalHours} hrs`} />
        <StatCard title="This Week" value={`${stats.thisWeek} workouts`} />
        <StatCard title="Calories Burned" value={`${stats.caloriesBurned} kcal`} />
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 650px", minWidth: 320 }}>
          <div className="card" style={{ padding: 18 }}>
            <h3 style={{ marginTop: 0 }}>Today's Summary</h3>
            {recent && recent.length ? (
              <>
                <div style={{ color: "#9ca3af", marginBottom: 8 }}>
                  Last workout: <strong>{formatDate(recent[0].date)}</strong>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <SummaryItem label="Workout" value={recent[0].category || recent[0].title || "—"} />
                  <SummaryItem label="Duration" value={recent[0].duration ? `${recent[0].duration} min` : "60 min"} />
                  <SummaryItem label="Sets" value={recent[0].sets || "—"} />
                </div>

                {recent[0].notes && <p style={{ marginTop: 12, color: "#9ca3af" }}>Notes: {recent[0].notes}</p>}
              </>
            ) : (
              <p style={{ color: "#9ca3af" }}>No recent workout — log your first session!</p>
            )}
          </div>

          <div className="card" style={{ padding: 18, marginTop: 12 }}>
            <h3 style={{ marginTop: 0 }}>Recent Workouts</h3>
            {recent.length ? (
              <ul>
                {recent.map((w, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    <strong>{w.category || w.title || "Workout"}</strong> — {formatDate(w.date)} —{" "}
                    {w.duration ? `${w.duration} min` : "60 min"}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: "#9ca3af" }}>No workouts yet.</p>
            )}
          </div>
        </div>

        <div style={{ flex: "0 0 640px", minWidth: 320 }}>
          <div className="inline-row" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <div className="inline-card" style={{ flex: 1, minWidth: 280 }}>
              <div className="card" style={{ padding: 14, marginBottom: 0 }}>
                <h4 style={{ marginTop: 0 }}>🔥 Streak</h4>
                <div style={{ fontSize: 28, fontWeight: 700, textAlign: "center" }}>{streak.current} days</div>
                <div style={{ textAlign: "center", color: "#9ca3af", marginTop: 6 }}>Longest: {streak.longest} days</div>
                <div style={{ marginTop: 10 }}>
                  <button style={buttonStyle}>View streak</button>
                </div>
              </div>
            </div>

            <div className="inline-card" style={{ flex: 1, minWidth: 280 }}>
              <div className="card" style={{ padding: 14, marginBottom: 0 }}>
                <h4 style={{ marginTop: 0 }}>Goals</h4>
                <div style={{ display: "grid", gap: 10 }}>
                  {goals.map((g) => {
                    const pct = Math.min(100, Math.round((g.progress / Math.max(1, g.target)) * 100));
                    return (
                      <div key={g.id}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <div style={{ fontSize: 14 }}>{g.text}</div>
                          <div style={{ color: "#9ca3af", fontSize: 13 }}>
                            {g.progress}{g.unit ? g.unit : ""}/{g.target}{g.unit ? g.unit : ""}
                          </div>
                        </div>
                        <div style={{ background: "#e6e6e6", height: 8, borderRadius: 999, overflow: "hidden", marginTop: 6 }}>
                          <div style={{ width: `${pct}%`, background: "#3b82f6", height: "100%" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 12, textAlign: "right" }}>
                  <button style={{ ...buttonStyle, background: "transparent", color: "#111827", border: "1px solid rgba(0,0,0,0.08)" }}>
                    Manage Goals
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// This is the updated StatCard component as per your request
function StatCard({ title, value }) {
  return (
    <div className="card" style={{ padding: 12, flex: "1 1 180px", minWidth: 160 }}>
      <div style={{ color: "#9ca3af", fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div style={{ minWidth: 120 }}>
      <div style={{ color: "#9ca3af", fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 700 }}>{value}</div>
    </div>
  );
}

const buttonStyle = {
  background: "#16a34a",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: 6,
  cursor: "pointer",
};