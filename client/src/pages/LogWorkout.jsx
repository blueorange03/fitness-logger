// src/pages/LogWorkout.jsx
import React from 'react';
// No CSS import needed here if we add card styles to App.css

const LogWorkout = () => {
  // TODO: Fetch and map over real workout data
  return (
    <div className="log-page">
      <h1 className="page-title">Log</h1>
      {/* This is a static card from your design */}
      <div className="card">
        <div className="log-header">
          <div>
            <h3>Legs</h3>
            <span className="date">Oct 31</span>
          </div>
          <span className="duration">60 min</span>
        </div>

        <div className="exercise-item">
          <h4>Squats</h4>
          <p>3 sets</p>
          <p className="set">10 @ 25kg</p>
        </div>

        <div className="exercise-item">
          <h4>Leg Extensions</h4>
          <p>3 sets</p>
          <p className="set">10 @ 42kg</p>
        </div>
      </div>
      {/* You would map over more cards here */}
    </div>
  );
};

export default LogWorkout;