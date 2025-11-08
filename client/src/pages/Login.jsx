// src/pages/Login.js
import React from 'react';
import './Login.css'; // We will create this CSS file next
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

// 'onLoginSuccess' is passed down from App.js
const Login = ({ onLoginSuccess }) => {
  // TODO: Add state for email/password
  // TODO: Add real login/signup logic

  const handleLogin = (e) => {
    e.preventDefault();
    // On a real login, you'd check with the backend
    // For now, we'll just log in successfully
    onLoginSuccess();
  };

  return (
    <div className="login-page">
      <form className="login-form">
        <h1>Fitness Logger</h1>
        <p>Sign in or create an account to continue</p>

        <div className="form-group">
          <label>Email</label>
          <div className="input-wrapper">
            <HiOutlineMail className="input-icon" />
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="input-wrapper">
            <HiOutlineLockClosed className="input-icon" />
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button className="btn btn-primary" onClick={handleLogin}>
          Login
        </button>
        <button className="btn btn-secondary">Sign Up</button>

        <p className="firebase-note">
          Note: Login/Signup requires "Email/Password"...
        </p>
      </form>
    </div>
  );
};

export default Login;