import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function LogWorkout() {
  const [type, setType] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post("/workouts", { type });
    navigate("/workouts");
  }

  return (
    <div className="card">
      <h2>Log Workout</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Workout type" value={type} onChange={e => setType(e.target.value)} />
        <button>Save</button>
      </form>
    </div>
  );
}
