import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";

const mockRoutineData = {
  "Full Body": [
    { id: 1, name: "Barbell Squat", sets: "3-4", reps: "6-8" },
    { id: 2, name: "Bench Press", sets: "3-4", reps: "8-10" },
    { id: 3, name: "Barbell Row", sets: "3-4", reps: "8-10" },
    { id: 4, name: "Overhead Press", sets: "3", reps: "10-12" },
    { id: 5, name: "Face Pulls", sets: "3", reps: "15-20" },
  ],
  "Legs": [
    { id: 1, name: "Barbell Squat", sets: "4", reps: "5" },
    { id: 2, name: "Romanian Deadlift", sets: "3", reps: "8" },
    { id: 3, name: "Leg Extension", sets: "3", reps: "12-15" },
    { id: 4, name: "Leg Curl", sets: "3", reps: "12-15" },
    { id: 5, name: "Calf Raises", sets: "3", reps: "15-20" },
  ],
  "Pull": [
    { id: 1, name: "Pull-ups", sets: "3", reps: "Failure" },
    { id: 2, name: "T-Bar Row", sets: "3", reps: "8-10" },
    { id: 3, name: "Lat Pulldown", sets: "3", reps: "10-12" },
    { id: 4, name: "Bicep Curl", sets: "3", reps: "10-12" },
    { id: 5, name: "Hammer Curl", sets: "3", reps: "12-15" },
  ],
  "Push": [
    { id: 1, name: "Bench Press", sets: "4", reps: "6-8" },
    { id: 2, name: "Incline Dumbbell Press", sets: "3", reps: "8-10" },
    { id: 3, name: "Overhead Press", sets: "3", reps: "8-10" },
    { id: 4, name: "Lateral Raise", sets: "3", reps: "12-15" },
    { id: 5, name: "Tricep Pushdown", sets: "3", reps: "12-15" },
  ],
};

export default function Routines() {
  const { routineName } = useParams();
  const navigate = useNavigate();

  if (!routineName) {
    navigate('/workouts');
    return null; 
  }

  const key = decodeURIComponent(routineName).split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  const exercises = mockRoutineData[key] || [];

  return (
    <div className="routines-page">
      <div className="routines-header">
        {/* Back button now navigates to the list at /workouts */}
        <button onClick={() => navigate('/workouts')} className="back-btn">
          &lt; Routines
        </button>
        <h1>{key}</h1>
        <button className="add-btn-round">+</button>
      </div>

      <div className="routines-details-container card">
        <div className="details-header">
          <span>Exercise</span>
          <span>Sets</span>
          <span>Reps</span>
        </div>
        
        {exercises.length === 0 ? (
            <p style={{ textAlign: "center", color: "#9ca3af", padding: "20px" }}>No exercises found for this routine.</p>
        ) : (
            exercises.map((ex) => (
            <div key={ex.id} className="exercise-detail-item">
                <span className="ex-name">{ex.name}</span>
                <span className="ex-sets">{ex.sets}</span>
                <span className="ex-reps">{ex.reps}</span>
                <button className="icon-btn remove-btn-small">
                    <FaTrashAlt />
                </button>
            </div>
            ))
        )}
        
        <div style={{ padding: "20px 0" }}>
            <button className="start-btn" style={{ width: "100%" }}>
                Start Workout
            </button>
        </div>
      </div>
    </div>
  );
}