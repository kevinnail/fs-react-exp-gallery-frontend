import { Redirect, Route, Switch } from 'react-router-dom';
import './App.css';
import Auth from './components/Auth/Auth.js';
import { useUser } from './hooks/useUser.js';

function App() {
  const { user, error } = useUser();

  if (user) {
    return <Redirect to="/gallery" />;
  } else if (error) {
    console.error(error);
  }
  return (
    <div className="App">
      <Switch>
        <Route path="/auth/:type" component={Auth} />
        <Route exact path="*" />
        {user && <Redirect to="/gallery" />}
        {!user && <Redirect to="/auth/sign-in" />}
      </Switch>
    </div>
  );
}
export default App;
