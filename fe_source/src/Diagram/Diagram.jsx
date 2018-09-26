import React from 'react';
import { Button, Modal, Icon, Spin } from 'antd';
import _ from 'lodash';
import axios from 'axios';

import api from '../api';
import './Diagram.css';
import DetailModal from './DetailModal';
import AddTaskModal from './AddTaskModal';
import TaskDetail from '../components/TaskDetail';
import util from '../common/util';

const confirm = Modal.confirm;
const joint = window.joint;
const svgAsPngUri = window.svgAsPngUri;

const POPOVER_WIDTH = 180;
const POPOVER_HEIGHT = 50;
const POPOVER_MARGIN = 5;
const DIAGRAM_INIT_WIDTH = window.innerWidth + 200;

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
      taskLoading: false,
      detailModalVisible: false,
      taskDetailModalVisible: false,
      saveImgModalVisible: false,
      confirmLoading: false,
      showPopover: false,
      popoverX: 0,
      popoverY: 0,
      diagramX: 0,
      diagramY: 0,
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


  initDiagram = () => {
    const graph = new joint.dia.Graph();
    this.graph = graph;
    const paper = new joint.dia.Paper({
      el: document.getElementById('holder'),
      model: graph,
      width: DIAGRAM_INIT_WIDTH,
      height: window.innerHeight,
      gridSize: 10,
      drawGrid: true
    });
    this.paper = paper;
    this.initPaperEvents(paper);
  }

  initPaperEvents = paper =>{
    this.initPopover(paper);
    this.initConnectByDropping(paper);
    this.initRemoveLinkTool(paper);
    this.initDiagramDragging(paper);
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
            this.removeTaskFromPaper(task);
          })
          .catch(err => {
            util.handleError(err);
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

  showTaskDetailModal = () => {
    this.closePopover();
    this.setState({
      taskDetailModalVisible: true
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
      // default position
      taskParams.positionX = taskParams.positionX || 30;
      taskParams.positionY = taskParams.positionY || 30;
      const rect =
        new joint.shapes.standard.Rectangle()
          .position(taskParams.positionX, taskParams.positionY)
          .resize(100, 40)
          .attr({
            body: {
              fill: 'rgb(73, 85, 208)',
              stroke: 'white',
              rx: 10,
              ry: 10,
              'stroke-opacity': .7,
              'stroke-width': 5
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

  // connect link and add to data
  buildLink = (sourceCell, targetCell) => {
    const link = this.connectLink(sourceCell, targetCell);
    if (this.tasks[sourceCell.cid] && this.tasks[targetCell.cid]) {
      const sourceTask = this.tasks[sourceCell.cid];
      const targetTask = this.tasks[targetCell.cid];
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
      this.createTasks(values)
        .then(res => {
          if (res && res.data.length > 0) {
            this.buildRect(res.data[0]);
            this.setState({
              visible: false,
              confirmLoading: false
            });
          }
        })
        .catch(err => {
          util.handleError(err);
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
          util.handleSuccess('更新成功');
          this.setState({
            visible: false,
            confirmLoading: false
          });
          this.reloadTasks();
        })
        .catch(err => {
          util.handleError(err);
        })
    });
  }

  // fired when the addTaskModal is cancelled
  onCancel = () => {
    this.setState({
      visible: false,
      modalTask: {}
    });
  }

  removeTaskFromPaper = task => {
    const cid = task.rect.cid;
    task.rect.remove();
    delete this.tasks[cid];
  }

  initDiagramDragging = paper => {
    paper.on('blank:pointerdown', this.onDiagramTouchStart);
  }

  onDiagramTouchStart = (evt, evtX, evtY) =>{
    evt.preventDefault();
    window.addEventListener('touchmove', this.onDiagramTouchMove, { passive: false });
    window.addEventListener('touchend', this.onDiagramTouchEnd, { passive: false });
    this.setState({
      startX: evt.pageX || evt.touches[0].pageX,
      startY: evt.pageY || evt.touches[0].pageY
    });
  }

  onDiagramTouchMove = evt => {
    evt.preventDefault();
    const nowX = evt.pageX || evt.touches[0].pageX;
    const nowY = evt.pageY || evt.touches[0].pageY;
    const moveRatio = 2;
    const moveX = (nowX - this.state.startX) / moveRatio;
    const moveY = (nowY - this.state.startY) / moveRatio;
    const startDiagramX = this.state.diagramX;
    const startDiagramY = this.state.diagramY;
    // 如果左边到边界了，不可移动
    const diagramX = startDiagramX + moveX > 0
      ? 0
      // 如果右边到边界了
      : (startDiagramX + moveX + DIAGRAM_INIT_WIDTH - window.innerWidth) < 0
        ? window.innerWidth - DIAGRAM_INIT_WIDTH
        : startDiagramX + moveX;
    // TODO: change the y param here
    const diagramY = startDiagramY;
    this.setState({ diagramX, diagramY });
  }

  onDiagramTouchEnd = evt => {
    window.removeEventListener('touchmove', this.onDiagramTouchMove);
    window.removeEventListener('touchend', this.onDiagramTouchEnd);
  }

  initPopover = paper => {
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
        paper.on('blank:pointerdown', onBlankPointerDown);

        const onCellPointerMove = (function () {
          this.closePopover();
          paper.off('cell:pointermove', onCellPointerMove);
        }).bind(this);
        // 拖动时关闭popover
        paper.on('cell:pointermove', onCellPointerMove);
      }
    });
  }

  initConnectByDropping = paper => {
    // connect by dropping
    const geometry = window.g;
    const graph = paper.model;
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
        cellView.model.translate(-30, 0);
      }
      return false;
    });
  }

  // add remove button to link 
  initRemoveLinkTool = paper => {
    paper.on('link:pointerdown', (linkView, evt, x, y) => {
      evt.stopPropagation();
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

  // get this.tasks by id
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
    this.setState({
      taskLoading: true
    });
    axios.post(api.getByRootTask, { id: this.props.rootTaskId })
      .then(res => {
        if (res.data.length > 0) {
          // draw task rects
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
        this.setState({
          taskLoading: false
        });
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
          <img width="300" src={this.state.svgUri} alt="diagram"/>
        </Modal>
        <Modal
          visible={this.state.taskDetailModalVisible}
          onCancel={() => {this.setState({ taskDetailModalVisible: false })}}
          footer={false}
        >
          <TaskDetail task={this.state.modalTask}/>
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
        <Spin size="large" spinning={this.state.taskLoading}>
          <div className="diagram-container" style={{
            height: window.innerHeight,
            width: window.innerWidth
          }}>
            <div id="holder"
              style={{
                left: this.state.diagramX,
                top: this.state.diagramY
              }}
            ></div>
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
          </div>
        </Spin>
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
            <Icon type="eye-o" onClick={this.showTaskDetailModal} />
            <Icon type="profile" onClick={this.showDetailModal} />
            <Icon type="delete" onClick={this.showRemoveModal} />
            <Icon type="edit" onClick={this.editTask} />
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default Diagram;
