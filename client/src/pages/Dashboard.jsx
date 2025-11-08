import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard() {
  const [workouts, setWorkouts] = useState([]);
  useEffect(() => {
    api.get('/workouts').then(res => setWorkouts(res.data.workouts || []));
  }, []);
  return (
    <div>
      <h2>Dashboard</h2>
      <p>Total workouts: {workouts.length}</p>
    </div>
  );
}
