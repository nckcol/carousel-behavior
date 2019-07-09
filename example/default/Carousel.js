import React, {Component} from 'react';
import {CarouselBehavior} from '../../esm/index.js';
import './Carousel.css';

const colors = [
  '#ec407a',
  '#ab47bc',
  '#7e57c2',
  '#5c6bc0',
  '#29b6f6',
  '#26a69a',
  '#d4e157',
  '#ef5350',
];

function getColorByNumber(number) {
  return colors[number % colors.length];
}

function getTransitionStyle(animate, duration = 200, easing = 'ease-out') {
  const transition = `transform ${duration}ms ${easing}`;
  const noTransition = `transform 0ms ${easing}`;

  return animate ? transition : noTransition;
}

function getTransformStyle(position) {
  return `translate3d(${-Math.round(position)}px, 0, 0)`;
}

function getCursorStyle(isMoving) {
  return isMoving ? '-webkit-grabbing' : '-webkit-grab';
}

function getContainerStyles({position, draft, fullWidth, isMoving}) {
  const transform = getTransformStyle(position);
  const transition = getTransitionStyle(!draft && !isMoving);
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
const slidesPerPage = 3;

class Carousel extends Component {
  state = {
    containerWidth: 0,
  };

  containerRef = React.createRef();

  render() {
    const {containerWidth} = this.state;
    const {showReplacement, isInfinite} = this.props;

    return (
      <CarouselBehavior
        slidesPerPage={slidesPerPage}
        containerWidth={containerWidth}
        infinite={isInfinite}
        items={numberList}
        render={({
          position,
          slides,
          draft,
          fullWidth,
          isMoving,
          containerHandlers,
          nextPage,
          previousPage,
        }) => {
          const containerStyle = getContainerStyles({
            draft,
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
                {slides.map((number, index) => (
                  <div
                    key={index}
                    style={{
                      ...slideStyle,
                      backgroundColor: getColorByNumber(showReplacement ? index : number),
                    }}
                    className="Carousel-slide"
                  >
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
