import React, { useState, useEffect, useCallback } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt, FaPlusCircle } from "react-icons/fa";

const initialSet = { reps: "", weight: "" };

const initialExercise = {
  name: "",
  sets: [{ id: 1, ...initialSet }],
};

export default function LogWorkout() {
  const [category, setCategory] = useState("");
  const [exercises, setExercises] = useState([initialExercise]);
  const [startTime, setStartTime] = useState(null);
  const [duration, setDuration] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const navigate = useNavigate();

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
    setExercises(exercises.length > 0 ? exercises.map(ex => ({...ex, sets: ex.sets.map(s => ({...s, reps: "", weight: ""}))})) : [initialExercise]);
  };

  const handleStop = async () => {
    setIsRunning(false);

    if (!category) return alert("Please select a category");
    if (exercises.some((ex) => !ex.name))
      return alert("Enter all exercise names");

    const cleanedExercises = exercises.map((ex) => ({
      name: ex.name,
      sets: ex.sets
        .filter((set) => set.reps || set.weight)
        .map((set) => ({
          reps: parseInt(set.reps) || 0,
          weight: parseFloat(set.weight) || 0,
        })),
    }));

    const totalSets = cleanedExercises.reduce((sum, ex) => sum + ex.sets.length, 0);

    if (totalSets === 0) return alert("Please log at least one set before saving.");

    try {
      await api.post("/workouts", {
        category,
        exercises: cleanedExercises,
        duration: `${duration} min`,
        date: startTime,
      });
      alert("✅ Workout saved successfully!");
      navigate("/workouts");
    } catch (err) {
      console.error("❌ Failed to save workout:", err);
      alert("Failed to save workout. Check console for details.");
    }
  };

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      { ...initialExercise, sets: [{ id: prev.length + 1, ...initialSet }] },
    ]);
  };

  const removeExercise = (exIndex) => {
    setExercises((prev) => prev.filter((_, i) => i !== exIndex));
  };

  const handleExerciseNameChange = (exIndex, name) => {
    setExercises((prev) =>
      prev.map((ex, i) => (i === exIndex ? { ...ex, name } : ex))
    );
  };

  const addSet = (exIndex) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i === exIndex) {
          const newSetId = ex.sets.length + 1;
          return {
            ...ex,
            sets: [...ex.sets, { id: newSetId, ...initialSet }],
          };
        }
        return ex;
      })
    );
  };

  const removeSet = (exIndex, setIndex) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i === exIndex) {
          if (ex.sets.length === 1) {
            return ex;
          }
          return {
            ...ex,
            sets: ex.sets.filter((_, j) => j !== setIndex),
          };
        }
        return ex;
      })
    );
  };

  const handleSetChange = useCallback(
    (exIndex, setIndex, field, value) => {
      setExercises((prev) =>
        prev.map((ex, i) => {
          if (i === exIndex) {
            const newSets = ex.sets.map((set, j) => {
              if (j === setIndex) {
                return { ...set, [field]: value };
              }
              return set;
            });
            return { ...ex, sets: newSets };
          }
          return ex;
        })
      );
    },
    []
  );

  return (
    <div className="card">
      <div className="log-header">
        <h3>Log Workout</h3>
        <span className="duration">
          {isRunning ? `⏱️ ${duration} min` : "Ready"}
        </span>
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <select
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="form-input"
          style={{ paddingLeft: "15px" }}
        >
          <option value="">Select Category</option>
          <option value="Strength">Strength</option>
          <option value="Cardio">Cardio</option>
          <option value="Hybrid">Hybrid</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <hr />

      {exercises.map((ex, exIndex) => (
        <div key={exIndex} className="exercise-item-container card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <input
              placeholder={`Exercise ${exIndex + 1} Name (e.g., Bench Press)`}
              value={ex.name}
              onChange={(e) =>
                handleExerciseNameChange(exIndex, e.target.value)
              }
              className="form-input"
              style={{
                width: "85%",
                fontWeight: "600",
                fontSize: "1.1rem",
                paddingLeft: "15px",
              }}
            />
            {exercises.length > 1 && (
              <button
                type="button"
                onClick={() => removeExercise(exIndex)}
                className="add-btn"
                style={{
                  color: "#ef4444",
                  border: "1px dashed #ef4444",
                  width: "10%",
                }}
              >
                <FaTrashAlt />
              </button>
            )}
          </div>

          <div className="set-row-header">
            <span>Set</span>
            <span>Reps</span>
            <span>Weight (kg)</span>
            <span>Action</span>
          </div>

          {ex.sets.map((set, setIndex) => (
            <div key={setIndex} className="set-row">
              <span className="set-number">Set {setIndex + 1}</span>
              <input
                type="number"
                placeholder="Reps"
                value={set.reps}
                onChange={(e) =>
                  handleSetChange(exIndex, setIndex, "reps", e.target.value)
                }
              />
              <input
                type="number"
                placeholder="Weight"
                value={set.weight}
                onChange={(e) =>
                  handleSetChange(exIndex, setIndex, "weight", e.target.value)
                }
              />
              <button
                type="button"
                onClick={() => removeSet(exIndex, setIndex)}
                disabled={ex.sets.length === 1}
                className="icon-btn"
              >
                <FaTrashAlt style={{ color: "var(--text-secondary)" }} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addSet(exIndex)}
            className="add-btn"
            style={{ marginTop: "10px" }}
          >
            <FaPlusCircle /> Add Set
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addExercise}
        className="add-btn"
        style={{ width: "100%", fontSize: "1.1rem", marginBottom: "20px" }}
      >
        + Add Another Exercise
      </button>

      <hr />

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {!isRunning ? (
          <button className="start-btn" onClick={handleStart}>
            ▶️ Start Workout
          </button>
        ) : (
          <button className="stop-btn" onClick={handleStop} disabled={!category}>
            ⏹ Stop & Save Workout
          </button>
        )}
      </div>
    </div>
  );
}