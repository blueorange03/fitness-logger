import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  return (
    <header style={{ background: '#111827', color: 'white', padding: '10px 20px' }}>
      <h2>Fitness Logger</h2>
      <nav>
        {user ? (
          <>
            <Link to="/dashboard">Dashboard</Link> |{" "}
            <Link to="/log">Log Workout</Link> |{" "}
            <Link to="/workouts">My Workouts</Link> |{" "}
            <Link to="/profile">Profile</Link> |{" "}
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
