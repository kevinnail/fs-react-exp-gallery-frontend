import { useEffect, useState } from 'react';
import { Link, NavLink, useParams, useNavigate, Navigate } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import './Auth.css';
import Menu from '../Menu/Menu.js';
import { signOut, authUser } from '../../services/auth.js';
import { getUser } from '../../services/fetch-utils.js';
import Loading from '../Loading/Loading.js';
import { toast } from 'react-toastify';
import AgreementModal from './AgreementModal.js';
import { fetchGalleryPosts } from '../../services/fetch-utils.js';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignIn, setIsSignIn] = useState(true);
  const { user, setUser, error, loading, setLoading, signout, setIsAdmin, isAdmin } =
    useUserStore();
  const { type } = useParams();
  const [isFormRetracted, setIsFormRetracted] = useState(false);
  const navigate = useNavigate();
  const [isAgreementOpen, setAgreementOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [recentImages, setRecentImages] = useState([]);

  useEffect(() => {
    const loadRecentPosts = async () => {
      try {
        const posts = await fetchGalleryPosts();
        if (Array.isArray(posts)) {
          const sorted = posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setRecentImages(sorted);
        }
      } catch (err) {
        console.error('Error loading posts:', err);
      }
    };
    loadRecentPosts();
  }, []);

  // Validation functions
  const validateEmailLength = (email) => {
    if (email.length > 100) {
      toast.warn('Email must be 100 characters or less', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3000,
      });
      return false;
    }
    return true;
  };

  const validateEmailFormat = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.warn('Enter a valid email address', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3000,
      });
      return false;
    }
    return true;
  };

  const validatePassword = (password) => {
    if (password.length > 50) {
      toast.warn('Password must be 50 characters or less', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3000,
      });
      return false;
    }
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmailLength(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
  };
  if (user) {
    return <Navigate to={isAdmin ? '/admin' : '/profile'} replace />;
  } else if (error) {
    console.error(error);
  }

  // submit form to log in or sign up
  const submitAuth = async () => {
    try {
      setLoading(true);
      const normalizedEmail = email.trim();
      const isLengthOk = validateEmailLength(normalizedEmail);
      const isFormatOk = validateEmailFormat(normalizedEmail);
      if (!isLengthOk || !isFormatOk) {
        setLoading(false);
        return;
      }
      await authUser(normalizedEmail, password, type);
      const data = await getUser();
      if (data) {
        // Handle different possible data structures
        const user = data.user?.user || data.user || data;
        const isAdmin = data.isAdmin || false;
        setUser(user);
        setIsAdmin(isAdmin);
        setLoading(false);
        navigate('/admin');
      }
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

  const handleClick = async () => {
    try {
      await signOut();
      signout();
    } catch (error) {
      console.error('Error signing out:', error);
      // Still clear state even if sign out fails
      signout();
    }
  };

  const handleSignupClick = () => {
    if (!agreedToTerms) {
      setAgreementOpen(true);
    } else {
      submitAuth();
    }
  };

  const handleAgree = () => {
    setAgreementOpen(false);
    setAgreedToTerms(true);
    submitAuth();
  };

  const handleDecline = () => {
    setAgreementOpen(false);
    toast.info('You must agree to the terms to create an account.', {
      theme: 'dark',
      autoClose: 4000,
    });
  };

  // show loading spinner while waiting
  if (loading) {
    return <Loading />;
  }
  console.log('recentImages', recentImages);

  return (
    <>
      <div className="auth-container">
        <div className="menu-search-container">
          <Menu handleClick={handleClick} />
        </div>

        <div className="scene">
          <div className="cube">
            {['front', 'back', 'right', 'left', 'top', 'bottom'].map((pos, idx) => {
              const post = recentImages[idx];
              const img = post?.image_url || post?.imageUrl || post?.image;
              const href = post?.id ? `/post/${post.id}` : '/';
              return (
                <div
                  key={post?.id ?? pos}
                  className={`face ${pos}`}
                  style={{
                    backgroundImage: `url(${img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <Link className="hidden-text-link" to={href}>
                    {
                      'This is a link to the gallery page if you are clever enough you might find it! '
                    }
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        <div className="scene2">
          <div className="cube2">
            <div className="face2 front2">
              <Link className="hidden-text-link" to="/about-me">
                {'About me '}
              </Link>
            </div>
            <div className="face2 back2">
              <Link className="hidden-text-link" to="/about-me">
                {'About me '}
              </Link>
            </div>
            <div className="face2 right2">
              <Link className="hidden-text-link" to="/about-me">
                {'About me '}
              </Link>
            </div>
            <div className="face2 left2">
              <Link className="hidden-text-link" to="/about-me">
                {'About me '}
              </Link>
            </div>
            <div className="face2 top2">
              <Link className="hidden-text-link" to="/about-me">
                {'About me '}
              </Link>
            </div>
            <div className="face2 bottom2">
              <Link className="hidden-text-link" to="/about-me">
                {'About me '}
              </Link>
            </div>
          </div>
        </div>

        <div className={`auth-section-container ${isFormRetracted ? 'retracted' : ''}`}>
          <div className="auth-content-wrapper">
            <div className="welcome-section">
              <h2 className="welcome-title">Welcome to Stress Less Glass</h2>
              <p className="welcome-message">
                Create your free account! I&apos;m actively working on this site adding new features
                which will (soon!) give you:
              </p>
              <div className="welcome-features">
                <ul>
                  <li>Exclusive early access to new work</li>
                  <li>Auctions</li>
                  <li>Messages - secure & private</li>
                </ul>
              </div>
            </div>

            <div className="form-section">
              <div className="sign-in-sign-out">
                <NavLink className="auth-link" to="/auth/sign-in" onClick={() => setIsSignIn(true)}>
                  Sign-in
                </NavLink>
                <NavLink
                  className="auth-link"
                  to="/auth/sign-up"
                  onClick={() => setIsSignIn(false)}
                >
                  Sign-up
                </NavLink>
              </div>

              <div className="form-inputs">
                <div className="email-container">
                  <input
                    className="input-auth"
                    type="email"
                    placeholder="email@email.com"
                    value={email}
                    onChange={handleEmailChange}
                    maxLength={101}
                    required
                    inputMode="email"
                    autoComplete="email"
                  />
                </div>

                <input
                  className="input-auth"
                  type="password"
                  placeholder="password"
                  value={password}
                  onChange={handlePasswordChange}
                  maxLength={51}
                />
                <button className="button-auth" onClick={isSignIn ? submitAuth : handleSignupClick}>
                  {isSignIn ? 'Sign In' : 'Sign Up'}
                </button>
                <AgreementModal
                  isOpen={isAgreementOpen}
                  onAgree={handleAgree}
                  onDecline={handleDecline}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        className="retract-button"
        title="Hide form if you feel like spacing out and watching the animation"
        onClick={() => setIsFormRetracted(!isFormRetracted)}
      >
        {isFormRetracted ? (
          <i className="fa fa-arrow-right" aria-hidden="true"></i>
        ) : (
          <i className="fa fa-arrow-left" aria-hidden="true"></i>
        )}
      </button>
    </>
  );
}
