import React from 'react';
import { Icon, Button, Checkbox, List } from 'antd';
import axios from 'axios';
import _ from 'lodash';

import AddActionModal from './AddActionModal';
import { CurrentUserContext } from '../context';
import './ActionList.css';
import api from '../api';
import util from '../util';

class ActionList extends React.Component {
  constructor(props) {
    super(props);
    const location = this.props.location;
    this.modalTask = {};
    if (location.state) {
      this.modalTask = this.props.location.state.modalTask;
    }
    this.state = {
      addActionModalVisible: false,
      addActionModalLoading: false,
      actions: []
    };
  }

  componentDidMount() {
    this.loadActions();
  }

  loadActions = () => {
    axios.post(api.queryAction, {
      creator: this.props.userId,
      parent: this.modalTask._id
    })
    .then(res => {
      this.setState({
        actions: res.data
      });
    })
  }

  addAction = () => {
    this.setState({
      addActionModalLoading: true
    });
    const form = this.formRef.props.form;
    const thisObj = this;
    form.validateFields((err, values) => {
      if (err) return;
      const payload = values;
      payload.creator = this.props.userId;
      payload.parent = this.modalTask._id;
      console.log(payload);
      axios.post(api.createAction, payload)
        .then(() => {
          thisObj.setState({
            addActionModalVisible: false,
            addActionModalLoading: false
          });
          util.handleSuccess('Create successful');
          thisObj.loadActions();
        })
        .catch(err => {
          thisObj.setState({
            addActionModalVisible: false,
            addActionModalLoading: false
          });
          util.handleError(err);
        });
    });
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

  onActionCheck = (_id, e) => {
    const actions = this.state.actions;
    const ind = _.findIndex(actions, { _id });
    if (ind >= 0) {
      actions[ind].progress = e.target.checked 
        ? 100
        : 0;
    }
    this.setState({
      actions
    });
  }

  render() {
    const renderItem = item => (
      <List.Item>
        {item.progress === 100 
          ? <del>{`${item.title}`}</del>
          : item.title
        }
        <Checkbox onChange={this.onActionCheck.bind(this, item._id)}></Checkbox>
      </List.Item>
    );
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
        {
          this.modalTask._id
            ? (
                <List
                  header={<div>{`${this.modalTask.title}`}</div>}
                  bordered
                  dataSource={this.state.actions}
                  renderItem={renderItem}
                />
              )
            : (
              <p>Add actions for this task</p>
            )
        }
        
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

export default props => (
  <CurrentUserContext.Consumer>
    {({ id }) => <ActionList {...props} userId={id} />}
  </CurrentUserContext.Consumer>
);