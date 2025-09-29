import { Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { useUser } from './hooks/useUser.js';
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
import { createTheme } from '@mui/material';
import { useState } from 'react';
import { ThemeProvider } from '@emotion/react';
import { ToastContainer } from 'react-toastify';

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

  const { user } = useUser();

  return (
    <div className="App">
      <div className="app-wrapper">
        <Header />
        <ToastContainer position="top-center" />
        <ThemeProvider theme={theme}>
          <Routes>
            <Route path="/auth/:type" element={<Auth />} />
            <Route path="/main-gallery/:id" element={<MainPostDetail />} />
            <Route path="/main-gallery" element={<MainGallery />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/about-me" element={<AboutMe />} />
            <Route path="/admin/discounts" element={<DiscountForm />} />
            <Route path="/admin/new" element={<NewPost />} />
            <Route path="/admin/:id" element={<EditPost />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to={user ? '/admin' : '/auth/sign-in'} replace />} />
          </Routes>
        </ThemeProvider>
      </div>
    </div>
  );
}
export default App;
