import React, {Component} from 'react';
import {getDistanceSq} from './utils/distance';
import getEasings from './utils/easing';

const PIXEL_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
const EDGE_EASING_SIZE = 120;
const SAFE_ZONE = 80 / PIXEL_RATIO;
const MOUSE_BUTTON_LEFT = 0;

const [makeStartEasing, makeEndEasing] = getEasings(EDGE_EASING_SIZE);

function clearSelection() {
  if (document.selection) {
    // IE?
    document.selection.empty();
    return;
  }

  if (window.getSelection && window.getSelection().empty) {
    // Chrome
    window.getSelection().empty();
    return;
  }

  if (window.getSelection && window.getSelection().removeAllRanges) {
    // Firefox
    window.getSelection().removeAllRanges();
    return;
  }
}

class Frame extends Component {
  state = {
    startPoint: {
      x: 0,
      y: 0,
    },
    endPoint: {
      x: 0,
      y: 0,
    },
    scrolling: false,
    mousedown: false,
    dragging: false,
  };

  componentDidMount() {
    if (!window) {
      return;
    }
    window.addEventListener('touchmove', this.handleWindowTouchMove, {
      passive: false,
    });
    window.addEventListener('scroll', this.handleScroll);
  }

  componentWillUnmount() {
    if (!window) {
      return;
    }
    window.removeEventListener('touchmove', this.handleWindowTouchMove, {
      passive: false,
    });
    window.removeEventListener('scroll', this.handleScroll);
    clearTimeout(this._scrollTimer);
  }

  handleWindowTouchMove = (event) => {
    if (!this.isDragging()) {
      return;
    }
    event.preventDefault();
  };

  handleScroll = () => {
    if (!this._listenScroll || this.state.scrolling) {
      return;
    }

    this.setState({
      scrolling: true,
    });
  };

  scrollListen() {
    this._listenScroll = true;
  }

  scrollEnd() {
    this._listenScroll = false;

    clearTimeout(this._scrollTimer);

    this._scrollTimer = setTimeout(() => {
      this.setState({
        scrolling: false,
      });
    }, 100);
  }

  isDragAllowed() {
    return !this.state.scrolling && this.isMouseDown();
  }

  getItemWidth() {
    const {containerWidth, slidesPerPage} = this.props;
    return containerWidth / slidesPerPage;
  }

  getFullWidth() {
    const {slidesCount} = this.props;
    const itemWidth = this.getItemWidth();
    return itemWidth * slidesCount;
  }

  getMovement() {
    const {startPoint, endPoint} = this.state;
    return startPoint.x - endPoint.x;
  }

  getCurrentPage() {
    const {currentPage} = this.props;
    const offset = this.getSafePageOffset();
    return currentPage + offset;
  }

  getSafePageOffset() {
    const movement = this.getMovement();
    const itemWidth = this.getItemWidth();

    const relativeSafeZone = SAFE_ZONE / itemWidth;

    const direction = Math.sign(movement);
    const absoluteMovement = direction * movement;

    const offset = absoluteMovement / itemWidth;
    const offsetWhole = Math.floor(offset);
    const offsetFraction = offset - offsetWhole;

    if (offsetFraction - relativeSafeZone > 0) {
      return direction * (offsetWhole + 1);
    }

    return direction * offsetWhole;
  }

  getPosition() {
    const {containerWidth, currentPage} = this.props;

    const itemWidth = this.getItemWidth();
    const offset = currentPage * itemWidth;

    if (!this.isDragAllowed()) {
      return offset;
    }

    const {slidesCount} = this.props;

    const workWidth = itemWidth * slidesCount - containerWidth;

    const startEasing = makeStartEasing();
    const endEasing = makeEndEasing(workWidth);

    const movement = this.getMovement();
    const position = offset + movement;

    if (position < 0) {
      return startEasing(position);
    }

    if (position > workWidth) {
      return endEasing(position);
    }

    return position;
  }

  setDraggingState(start, current) {
    if (!this.isDragging() && getDistanceSq(start, current) > Math.pow(10 * PIXEL_RATIO, 2)) {
      this.enableDragging();
    }
  }

  moveStart(point) {
    this.setState({
      startPoint: point,
      endPoint: point,
      mousedown: true,
    });
  }

  move(point) {
    const {startPoint} = this.state;

    this.setState({
      endPoint: point,
    });

    this.setDraggingState(startPoint, point);
  }

  moveEnd() {
    const currentPage = this.getCurrentPage();

    this.props.onPageChange(currentPage);

    this.setState({
      mousedown: false,
    });

    this.disableDragging();
  }

  enableDragging() {
    clearTimeout(this._draggingTimer);
    clearSelection();
    this.setState({
      dragging: true,
    });
  }

  disableDragging() {
    this._draggingTimer = setTimeout(() => {
      this.setState({
        dragging: false,
      });
    }, 20);
  }

  isDragging() {
    return this.state.dragging;
  }

  isMouseDown() {
    return this.state.mousedown;
  }

  handleClickCapture = (e) => {
    if (this.isDragging()) {
      e.preventDefault();
      e.stopPropagation();

      if (e.nativeEvent) {
        e.nativeEvent.stopPropagation();
      }
    }
  };

  handleDragStart = (e) => {
    e.preventDefault();
  };

  handleTouchStart = (e) => {
    this.scrollListen();

    const point = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY,
    };

    this.moveStart(point);
  };

  handleTouchEnd = () => {
    this.scrollEnd();
    this.moveEnd(this.state.endPoint);
  };

  handleTouchMove = (e) => {
    const point = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY,
    };

    if (!this.isDragAllowed()) {
      this.moveStart(point);
      return;
    }

    this.move(point);
  };

  handleMouseDown = (e) => {
    if (e.button !== MOUSE_BUTTON_LEFT) {
      return;
    }

    const point = {
      x: e.pageX,
      y: e.pageY,
    };

    this.moveStart(point);
  };

  handleMouseMove = (e) => {
    if (!this.isDragAllowed()) {
      return;
    }

    if (this.isDragging()) {
      e.preventDefault();
    }

    const point = {
      x: e.pageX,
      y: e.pageY,
    };

    this.move(point);
  };

  handleMouseUp = () => {
    const {endPoint} = this.state;
    this.moveEnd(endPoint);
  };

  handleMouseLeave = (e) => {
    if (!this.isDragAllowed()) {
      return;
    }

    const endPoint = {
      x: e.pageX,
      y: e.pageY,
    };

    this.moveEnd(endPoint);
  };

  render() {
    const {changePage, nextPage, previousPage, render} = this.props;

    const position = this.getPosition();
    const fullWidth = this.getFullWidth();
    const isMoving = this.isDragAllowed();

    const containerHandlers = {
      onTouchStart: this.handleTouchStart,
      onTouchEnd: this.handleTouchEnd,
      onTouchMove: this.handleTouchMove,
      onMouseDown: this.handleMouseDown,
      onMouseUp: this.handleMouseUp,
      onMouseLeave: this.handleMouseLeave,
      onMouseMove: this.handleMouseMove,
      onClickCapture: this.handleClickCapture,
      onDragStart: this.handleDragStart,
    };

    return render({
      position,
      fullWidth,
      isMoving,
      changePage,
      nextPage,
      previousPage,
      containerHandlers,
    });
  }
}

export default Frame;
