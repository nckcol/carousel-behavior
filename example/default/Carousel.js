import React, {Component} from 'react';
import {CarouselBehavior} from '../../esm/index.js';
import './Carousel.css';

function getTransitionStyle(isMoving, duration = 300, easing = 'ease-out') {
  const transition = `transform ${duration}ms ${easing}`;
  const mousedownTransition = `transform 0ms ${easing}`;

  return isMoving ? mousedownTransition : transition;
}

function getTransformStyle(position) {
  return `translate3d(${-Math.round(position)}px, 0, 0)`;
}

function getCursorStyle(isMoving) {
  return isMoving ? '-webkit-grabbing' : '-webkit-grab';
}

function getContainerStyles({position, fullWidth, isMoving}) {
  const transform = getTransformStyle(position);
  const transition = getTransitionStyle(isMoving);
  const cursor = getCursorStyle(isMoving);

  return {
    display: fullWidth > 0 ? 'inline-flex' : 'block',
    width: fullWidth > 0 ? `${fullWidth}px` : 'auto',
    transform,
    transition,
    WebkitTransition: transition,
    cursor,
  };
}

function getSlideStyle({slideWidth}) {
  return {
    flex: `0 0 ${slideWidth}`,
    width: `${slideWidth}`,
    maxWidth: `${slideWidth}`,
    boxSizing: 'border-box',
  };
}

const numberList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const slidesCount = numberList.length;
const slidesPerPage = 2;

class Carousel extends Component {
  state = {
    containerWidth: 0,
  };

  containerRef = React.createRef();

  render() {
    const {containerWidth} = this.state;

    return (
      <CarouselBehavior
        slidesCount={slidesCount}
        slidesPerPage={slidesPerPage}
        containerWidth={containerWidth}
        render={({position, fullWidth, isMoving, containerHandlers, nextPage, previousPage}) => {
          const containerStyle = getContainerStyles({
            position,
            fullWidth,
            isMoving,
          });
          const slideStyle = getSlideStyle({
            slideWidth: `${100 / slidesCount}%`,
          });
          return (
            <div className="Carousel">
              <div
                className="Carousel-container"
                style={containerStyle}
                ref={this.containerRef}
                {...containerHandlers}
              >
                {numberList.map((number) => (
                  <div key={number} style={slideStyle} className="Carousel-slide">
                    {number}
                  </div>
                ))}
              </div>
              <div className="Carousel-controls">
                <button className="Carousel-button" type="button" onClick={() => previousPage()}>
                  Previous
                </button>
              
                <button className="Carousel-button" type="button" onClick={() => nextPage()}>
                  Next
                </button>
              </div>
            </div>
          );
        }}
      />
    );
  }

  componentDidMount() {
    if (this.state.containerWidth > 0) {
      return;
    }

    const {width: containerWidth} = this.containerRef.current.getBoundingClientRect();

    this.setState({
      containerWidth,
    });
  }

  handleResize = ({bounds}) => {
    this.setState({width: bounds.width});
  };
}

export default Carousel;
