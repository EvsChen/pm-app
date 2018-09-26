import React from 'react';
import { Button, Spin } from 'antd';
import PropTypes from 'proptypes';
import _ from 'lodash';

import ActionModalContainer from './ActionModalContainer';
import ActionList from '../components/ActionList';
import './Action.css';
import util from '../common/util';

class Action extends React.Component {
  state = {
    modalVisible: false,
    modalLoading: false,
    isEditModal: false,
  }

  cancelModal = () => {
    this.setState({
      modalVisible: false,
      isEditModal: false,
      modalAction: null
    });
  }

  onActionClick = item => {
    // 如果是编辑action
    this.setState({
      modalAction: item,
      isEditModal: true
    });
    this.setModalVisible(true);
  }

  showModal = () => this.setModalVisible(true);
  setModalLoading = bool => this.setState({ modalLoading: bool })
  setModalVisible = bool => this.setState({ modalVisible: bool })

  onCreateAction = () => {
    const form = this.formRef.props.form;
    this.setModalLoading(true);
    form.validateFields((err, values) => {
      if (err) {
        this.setModalLoading(false);
        util.handleError(err);
        return;
      }
      this.props.addAction(values)
        .then(() => {
          this.cancelModal();
        })
        .catch(err => {
          this.setModalLoading(false);
          util.handleError(err);
        })
    });
  }

  onUpdateAction = () => {
    const form = this.formRef.props.form;
    this.setModalLoading(true);
    form.validateFields((err, values) => {
      if (err) {
        this.setModalLoading(false);
        util.handleError(err);
        return;
      }
      this.props.updateAction(_.extend(this.state.modalAction, values))
        .then(() => {
          this.cancelModal();
        })
        .catch(err => {
          this.setModalLoading(false);
          util.handleError(err);
        })
    });    
  }

  render() {
    return (
      <React.Fragment>
        {
          this.props.loading 
            ? <Spin spinning={this.props.loading} size="large"/>
            : (
                this.props.actions && this.props.actions.length === 0
                  ? <p>Currently there is no action for this task. Add actions by click the "Add" button.</p>
                  : <ActionList 
                      header={this.props.task.title}
                      actions={this.props.actions}
                      onActionCheck={this.props.onListActionCheck}
                      onActionClick={this.onActionClick}
                    />
            )
        }
        <ActionModalContainer
          wrappedComponentRef={formRef => this.formRef = formRef}
          onCreate={this.onCreateAction}
          onUpdate={this.onUpdateAction}
          onCancel={this.cancelModal}
          visible={this.state.modalVisible}
          confirmLoading={this.state.modalLoading}
          modalData={this.state.modalAction}
          isEditModal={this.state.isEditModal}
          personArray={[]}
        />
        <Button
          type="primary"
          id="addFlow"
          className="action-button"
          onClick={this.showModal}
          style={{ left: window.innerWidth - 75 }}>
          Add
        </Button>
      </React.Fragment>
    )
  }
}

Action.propTypes = {
  actions: PropTypes.array,
  task: PropTypes.object,
  onListActionCheck: PropTypes.func,
  loading: PropTypes.bool,
  loadActions: PropTypes.func,
  updateAction: PropTypes.func,
  addAction: PropTypes.func
};

export default Action;