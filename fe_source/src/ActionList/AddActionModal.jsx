import React from 'react';
import { Modal, Form, Input, Select, DatePicker } from 'antd';
import PropTypes from 'proptypes';
import moment from 'moment';
import _ from 'lodash';

const FormItem = Form.Item;
const Option = Select.Option;
// FIXME: consider changing date into 12:00 AM
class AddAction extends React.Component {
  state = {
    personArray: []
  }

  render() {
    // Here we lift the visible state up, as well as the onCreate method
    const { form, confirmLoading, visible, onCreate, onUpdate, onCancel, isEditModal } = this.props;
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
                  this.state.personArray.map(val => 
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

const AddActionModal = Form.create({
  // This method maps modal props into form initial values
  mapPropsToFields: props => {
    return _.mapValues(props.modalData, (val, key) => {
      if (key === 'startDate' || key === 'endDate') {
        return Form.createFormField({ value: moment(val) });
      }
      return Form.createFormField({ value: val });
    });
  }
})(AddAction);

AddActionModal.propTypes = {
  onCreate: PropTypes.func,
  onUpdate: PropTypes.func,
  onCancel: PropTypes.func,
  wrappedComponentRef: PropTypes.func,
  isEditModal: PropTypes.bool,
  visible: PropTypes.bool,
  confirmLoading: PropTypes.bool
};

export default AddActionModal;