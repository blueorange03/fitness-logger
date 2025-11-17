import React from "react";
import { useNavigate } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa"; 

// This component is now the ROUTINE LIST page.
export default function Workouts() {
  const navigate = useNavigate(); 
  const routines = ["Full Body", "Legs", "Pull", "Push"];

  const handleRoutineClick = (name) => {
    navigate(`/routines/${encodeURIComponent(name)}`);
  };

  return (
    <div className="routines-page">
      <div className="routines-header">
        <h1>Workouts</h1> 
        <button className="add-btn-round">+</button> 
      </div>
      
      <div className="routines-list-container card">
        {routines.map((routine, index) => (
          <div 
            key={index} 
            className="routine-item"
            onClick={() => handleRoutineClick(routine)} 
          >
            <span>{routine}</span>
            <FaChevronRight className="chevron-icon" />
          </div>
        ))}
      </div>
    </div>
  );
}