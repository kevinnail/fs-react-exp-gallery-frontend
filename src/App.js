import { Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import { useUser } from './hooks/useUser.js';
import Auth from './components/Auth/Auth.js';
import Admin from './components/Admin/Admin.js';
import Header from './components/Header/Header.js';
import NewPost from './components/NewPost/NewPost.js';
import EditPost from './components/EditPost/EditPost.js';
import Gallery from './components/Gallery/Gallery.js';
import PostDetail from './components/PostDetail/PostDetail.js';
import MainGallery from './components/MainGallery/MainGallery.js';
import MainPostDetail from './components/MainPostDetail/MainPostDetail.js';
import AboutMe from './components/AboutMe/AboutMe.js';
import SearchResults from './components/SearchResults/SearchResults.js';
import DiscountForm from './components/DiscountForm/DiscountForm.js';

function App() {
  const { user } = useUser();

  return (
    <div className="App">
      <div className="app-wrapper">
        <Header />
        <Switch>
          <Route exact path="/auth/:type" component={Auth} />
          <Route path="/main-gallery/:id" component={MainPostDetail} />
          <Route path="/main-gallery" component={MainGallery} />
          <Route path="/search" component={SearchResults} />
          <Route path="/gallery/:id" component={PostDetail} />
          <Route path="/gallery" component={Gallery} />
          <Route path="/about-me" component={AboutMe} />
          <Route path="/admin/discounts" component={DiscountForm} />
          <Route path="/admin/new" component={NewPost} />
          <Route exact path="/admin/:id" component={EditPost} />

          <Route path="/admin" component={Admin} />
          <Route path="*">
            <Redirect to={user ? '/admin' : '/auth/sign-in'} />
          </Route>
        </Switch>
      </div>
    </div>
  );
}
export default App;
