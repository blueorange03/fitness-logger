import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function LogWorkout() {
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [duration, setDuration] = useState("");
  const [exercises, setExercises] = useState([{ name: "", sets: "" }]);
  const [monthCount, setMonthCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMonthlyCount() {
      const res = await api.get("/workouts");
      const workouts = res.data.workouts || [];
      const currentMonth = new Date().getMonth();
      const days = new Set(
        workouts
          .filter(w => new Date(w.date).getMonth() === currentMonth)
          .map(w => new Date(w.date).toDateString())
      );
      setMonthCount(days.size);
    }
    fetchMonthlyCount();
  }, []);

  const handleExerciseChange = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: "" }]);
  };

  const removeExercise = (index) => {
    const updated = exercises.filter((_, i) => i !== index);
    setExercises(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!category || !date || exercises.some(e => !e.name || !e.sets)) {
      alert("Please fill all fields properly.");
      return;
    }

    await api.post("/workouts", {
      category,
      exercises: exercises.map(e => `${e.sets}x ${e.name}`),
      date,
      duration: duration || "60 min"
    });

    navigate("/workouts");
  };

  return (
    <div className="card">
      <h2>Log Workout</h2>

      <div className="month-counter">
        <strong>{monthCount}</strong> workout days this month 💪
      </div>

      <form className="log-form" onSubmit={handleSubmit}>
        <label>Workout Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">-- Select --</option>
          <option value="Upper">Upper</option>
          <option value="Pull">Pull</option>
          <option value="Push">Push</option>
          <option value="Legs">Legs</option>
          <option value="Cardio">Cardio</option>
          <option value="Core">Core</option>
        </select>

        <label>Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} />

        <label>Duration (optional)</label>
        <input
          type="text"
          placeholder="e.g. 60 min"
          value={duration}
          onChange={e => setDuration(e.target.value)}
        />

        <label>Exercises</label>
        {exercises.map((exercise, i) => (
          <div key={i} className="exercise-row">
            <input
              type="text"
              placeholder="Exercise name"
              value={exercise.name}
              onChange={e => handleExerciseChange(i, "name", e.target.value)}
            />
            <input
              type="number"
              placeholder="Sets"
              value={exercise.sets}
              onChange={e => handleExerciseChange(i, "sets", e.target.value)}
              min="1"
            />
            {exercises.length > 1 && (
              <button
                type="button"
                className="remove-btn"
                onClick={() => removeExercise(i)}
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button type="button" className="add-btn" onClick={addExercise}>
          + Add Exercise
        </button>

        <div className="btn-container">
          <button type="submit">Save Workout</button>
        </div>
      </form>
    </div>
  );
}
