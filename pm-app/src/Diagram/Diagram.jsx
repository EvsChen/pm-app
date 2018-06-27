import React from 'react';
import { Button, Modal, Form, Input, Radio, DatePicker, Select, Icon, Spin } from 'antd';
import _ from 'lodash';
import axios from 'axios';

import api from '../api';
import { CurrentUserContext } from '../context';
import './Diagram.css';
import './Joystick.css';

const FormItem = Form.Item;
const confirm = Modal.confirm;
const Option = Select.Option;
const joint = window.joint;

// FIXME: restrict the position of joystick touch in the circle
// TODO: consider separating Joystick into a file
class Joystick extends React.Component {
  state = {
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    moveX: 0,
    moveY: 0
  }

  componentDidMount() {
    const touchPoint = document.getElementById('joystick-touch');
    touchPoint.addEventListener('touchstart', this.onTouchStart, { passive: false });
    touchPoint.addEventListener('touchmove', this.onTouchMove, { passive: false });
    touchPoint.addEventListener('touchend', this.onTouchEnd, { passive: false });
  }

  onTouchStart = (evt) => {
    evt.preventDefault();
    evt.target.style.backgroundColor = 'rgba(0,0,0,0.8)';
    this.setState({
      x: evt.target.offsetLeft,
      y: evt.target.offsetTop,
      startX: evt.pageX || evt.touches[0].pageX,
      startY: evt.pageY || evt.touches[0].pageY,
    });
  }

  onTouchMove = (evt) => {
    evt.preventDefault();
    const target = evt.target;
    const holder = document.getElementById('holder');
    const nowX = evt.pageX || evt.touches[0].pageX;
    const nowY = evt.pageY || evt.touches[0].pageY;
    this.setState({
      moveX: nowX - this.state.startX,
      moveY: nowY - this.state.startY
    });
    target.style.left = `${40 + this.state.moveX}px`;
    target.style.top = `${40 + this.state.moveY}px`;
    const step = 5;
    this.state.moveX > 0
      ? holder.style.left = `${holder.offsetLeft - step}px`
      : holder.style.left = `${(holder.offsetLeft + step) > 0 ? 0 : (holder.offsetLeft + step)}px`;
  }

  onTouchEnd = (evt) => {
    evt.preventDefault();
    const target = evt.target;
    target.style.backgroundColor = 'rgba(0,0,0,0.4)';
    this.setState({
      moveX: 0,
      moveY: 0,
    });
    target.style.left = target.style.top = '40px';
  }

  render() {
    return (
      <div id="joystick">
        <div id="joystick-touch"></div>
      </div>
    );
  }
}

// FIXME: consider changing date into 12:00 AM
class AddTask extends React.Component {
  onChange = (dates, dateStrings) => {
    console.log('From: ', dates[0], ', to: ', dates[1]);
    console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
  }

  componentDidUpdate() {
    console.log('modal updated');
  }

  render() {
    // Here we lift the visible state up, as well as the onCreate method
    const { form, confirmLoading, visible, onCreate, onCancel } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal title="Add new task"
        visible={visible}
        onOk={onCreate}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        bodyStyle={{
          height: 400,
          'overflowY': 'auto'
        }}
        style={{ top: 50 }}
      >
        <Form layout="vertical">
          <FormItem label="Title">
            {getFieldDecorator('title', {
              rules: [{ required: true, message: 'Please input the title of task!' }],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="Description">
            {getFieldDecorator('description')(<Input type="textarea" />)}
          </FormItem>
          <FormItem label="Owner">
            {getFieldDecorator('owner')(
              <Select>
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
              </Select>
            )}
          </FormItem>
          <FormItem label="Start Date">
            {getFieldDecorator('startDate')(
              <DatePicker />
            )}
          </FormItem>
          <FormItem label="End Date">
            {getFieldDecorator('endDate')(
              <DatePicker />
            )}
          </FormItem>
          <FormItem className="collection-create-form_last-form-item">
            {getFieldDecorator('modifier', {
              initialValue: 'public',
            })(
              <Radio.Group>
                <Radio value="public">Public</Radio>
                <Radio value="private">Private</Radio>
              </Radio.Group>
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

const AddTaskModal = Form.create()(AddTask);

// TODO: consider the two-finger zooming: how to handle?
class Diagram extends React.Component {
  constructor(props) {
    super(props);
    this.graph = {};
    this.tasks = {};
    this.state = {
      loading: true,
      visible: false,
      removeModalVisible: false,
      confirmLoading: false,
      showPopover: false,
      popoverX: 0,
      popoverY: 0,
      modal: {
        isEdit: false,
      }
    }
  }

  componentDidMount() {
    this.initDiagram();
    if (this.props.rootTaskId) {
      this.loadTasks();
    }
  }

  componentWillUnmount() {
    this.clearDiagram();
  }

  componentDidUpdate(prevProps) {
    if (this.props.rootTaskId !== prevProps.rootTaskId) {
      this.tasks = {};
      this.graph.clear();
      this.loadTasks();
    }
  }

  showModal = () => {
    this.setState({
      visible: true
    });
  }

  showRemoveModal = () => {
    this.closePopover();
    const removeTask = this.removeTask;
    confirm({
      title: 'Are you sure delete this task?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        removeTask();
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  }

  buildRect = taskParams => {
    if (_.isArray(taskParams)) {
      taskParams.forEach(task => {
        this.buildRect(task);
      });
    }
    else {
      taskParams.positionX = taskParams.positionX || 30;
      taskParams.positionY = taskParams.positionY || 30;
      const rect =
        new joint.shapes.standard.Rectangle()
          .position(taskParams.positionX, taskParams.positionY)
          .resize(100, 40)
          .attr({
            body: {
              fill: 'blue',
              'stroke-opacity': .7
            },
            label: {
              text: taskParams.title || 'init',
              fill: 'white'
            }
          })
          .addTo(this.graph);
      taskParams.rect = rect;
      this.tasks[rect.cid] = taskParams;
      rect.on('change:position', (ele, pos) => {
        if (this.tasks[ele.cid]) {
          const task = this.tasks[ele.cid];
          task.positionX = pos.x;
          task.positionY = pos.y;
        }
      });
      console.log(this.tasks);
      return rect;
    }
  }

  connectLink = (sourceCell, targetCell) => {
    return new joint.shapes.standard.Link({
      source: { id: sourceCell.id },
      target: { id: targetCell.id },
      attrs: {
        '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z' },
        'stroke-width': 10
      }
    })
      .addTo(this.graph);
  }

  buildLink = (sourceCell, targetCell) => {
    const link = this.connectLink(sourceCell, targetCell);
    if (this.tasks[sourceCell.cid] && this.tasks[targetCell.cid]) {
      const sourceTask = this.tasks[sourceCell.cid];
      const targetTask = this.tasks[targetCell.cid];
      console.log(sourceTask);
      console.log(targetTask);
      _.isArray(sourceTask.linkTo)
        ? sourceTask.linkTo.push(targetTask._id)
        : sourceTask.linkTo = [targetTask._id];
    }
    return link;
  }

  onCreate = () => {
    // The modal closes in an async manner 
    this.setState({
      confirmLoading: true
    });
    const form = this.formRef.props.form;
    form.validateFields((err, values) => {
      if (err) return;
      console.log(values);
      this.createTasks(values)
        .then(res => {
          console.log(res);
          if (res && res.data.length > 0) {
            this.buildRect(res.data[0]);
            this.setState({
              visible: false,
              confirmLoading: false
            });
          }
        })
        .catch(err => {
          this.handleError(err);
        })
    });
  }

  handleError = err => {
    console.error(err);
  }

  onCancel = () => {
    this.setState({
      visible: false
    });
  }

  removeTask = task => {
    if (task._id) {
      axios.post(api.removeTask, {
        id: task._id
      })
        .then(() => {
          console.log('Remove successful');
          this.removeTaskFromPaper(task);
        })
        .catch(err => {
          console.log('Remove fail');
        })
    }
    else {
      this.removeTaskFromPaper(task);
    }
  }

  removeTaskFromPaper = task => {
    const cid = task.rect.cid;
    task.rect.remove();
    delete this.tasks[cid];
  }

  initDiagram = () => {
    const geometry = window.g;
    const graph = new joint.dia.Graph();
    this.graph = graph;
    const paper = new joint.dia.Paper({
      el: document.getElementById('holder'),
      model: graph,
      width: window.innerWidth + 200,
      height: window.innerHeight,
      gridSize: 10,
      drawGrid: true
    });
    this.paper = paper;
    console.log(graph);
    console.log(paper);

    paper.on('cell:pointerdown', (cellView, evt, evtX, evtY) => {
      console.log(cellView);
      if (cellView && cellView.model) {
        const { x: cellX, y: cellY } = cellView.model.attributes.position;
        const { width, height } = cellView.model.attributes.size;
        const popoverWidth = 120;
        const popoverHeight = 50;
        const centerX = cellX + width / 2;
        const centerY = cellY + height / 2;
        const margin = 5;
        // TODO: consider the popover outside screen
        const popoverX = cellX;
        const popoverY = evtY > centerY
          // evtY > centerY: display below the cell
          ? cellY + margin + height
          // else: display above the cell;
          : cellY - margin - popoverHeight;
        this.setState({
          showPopover: true,
          popoverX,
          popoverY
        });
        this.removeTask = this.removeTask.bind(this, this.tasks[cellView.model.cid]);
        // FIXME: better way to write?
        function onBlankPointerDown(evt, x, y) {
          this.closePopover();
          paper.off('blank:pointerdown', onBlankPointerDown);
        }
        onBlankPointerDown = onBlankPointerDown.bind(this);
        paper.on('blank:pointerdown', onBlankPointerDown);
      }
    });

    paper.on('cell:pointerup', (cellView, evt, x, y) => {
      // Find the first element below that is not a link nor the dragged element itself.
      const elementBelow = graph.get('cells').find(function (cell) {
        if (cell instanceof joint.dia.Link) return false; // Not interested in links.
        if (cell.id === cellView.model.id) return false; // The same element as the dropped one.
        if (cell.getBBox().containsPoint(geometry.point(x, y))) {
          return true;
        }
        return false;
      });
      // If the two elements are connected already, don't
      // connect them again (this is application specific though).
      if (elementBelow && !_.includes(graph.getNeighbors(elementBelow), cellView.model)) {
        this.buildLink(cellView.model, elementBelow);
        // Move the element a bit to the side.
        cellView.model.translate(-20, 0);
      }
      return false;
    });

    paper.on('link:pointerdown', (cellView, evt, x, y) => {
      evt.stopPropagation();
      console.log('link down');
    });
  }

  clearDiagram = () => {
    if (this.graph && this.paper) {
      this.graph.clear();
      this.paper.remove();
    }
  }

  getTaskById = id => {
    let result;
    _.forIn(this.tasks, task => {
      if (task._id === id) {
        result = task;
      }
    });
    return result;
  }

  // TODO: change this.tasks into array? or other data types
  // TODO: consider a global way of using this.tasks, in case the structure changes

  loadTasks = () => {
    axios.post(api.getByRootTask, { id: this.props.rootTaskId })
      .then(res => {
        if (res.data.length > 0) {
          this.buildRect(res.data);
          _.forIn(this.tasks, task => {
            if (_.isArray(task.linkTo) && task.linkTo.length > 0) {
              task.linkTo.forEach(id => {
                const targetTask = this.getTaskById(id);
                if (targetTask) {
                  this.connectLink(task.rect, targetTask.rect);
                }
              });
            }
          });
        }
      });
  };

  saveFormRef = formRef => {
    this.formRef = formRef;
  }

  createTasks = tasks => {
    console.log(tasks);
    if (tasks) {
      const payload = {
        tasks: []
      };
      // tell if the task is a task or a task collection
      // TODO: better way to distinguish
      const taskArr = tasks.title ? [tasks] : tasks;
      _.forIn(taskArr, task => {
        task.creator = task.creator || this.props.userId;
        task.parent = task.parent || this.props.rootTaskId;
        payload.tasks.push(this.filterData(task));
      });
      console.log(payload);
      return axios.post(api.createTask, payload);
    }
  }

  saveFlow = () => {
    console.log(this.tasks);
    this.createTasks(this.tasks)
      .then((res) => {
        console.log(res.data);
        console.log('success');
      })
      .catch(err => {
        console.error(err);
      })
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

  closePopover = () => {
    this.setState({
      showPopover: false
    });
  }

  render() {
    return (
      <React.Fragment>
        <AddTaskModal
          id="addTaskModal"
          isEdit={this.state.modal.isEdit}
          editId={this.state.modal.editId}
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCreate={this.onCreate}
          onCancel={this.onCancel}
          confirmLoading={this.state.confirmLoading}
        />
        <div className="diagram-container" style={{
          height: window.innerHeight,
          width: window.innerWidth
        }}>
          <div id="holder"></div>
        </div>
        {/* FIXME: other way to close popover/position of popover outside screen */}
        <div className="cell-popover"
          style={{
            display: this.state.showPopover ? 'block' : 'none',
            left: this.state.popoverX,
            top: this.state.popoverY,
          }}
        >
          <div className="action">
            <Icon type="delete" onClick={this.showRemoveModal} />
            <Icon type="edit" />
          </div>
          <Icon type="close" onClick={this.closePopover} />
        </div>
        <Button
          type="primary"
          id="addFlow"
          onClick={this.showModal}
          style={{
            left: window.innerWidth - 75
          }}>Add</Button>
        {/* TODO: if changes are made, enable Button */}
        <Button
          type="primary"
          id="saveFlow"
          onClick={this.saveFlow}
          style={{
            left: window.innerWidth - 145
          }}>Save</Button>
        <Joystick />
      </React.Fragment>
    )
  }
}

class DiagramHolder extends React.Component {
  state = {
    loading: true,
    rootTasks: [],
    selectedTaskId: '',
    visible: false,
    confirmLoading: false
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
          loading: false
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
              <Select placeholder="Select task" style={{ width: 120 }} onChange={this.onChange}>
                {taskOptions}
              </Select>
              <Icon type="plus" onClick={this.showModal} />
            </div>
            <Diagram rootTaskId={this.state.selectedTaskId} userId={this.props.userId} />
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