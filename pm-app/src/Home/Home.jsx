import React from 'react';
import { Layout, Select } from 'antd';
import axios from 'axios';
import moment from 'moment';

import './Home.css';
import { CurrentUserContext } from '../common/context';
import api from '../api';
import TaskCard from './TaskCard';

const { Header, Content } = Layout;
const Option = Select.Option;

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: []
    };
  }

  componentDidMount() {
    this.handleChange('day');
  }

  handleError = err => {
    console.log(err);
  }

  handleChange = (value) => {
    axios.post(api.queryTask, {
      creator: this.props.userId,
      endDate: {
        $gte: moment().startOf(value),
        $lte: moment().endOf(value)
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
        <Content style={{ margin: '0 16px' }}>
          {
            this.state.tasks && this.state.tasks.map(task =>
              <TaskCard task={task} key={task._id} />
            )
          }
        </Content>
      </React.Fragment>
    );
  }
}


export default props => (
  <CurrentUserContext.Consumer>
    {({ id }) => <Index {...props} userId={id} />}
  </CurrentUserContext.Consumer>
);