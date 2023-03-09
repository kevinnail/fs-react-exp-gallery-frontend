import { Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import Auth from './components/Auth/Auth.js';
import Admin from './components/Admin/Admin.js';
import Header from './components/Header/Header.js';
import { useUser } from './hooks/useUser.js';
import NewPost from './components/NewPost/NewPost.js';

function App() {
  const { user } = useUser();

  return (
    <div className="App">
      <Header />
      <Switch>
        <Route exact path="/auth/:type" component={Auth} />
        <Route path="/admin/new" component={NewPost} />
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
