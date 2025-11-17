import React, { useEffect, useState } from "react";
import api from "../api";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subMonths, format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function WorkoutStatistics() {
  const [workouts, setWorkouts] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [range, setRange] = useState(12);
  const [view, setView] = useState("heatmap"); 

  const [chartType, setChartType] = useState("frequency");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    async function loadData() {
      const w = await api.get("/workouts");
      const weights = await api.get("/weights");
      setWorkouts(w.data.workouts || []);
      setWeightHistory(weights.data.weights || []);
    }
    loadData();
  }, []);

  const endDate = new Date();
  const startDate = subMonths(endDate, range);

  const filtered = workouts.filter((w) => {
    const d = new Date(w.startTime);
    return d >= startDate && d <= endDate;
  });

  const filteredByCategory =
    categoryFilter === "all"
      ? filtered
      : filtered.filter((w) => w.category === categoryFilter);

  const dateMap = {};

  filteredByCategory.forEach((w) => {
    const date = format(new Date(w.startTime), "yyyy-MM-dd");

    if (!dateMap[date]) {
      dateMap[date] = { date, count: 0, duration: 0, categoryCount: {} };
    }

    dateMap[date].count += 1;
    dateMap[date].duration += w.duration;
    dateMap[date].categoryCount[w.category] =
      (dateMap[date].categoryCount[w.category] || 0) + 1;
  });

  const values = Object.values(dateMap).map((v) => {
    let intensity = 0;

    if (chartType === "frequency") {
      intensity = v.count;
    } else if (chartType === "duration") {
      intensity = Math.round(v.duration / 10);
    } else if (chartType === "category") {
      const c = categoryFilter === "all" ? null : categoryFilter;
      intensity = c ? (v.categoryCount[c] || 0) : v.count;
    }

    return { date: v.date, count: intensity };
  });

  const weightGraphData = weightHistory.map((w) => ({
    date: format(new Date(w.date), "MM-dd"),
    weight: w.weight,
  }));

  return (
    <div className="card heatmap-container">
      <h2 style={{ textAlign: "center", marginBottom: "10px" }}>
        Workout Statistics
      </h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
        <select value={view} onChange={(e) => setView(e.target.value)}>
          <option value="heatmap">Heatmap</option>
          <option value="weight">Body Weight Graph</option>
        </select>

        {view === "heatmap" && (
          <>
            <select value={range} onChange={(e) => setRange(Number(e.target.value))}>
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last 12 Months</option>
            </select>

            <select value={chartType} onChange={(e) => setChartType(e.target.value)}>
              <option value="frequency">Frequency</option>
              <option value="duration">Duration</option>
              <option value="category">Category</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Strength">Strength</option>
              <option value="Cardio">Cardio</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Other">Other</option>
            </select>
          </>
        )}
      </div>

      {view === "heatmap" ? (
        <>
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={values}
            classForValue={(value) => {
              if (!value?.count) return "color-empty";
              if (value.count >= 8) return "color-scale-4";
              if (value.count >= 5) return "color-scale-3";
              if (value.count >= 3) return "color-scale-2";
              return "color-scale-1";
            }}
            tooltipDataAttrs={(value) =>
              value?.date
                ? {
                    "data-tip": `${value.date}: ${value.count} units`,
                  }
                : null
            }
            showWeekdayLabels={true}
          />
        </>
      ) : (
        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer>
            <LineChart data={weightGraphData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit=" kg" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
