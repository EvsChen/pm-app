import React from 'react';
import { Button, Modal } from 'antd';
import { Link } from 'react-router-dom';

/**
 * @param {Function} onViewSubTask
 */
class DetailModal extends React.Component {

  render() {
    // Here we lift the visible state up, as well as the onCreate method
    const { onViewSubTask, visible, onCancel } = this.props;
    return (
      <Modal title="View task detail"
        visible={visible}
        bodyStyle={{
          height: 400,
          overflowY: 'auto'
        }}
        footer={null}
        onCancel={onCancel}
        style={{ top: 50 }}
      >
        <Button type="primary" onClick={onViewSubTask}>Show subtasks</Button>
        <Link to={{
          pathname: '/home/action/aaa',
        }}>
          View action list
        </Link>
      </Modal>
    );
  }
}

export default DetailModal;