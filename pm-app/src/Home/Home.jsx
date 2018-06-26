import React from 'react';
import { Layout, Card, Icon, Avatar, Select } from 'antd';
import axios from 'axios';
import moment from 'moment';

import './Home.css';
import { CurrentUserContext } from '../context';
import api from '../api';

const { Header, Content } = Layout;
const { Meta } = Card;
const Option = Select.Option;

class Index extends React.Component {
  state = {
    tasks: []
  }

  handleError = err => {
    console.log(err);
  }

  handleChange = (value) => {
    switch (value) {
      case 'today':
        axios.post(api.queryTask, {
          query: {
            creator: this.props.userId,
            endDate: {
              $gte: moment().startOf('day'),
              $lte: moment().endOf('day')
            }
          }
        })
          .then(res => {
            this.setState({
              tasks: res.data
            });
          })
          .catch(err => {
            this.handleError(err);
          });
        break;
      case 'week':
        axios.post(api.queryTask, {
          query: {
            creator: this.props.userId,
            endDate: {
              $gte: moment().startOf('week'),
              $lte: moment().endOf('week')
            }
          }
        })
          .then(res => {
            this.setState({
              tasks: res.data
            });          })
          .catch(err => {
            this.handleError(err);
          });
        break;
      case 'month':
        axios.post(api.queryTask, {
          query: {
            creator: this.props.userId,
            endDate: {
              $gte: moment().startOf('month'),
              $lte: moment().endOf('month')
            }
          }
        })
          .then(res => {
            this.setState({
              tasks: res.data
            });          })
          .catch(err => {
            this.handleError(err);
          });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Header style={{ background: '#fff', padding: 0 }}>
          <Select defaultValue="lucy" style={{ width: 120 }} onChange={this.handleChange}>
            <Option value="today">Today</Option>
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
          </Select>
        </Header>
        <Content style={{ margin: '0 16px' }}>
          {
            this.state.tasks && this.state.tasks.map(task => 
              <TaskCard task={task} key={task._id}/>
            )
          }
        </Content>
      </React.Fragment>
    );
  }
}

class TaskCard extends React.Component {
  render() {
    return (
      <Card
        actions={[<Icon type="setting" />, <Icon type="edit" />, <Icon type="ellipsis" />]}
      >
        <Meta
          avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
          title={this.props.task.title}
          description={(<p>Due: {this.props.task.endDate}</p>)}
        />
      </Card>
    )
  }
}

export default props => (
  <CurrentUserContext.Consumer>
    {({ id }) => <Index {...props} userId={id} />}
  </CurrentUserContext.Consumer>
);