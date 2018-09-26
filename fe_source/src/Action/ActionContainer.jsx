import React from 'react';
import axios from 'axios';
import _ from 'lodash';

import Action from './Action';
import GoBack from '../components/GoBack';
import { CurrentUserContext } from '../common/context';
import api from '../api';

class ActionContainer extends React.Component {
  constructor(props) {
    super(props);
    this.modalTask = {};
    if (this.props.location.state) {
      // get data from the persist state
      this.modalTask = this.props.location.state.modalTask;
    }
    this.state = {
      actions: [],
      loading: false
    };
  }

  componentDidMount() {
    this.loadActions();
  }

  loadActions = () => {
    this.setState({
      loading: true
    });
    return axios.post(api.queryAction, {
      creator: this.props.userId,
      parent: this.modalTask._id
    })
    .then(res => {
      this.setState({
        actions: res.data,
        loading: false
      });
      return Promise.resolve(res);
    })
    .catch(err => {
      this.setState({
        loading: false
      });
      return Promise.reject(err);
    })
  }

  addAction = payload => {
    payload.creator = this.props.userId;
    payload.parent = this.modalTask._id;
    return axios.post(api.createAction, payload)
      .then(() => {
        this.loadActions();
        return Promise.resolve();
      });
  };

  updateAction = payload => {
    return axios.post(api.updateAction ,payload)
      .then(() => {
        this.loadActions();
        return Promise.resolve();
      })
  };

  // TODO: this function is not pure enough
  // consider using simpler data mutation method
  onListActionCheck = (_id, e) => {
    const actions = this.state.actions;
    const ind = _.findIndex(actions, { _id });
    if (ind >= 0) {
      actions[ind].progress = e.target.checked ? 100 : 0;
    }
    this.setState({ actions });
  }

  render() {
    return (
      <React.Fragment>    
        <GoBack onClick={() => this.props.history.go(-1)}/>
        <Action 
          actions={this.state.actions}
          task={this.modalTask}
          onListActionCheck={this.onListActionCheck}
          loading={this.state.loading}
          loadActions={this.loadActions}
          addAction={this.addAction}
          updateAction={this.updateAction}
        />
      </React.Fragment>
    )
  }
}

export default props => (
  <CurrentUserContext.Consumer>
    {({ id }) => <ActionContainer {...props} userId={id} />}
  </CurrentUserContext.Consumer>
);