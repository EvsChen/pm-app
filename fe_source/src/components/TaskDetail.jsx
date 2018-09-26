import React from 'react';
import PropTypes from 'proptypes';

class DetailItem extends React.Component {
  render() {
    const {label, value} = this.props;
    return (
      <div>
        <span
          style={{
            marginRight: 10
          }}
        >{label}:</span><span>{value}</span>
      </div>
    );
  }
}

DetailItem.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string
};

class TaskDetail extends React.Component {
  componentDidMount() {
    this.loadTask();
  }

  loadTask = () => {
    const task = this.props.task;
    console.log(task);
  }

  render() {
    const task = this.props.task;
    return (
      <div>
        <DetailItem label="Title" value={task.title} />
        <DetailItem label="Description" value={task.description} />
      </div>
    );
  }
}

TaskDetail.propTypes = {
  taskId: PropTypes.string,
  task: PropTypes.object
};

export default TaskDetail;