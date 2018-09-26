/**
 * @file components/ActionList.jsx - display actions
 */
import React from 'react';
import { List, Checkbox } from 'antd';
import PropTypes from 'proptypes';

const ActionList = props =>  {
  const { header, actions, onActionClick, onActionCheck } = props;
  const handleClick = item => onActionClick(item);
  const handleCheck = (_id, e) => onActionCheck(_id, e);
  const renderItem = item => (
    <List.Item>
      <div className="item-content" onClick={handleClick.bind(null, item)}>
        {item.progress === 100 
          ? <del>{`${item.title}`}</del>
          : item.title
        }
      </div>
      <Checkbox onChange={handleCheck.bind(null, item._id)}></Checkbox>
    </List.Item>);
    return (
      <React.Fragment>
        <List
          header={<div>{`${header}`}</div>}
          bordered
          dataSource={actions}
          renderItem={renderItem}
          />
      </React.Fragment>
    );
  };

ActionList.propTypes = {
  header: PropTypes.string,
  actions: PropTypes.array,
  onActionClick: PropTypes.func,
  onActionCheck: PropTypes.func
};

export default ActionList;