import React from 'react';
import { Button, Modal, Form, Input, Radio, DatePicker, Select, Icon, Spin } from 'antd';

/**
 * @param {Function} onViewSubTask
 */
class DetailModal extends React.Component {

  render() {
    // Here we lift the visible state up, as well as the onCreate method
    const { onViewSubTask, visible, onCreate, onUpdate, onCancel, isEditModal } = this.props;
    return (
      <Modal title="View task detail"
        visible={visible}
        bodyStyle={{
          height: 400,
          overflowY: 'auto'
        }
        }
        style={{ top: 50 }}
      >
        <Button type="primary" onClick={onViewSubTask}>Show subtasks</Button>
      </Modal>
    );
  }
}

export default DetailModal;