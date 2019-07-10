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

  render() {
    const {
      currentPage,
      changePage,
      nextPage,
      previousPage,
      render,
      component,
      draft,
      slidesCount,
      ...customProps
    } = this.props;

    const slides = this.cloneSlides();
    const position = this.getPosition();
    const fullWidth = this.getFullWidth();
    const isMoving = this.isDragAllowed();
    const instantPage = this.getCurrentPage() % slidesCount;
    const normalCurrentPage = (currentPage + slidesCount) % slidesCount;

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

    const props = {
      ...customProps,
      slides,
      position,
      fullWidth,
      isMoving,
      draft,
      instantPage,
      currentPage: normalCurrentPage,
      /* actions */
      changePage,
      nextPage,
      previousPage,
      /* handlers */
      containerHandlers,
    };

    if (component) {
      return React.createElement(component, props);
    }

    return render(props);
  }

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

  getStartFakeItemsNumber() {
    const {infinite} = this.props;
    if (!infinite) {
      return 0;
    }
    return 1;
  }

  getEndFakeItemsNumber() {
    const {infinite, slidesPerPage} = this.props;
    if (!infinite) {
      return 0;
    }
    return slidesPerPage - this.getStartFakeItemsNumber() + 1;
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
    // const {currentPage, slidesCount} = this.props;

    const itemWidth = this.getItemWidth();
    // const defaultOffset = currentPage * itemWidth;

    // const position = this.getPosition();
    // const loopWidth = itemWidth * (slidesCount - 2);
    // console.log(defaultOffset, position);

    // const movement = ((position - defaultOffset) + loopWidth) % loopWidth ;

    const movement = this.getMovement();

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
    const {slidesPerPage, currentPage, infinite} = this.props;

    const itemWidth = this.getItemWidth();

    const startFakeItemsNumber = this.getStartFakeItemsNumber();
    const endFakeItemsNumber = this.getEndFakeItemsNumber();

    const offset = (startFakeItemsNumber + currentPage) * itemWidth;

    if (!this.isDragAllowed()) {
      return offset;
    }

    const {slidesCount} = this.props;

    const workWidth = infinite
      ? itemWidth * slidesCount
      : itemWidth * (slidesCount - slidesPerPage);

    const movement = this.getMovement();
    const position = offset + movement;

    if (!infinite) {
      const startEasing = makeStartEasing();
      const endEasing = makeEndEasing(workWidth);

      if (position < 0) {
        return startEasing(position);
      }

      if (position > workWidth) {
        return endEasing(position);
      }

      return position;
    }

    const direction = Math.sign(movement);
    const minPosition = direction < 0 ? itemWidth - SAFE_ZONE : SAFE_ZONE;
    const maxPosition = workWidth + minPosition;
    const loopWidth = itemWidth * slidesCount;

    return this.infinitizePosition(position, minPosition, maxPosition, loopWidth);
  }

  infinitizePosition(position, minPosition, maxPosition, loopWidth) {
    if (position < minPosition) {
      return this.infinitizePosition(position + loopWidth, minPosition, maxPosition, loopWidth);
    }

    if (position > maxPosition) {
      return this.infinitizePosition(position - loopWidth, minPosition, maxPosition, loopWidth);
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

  getPrependedSlides() {
    const {items} = this.props;
    const startFakeItemsNumber = this.getStartFakeItemsNumber();
    if (startFakeItemsNumber <= 0) {
      return [];
    }
    return items.slice(-startFakeItemsNumber);
  }

  getAppendedSlides() {
    const {items} = this.props;
    const endFakeItemsNumber = this.getEndFakeItemsNumber();
    return items.slice(0, endFakeItemsNumber);
  }

  cloneSlides() {
    const {items} = this.props;
    return this.getPrependedSlides()
      .concat(items)
      .concat(this.getAppendedSlides());
  }

  handleClickCapture = (e) => {
    if (this.isDragging()) {
      e.preventDefault();
      e.stopPropagation();
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
}

export default Frame;
