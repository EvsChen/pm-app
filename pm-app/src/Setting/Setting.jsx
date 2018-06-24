import React from 'react';
import { Button } from 'antd';
import './Setting.css';

class Setting extends React.Component {
  logOut = () => {
    this.props.history.push('/login');
  }

  render() {
    return (
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
    )
  }
}

export default Setting;