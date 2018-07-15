import React from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import axios from 'axios';

import api from '../api';
import util from '../util';

const FormItem = Form.Item;
const Option = Select.Option;
// FIXME: consider changing date into 12:00 AM
class AddAction extends React.Component {
  state = {
    personArray: []
  }

  // componentDidUpdate(prevProps) {
  //   if (this.props.visible !== prevProps.visible && this.props.visible) {
  //     axios.post(api.getRelatedPerson, {
  //       _id: this.props.modalTask._id
  //     })
  //       .then(res => {
  //         const personArray = res.data;
  //         this.setState({
  //           personArray
  //         });
  //       })
  //       .catch(err => {
  //         util.handleError(err);
  //       })
  //   }
  // }

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

/**
 * @param {Function} onCreate
 * @param {Function} onUpdate
 * @param {Function} onCancel
 * @param {Function} wrappedComponentRef - formRef => {this.formRef = formRef}
 * @param {Boolean} isEditModal 
 * @param {Boolean} confirmLoading
 * @param {Boolean} visible
 */
const AddActionModal = Form.create({
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
})(AddAction);

export default AddActionModal;