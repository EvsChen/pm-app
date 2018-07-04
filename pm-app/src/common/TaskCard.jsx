import React from 'react';
import { Card, Icon, Avatar} from 'antd';

const { Meta } = Card;

class TaskCard extends React.Component {
  render() {
    return (
      <Card
        style={{ margin: '16px 0' }}
        actions={[<Icon type="edit" />, <Icon type="ellipsis" />]}
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

export default TaskCard;