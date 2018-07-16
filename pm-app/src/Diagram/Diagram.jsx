import React from 'react';
import { Button, Modal, Select, Icon, Spin } from 'antd';
import _ from 'lodash';
import axios from 'axios';

import api from '../api';
import './Diagram.css';
import { CurrentUserContext } from '../context';
import DetailModal from './DetailModal';
import AddTaskModal from './AddTaskModal';
import Joystick from './Joystick';
import util from '../util';

const confirm = Modal.confirm;
const Option = Select.Option;
const joint = window.joint;
const svgAsPngUri = window.svgAsPngUri;

const POPOVER_WIDTH = 140;
const POPOVER_HEIGHT = 50;
const POPOVER_MARGIN = 5;

// TODO: consider the two-finger zooming: how to handle?
class Diagram extends React.Component {
  constructor(props) {
    super(props);
    this.graph = {};
    this.tasks = {};
    this.state = {
      canSave: false,
      loading: true,
      visible: false,
      detailModalVisible: false,
      saveImgModalVisible: false,
      confirmLoading: false,
      showPopover: false,
      popoverX: 0,
      popoverY: 0,
      isEditModal: false,
      modalTask: {}
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
      // close popover
      this.closePopover();
      // close all modal
      this.setState({
        visible: false,
        detailModalVisible: false
      })
      this.tasks = {};
      this.graph.clear();
      this.loadTasks();
    }
  }

  addTask = () => {
    this.setState({
      isEditModal: false,
    });
    this.showModal();
  }

  editTask = () => {
    this.setState({
      isEditModal: true
    });
    this.closePopover();
    this.showModal();
  }

  removeTask = () => {
    const task = this.state.modalTask;
    if (task) {
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
  }

  /**
   * add new tasks into database
   * @param {(Object|Object[])} tasks - accept a single task or a task array
   */
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

  /**
   * add new tasks into database
   * @param {(Object|Object[])} tasks - accept a single task or a task array
   */
  updateTasks = tasks => {
    if (tasks) {
      const payload = { tasks: [] };
      // tell if the task is a task or a task collection
      const taskArr = tasks.title ? [tasks] : tasks;
      _.forIn(taskArr, task => {
        task.creator = task.creator || this.props.userId;
        task.parent = task.parent || this.props.rootTaskId;
        payload.tasks.push(this.filterData(task));
      });
      console.log(payload);
      return axios.post(api.updateTask, payload);
    }
  }

  saveFlow = () => {
    console.log(this.tasks);
    this.createTasks(this.tasks)
      .then(() => {
        util.handleSuccess('保存成功');
        this.setState({
          canSave: false
        });
      })
      .catch(err => {
        util.handleError(err);
      });
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

  showDetailModal = () => {
    this.closePopover();
    this.setState({
      detailModalVisible: true
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
          this.setState({
            canSave: true
          });
          task.positionX = pos.x;
          task.positionY = pos.y;
        }
      });
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

  addToolsToLink = linkView => {
    if (linkView.hasTools()) {
      linkView.showTools();
    }
    else {
      const tasks = this.tasks;
      const setState = this.setState.bind(this);
      const removeTool = new joint.linkTools.Remove({
        action: function (evt) {
          this.model.remove();
          const sourceTask = tasks[this.sourceView.model.cid];
          const targetTask = tasks[this.targetView.model.cid];
          if (sourceTask.linkTo.indexOf(targetTask._id) !== -1) {
            const ind = sourceTask.linkTo.indexOf(targetTask._id);
            sourceTask.linkTo.splice(ind, 1);
            setState({
              canSave: true
            });
          }
        }
      });
      // able to add multiple tools here
      const toolsView = new joint.dia.ToolsView({
        name: 'tools',
        tools: [removeTool]
      });
      linkView.addTools(toolsView);
    }
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

  /**
   * update the task when the modal closes
   */
  onUpdate = () => {
    this.setState({
      confirmLoading: true
    });
    const form = this.formRef.props.form;
    // extend the original task values to the new one
    form.validateFields((err, values) => {
      if (err) return;
      this.updateTasks(_.extend(this.state.modalTask, values))
        .then(res => {
          this.setState({
            visible: false,
            confirmLoading: false
          });
          this.reloadTasks();
        })
        .catch(err => {
          this.handleError(err);
        })
    });
  }

  onCancel = () => {
    this.setState({
      visible: false
    });
  }


  handleError = err => {
    console.error(err);
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

    // show cell popover
    paper.on('cell:pointerdown', (cellView, evt, evtX, evtY) => {
      if (cellView && cellView.model && !cellView.model.isLink()) {
        this.setState({
          modalTask: this.tasks[cellView.model.cid]
        });
        const { x: cellX, y: cellY } = cellView.model.attributes.position;
        const { width, height } = cellView.model.attributes.size;
        const { popoverX, popoverY } = this.getPopoverPosition({ cellX, cellY, width, height }, { evtX, evtY });
        this.showPopover(popoverX, popoverY);
        // FIXME: better way to write?
        const onBlankPointerDown = (function (evt, x, y) {
          // if the click is outside the popover
          if (!(x > popoverX
            && x < popoverX + POPOVER_WIDTH
            && y > popoverY
            && y < popoverY + POPOVER_HEIGHT)) {
            this.setState({
              modalTask: {}
            });
          }
          this.closePopover();
          paper.off('blank:pointerdown', onBlankPointerDown);
        }).bind(this);

        const onCellPointerMove = (function () {
          this.closePopover();
          paper.off('cell:pointermove', onCellPointerMove);
        }).bind(this);
        paper.on('blank:pointerdown', onBlankPointerDown);
        paper.on('cell:pointermove', onCellPointerMove);
      }
    });

    // connect by dropping
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

    // add remove button to link 
    paper.on('link:pointerdown', (linkView, evt, x, y) => {
      evt.stopPropagation();
      console.log(linkView);
      this.addToolsToLink(linkView);
      const onBlankPointerDown = (evt, x, y) => {
        linkView.hideTools();
        paper.off('blank:pointerdown', onBlankPointerDown);
      };
      paper.on('blank:pointerdown', onBlankPointerDown);
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

  // TODO: consider a global way of using this.tasks, in case the structure changes

  reloadTasks = () => {
    if (this.graph) {
      this.graph.clear();
      this.tasks = [];
      this.loadTasks();
    }
  }

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

  /**
   * remove 'rect' from task
   */
  filterData = task => {
    const newTask = _.omitBy(task, (val, key) => {
      if (!val) return true;
      else if (key === 'modifier') return true;
      else if (key === 'rect') return true;
      else return false;
    });
    return newTask;
  }

  getPopoverPosition = ({ cellX, cellY, width, height }, { evtX, evtY }) => {
    const centerX = cellX + width / 2;
    const centerY = cellY + height / 2;
    // TODO: consider the popover outside screen
    const popoverX = cellX;
    const popoverY = evtY > centerY
      // evtY > centerY: display below the cell
      ? cellY + POPOVER_MARGIN + height
      // else: display above the cell;
      : cellY - POPOVER_MARGIN - POPOVER_HEIGHT;
    return { popoverX, popoverY };
  }

  showPopover = (popoverX, popoverY) => {
    this.setState({
      showPopover: true,
      popoverX,
      popoverY
    });
  }

  closePopover = () => {
    this.setState({
      showPopover: false,
      popoverX: 0,
      popoverY: 0
    });
  }

  viewSubTaskHandler = () => {
    // close the detail modal
    this.setState({
      detailModalVisible: false
    });
    this.props.onViewSubTask(this.state.modalTask);
  }

  onDetailModalCancel = () => {
    this.setState({
      detailModalVisible: false
    });
  }

  exportToImg = () => {
    svgAsPngUri(document.querySelector('#holder svg'), {}, uri => {
      this.setState({
        saveImgModalVisible: true,
        svgUri: uri
      });
    });
    // saveSvgAsPng(document.querySelector('#holder svg'), 'flowchart.png');
    // const svgData = $('#holder svg')[0].outerHTML;
    // const svgBlob = new Blob([svgData], { type: "image/png;charset=utf-8" });
    // const svgUrl = URL.createObjectURL(svgBlob);
    // const downloadLink = document.createElement('a');
    // downloadLink.target = '_blank';
    // downloadLink.href = svgUrl;
    // downloadLink.download = 'flowchart.png';
    // document.body.appendChild(downloadLink);
    // downloadLink.click();
    // document.body.removeChild(downloadLink);
  }

  render() {
    return (
      <React.Fragment>
        <Modal
          visible={this.state.saveImgModalVisible}
          footer={null}
          onCancel={() => { this.setState({saveImgModalVisible: false}) }}
        >
          Long press to save the image
          <img width="300" src={this.state.svgUri} />
        </Modal>
        <AddTaskModal
          id="addTaskModal"
          isEditModal={this.state.isEditModal}
          modalTask={this.state.modalTask}
          wrappedComponentRef={this.saveFormRef}
          visible={this.state.visible}
          onCreate={this.onCreate}
          onUpdate={this.onUpdate}
          onCancel={this.onCancel}
          confirmLoading={this.state.confirmLoading}
        />
        <DetailModal
          onCancel={this.onDetailModalCancel}
          modalTask={this.state.modalTask}
          visible={this.state.detailModalVisible}
          onViewSubTask={this.viewSubTaskHandler}
        />
        <div className="diagram-container" style={{
          height: window.innerHeight,
          width: window.innerWidth
        }}>
          <div id="holder"></div>
          <Button
            type="primary"
            className="action-button"
            onClick={this.exportToImg}
            style={{
              left: window.innerWidth - 225,
            }}>Export</Button>
          <Button
            type="primary"
            id="saveFlow"
            className="action-button"
            disabled={!this.state.canSave}
            onClick={this.saveFlow}
            style={{
              left: window.innerWidth - 145,
            }}>Save</Button>
          <Button
            type="primary"
            id="addFlow"
            className="action-button"
            onClick={this.addTask}
            style={{
              left: window.innerWidth - 75,
            }}>Add</Button>
          <Joystick targetId="holder" />
        </div>
        <div className="cell-popover"
          style={{
            display: this.state.showPopover ? 'block' : 'none',
            left: this.state.popoverX,
            top: this.state.popoverY,
            width: POPOVER_WIDTH,
            height: POPOVER_HEIGHT
          }}
        >
          <div className="action">
            <Icon type="profile" onClick={this.showDetailModal} />
            <Icon type="delete" onClick={this.showRemoveModal} />
            <Icon type="edit" onClick={this.editTask} />
          </div>
          <Icon type="close" onClick={this.closePopover} />
        </div>
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