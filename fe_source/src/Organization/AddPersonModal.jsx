import React from 'react';
import { Modal, Form, Input } from 'antd';

const FormItem = Form.Item;

class AddPerson extends React.Component {
  render() {
    const { form, visible, onCreate, confirmLoading, onCancel } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal title="Add new person"
        visible={visible}
        onOk={onCreate}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        bodyStyle={{
          overflowY: 'auto',
          height: 400
        }}
      >
        <Form layout="vertical">
          <FormItem label="Username">
            {getFieldDecorator('userName')(<Input />)}
          </FormItem>
          <FormItem label="First Name">
            {getFieldDecorator('firstName',{
              rules: [{ required: true, message: 'Please input the first name!' }]
            })(<Input type="textarea" />)}
          </FormItem>
          <FormItem label="Last Name">
            {getFieldDecorator('lastName',{
              rules: [{ required: true, message: 'Please input the first name!' }]
            })(<Input type="textarea" />)}
          </FormItem>
          <FormItem label="Position">
            {getFieldDecorator('position')(<Input type="textarea" />)}
          </FormItem>
          <FormItem label="Department">
            {getFieldDecorator('department')(<Input type="textarea" />)}
          </FormItem>
          <FormItem label="Email">
            {getFieldDecorator('email')(<Input type="textarea" />)}
          </FormItem>
        </Form>
      </Modal>
    );
  }
}
const AddPersonModal = Form.create()(AddPerson);

export default AddPersonModal;