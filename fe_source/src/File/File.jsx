import React from 'react';
import _ from 'lodash';
import { Button, Upload, Icon, List } from 'antd';

import { handleError, handleSuccess } from '../common/util';
import { CurrentUserContext } from '../common/context';
import s3 from '../common/s3';

class File extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fileList: [],
      loading: false,
      uploaderFileList: []
    };
  }

  componentDidMount() {
    this.reloadFileList();
  }

  reloadFileList = () => {
    this.setState({loading: true});
    const userId = this.props.userId;
    s3.$loadFileList(userId)
      .then(fileList => {
        this.setState({ 
          fileList: fileList,
          loading: false
        });
      })
      .catch(err => {
        handleError(err);
        this.setState({
          loading: false
        });
        return s3.$createFileObject(userId);
      })
  }

  onFileChange = ({file}) => {
    this.setState(prevState => {
      prevState.uploaderFileList.push(_.pick(file, ['name', 'status', 'uid']));
      return prevState;
    });
  }

  customFileUpload = ({file}) => {
    const userId = this.props.userId;
    s3.$uploadFile(userId, file)
      .then(data => {
        // when uploading finished, setting file list to empty
        handleSuccess('上传成功！');
        this.setState({
          uploaderFileList: []
        });
        this.reloadFileList();
      })
      .catch(err => {
        handleError(err);
      });
  }

  render() {
    // TODO: upload排版
    // TODO: increase loading icon for each step
    const customFileUpload = this.customFileUpload;
    const uploaderProps = {
      name: 'file',
      action: '',
      headers: {
        authorization: 'authorization-text',
      },
      customRequest: customFileUpload,
      onChange: this.onFileChange,
      fileList: this.state.uploaderFileList
    };
    const renderItem = item => (
      <List.Item>
        <a href={item.url}>{item.title}</a>
      </List.Item>
    );
    const template = <div>
      <List
        loading={this.state.loading}
        dataSource={this.state.fileList}
        renderItem={renderItem}
        style={{
          paddingLeft: 30
        }}
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