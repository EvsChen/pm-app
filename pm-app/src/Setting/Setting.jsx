import React from 'react';
import { Button } from 'antd';
import './Setting.css';
import { CurrentUserContext } from '../common/context';

class Setting extends React.Component {
  logOut = () => {
    this.props.logOut();
    this.props.history.push('/login');
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