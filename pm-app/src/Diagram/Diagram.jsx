import React from 'react';
import { Button, Modal, Form, Input, Radio, DatePicker, Select } from 'antd';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';

import api from '../api';
import { CurrentUserContext } from '../context';
import './Diagram.css';
import './Joystick.css';

const FormItem = Form.Item;
const Option = Select.Option;

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


const AddTaskModal = Form.create()(
  class extends React.Component {
    onChange = (dates, dateStrings) => {
      console.log('From: ', dates[0], ', to: ', dates[1]);
      console.log('From: ', dateStrings[0], ', to: ', dateStrings[1]);
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
);

// TODO: consider the two-finger zooming: how to handle?
class Diagram extends React.Component {
  constructor(props) {
    super(props);
    this.graph = {};
    this.tasks = {};
    this.state = {
      visible: false,
      confirmLoading: false
    }
  }

  showModal = () => {
    this.setState({
      visible: true
    })
  }

  buildRect = (taskParams) => {
    const joint = window.joint;
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
    this.tasks[rect.cid] = taskParams;
    rect.on('change:position', (ele, pos) => {
      if (this.tasks[ele.cid]) {
        const task = this.tasks[ele.cid];
        task.positionX = pos.x;
        task.positionY = pos.y;
        console.log(task);
      }
    });
    return rect;
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
      this.buildRect(values);
      this.setState({
        visible: false,
        confirmLoading: false
      });
    });
  }

  onCancel = () => {
    this.setState({
      visible: false
    });
  }

  componentDidMount() {
    const joint = window.joint;
    const geometry = window.g;
    const _ = window._;
    const graph = new joint.dia.Graph();
    this.graph = graph;
    const paper = new joint.dia.Paper({
      el: document.getElementById('holder'),
      model: graph,
      width: 600,
      height: window.innerHeight,
      gridSize: 10,
      drawGrid: true
    });
    this.paper = paper;
    axios.post(api.getTask, { id: this.props.userId })
      .then(res => {
        if (res.data.length > 0) {
          res.data.forEach(task => {
            this.buildRect(task);
          });
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
      if (elementBelow && !_.contains(graph.getNeighbors(elementBelow), cellView.model)) {
        graph.addCell(new joint.dia.Link({
          source: { id: cellView.model.id },
          target: { id: elementBelow.id }
          // attrs: { '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z' } }
        }));
        // Move the element a bit to the side.
        cellView.model.translate(-20, 0);
      }
      return false;
    });
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  // FIXME: after the creation the change of position seems not working
  saveFlow = () => {
    console.log(this.tasks);
    const payload = {
      id: this.props.userId,
      tasks: []
    };
    _.forIn(this.tasks, (task) => {
      payload.tasks.push(this.filterData(task));
    });
    console.log(payload);
    axios.post(api.createTask, payload)
      .then(() => {
        console.log('success');
      })
      .catch(err => {
        console.error(err);
      });
  }

  filterData = task => {
    const newTask = _.omitBy(task, (val, key) => {
      if (!val) return true;
      else if (key === 'modifier') return true;
      else return false;
    });
    return newTask;
  }

  // TODO: Add custom scroll stick 摇杆
  render() {
    return (
      <React.Fragment>
        <AddTaskModal
          id="addTaskModal"
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
        <Button
          type="primary"
          id="addFlow"
          onClick={this.showModal}>Add</Button>
        <Button
          type="primary"
          id="saveFlow"
          onClick={this.saveFlow}>Save</Button>
        <Joystick />
      </React.Fragment>
    )
  }
}

export default props => (
  <CurrentUserContext.Consumer>
    {({ id }) => <Diagram {...props} userId={id} />}
  </CurrentUserContext.Consumer>
);