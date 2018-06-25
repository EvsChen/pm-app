import React from 'react';
import { Button } from 'antd';
import './Setting.css';
import { CurrentUserContext } from '../context';

class Setting extends React.Component {
  logOut = () => {
    this.props.history.push('/login');
  }

  render() {
    return (
      <CurrentUserContext.Consumer>
        {({ logOut }) => (
          <React.Fragment>
          <div id="logOut">
            <Button
              id="logOutButton"
              type="primary"
              onClick={this.logOut}>
              Log Out
          </Button>
          </div>
        </React.Fragment>
        )}
        </CurrentUserContext.Consumer>
    )
  }
}

export default Setting;