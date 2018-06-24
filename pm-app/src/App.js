import React, { Component } from 'react';
import {
  BrowserRouter as Router,
  Route
} from 'react-router-dom';
import Login from './Login';
import Main from './Main';
import Register from './Register';
import './App.css';


class App extends Component {
  render() {
    return (
      <Router>
        <div className="App">
          <Route path="/home" component={Main} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
        </div>
      </Router>
    );
  }
}

export default App;
