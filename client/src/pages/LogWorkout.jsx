import React, { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function LogWorkout() {
  const [category, setCategory] = useState("");
  const [exercises, setExercises] = useState([
    { name: "", sets: "", reps: "", weight: "" },
  ]);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();

  // Update timer
  useEffect(() => {
    let interval;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        const diff = Math.floor((Date.now() - new Date(startTime)) / 60000);
        setDuration(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const handleStart = () => {
    setStartTime(new Date());
    setIsRunning(true);
  };

  const handleStop = async () => {
    const endTime = new Date();
    setIsRunning(false);

    if (!category) return alert("Please select a category");
    if (exercises.some((ex) => !ex.name)) return alert("Enter all exercise names");

    try {
      await api.post("/workouts", {
        category,
        exercises,
        startTime,
        endTime,
      });
      alert("✅ Workout saved successfully!");
      navigate("/workouts");
    } catch (err) {
      console.error("❌ Failed to save:", err.response?.data || err.message);
      alert("Failed to save workout");
    }
  };

  const handleExerciseChange = (index, field, value) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: "", reps: "", weight: "" }]);
  };

  return (
    <div className="card">
      <h2>🏋️ Log Workout</h2>

      <label>Workout Category</label>
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
      >
        <option value="">-- Select Category --</option>
        <option value="Chest">Chest</option>
        <option value="Back">Back</option>
        <option value="Legs">Legs</option>
        <option value="Arms">Arms</option>
        <option value="Shoulders">Shoulders</option>
        <option value="Cardio">Cardio</option>
      </select>

      <h3>Exercises</h3>
      {exercises.map((ex, i) => (
        <div key={i} className="exercise-row">
          <input
            placeholder="Exercise name"
            value={ex.name}
            onChange={(e) => handleExerciseChange(i, "name", e.target.value)}
          />
          <input
            type="number"
            placeholder="Sets"
            value={ex.sets}
            onChange={(e) => handleExerciseChange(i, "sets", e.target.value)}
          />
          <input
            type="number"
            placeholder="Reps"
            value={ex.reps}
            onChange={(e) => handleExerciseChange(i, "reps", e.target.value)}
          />
          <input
            type="number"
            placeholder="Weight (kg)"
            value={ex.weight}
            onChange={(e) => handleExerciseChange(i, "weight", e.target.value)}
          />
        </div>
      ))}

      <button type="button" onClick={addExercise} className="add-btn">
        + Add Exercise
      </button>

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {!isRunning ? (
          <button className="start-btn" onClick={handleStart}>
            ▶️ Start Workout
          </button>
        ) : (
          <button className="stop-btn" onClick={handleStop}>
            ⏹ Stop & Save Workout
          </button>
        )}
        {isRunning && (
          <p style={{ marginTop: "10px", fontWeight: "bold" }}>
            Duration: {duration} min
          </p>
        )}
      </div>
    </div>
  );
}
