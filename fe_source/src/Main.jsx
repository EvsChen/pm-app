import React from 'react';
import { Layout, Menu, Icon } from 'antd';
import { Link, Route } from 'react-router-dom';

import './Main.css';

import Index from './Home/Home';
import Organization from './Organization/Organization';
import File from './File/File';
import DiagramHolder from './Diagram/DiagramHolder';
import Setting from './Setting/Setting';
import Action from './Action/ActionContainer';

const { Sider } = Layout;

const pathList = [
  '/home',
  '/home/diagram',
  '/home/organization',
  '/home/setting',
  '/home/file',
  '/home/action'
];

class Main extends React.Component {
  constructor(props) {
    super(props);
    const current = pathList.indexOf(this.props.location.pathname) > 0
      ? pathList.indexOf(this.props.location.pathname).toString()
      : '0';
    this.state = {
      collapsed: true,
      current
    };
  }

  onCollapse = collapsed => {
    this.setState({ collapsed: collapsed });
  }

  handleMenuClick = e => {
    this.setState({
      current: e.key,
    });
  }

  render() {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sider
          collapsible
          collapsedWidth="0"
          defaultCollapsed={true}
          collapsed={this.state.collapsed}
          onCollapse={this.onCollapse}
        >
          <div className="sider-info">
            <div className="sider-info-position">
              <span className="sider-info-position-name">Jason</span>
              <br />
              <span className="sider-info-position-pos">Manager</span>
            </div>
          </div>
          <Menu theme="dark"
            mode="inline"
            selectedKeys={[this.state.current]}
            onClick={this.handleMenuClick}>
            <Menu.Item key="0">
              <Link to={`${this.props.match.path}`}>
                <Icon type="calendar" />
                <span>Home</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="1">
              <Link to={`${this.props.match.path}/diagram`}>
                <Icon type="appstore-o" />
                <span>Diagram</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to={`${this.props.match.path}/organization`}>
                <Icon type="user" />
                <span>Organization</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to={`${this.props.match.path}/file`}>
                <Icon type="file" />
                <span>File</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="4">
              <Link to={`${this.props.match.path}/action`}>
                <Icon type="table" />
                <span>Action List</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="5">
              <Link to={`${this.props.match.path}/setting`}>
                <Icon type="setting" />
                <span>Setting</span>
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Route exact path={`${this.props.match.path}`} component={Index} />
          <Route path={`${this.props.match.path}/diagram`} component={DiagramHolder} />
          <Route path={`${this.props.match.path}/organization`} component={Organization} />
          <Route path={`${this.props.match.path}/file`} component={File} />
          <Route path={`${this.props.match.path}/setting`} component={Setting} />
          <Route path={`${this.props.match.path}/action`} component={Action} />
        </Layout>
      </Layout>
    );
  }
}

export default Main;