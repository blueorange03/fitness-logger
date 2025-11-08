// src/App.js
import React, { useState } from 'react';
import './App.css';

// Import Pages
import Login from './pages/Login';
import Log from './pages/LogWorkout';
import Profile from './pages/Profile';


// Import Components
import Navbar from './components/Navbar';

function App() {
  // We'll use this state to manage auth and navigation
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState('log'); // Default page after login

  // This will render the correct page based on 'activePage' state
  const renderPage = () => {
    switch (activePage) {
      case 'log':
        return <Log />;
      case 'routines':
        return <Routines />;
      case 'statistics':
        return <Statistics />;
      case 'profile':
        return <Profile />;
      default:
        return <Log />;
    }
  };

  // If not logged in, show the Login page
  if (!isLoggedIn) {
    // We pass setIsLoggedIn so the Login page can update the App state
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  // If logged in, show the main app layout
  return (
    <div className="App">
      {/* The main content (Log, Routines, etc.) */}
      {renderPage()}

      {/* The Bottom Navigation Bar */}
      <Navbar activePage={activePage} setActivePage={setActivePage} />
    </div>
  );
}

export default App;