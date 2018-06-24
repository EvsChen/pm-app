import React from 'react';
import { Tree, Icon, Cascader, Input, Button, Avatar, Modal } from 'antd';

import './Orgnization.css';

const TreeNode = Tree.TreeNode;
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

function onChange(value) {
  console.log(value);
}

class Orgnization extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userName: '',
      treeData: [{
        title: 'Jason',
        key: 'Jason',
        children: [
          {
            title: 'Max',
            key: 'Max',
          },
          {
            title: 'Elvis',
            key: 'Elvis',
          }
        ]
      }],
      modalVisible: false,
      modalConfirmLoading: false
    };
  }

  emitEmpty = () => {
    this.userNameInput.focus();
    this.setState({ userName: '' });
  }

  onChangeUserName = (e) => {
    this.setState({ userName: e.target.value });
  }

  renderTreeNodes = (data) => {
    return data.map((item) => {
      if (item.children) {
        return (
          <TreeNode icon={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />} title={item.title} key={item.title} dataRef={item}>
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode icon={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />} {...item} dataRef={item} />;
    });
  }

  showAddPersonModal = () => {
    this.setState({
      modalVisible: true
    })
  }

  handleConfirm = () => {
    this.setState({
      modalConfirmLoading: true
    });
    // The modal closes in an async manner 
    setTimeout(() => {
      this.setState({
        modalVisible: false,
        modalConfirmLoading: false
      });
    }, 2000);
  }

  handleCancel = () => {
    this.setState({
      modalVisible: false
    });
  }

  render() {
    const { userName, modalVisible, modalConfirmLoading } = this.state;
    const suffix = userName ? <Icon type="close-circle" onClick={this.emitEmpty} /> : null;

    return (
      <React.Fragment>
        {/* TODO: Adding person by searching existing users */}
        <Modal title="Add new person"
          visible={modalVisible}
          onOk={this.handleConfirm}
          confirmLoading={modalConfirmLoading}
          onCancel={this.handleCancel}
        >
          <p>{`Hello from react`}</p>
        </Modal>

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
                onChange={onChange}
                placeholder="Filter by orgnization:" />
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
      </React.Fragment>
    );
  }
}

export default Orgnization;