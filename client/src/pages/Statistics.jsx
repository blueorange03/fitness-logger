import React, { useEffect, useState } from "react";
import api from "../api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function Statistics() {
  const [workouts, setWorkouts] = useState([]);
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth()); // current month
  const [view, setView] = useState("category"); // "category" | "frequency" | "duration"

  useEffect(() => {
    async function fetchData() {
      const res = await api.get("/workouts");
      setWorkouts(res.data.workouts || []);
    }
    fetchData();
  }, []);

  // 🧠 Filter workouts for the selected month
  const filtered = workouts.filter((w) => {
    const d = new Date(w.startTime);
    return d.getMonth() === monthFilter;
  });

  // 🧩 By Category — how many workouts per category
  const categoryCount = filtered.reduce((acc, w) => {
    acc[w.category] = (acc[w.category] || 0) + 1;
    return acc;
  }, {});
  const categoryData = Object.entries(categoryCount).map(([key, value]) => ({
    category: key,
    count: value,
  }));

  // 🧩 Weekly Frequency — how many workouts per week
  const weekCount = filtered.reduce((acc, w) => {
    const d = new Date(w.startTime);
    const week = Math.ceil(d.getDate() / 7);
    acc[week] = (acc[week] || 0) + 1;
    return acc;
  }, {});
  const weekData = Object.entries(weekCount).map(([week, count]) => ({
    week: `Week ${week}`,
    count,
  }));

  // 🧩 Weekly Duration — total minutes per week
  const weekDuration = filtered.reduce((acc, w) => {
    const d = new Date(w.startTime);
    const week = Math.ceil(d.getDate() / 7);
    acc[week] = (acc[week] || 0) + (w.duration || 0);
    return acc;
  }, {});
  const durationData = Object.entries(weekDuration).map(([week, minutes]) => ({
    week: `Week ${week}`,
    minutes,
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#14b8a6"];

  // 🧩 Dynamic chart rendering
  const renderChart = () => {
    switch (view) {
      case "category":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="category"
                outerRadius={120}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "frequency":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" name="Workouts" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "duration":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={durationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis label={{ value: "Minutes", angle: -90, position: "insideLeft" }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="minutes"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="card">
      <h2 style={{ textAlign: "center" }}>🏋️ Workout Statistics</h2>

      {/* Filter Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        {/* Month Selector */}
        <select
          value={monthFilter}
          onChange={(e) => setMonthFilter(parseInt(e.target.value))}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(2025, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        {/* Chart View Selector */}
        <select
          value={view}
          onChange={(e) => setView(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
          }}
        >
          <option value="category">By Category (Pie)</option>
          <option value="frequency">Weekly Frequency (Bar)</option>
          <option value="duration">Weekly Duration (Line)</option>
        </select>
      </div>

      {/* Charts */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: "center" }}>No data available for this month.</p>
      ) : (
        renderChart()
      )}
    </div>
  );
}
