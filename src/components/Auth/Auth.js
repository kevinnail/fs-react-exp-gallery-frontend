import React, { useState } from 'react';
import { Link, NavLink, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import './Auth.css';
import Menu from '../Menu/Menu.js';
import { signOut, authUser } from '../../services/auth.js';
import { getUser } from '../../services/fetch-utils.js';
import Loading from '../Loading/Loading.js';
import { toast } from 'react-toastify';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignIn, setIsSignIn] = useState(true);
  const { user, setUser, error, loading, setLoading } = useUserStore();
  const { type } = useParams();
  const [isFormRetracted, setIsFormRetracted] = useState(true);
  const navigate = useNavigate();
  if (user) {
    return <Navigate to={user.isAdmin ? '/admin' : '/profile'} replace />;
  } else if (error) {
    console.error(error);
  }

  // submit form to log in or sign up
  const submitAuth = async () => {
    try {
      setLoading(true);
      await authUser(email, password, type);
      const user = await getUser();
      setUser(user);
      setLoading(false);
      navigate('/admin');
    } catch (e) {
      console.error(e);
      toast.error(e.message, {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        autoClose: 5000,
      });
      setLoading(false);
    }
  };

  // show loading spinner while waiting for posts to load1
  if (loading) {
    return <Loading />;
  }

  const handleClick = async () => {
    try {
      await signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      // Still set user to null even if sign out fails
      setUser(null);
    }
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
