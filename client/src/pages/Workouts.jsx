// src/pages/Workouts.jsx
import React from 'react';
import './Workouts.css'; // We will create this CSS file next
import { IoDocumentTextOutline, IoListOutline } from 'react-icons/io5';

const Workouts = () => {
  return (
    <div className="routines-page">
      <h1 className="page-title">Routines</h1>

      <div className="form-card">
        <h3>Save New Routine</h3>
        <div className="form-group">
          <label>Routine Name</label>
          <div className="input-wrapper">
            <IoDocumentTextOutline className="input-icon" />
            <input
              type="text"
              className="form-input-no-icon"
              placeholder="e.g., Leg Day"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Exercises/Notes</label>
          <div className="input-wrapper">
            <IoListOutline className="input-icon" />
            <textarea
              className="form-input-no-icon"
              placeholder="e.g., Squats 3x10, Lunges 3x12..."
            />
          </div>
        </div>
        <button className="btn-save-routine">+ Save Routine</button>
      </div>

      <div className="divider"></div>
      <h3>Saved Routines</h3>
      <div className="empty-routines">
        <p>No routines saved yet.</p>
      </div>
    </div>
  );
};

export default Workouts;