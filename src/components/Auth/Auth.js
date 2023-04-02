import React, { useState } from 'react';
import { NavLink, Redirect, useParams } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import './Auth.css';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignIn, setIsSignIn] = useState(true);
  const { user, logInUser, error } = useUser();
  const { type } = useParams();
  const [loading, setLoading] = useState(false);
  if (user) {
    return <Redirect to="/admin" />;
  } else if (error) {
    console.error(error);
  }

  const submitAuth = async () => {
    try {
      setLoading(true);
      await logInUser(email, password, type);
    } catch (e) {
      console.error(e);
    }
  };
  // show loading spinner while waiting for posts to load1
  if (loading) {
    return (
      <div className="loading-div">
        <img className="loading" src="../logo-sq.png" />
      </div>
    );
  }

  return (
    <div className="auth-container">
      {}
      {}
      {}
      {}
      {}
      {}
      <div className="marble-container">
        <img className="rotating-marble" src="../marble-css.png" />
      </div>

      {}
      {}
      {}
      {}
      {}
      {}
      {}
      <div className="sign-in-sign-out">
        <NavLink className="auth-link" to="/auth/sign-in" onClick={() => setIsSignIn(true)}>
          Sign-in
        </NavLink>
        <NavLink className="auth-link" to="/auth/sign-up" onClick={() => setIsSignIn(false)}>
          Sign-up
        </NavLink>
      </div>

      <div className="email-container">
        <input
          className="input-auth"
          type="email"
          placeholder="email@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input-auth"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button className="button-auth" onClick={submitAuth}>
          {isSignIn ? 'Sign In' : 'Sign Up'}
        </button>
      </div>
    </div>
  );
}
