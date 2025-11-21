import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import { useUserStore } from './stores/userStore.js';
import Auth from './components/Auth/Auth.js';
import Admin from './components/Admin/Admin.js';
import Header from './components/Header/Header.js';
import NewPost from './components/NewPost/NewPost.js';
import EditPost from './components/EditPost/EditPost.js';
import MainGallery from './components/MainGallery/MainGallery.js';
import MainPostDetail from './components/MainPostDetail/MainPostDetail.js';
import AboutMe from './components/AboutMe/AboutMe.js';
import SearchResults from './components/SearchResults/SearchResults.js';
import DiscountForm from './components/DiscountForm/DiscountForm.js';
import Account from './components/Account/Account.js';
import Messages from './components/Messages/Messages.js';
import AdminInbox from './components/AdminInbox/AdminInbox.js';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.js';
import UserRoute from './components/UserRoute/UserRoute.js';
import { createTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import { toast, ToastContainer } from 'react-toastify';
import websocketService, { attachAdminListener } from './services/websocket.js';
import NotFound from './components/NotFound/NotFound.js';
import UserDashboard from './components/Admin/Users/UsersDashboard.js';
import AuctionList from './components/AuctionList/AuctionList.js';
import AuctionForm from './components/AuctionForm/AuctionForm.js';
import AuctionDetail from './components/AuctionList/AuctionDetail.js';
import AuctionArchive from './components/AuctionArchive/AuctionArchive.js';
import { useProfileStore } from './stores/profileStore.js';
import { useMessaging } from './hooks/useWebSocket.js';
import { getMyMessages } from './services/fetch-messages.js';
import AdminSales from './components/Admin/AdminSales/AdminSales.js';

const mainTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1f8e3d',
    },
    secondary: {
      main: '#1565c0',
    },
  },
  props: {
    MuiTooltip: {
      arrow: true,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});
function App() {
  // eslint-disable-next-line
  const [theme, setTheme] = useState(mainTheme);
  const { user, isAdmin, setUnreadMessageCount } = useUserStore();
  const { profile, fetchUserProfile } = useProfileStore();
  const { isConnected, joinConversation } = useMessaging();
  const location = useLocation();
  const navigate = useNavigate();

  if (user && user.isAdmin) {
    attachAdminListener();
  }

  useEffect(() => {
    if (!user) {
      useUserStore.getState().fetchUser();
    }
  }, [user]);

  useEffect(() => {
    if (!user || !isConnected) return;

    const joinUserConversation = async () => {
      try {
        const messages = await getMyMessages();
        if (messages.length > 0) {
          const convId = messages[0].conversationId;
          joinConversation(convId);
        }
      } catch (err) {
        console.error('Failed to pre-join conversation:', err);
      }
    };

    joinUserConversation();
  }, [user, isConnected, joinConversation]);

  useEffect(() => {
    if (user && !profile) {
      fetchUserProfile();
    }
  }, [user, profile, fetchUserProfile]);

  useEffect(() => {
    const handleOutbid = () => {
      toast.warn(`You’ve been outbid!`, {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3000,
      });
    };

    const handleYouWon = () => {
      if (location.pathname.includes('/account')) return;
      toast.success(<p>You won the auction! Check your account page for more information.</p>, {
        theme: 'colored',
        draggable: true,
        draggablePercent: 60,
        autoClose: false,
      });
    };

    const handleAuctionEnded = () => {
      if (location.pathname.includes('/account')) return;

      toast.success(`Auction has ended.`, {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3000,
      });
    };

    const handleNavAccount = () => {
      toast.dismiss();
      navigate('/account');
    };

    const handleTrackingUpdated = () => {
      toast.success(
        <div>
          <span style={{ fontSize: '1rem', display: 'block', marginBottom: '1rem' }}>
            Tracking # has been updated!
          </span>
          <span
            style={{ fontSize: '.9rem' }}
            onClick={() => {
              handleNavAccount();
            }}
          >
            go to{' '}
            <span style={{ fontWeight: 'bold', color: 'green', cursor: 'pointer' }}>Account </span>
            page
          </span>
        </div>,
        {
          theme: 'dark',
          draggable: true,
          draggablePercent: 60,
          autoClose: false,
        }
      );
    };

    websocketService.on('user-outbid', handleOutbid);
    websocketService.on('user-won', handleYouWon);
    websocketService.on('auction-ended', handleAuctionEnded);
    websocketService.on('tracking-info', handleTrackingUpdated);

    return () => {
      websocketService.off('user-outbid', handleOutbid);
      websocketService.off('user-won', handleYouWon);
      websocketService.off('auction-ended', handleAuctionEnded);
      websocketService.off('tracking-info', handleTrackingUpdated);
      websocketService.disconnect();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const handleAdminNotify = (data) => {
      const msg = data?.message || data;
      if (msg && !msg.isFromAdmin) {
        setUnreadMessageCount((prev) => prev + 1);
      }
    };

    websocketService.on('new_customer_message', handleAdminNotify);

    return () => {
      websocketService.off('new_customer_message', handleAdminNotify);
    };
  }, [user, setUnreadMessageCount, isAdmin]);

  return (
    <div className="App">
      <div className="app-wrapper">
        <Header />
        <ToastContainer position="top-center" />
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/auth/:type" element={<Auth />} />
            <Route path="/" element={<MainGallery />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/about-me" element={<AboutMe />} />
            <Route path="/auctions" element={<AuctionList />} />
            <Route path="/auctions/:id" element={<AuctionDetail />} />
            <Route path="/auctions/archive" element={<AuctionArchive />} />

            <Route path="/:id" element={<MainPostDetail />} />

            <Route
              path="/admin/discounts"
              element={
                <ProtectedRoute>
                  <DiscountForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/new"
              element={
                <ProtectedRoute>
                  <NewPost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/:id"
              element={
                <ProtectedRoute>
                  <EditPost />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/inbox"
              element={
                <ProtectedRoute>
                  <AdminInbox />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/sales"
              element={
                <ProtectedRoute>
                  <AdminSales />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/auctions"
              element={
                <ProtectedRoute>
                  <AuctionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/auctions/:id"
              element={
                <ProtectedRoute>
                  <AuctionForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <UserRoute>
                  <Account />
                </UserRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <UserRoute>
                  <Messages />
                </UserRoute>
              }
            />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </ThemeProvider>
      </div>
    </div>
  );
}
export default App;
