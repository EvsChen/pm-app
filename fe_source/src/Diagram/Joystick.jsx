import React from 'react';

import './Joystick.css';

// FIXME: restrict the position of joystick touch in the circle
class Joystick extends React.Component {
  state = {
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    moveX: 0,
    moveY: 0
  }

  componentDidMount() {
    const touchPoint = document.getElementById('joystick-touch');
    touchPoint.addEventListener('touchstart', this.onTouchStart, { passive: false });
    touchPoint.addEventListener('touchmove', this.onTouchMove, { passive: false });
    touchPoint.addEventListener('touchend', this.onTouchEnd, { passive: false });
  }

  onTouchStart = (evt) => {
    evt.preventDefault();
    evt.target.style.backgroundColor = 'rgba(0,0,0,0.8)';
    this.setState({
      x: evt.target.offsetLeft,
      y: evt.target.offsetTop,
      startX: evt.pageX || evt.touches[0].pageX,
      startY: evt.pageY || evt.touches[0].pageY,
    });
  }

  onTouchMove = (evt) => {
    evt.preventDefault();
    const target = evt.target;
    const holder = document.getElementById(this.props.targetId);
    const nowX = evt.pageX || evt.touches[0].pageX;
    const nowY = evt.pageY || evt.touches[0].pageY;
    this.setState({
      moveX: nowX - this.state.startX,
      moveY: nowY - this.state.startY
    });
    target.style.left = `${40 + this.state.moveX}px`;
    target.style.top = `${40 + this.state.moveY}px`;
    const step = 5;
    this.state.moveX > 0
      ? holder.style.left = `${holder.offsetLeft - step}px`
      : holder.style.left = `${(holder.offsetLeft + step) > 0 ? 0 : (holder.offsetLeft + step)}px`;
  }

  onTouchEnd = (evt) => {
    evt.preventDefault();
    const target = evt.target;
    target.style.backgroundColor = 'rgba(0,0,0,0.4)';
    this.setState({
      moveX: 0,
      moveY: 0,
    });
    target.style.left = target.style.top = '40px';
  }

  render() {
    return (
      <div id="joystick">
        <div id="joystick-touch"></div>
      </div>
    );
  }
}

export default Joystick;