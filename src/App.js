import { Route, Routes } from 'react-router-dom';
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
import Profile from './components/Profile/Profile.js';
import Messages from './components/Messages/Messages.js';
import AdminInbox from './components/AdminInbox/AdminInbox.js';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.js';
import UserRoute from './components/UserRoute/UserRoute.js';
import { createTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import { toast, ToastContainer } from 'react-toastify';
import websocketService from './services/websocket.js';
import NotFound from './components/NotFound/NotFound.js';
import UserDashboard from './components/Admin/Users/UsersDashboard.js';
import AuctionList from './components/AuctionList/AuctionList.js';
import AuctionForm from './components/AuctionForm/AuctionForm.js';
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

  const user = useUserStore((state) => state.user);

  useEffect(() => {
    websocketService.connect();

    const handleOutbid = (data) => {
      toast.warn(`You’ve been outbid on auction #${data.auctionId}`, {
        theme: 'dark',
        draggable: true,
        draggablePercent: 60,
        autoClose: 3000,
      });
    };

    websocketService.on('user-outbid', handleOutbid);

    return () => {
      websocketService.off('user-outbid', handleOutbid);
      websocketService.disconnect(); // optional: only if App truly unmounts once
    };
  }, []);

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
              path="/profile"
              element={
                <UserRoute>
                  <Profile />
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
