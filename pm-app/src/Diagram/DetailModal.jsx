import React from 'react';
import PropTypes from 'proptypes';
import { Button, Modal } from 'antd';
import { Link } from 'react-router-dom';

class DetailModal extends React.Component {
  render() {
    // Here we lift the visible state up, as well as the onCreate method
    const { onViewSubTask, visible, onCancel, modalTask } = this.props;
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
        className="task-detail-modal"
      >
        <Button type="primary" onClick={onViewSubTask}>Show subtasks</Button>
        <Link to={{
          pathname: '/home/action',
          state: {
            modalTask
          }
        }}>
          <Button type="primary">Show actions</Button>
        </Link>
      </Modal>
    );
  }
}

DetailModal.propTypes = {
  visible: PropTypes.bool,
  modalTask: PropTypes.object
};

export default DetailModal;