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
import { CurrentUserContext } from './context';

// TODO: Consider combining the auth into the App
const auth = {
  isAuthenticated: false,
  authenticate() {
    this.isAuthenticated = true;
  },
  signout() {
    this.isAuthenticated = false;
  }
};

const PrivateRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={props =>
      auth.isAuthenticated ? (
        <Component {...props} />
      ) : (
        <Redirect
          to={{
            pathname: "/login",
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
      curretUser: {
        id: 'app'
      }
    }
  }

  logIn = (id) => {
    auth.authenticate();
    this.setState({ 
      user: { 
        id,
        logOut: this.logOut
      }
    });
  }

  logOut = () => {
    auth.signout();
    this.setState({
      id: ''
    });
  }

  render() {
    return (
      <Router>
        <CurrentUserContext.Provider value={this.state.user}>
          <div className="App">
            <PrivateRoute path="/home" component={Main} />
            <PrivateRoute exact path="/" component={Main} />            
            <Route
              path="/login"
              render={(props) => <Login {...props} logIn={this.logIn}/>}
            />
            <Route path="/register" component={Register} />
          </div>
        </CurrentUserContext.Provider>
      </Router>
    );
  }
}

export default App;
