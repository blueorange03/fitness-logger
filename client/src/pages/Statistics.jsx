import React, { useEffect, useState } from "react";
import api from "../api";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

export default function Statistics() {
  const [workouts, setWorkouts] = useState([]);
  const [monthFilter, setMonthFilter] = useState(new Date().getMonth()); // current month
  const [view, setView] = useState("category"); // "category" or "frequency"

  useEffect(() => {
    async function fetchData() {
      const res = await api.get("/workouts");
      setWorkouts(res.data.workouts || []);
    }
    fetchData();
  }, []);

  // Filter workouts for the selected month
  const filtered = workouts.filter(w => {
    const d = new Date(w.date);
    return d.getMonth() === monthFilter;
  });

  // Group by category (e.g., Upper, Legs, Pull)
  const categoryCount = filtered.reduce((acc, w) => {
    acc[w.category] = (acc[w.category] || 0) + 1;
    return acc;
  }, {});

  // Convert to chart data format
  const data = Object.entries(categoryCount).map(([key, value]) => ({
    category: key,
    count: value
  }));

  // Weekly frequency chart
  const weekCount = filtered.reduce((acc, w) => {
    const week = Math.ceil(new Date(w.date).getDate() / 7);
    acc[week] = (acc[week] || 0) + 1;
    return acc;
  }, {});

  const weekData = Object.entries(weekCount).map(([week, count]) => ({
    week: `Week ${week}`,
    count
  }));

  const COLORS = ["#3b82f6", "#60a5fa", "#10b981", "#facc15", "#ef4444"];

  return (
    <div className="card">
      <h2>Workout Statistics</h2>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <select value={monthFilter} onChange={e => setMonthFilter(parseInt(e.target.value))}>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={i}>
              {new Date(2025, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>

        <select value={view} onChange={e => setView(e.target.value)}>
          <option value="category">By Category</option>
          <option value="frequency">Weekly Frequency</option>
        </select>
      </div>

      {view === "category" ? (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="category"
              outerRadius={120}
              fill="#8884d8"
              label
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={weekData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Workouts" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
