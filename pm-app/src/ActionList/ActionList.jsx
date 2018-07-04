import React from 'react';
import { Icon } from 'antd';

import TaskCard from '../common/TaskCard';

class ActionList extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
      <Icon type="left" 
      onClick={() => {this.props.history.go(-1);}}
      style={{ float: 'left' }} />
      <p>The task id is {this.props.match.params.taskId} </p>
      </div>
    )
  }
}

export default ActionList;