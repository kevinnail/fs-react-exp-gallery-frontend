import React, { useState } from 'react';
import { Link, NavLink, Redirect, useParams } from 'react-router-dom';
import { useUser } from '../../hooks/useUser.js';
import './Auth.css';
import Menu from '../Menu/Menu.js';
import { signOut } from '../../services/auth.js';
import Loading from '../Loading/Loading.js';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignIn, setIsSignIn] = useState(true);
  const { user, logInUser, error, loading, setLoading, setUser } = useUser();
  const { type } = useParams();
  const [isFormRetracted, setIsFormRetracted] = useState(true);

  if (user) {
    return <Redirect to="/admin" />;
  } else if (error) {
    console.error(error);
  }

  const isEmailAllowed = (email) => {
    const allowedEmails = process.env.REACT_APP_ALLOWED_EMAILS.split(',');
    return allowedEmails.includes(email);
  };

  // submit form to log in or sign up
  const submitAuth = async () => {
    // Check if the email is allowed
    if (!isEmailAllowed(email)) {
      alert('This email is not allowed to create an account.');
      return;
    }

    try {
      setLoading(true);
      await logInUser(email, password, type);
    } catch (e) {
      console.error(e);
    }
  };

  // show loading spinner while waiting for posts to load1
  if (loading) {
    return <Loading />;
  }
  if (error) {
    return (
      <div className="loading-div-wrapper">
        <h2 className="error-state">
          Something went wrong. Please refresh the page or try again later. Here{`'`}s the error
          message if it helps:
          <br />
          <span className="error-span">{error}</span>
        </h2>
      </div>
    );
  }
  const handleClick = async () => {
    await signOut();
    setUser(null);
  };
  return (
    <>
      <div className="auth-container">
        {}
        <div className="menu-search-container">
          <Menu handleClick={handleClick} />
        </div>
        {}
        <div className="scene">
          <div className="cube">
            <div className="face front">
              <Link className="hidden-text-link" to="/main-gallery">
                {' '}
                {'This is a link to the gallery page if you are clever enough you might find it! '}
              </Link>
            </div>
            <div className="face back">
              {' '}
              <Link className="hidden-text-link" to="/main-gallery">
                {'This is a link to the gallery page if you are clever enough you might find it! '}
              </Link>
            </div>
            <div className="face right">
              {' '}
              <Link className="hidden-text-link" to="/main-gallery">
                {'This is a link to the gallery page if you are clever enough you might find it! '}
              </Link>
            </div>
            <div className="face left">
              {' '}
              <Link className="hidden-text-link" to="/main-gallery">
                {'This is a link to the gallery page if you are clever enough you might find it! '}
              </Link>
            </div>
            <div className="face top">
              {' '}
              <Link className="hidden-text-link" to="/main-gallery">
                {'This is a link to the gallery page if you are clever enough you might find it! '}
              </Link>
            </div>
            <div className="face bottom">
              {' '}
              <Link className="hidden-text-link" to="/main-gallery">
                {'This is a link to the gallery page if you are clever enough you might find it! '}
              </Link>
            </div>
          </div>
        </div>
        <div className="scene2">
          <div className="cube2">
            <div className="face2 front2">
              {' '}
              <Link className="hidden-text-link" to="/about-me">
                {'About me '}
              </Link>
            </div>
            <div className="face2 back2">
              {' '}
              <Link className="hidden-text-link" to="/about-me">
                {'About me '}
              </Link>
            </div>
            <div className="face2 right2">
              {' '}
              <Link className="hidden-text-link" to="/about-me">
                {'About me '}
              </Link>
            </div>
            <div className="face2 left2">
              {' '}
              <Link className="hidden-text-link" to="/about-me">
                {'About me '}
              </Link>
            </div>
            <div className="face2 top2">
              {' '}
              <Link className="hidden-text-link" to="/about-me">
                {'About me '}
              </Link>
            </div>
            <div className="face2 bottom2">
              {' '}
              <Link className="hidden-text-link" to="/about-me">
                {'About me '}
              </Link>
            </div>
          </div>
        </div>

        {}
        {}
        {}
        <div className={`auth-section-container ${isFormRetracted ? 'retracted' : ''}`}>
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
          <button className="button-auth" onClick={submitAuth}>
            {isSignIn ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>

      <button className="retract-button" onClick={() => setIsFormRetracted(!isFormRetracted)}>
        {isFormRetracted ? (
          <i className="fa fa-arrow-right" aria-hidden="true"></i>
        ) : (
          <i className="fa fa-arrow-left" aria-hidden="true"></i>
        )}
      </button>
    </>
  );
}
