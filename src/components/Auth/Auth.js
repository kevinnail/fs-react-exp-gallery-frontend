import { useEffect, useState } from 'react';
import { Link, NavLink, useParams, useNavigate, Navigate } from 'react-router-dom';
import { useUserStore } from '../../stores/userStore.js';
import './Auth.css';
import { authUser } from '../../services/auth.js';
import { getUser } from '../../services/fetch-utils.js';
import Loading from '../Loading/Loading.js';
import { toast } from 'react-toastify';
import AgreementModal from './AgreementModal.js';
import { useGalleryPosts } from '../../hooks/useGalleryPosts.js';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignIn, setIsSignIn] = useState(true);
  const { user, setUser, error, loading, setLoading, setIsAdmin, isAdmin } = useUserStore();
  const { type } = useParams();
  const [isFormRetracted, setIsFormRetracted] = useState(false);
  const navigate = useNavigate();
  const [isAgreementOpen, setAgreementOpen] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { posts, galleryLoading } = useGalleryPosts();
  const [recentImages, setRecentImages] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  // Get most recent posts for cube
  useEffect(() => {
    const loadRecentPosts = async () => {
      try {
        if (Array.isArray(posts)) {
          const sorted = posts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setRecentImages(sorted);
        }
      } catch (err) {
        console.error('Error loading posts:', err);
      }
    };
    loadRecentPosts();
  }, [posts]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verify') === 'true') {
      toast.success('Email verified successfully! You can now sign in.', {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        autoClose: 5000,
      });
    } else if (params.get('verified') === 'false') {
      toast.error(
        <div>
          <p>Invalid or expired verification link.</p>
          <p>
            Please try again. If that fails, please contact me on{' '}
            <a style={{ textDecoration: 'none' }} href="http://www.instagram.com/stresslessglass">
              Instagram
            </a>
          </p>
        </div>,
        {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          autoClose: false,
        }
      );
    }
  }, []);

  // Validation functions
  const validateEmailLength = (email) => {
    if (email.length > 100) {
      toast.warn('Email must be 100 characters or less', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        autoClose: 5000,
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
        autoClose: 5000,
      });
      return false;
    }
    return true;
  };

  // runs live as user types
  const validatePasswordLengthLive = (password) => {
    if (password.length > 50) {
      toast.warn('Password must be 50 characters or less', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        autoClose: 5000,
      });
      return false;
    }
    return true;
  };

  // runs only at submit
  const validatePasswordMinAtSubmit = (password) => {
    if (password.length < 8) {
      toast.warn('Password must be at least 8 characters long', {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        autoClose: 5000,
      });
      return false;
    }
    return true;
  };

  // At least 8 chars, 1 lowercase, 1 uppercase, 1 number, 1 special character
  function isStrongPassword(password) {
    // At least 8 chars, 1 lowercase, 1 uppercase, 1 number, 1 special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
    return regex.test(password);
  }

  const validatePasswordSignUp = (password) => {
    if (!isStrongPassword(password)) {
      toast.warn(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and symbol',
        {
          theme: 'dark',
          draggable: true,
          draggablePercent: 60,
          autoClose: 10000,
        }
      );
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
    validatePasswordLengthLive(value);
  };

  if (user) {
    return <Navigate to={isAdmin ? '/admin' : '/account'} replace />;
  } else if (error) {
    console.error(error);
  }

  // submit form to log in or sign up
  const submitAuth = async () => {
    try {
      setLoading(true);

      // check email format/ value
      const normalizedEmail = email.trim();

      // check if email is scammer and serve up some wasted time
      // ^ waste time START ================================================
      if (normalizedEmail === 'stresslessglassauctions1@gmail.com') {
        toast.success('Success! Please wait one moment until your account is created...', {
          theme: 'dark',
          draggable: true,
          draggablePercent: 60,
          toastId: 'secure-password',
          autoClose: false,
        });

        // after 30 seconds
        setTimeout(() => {
          toast.info('Creating your profile...', {
            theme: 'dark',
            autoClose: 30000,
          });
        }, 1000);

        // after 70 seconds
        setTimeout(() => {
          toast.info('Finalizing setup...', {
            theme: 'dark',
            autoClose: 70000,
          });
        }, 32000);

        // after 1100 seconds
        setTimeout(() => {
          toast.success('All set! You can now sign in. Click here!', {
            theme: 'dark',
            autoClose: 90000,
          });
        }, 104000);

        return;
      }
      // ^ waste time END =================================================

      const isLengthOk = validateEmailLength(normalizedEmail);
      const isFormatOk = validateEmailFormat(normalizedEmail);

      if (!isLengthOk || !isFormatOk) {
        setLoading(false);
        return;
      }

      if (type === 'sign-up' && !validatePasswordSignUp(password)) {
        setLoading(false);
        return;
      }

      // check if password is long enough
      const isPasswordValid = validatePasswordMinAtSubmit(password);
      if (!isPasswordValid) {
        setLoading(false);
        return;
      }

      await authUser(normalizedEmail, password, type);
      const data = await getUser();

      if (!data?.user?.isVerified) {
        toast.info('Please check your email to verify account!', {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          autoClose: false,
        });
        setLoading(false);
        return;
      }

      if (data) {
        // Handle different possible data structures
        const user = data.user?.user || data.user || data;
        const isAdmin = data.isAdmin || false;
        setUser(user);
        setIsAdmin(isAdmin);
        setLoading(false);
        if (isAdmin) {
          navigate('/admin');
        } else {
          navigate('/account');
        }
      }

      if (type === 'sign-up') {
        toast.success('Account created successfully', {
          theme: 'colored',
          draggable: true,
          draggablePercent: 60,
          autoClose: 5000,
        });
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

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <div className="auth-container">
        <div className="scene">
          <div className="cube">
            {['front', 'back', 'right', 'left', 'top', 'bottom'].map((pos, idx) => {
              const post = recentImages[idx];
              const img = post?.image_url || post?.imageUrl || post?.image;
              const href = galleryLoading ? '#' : post?.id ? `/${post.id}` : '/';

              if (galleryLoading) {
                return (
                  <div
                    key={post?.id ?? pos}
                    className={`face ${pos} placeholder`}
                    style={{
                      width: '100%',
                      paddingBottom: '100%',
                      backgroundColor: '#333',
                      borderRadius: '5px',
                      display: 'block',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxSizing: 'border-box',
                      border: 'none',
                    }}
                  >
                    {' '}
                    <Link className="hidden-text-link" to={href}>
                      {
                        'This is a link to the gallery page if you are clever enough you might find it! '
                      }
                    </Link>
                  </div>
                );
              }

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
              <p className="welcome-message">Create your free account!</p>
              <div className="welcome-features">
                <ul>
                  <li>Exclusive discounts & early access to new work</li>
                  <li>Bid on in house Auctions</li>
                  <li>Message me - private & encrypted</li>
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
                    placeholder="enter your email address"
                    value={email}
                    onChange={handleEmailChange}
                    maxLength={101}
                    required
                    inputMode="email"
                    autoComplete="email"
                  />
                </div>
                <div className="password-field">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Password"
                    className="input-auth"
                  />
                  <span className="toggle-visibility" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </span>
                </div>
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
        title="Hide form if you feel like spacing out and watching the animation.  For the nerds:  this is 100% raw CSS, nothing else, no frameworks!"
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
