import { Redirect, Route, Switch } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/auth/:type" component={Auth} />
        <Route exact path="/" />
        {user && <Redirect to="/posts" />}
        {!user && <Redirect to="/auth/sign-in" />}
      </Switch>
    </div>
  );
}

export default App;
