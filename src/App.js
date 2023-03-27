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

function App() {
  const { user } = useUser();

  return (
    <div className="App">
      <Header />
      <Switch>
        <Route exact path="/auth/:type" component={Auth} />
        <Route path="/gallery/:id" component={PostDetail} />
        <Route path="/gallery" component={Gallery} />
        <Route path="/admin/new" component={NewPost} />
        <Route exact path="/admin/:id" component={EditPost} />
        <Route path="/admin" component={Admin} />
        <Route exact path="*">
          {user && <Redirect to="/admin" />}
          {!user && <Redirect to="/auth/sign-in" />}
        </Route>
      </Switch>
    </div>
  );
}
export default App;
