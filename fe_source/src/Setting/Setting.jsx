import React from 'react';
import { Button } from 'antd';

import './Setting.css';
import { CurrentUserContext } from '../common/context';
import api from '../api';

class Setting extends React.Component {
  logOut = () => {
    this.props.logOut();
    this.props.history.push('/login');
  }

  showLog = logName => {
    switch (logName) {
      case 'error':
        window.open(api.getErrorsLog);
        break;
      case 'access':
        window.open(api.getAccessLog);
        break
      default:
        window.open(api.getAppLog, '_blank');
        break;
    } 
  }

  render() {
    return (   
      <div id="logOut">
        <Button
          id="logOutButton"
          type="primary"
          onClick={this.logOut}>
          Log Out
        </Button>
        <Button
          type="primary"
          onClick={this.showLog}>
          Show logs
        </Button>
        <Button
          type="primary"
          onClick={this.showLog.bind(this, 'error')}>
          Show Error logs
        </Button>
        <Button
          type="primary"
          onClick={this.showLog.bind(this, 'access')}>
          Show Access logs
        </Button>
      </div>
    )
  }
}

export default props => (
  <CurrentUserContext.Consumer>
    {({ logOut }) => (
      <Setting logOut={logOut} {...props}/>
    )}
  </CurrentUserContext.Consumer>
);