import React, { useEffect, useState } from "react";
import api from "../api";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { subMonths, format } from "date-fns";

export default function WorkoutHeatmap() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    async function fetchWorkouts() {
      const res = await api.get("/workouts");
      setWorkouts(res.data.workouts || []);
    }
    fetchWorkouts();
  }, []);

  // Define the range — last 12 months
  const endDate = new Date();
  const startDate = subMonths(endDate, 12);

  // Convert workouts into heatmap data
  const values = workouts.map((w) => {
    const date = format(new Date(w.startTime || w.date), "yyyy-MM-dd");
    return { date, count: 1 };
  });

  // Combine counts by date
  const grouped = Object.values(
    values.reduce((acc, curr) => {
      acc[curr.date] = acc[curr.date] || { date: curr.date, count: 0 };
      acc[curr.date].count += 1;
      return acc;
    }, {})
  );

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h2 style={{ marginBottom: "20px" }}>🏋️ Workout Activity (Past 12 Months)</h2>

      <CalendarHeatmap
        startDate={startDate}
        endDate={endDate}
        values={grouped}
        classForValue={(value) => {
          if (!value) return "color-empty";
          if (value.count >= 5) return "color-scale-4";
          if (value.count >= 3) return "color-scale-3";
          if (value.count >= 2) return "color-scale-2";
          return "color-scale-1";
        }}
        tooltipDataAttrs={(value) => {
          if (!value?.date) return null;
          return {
            "data-tip": `${value.date}: ${value.count} workout${
              value.count > 1 ? "s" : ""
            }`,
          };
        }}
        showWeekdayLabels
      />
      <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "10px" }}>
        💡 Each square represents a day — darker means more workouts.
      </p>
    </div>
  );
}
