import React from 'react';
import { Tree, Icon, Cascader, Input, Button, Avatar, Layout, Select, message } from 'antd';
import axios from 'axios';
import _ from 'lodash';

import { CurrentUserContext } from '../context';
import AddPersonModal from './AddPersonModal';
import api from '../api';
import './Organization.css';

const { Header, Content } = Layout;
const TreeNode = Tree.TreeNode;
const Option = Select.Option;

const options = [{
  value: 'zhejiang',
  label: 'Zhejiang',
  children: [{
    value: 'hangzhou',
    label: 'Hangzhou',
    children: [{
      value: 'xihu',
      label: 'West Lake',
    }],
  }],
}, {
  value: 'jiangsu',
  label: 'Jiangsu',
  children: [{
    value: 'nanjing',
    label: 'Nanjing',
    children: [{
      value: 'zhonghuamen',
      label: 'Zhong Hua Men',
    }],
  }],
}];

class Organization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      modalVisible: false,
      confirmLoading: false,
      loading: false,
      rootTasks: [],
      selectedTaskId: ''
    };
  }

  componentDidMount() {
    this.loadRootTasks();
  }

  componentWillUnmount() {
    console.log('Organization unmount');
    const newOrganization = this.convertTreeToOrganization(this.state.treeData);
    console.log(newOrganization);
    this.updateTaskOrganization(newOrganization);
  }

  convertTreeToOrganization = treeData => {
    // omit the person property of each object
    return treeData.map(val => {
      if (_.isArray(val.children) && val.children.length > 0) {
        val.children = this.convertTreeToOrganization(val.children);
      }
      return _.omit(val, 'person');
    });
  }

  updateTaskOrganization = organization => {
    axios.post(api.updateTask, {
      _id: this.state.selectedTaskId,
      organization
    })
      .then(res => {
        console.log(res);
        this.handleSuccess('Update successful');
      })
      .catch(err => {
        this.handleError(err);
      })
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
        this.loadTaskDetail(this.state.selectedTaskId);
      })
      .catch(err => {
        this.setState({
          loading: false
        });
        this.handleError(err);
      });
  }

  loadTaskDetail = _id => {
    axios.post(api.queryTask, {
      _id
    })
      .then (res => {
        this.setState({
          selectedTask: res.data[0],
          treeData: res.data[0].organization
        });
      })
      .catch(err => {
        this.handleError(err);
      });
  }

  emitEmpty = () => {
    this.userNameInput.focus();
    this.setState({ userName: '' });
  }

  onChangeUserName = (e) => {
    this.setState({ userName: e.target.value });
  }

  onSelectTaskChange = _id => {
    console.log('select change');
    this.setState({
      treeData: [],
      selectedTaskId: _id
    });
    this.loadTaskDetail(_id);
  }

  /**
   * map tree data into tree nodes 
   * example tree data is 
   * [
   *  {
   *    title: '', key: '',
   *    children: [{title: '...', key: '....', children: [...]}]
   *  },
   *  ...
   * ]
   */
  renderTreeNodes = data => {
    if (_.isArray(data)) {
      return data.map((item) => {
        if (item.children) {
          return (
            <TreeNode icon={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />} title={item.title} key={item.key} dataRef={item}>
              {this.renderTreeNodes(item.children)}
            </TreeNode>
          );
        }
        return <TreeNode icon={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />} {...item} dataRef={item} />;
      });
    }
  }

  showAddPersonModal = () => {
    this.setState({
      modalVisible: true
    });
  }

  handleSuccess = text => {
    message.success(text, 2.5);
  }

  handleError = err => {
    if (err instanceof Error) {
      message.error(`${err.name}:${err.message}`,2.5);
    }
    else {
      message.error(Object.prototype.toString(err), 2.5);
    }
    console.log(err);
  }

  addPersonToTree = person => {
    this.setState((prevState) => {
      const treeData = prevState.treeData;
      treeData.push({
        title: `${person.firstName} ${person.lastName}`,
        key: person._id,
        person
      });
      return { treeData };
    });
  }

  onModalCreate = () => {
    this.setState({
      confirmLoading: true
    });
    const setState = this.setState.bind(this);
    const createPerson = this.createPerson.bind(this);
    const addPersonToTree = this.addPersonToTree.bind(this);
    const form = this.formRef.props.form;
    form.validateFields((err, person) => {
      if (err) return;
        createPerson(person)
        .then(res => {
          if (res.data) {
            console.log(res.data);
            addPersonToTree(res.data);
          }
          setState({
            confirmLoading: false,
            modalVisible: false
          });
          this.handleSuccess('创建成功');
        })
        .catch(err => {
          this.handleError(err);
        })
    });
  }

  /**
   * @param {person} - person
   */
  createPerson = person => {
    return axios.post(api.createPerson, person);
  }

  onModalCancel = () => {
    this.setState({
      modalVisible: false
    });
  }

  saveFormRef = formRef => {
    this.formRef = formRef;
  }

  render() {
    const { userName } = this.state;
    const suffix = userName ? <Icon type="close-circle" onClick={this.emitEmpty} /> : null;
    const taskOptions = this.state.rootTasks.map((task) =>
      <Option key={task._id} value={task._id}>{task.title}</Option>
    );
    return (
      <React.Fragment>
        {/* TODO: Adding person by searching existing users */}
        <AddPersonModal
          visible={this.state.modalVisible}
          confirmLoading={this.state.confirmLoading}
          onCreate={this.onModalCreate}
          onCancel={this.onModalCancel}
          wrappedComponentRef={this.saveFormRef}
        />
        <Header style={{ background: '#fff', padding: 0 }}>
          {
            this.state.selectedTaskId && (
              <Select 
                defaultValue={this.state.selectedTaskId} 
                style={{ width: 120 }} 
                onChange={this.onSelectTaskChange}
              >
                {taskOptions}
              </Select>
            )
          }
        </Header>
        {/* The scrolling only resctricts to content  */}
        <Content style={{ margin: '0 16px' }}>
          <Tree
            showIcon
            defaultExpandAll
            defaultSelectedKeys={['0-0-0']}
          >
            {this.renderTreeNodes(this.state.treeData)}
          </Tree>
          <div className="filter">
            <div className="filter-condition">
              <p>
                <Cascader defaultValue={['zhejiang', 'hangzhou', 'xihu']}
                  options={options}
                  onChange={this.onChange}
                  placeholder="Filter by organization:" />
              </p>
              <p>
                <Input
                  placeholder="Search by name:"
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  suffix={suffix}
                  value={userName}
                  onChange={this.onChangeUserName}
                  ref={node => this.userNameInput = node}
                />
              </p>
            </div>
            <div className="filter-action filter-search">
              <Button type="primary" shape="circle" icon="search"></Button>
            </div>
            <div className="filter-action filter-add">
              <Button type="primary" shape="circle" icon="plus" onClick={this.showAddPersonModal}></Button>
            </div>
          </div>
        </Content>
      </React.Fragment>
    );
  }
}

export default props => (
  <CurrentUserContext.Consumer>
    {({ id }) => <Organization {...props} userId={id} />}
  </CurrentUserContext.Consumer>
);