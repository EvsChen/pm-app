import React from 'react';
import { Icon } from 'antd';
import PropTypes from 'proptypes';

const GoBack = props => {
  return (
    <div style={{
        textAlign: 'left',
        padding: 20
      }}>
        <Icon type="left"
          onClick={ () => props.onClick() }
          style={{
            fontSize: 20
          }} />
    </div>
  )
}

GoBack.propTypes = {
  onClick: PropTypes.func
};

export default GoBack;