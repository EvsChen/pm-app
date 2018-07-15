import React from 'react';
import { Icon, Button } from 'antd';

import TaskCard from '../common/TaskCard';
import AddActionModal from './AddActionModal';
import './ActionList.css';

class ActionList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addActionModalVisible: false,
      addActionModalLoading: false
    };
  }

  addAction = () => {

  }
  
  showAddActionModal = () => {
    this.setState({
      addActionModalVisible: true
    });
  }

  closeAddActionModal = () => {
    this.setState({
      addActionModalVisible: false
    });
  }

  render() {
    return (
      <div>
        <AddActionModal
          visible={this.state.addActionModalVisible}
          confirmLoading={this.state.addActionModalLoading}
          onCreate={this.addAction}
          onCancel={this.closeAddActionModal}
          wrappedComponentRef={formRef => { this.formRef = formRef }}
          />
        <Icon type="left"
          onClick={() => { this.props.history.go(-1); }}
          style={{ float: 'left' }} />
        <p>The task id is {this.props.match.params.taskId} </p>
        <Button
          type="primary"
          id="addFlow"
          className="action-button"
          onClick={this.showAddActionModal}
          style={{ left: window.innerWidth - 75 }}>
          Add
      </Button>
      </div>
    )
  }
}

export default ActionList;