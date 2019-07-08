import React, {Component} from 'react';
import Frame from './Frame';

function normalizePage(page, lastPage, firstPage = 0) {
  if (page <= firstPage) {
    return firstPage;
  }

  if (page >= lastPage) {
    return lastPage;
  }

  return page;
}

class CarouselBehavior extends Component {
  static defaultProps = {
    resizeDebounce: 250,
    slidesPerPage: 1,
    initialPage: 0,
    draggable: true,
    threshold: 20,
    loop: false,
    onInit: () => {},
    onPageChange: false,
    containerWidth: 0,
  };

  state = {
    currentPage: this.props.initialPage || 0,
  };

  render() {
    const {slidesCount, slidesPerPage, containerWidth, render} = this.props;
    const { currentPage } = this.state;

    return (
      <Frame
        slidesCount={slidesCount}
        containerWidth={containerWidth}
        currentPage={currentPage}
        slidesPerPage={slidesPerPage}
        render={render}
        changePage={this.changePage}
        nextPage={this.nextPage}
        previousPage={this.previousPage}
        onPageChange={this.handlePageChange}
      />
    );
  }

  changePage = (number) => {
    const {slidesPerPage, slidesCount, onChange} = this.props;

    const currentPage = normalizePage(number, slidesCount - slidesPerPage);

    this.setState({
      currentPage,
    });

    if (typeof onChange === 'function') {
      onPageChange(currentPage);
    }
  }

  nextPage = () => {
    this.changePage(this.state.currentPage + 1);
  }

  previousPage = () => {
    this.changePage(this.state.currentPage - 1);
  }

  handlePageChange = (page) => {
    this.changePage(page);
  };
}

export default CarouselBehavior;
