import React from 'react';
import { Button, Upload, Icon, List } from 'antd';

import { handleError } from '../common/util';
import { CurrentUserContext } from '../common/context';
import s3 from '../common/s3';

class File extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: []
    };
  }

  componentDidMount() {
    const userId = this.props.userId;
    s3.$loadFileList(userId)
      .then(fileList => {
        this.setState({
          files: fileList
        });
      })
      .catch(err => {
        handleError(err);
        return s3.$createFileObject(userId);
      })
  }

  render() {
    // TODO: upload排版
    // TODO: increase loading icon for each step
    const userId = this.props.userId;
    const uploaderProps = {
      name: 'file',
      action: '',
      headers: {
        authorization: 'authorization-text',
      },
      customRequest({file}) {
        s3.$uploadFile(userId, file)
          .then(data => {
            s3.$loadFileList(userId);
          })
          .catch(err => {
            handleError(err);
          });
      }
    };
    const renderItem = item => (
      <List.Item>
        <a href={item.url}>{item.title}</a>
      </List.Item>
    );
    const template = <div>
      <List
        dataSource={this.state.files}
        renderItem={renderItem}
      />
      <Upload {...uploaderProps}>
        <Button>
          <Icon type="upload" /> Click to Upload
        </Button>
      </Upload>
    </div>;
    return template;
  }
}

export default props => (
  <CurrentUserContext.Consumer>
    {({ id }) => <File {...props} userId={id} />}
  </CurrentUserContext.Consumer>
);