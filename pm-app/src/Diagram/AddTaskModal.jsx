import React from 'react';
import { Modal, Form, Input, Select, DatePicker, Button } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import axios from 'axios';
import PropTypes from 'proptypes';

import api from '../api';
import util from '../common/util';
import s3 from '../common/s3';
import { CurrentUserContext } from '../common/context';

const FormItem = Form.Item;
const Option = Select.Option;
// FIXME: consider changing date into 12:00 AM
class AddTask extends React.Component {
  state = {
    personArray: [],
    files: [],
    enableFilePreview: false
  }

  componentDidMount() {
    s3.$loadFileList(this.props.userId)
      .then(list => {
        if (list) {
          this.setState({
            files: list
          });
        }
      })
      .catch(err => {
        util.handleError(err);
      })
  }

  onFileChange = val => {
    if (val) {
      this.setState({
        enableFilePreview: true,
        filePreviewPath: val
      });
    }
  }

  onModalVisible = () => {
    this.getRelatedPersonList();
    this.checkFilePreview();
  }

  checkFilePreview = () => {
    // task含有file项, enable preview
    if (this.props.modalTask && this.props.modalTask.filePath) {
      this.setState({
        enableFilePreview: true,
        filePreviewPath: this.props.modalTask.filePath
      });
    }
  }

  getRelatedPersonList = () => {
    axios.post(api.getRelatedPerson, {
      _id: this.props.modalTask._id
    })
      .then(res => {
        const personArray = res.data;
        this.setState({ personArray });
      })
      .catch(err => {
        util.handleError(err);
      })
  }

  componentDidUpdate(prevProps) {
    if (this.props.visible !== prevProps.visible && this.props.visible) {
      this.onModalVisible();
    }
  }

  render() {
    // Here we lift the visible state up, as well as the onCreate method
    const { form, confirmLoading, visible, onCreate, onUpdate, onCancel, isEditModal } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal title={isEditModal ? 'Update task' : 'Create new task'}
        visible={visible}
        onOk={isEditModal ? onUpdate : onCreate}
        okText={isEditModal ? 'Update' : 'Create'}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        bodyStyle={{
          height: 400,
          overflowY: 'auto'
        }}
        style={{ top: 50 }}
      >
        <Form layout="vertical">
          <FormItem label="Title">
            {getFieldDecorator('title', {
              rules: [{ required: true, message: 'Please input the title of task!' }]
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="Description">
            {getFieldDecorator('description')(<Input type="textarea" />)}
          </FormItem>
          <FormItem label="Owner">
            {getFieldDecorator('owner')(
              <Select>
                {
                  this.state.personArray.map(val => 
                    <Option value={val.key} key={val.key}>{val.title}</Option>
                  )
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="File">
            {getFieldDecorator('filePath')(
              <Select onChange={this.onFileChange} className="file-select">
                {
                  this.state.files.map(val => 
                    <Option value={val.url} key={val.ETag}>{val.title}</Option>
                  )
                }
              </Select>
            )}
            <Button shape="circle" icon="search" 
              target="_blank"
              disabled={!this.state.enableFilePreview}
              href={this.state.filePreviewPath}
            />
          </FormItem>
          <FormItem label="Start Date">
            {getFieldDecorator('startDate')(
              <DatePicker />
            )}
          </FormItem>
          <FormItem label="End Date">
            {getFieldDecorator('endDate')(
              <DatePicker />
            )}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

const AddTaskModal = Form.create({
  // This method maps modal props into form initial values
  mapPropsToFields: (props) => {
    const fieldObj = _.mapValues(props.modalTask, (val, key) => {
      if (key === 'startDate' || key === 'endDate') {
        return Form.createFormField({
          value: moment(val)
        })
      }
      return Form.createFormField({
        value: val
      })
    });
    return fieldObj;
  }
})(AddTask);

AddTaskModal.propTypes = {
  isEditModal: PropTypes.bool,
  onUpdate: PropTypes.func
}

export default props => (
  <CurrentUserContext.Consumer>
    { ({id}) => (<AddTaskModal {...props} userId={id}/>)}
  </CurrentUserContext.Consumer>
);