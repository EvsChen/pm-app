import React from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import PropTypes from 'proptypes';
import moment from 'moment';
import _ from 'lodash';

const FormItem = Form.Item;
const Option = Select.Option;
// FIXME: consider changing date into 12:00 AM
class ActionModalForm extends React.Component {
  render() {
    const { form, confirmLoading, visible, onCreate, onUpdate, onCancel, isEditModal, personArray } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal title={isEditModal ? 'Update action' : 'Create new action'}
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
            })(<Input type="textarea"/>)}
          </FormItem>
          <FormItem label="Description">
            {getFieldDecorator('description')(<Input type="textarea" />)}
          </FormItem>
          <FormItem label="Owner">
            {getFieldDecorator('owner')(
              <Select>
                {
                  personArray.map(val => 
                    <Option value={val.key} key={val.key}>{val.title}</Option>
                  )
                }
              </Select>
            )}
          </FormItem>
          <FormItem label="Start Date">
            {getFieldDecorator('startDate')(<DatePicker />)}
          </FormItem>
          <FormItem label="End Date">
            {getFieldDecorator('endDate')(<DatePicker />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}

const ActionModalContainer = Form.create({
  mapPropsToFields: props => {
    return _.mapValues(props.modalData, (val, key) => {
      if (key === 'startDate' || key === 'endDate') {
        return Form.createFormField({ value: moment(val) });
      }
      return Form.createFormField({ value: val });
    });
  }
})(ActionModalForm);

ActionModalContainer.propTypes = {
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
  wrappedComponentRef: PropTypes.func.isRequired,
  isEditModal: PropTypes.bool,
  modalData: PropTypes.object,
  visible: PropTypes.bool.isRequired,
  confirmLoading: PropTypes.bool,
  personArray: PropTypes.array
};

export default ActionModalContainer;