import React from 'react';
import { Layout, Select, Spin } from 'antd';
import axios from 'axios';
import moment from 'moment';

import './Home.css';
import { CurrentUserContext } from '../common/context';
import util from '../common/util';
import api from '../api';
import TaskCard from './TaskCard';

const { Header, Content } = Layout;
const Option = Select.Option;

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      loading: false
    };
  }

  componentDidMount() {
    this.handleChange('day');
  }

  loadingTasks = value => {
    return axios.post(api.queryTask, {
      creator: this.props.userId,
      endDate: {
        $gte: moment().startOf(value),
        $lte: moment().endOf(value)
      }
    })
  }

  handleChange = value => {
    this.setState({
      loading: true
    });
    this.loadingTasks(value)
      .then(res => {
        this.setState({
          tasks: res.data,
          loading: false
        });
      })
      .catch(err => {
        util.handleError(err);
        this.setState({
          loading: false
        });
      });
  }

  render() {
    return (
      <React.Fragment>
        <Header style={{ background: '#fff', padding: 0 }}>
          <Select defaultValue="today" style={{ width: 120 }} onChange={this.handleChange}>
            <Option value="day">Today</Option>
            <Option value="week">This Week</Option>
            <Option value="month">This Month</Option>
          </Select>
        </Header>
        {/* The scrolling only resctricts to content  */}
        <Spin spinning={this.state.loading}>
          <Content style={{ margin: '0 16px' }}>
            {
              this.state.tasks && this.state.tasks.map(task =>
                <TaskCard task={task} key={task._id} />
              )
            }
          </Content>
        </Spin>
      </React.Fragment>
    );
  }
}


export default props => (
  <CurrentUserContext.Consumer>
    {({ id }) => <Index {...props} userId={id} />}
  </CurrentUserContext.Consumer>
);