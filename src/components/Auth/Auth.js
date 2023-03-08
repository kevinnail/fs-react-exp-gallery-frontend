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

  if (user) {
    return <Redirect to="/admin" />;
  } else if (error) {
    console.error(error);
  }

  const submitAuth = async () => {
    try {
      await logInUser(email, password, type);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="auth-container">
      <div className="sign-in-sign-out">
        <NavLink className="link" to="/auth/sign-in" onClick={() => setIsSignIn(true)}>
          Sign-in
        </NavLink>
        <NavLink className="link" to="/auth/sign-up" onClick={() => setIsSignIn(false)}>
          Sign-up
        </NavLink>
      </div>

      <div className="email-container">
        <input
          className="input"
          type="email"
          placeholder="email@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <button onClick={submitAuth}>{isSignIn ? 'Sign In' : 'Sign Up'}</button>
      </div>
    </div>
  );
}
