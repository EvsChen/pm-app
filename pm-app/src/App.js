import React, { Component } from 'react';
import {
  HashRouter as Router,
  Route,
  Redirect
} from 'react-router-dom';

import Login from './Login';
import Main from './Main';
import Register from './Register';
import './App.css';
import { CurrentUserContext } from './common/context';

const isAuthenticated = () => {
  if (localStorage.getItem('userId')) {
    return true;
  }
  return false;
}

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      isAuthenticated() ? (
        <Component {...props} />
      ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location }
            }}
          />
        )
    }
  />
);

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        id: localStorage.getItem('userId') || '',
        logOut: this.logOut
      }
    };
  }

  // TODO: consider store using jwt
  logIn = id => {
    this.setState({
      user: {
        id,
        logOut: this.logOut
      }
    });
    localStorage.setItem('userId', id);
  }

  logOut = () => {
    this.setState({ id: '' });
    localStorage.removeItem('userId');
  }

  render() {
    return (
      <Router>
        <CurrentUserContext.Provider value={this.state.user}>
          <div className="App">
            <Route exact path="/" render={() => <Redirect to="/home"/> }/>
            <PrivateRoute path="/home" component={Main} />
            <Route
              path="/login"
              render={props => <Login {...props} logIn={this.logIn} />}
            />
            <Route path="/register" component={Register} />
          </div>
        </CurrentUserContext.Provider>
      </Router>
    );
  }
}

export default App;
