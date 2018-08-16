import React from 'react';
import { Icon, Button, Checkbox, List } from 'antd';
import axios from 'axios';
import _ from 'lodash';

import AddActionModal from './AddActionModal';
import { CurrentUserContext } from '../common/context';
import './ActionList.css';
import api from '../api';
import util from '../common/util';

class ActionList extends React.Component {
  constructor(props) {
    super(props);
    const location = this.props.location;
    this.modalTask = {};
    if (location.state) {
      // get data from the persist state
      this.modalTask = this.props.location.state.modalTask;
    }
    this.state = {
      addActionModalVisible: false,
      addActionModalLoading: false,
      actions: [],
      actionModal: {
        data: {},
        isEditModal: false
      }
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

  updateAction = () => {
    this.setState({
      addActionModalLoading: true
    });
    const form = this.formRef.props.form;
    // extend the original task values to the new one
    form.validateFields((err, values) => {
      if (err) return;
      axios.post(api.updateAction ,_.extend(this.state.actionModal.data, values))
        .then(res => {
          this.setState({
            addActionModalVisible: false,
            addActionModalLoading: false
          });
          this.loadActions();
        })
        .catch(err => {
          util.handleError(err);
        })
    });
  }

  showAddActionModal = () => {
    this.setState({
      addActionModalVisible: true
    });
  }

  closeAddActionModal = () => {
    this.setState(prevState => {
      // reset the state of modal
      prevState.addActionModalVisible = false;
      prevState.actionModal.data = null;
      prevState.actionModal.isEditModal = false;   
      return prevState;   
    });
  }

  onActionClick = item => {
    // 如果是编辑action
    if (item) {
      this.setState(prevState => {
        prevState.actionModal.data = item;
        prevState.actionModal.isEditModal = true;
        return prevState;
      });
    }
    this.showAddActionModal();
  }

  onActionCheck = (_id, e) => {
    const actions = this.state.actions;
    const ind = _.findIndex(actions, { _id });
    if (ind >= 0) {
      actions[ind].progress = e.target.checked ? 100 : 0;
    }
    this.setState({ actions });
  }

  render() {
    const renderItem = item => (
      <List.Item>
        <div className="item-content" onClick={this.onActionClick.bind(this, item)}>
          {item.progress === 100 
            ? <del>{`${item.title}`}</del>
            : item.title
          }
        </div>
        <Checkbox onChange={this.onActionCheck.bind(this, item._id)}></Checkbox>
      </List.Item>
    );
    return (
      <div>
        <AddActionModal
          visible={this.state.addActionModalVisible}
          confirmLoading={this.state.addActionModalLoading}
          onCreate={this.addAction}
          onUpdate={this.updateAction}
          onCancel={this.closeAddActionModal}
          wrappedComponentRef={formRef => { this.formRef = formRef }}
          isEditModal={this.state.actionModal.isEditModal}
          modalData={this.state.actionModal.data}
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