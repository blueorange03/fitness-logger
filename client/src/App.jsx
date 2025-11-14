import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import LogWorkout from "./pages/LogWorkout";
import Workouts from "./pages/Workouts"; 
import Profile from "./pages/Profile";
import Routines from "./pages/Routines"; 
import Statistics from "./pages/Statistics";

export default function App() {
  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          
          {/* /workouts is now the list of routines (Push/Pull/Legs) */}
          <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} /> 
          
          {/* /routines now handles the base path and the dynamic routine detail path */}
          <Route path="/routines" element={<ProtectedRoute><Routines /></ProtectedRoute>} />
          <Route path="/routines/:routineName" element={<ProtectedRoute><Routines /></ProtectedRoute>} /> 
          
          <Route path="/log" element={<ProtectedRoute><LogWorkout /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><Statistics /></ProtectedRoute>}/>
        </Routes>
      </div>
    </>
  );
}