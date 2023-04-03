import React, { useState } from 'react';
import { NavLink, Redirect, useParams } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import './Auth.css';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignIn, setIsSignIn] = useState(true);
  const { user, logInUser, error, loading, setLoading } = useUser();
  const { type } = useParams();
  // const [loading, setLoading] = useState(false);
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
    <>
      <div className="auth-container">
        {}

        {}
        <div className="scene">
          <div className="cube">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face right"></div>
            <div className="face left"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
          </div>
        </div>
        <div className="scene2">
          <div className="cube2">
            <div className="face2 front2"></div>
            <div className="face2 back2"></div>
            <div className="face2 right2"></div>
            <div className="face2 left2"></div>
            <div className="face2 top2"></div>
            <div className="face2 bottom2"></div>
          </div>
        </div>
        <div className="scene3">
          <div className="dodecahedron">
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
            <div className="face3"></div>
          </div>
        </div>
        <div className="scene4">
          <div className="dodecahedron2">
            <div className="face4"></div>
            <div className="face4"></div>
            <div className="face4"></div>
            <div className="face4"></div>
            <div className="face4"></div>
            <div className="face4"></div>
            <div className="face4"></div>
            <div className="face4"></div>
            <div className="face4"></div>
            <div className="face4"></div>
            <div className="face4"></div>
          </div>
        </div>
        <div className="scene5">
          <div className="triangle">
            <div className="face5"></div>
            <div className="face5"></div>
            <div className="face5"></div>
          </div>
        </div>
        {}
        {}
        {/* <div className="marble-container">
        <img className="rotating-marble" src="../marble-css.png" />
      </div> */}

        {}
        {}
        {}
        {}
        {}
        {}
        {}
        <div className="auth-section-container">
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
          </div>

          <input
            className="input-auth"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div>
            <button className="button-auth" onClick={submitAuth}>
              {isSignIn ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
