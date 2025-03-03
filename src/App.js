import { Redirect, Route, Switch } from 'react-router-dom';
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
  const [theme, setTheme] = useState(mainTheme);

  const { user } = useUser();

  return (
    <div className="App">
      <div className="app-wrapper">
        <Header />
        <ThemeProvider theme={theme}>
          <Switch>
            <Route exact path="/auth/:type" component={Auth} />
            <Route path="/main-gallery/:id" component={MainPostDetail} />
            <Route path="/main-gallery" component={MainGallery} />
            <Route path="/search" component={SearchResults} />
            <Route path="/about-me" component={AboutMe} />
            <Route path="/admin/discounts" component={DiscountForm} />
            <Route path="/admin/new" component={NewPost} />
            <Route exact path="/admin/:id" component={EditPost} />

            <Route path="/admin" component={Admin} />
            <Route path="*">
              <Redirect to={user ? '/admin' : '/auth/sign-in'} />
            </Route>
          </Switch>
        </ThemeProvider>
      </div>
    </div>
  );
}
export default App;
