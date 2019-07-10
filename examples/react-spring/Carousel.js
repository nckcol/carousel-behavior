import React, {useEffect, useState, useRef} from 'react';
import {CarouselBehavior} from '../../esm/index.js';
import {useSpring, animated} from 'react-spring';
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

function getContainerStyle({position, fullWidth, isMoving}) {
  return {
    display: fullWidth > 0 ? 'inline-flex' : 'block',
    width: fullWidth > 0 ? `${fullWidth}px` : 'auto',
    transform: position.interpolate((x) => `translate3d(${-Math.round(x)}px, 0, 0)`),
    cursor: isMoving ? '-webkit-grabbing' : '-webkit-grab',
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

function CarouselBody({
  position,
  slides,
  draft,
  fullWidth,
  isMoving,
  containerHandlers,
  nextPage,
  previousPage,
  containerRef,
}) {
  const {containerPosition} = useSpring({
    containerPosition: position,
    immediate: draft || isMoving,
  });

  const containerStyle = getContainerStyle({
    position: containerPosition,
    draft,
    fullWidth,
    isMoving,
  });

  const slideStyle = getSlideStyle({
    slideWidth: `${100 / slidesCount}%`,
  });

  return (
    <div className="Carousel">
      <animated.div
        className="Carousel-container"
        style={containerStyle}
        ref={containerRef}
        {...containerHandlers}
      >
        {slides.map((number, index) => (
          <div
            key={index}
            style={{
              ...slideStyle,
              backgroundColor: getColorByNumber(number),
            }}
            className="Carousel-slide"
          >
            {number}
          </div>
        ))}
      </animated.div>
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
}

function Carousel({isInfinite}) {
  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(0);
  useEffect(() => {
    if (containerWidth > 0) {
      return;
    }

    const {width} = containerRef.current.getBoundingClientRect();
    setContainerWidth(width);
  }, [containerRef]);

  return (
    <CarouselBehavior
      slidesPerPage={slidesPerPage}
      containerWidth={containerWidth}
      infinite={isInfinite}
      items={numberList}
      component={CarouselBody}
      containerRef={containerRef}
    />
  );
}

export default Carousel;
