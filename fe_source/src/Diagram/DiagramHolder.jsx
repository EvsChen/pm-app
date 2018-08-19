import React from 'react';
import { Button, Select, Icon, Spin } from 'antd';
import _ from 'lodash';
import axios from 'axios';

import api from '../api';
import { CurrentUserContext } from '../common/context';
import Diagram from './Diagram';
import AddTaskModal from './AddTaskModal';

const Option = Select.Option;

class DiagramHolder extends React.Component {
  state = {
    loading: true,
    rootTasks: [],
    selectedTaskId: '',
    visible: false,
    confirmLoading: false,
    showSubTask: false,
    selectedSubTask: {},
    taskTree: []
  }

  componentDidMount() {
    this.loadRootTasks();
  }

  onCreate = () => {
    this.setState({
      confirmLoading: true
    });
    const form = this.formRef.props.form;
    const thisObj = this;
    form.validateFields((err, values) => {
      if (err) return;
      const payload = {
        tasks: []
      };
      values.isRoot = true;
      values.creator = this.props.userId;
      payload.tasks.push(this.filterData(values));
      axios.post(api.createTask, payload)
        .then(() => {
          console.log('success');
          thisObj.setState({
            visible: false,
            confirmLoading: false
          });
          thisObj.loadRootTasks();
        })
        .catch(err => {
          console.error(err);
          thisObj.setState({
            visible: false,
            confirmLoading: false
          });
        });
    });
  }

  onCancel = () => {
    this.setState({
      visible: false
    });
  }

  onChange = val => {
    this.setState({
      selectedTaskId: val
    });
  }

  loadRootTasks = () => {
    axios.post(api.getRootTask, {
      id: this.props.userId
    })
      .then(res => {
        this.setState({
          rootTasks: res.data,
          loading: false,
          selectedTaskId: res.data[0]._id
        });
      })
      .catch(err => {
        this.setState({
          loading: false
        });
      });
  }

  showModal = () => {
    this.setState({
      visible: true
    });
  }

  saveFormRef = formRef => {
    this.formRef = formRef;
  }

  filterData = task => {
    const newTask = _.omitBy(task, (val, key) => {
      if (!val) return true;
      else if (key === 'modifier') return true;
      else if (key === 'rect') return true;
      else return false;
    });
    return newTask;
  }

  showSubTask = selectedSubTask => {
    this.setState(prevState => {
      const taskTree = prevState.taskTree;
      taskTree.push({
        _id: prevState.selectedTaskId,
        task: prevState.selectedSubTask
      });
      return {
        selectedSubTask,
        selectedTaskId: selectedSubTask._id,
        showSubTask: true,
        taskTree
      }
    });
  }

  returnToUpperTask = () => {
    this.setState(prevState => {
      const taskTree = prevState.taskTree;
      const upperTask = taskTree.pop();
      return {
        selectedSubTask: upperTask.task,
        selectedTaskId: upperTask._id,
        showSubTask: !(taskTree.length === 0),
        taskTree
      }
    });
  }

  render() {
    let content;
    if (this.state.loading) {
      content = <Spin size="large" />;
    }
    else {
      // if no root tasks
      if (this.state.rootTasks.length === 0) {
        content = (
          <React.Fragment>
            <p className="first-add-p">
              It seems you don't have any tasks, try clicking the "add" button
                 </p>
            <Button
              type="primary"
              id="addFlow"
              style={{margin: '0 auto'}}
              onClick={this.showModal}>Add</Button>
          </React.Fragment>
        );
      }
      // if root tasks
      else {
        const taskOptions = this.state.rootTasks.map((task) =>
          <Option key={task._id} value={task._id}>{task.title}</Option>
        );
        content = (
          <React.Fragment>
            <div className="root-task-select" style={{ width: window.innerWidth }}>
              {
                this.state.showSubTask
                  ? (
                    <React.Fragment>
                      <Icon type="left" onClick={this.returnToUpperTask}
                        style={{
                          float: 'left'
                        }} />
                      <span>{this.state.selectedSubTask.title}</span>
                    </React.Fragment>
                  )
                  : (
                    <React.Fragment>
                      <Select placeholder="Select task" defaultValue={this.state.selectedTaskId} style={{ width: 120 }} onChange={this.onChange}>
                        {taskOptions}
                      </Select>
                      <Icon type="plus" onClick={this.showModal} />
                    </React.Fragment>
                  )
              }
            </div>
            <Diagram
              rootTaskId={this.state.selectedTaskId}
              userId={this.props.userId}
              onViewSubTask={this.showSubTask}
            />
          </React.Fragment>
        );
      }
    }
    return (
      <React.Fragment>
        <AddTaskModal
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCreate={this.onCreate}
          onCancel={this.onCancel}
          confirmLoading={this.state.confirmLoading}
        />
        {content}
      </React.Fragment>
    )
  }
}

// In order to use userId as a common prop
export default props => (
  <CurrentUserContext.Consumer>
    {({ id }) => <DiagramHolder {...props} userId={id} />}
  </CurrentUserContext.Consumer>
);