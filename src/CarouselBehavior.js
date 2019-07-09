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
    /** A single function-child that receives the individual item and return a functional component (item => props => view) */
    // constructSlide: (item) => (props) => React.Node
  };

  state = {
    currentPage: this.props.initialPage || 0,
    draft: true,
  };

  render() {
    const {slidesPerPage, containerWidth, items, render, infinite} = this.props;
    const {currentPage, draft} = this.state;

    return (
      <Frame
        slidesCount={items.length}
        slidesPerPage={slidesPerPage}
        containerWidth={containerWidth}
        currentPage={currentPage}
        render={render}
        infinite={infinite}
        items={items}
        draft={draft}
        changePage={this.changePage}
        nextPage={this.nextPage}
        previousPage={this.previousPage}
        onPageChange={this.handlePageChange}
      />
    );
  }

  componentDidUpdate(prevProps) {
    if (this.props.containerWidth !== prevProps.containerWidth) {
      // use setTimeout or rAF to return control to browser to render elements properly
      window.requestAnimationFrame(() =>
        this.setState({
          draft: false,
        })
      );
    }
  }

  changePage = (currentPage) => {
    window.requestAnimationFrame(() => {
      this.setState(
        {
          currentPage,
          draft: false,
        },
        () => {
          if (typeof onChange === 'function') {
            onPageChange(currentPage);
          }
        }
      );
    });
  };

  nextPage = () => {
    const {items, infinite, slidesPerPage} = this.props;
    const slidesCount = items.length;
    const prevPage = this.state.currentPage;

    if (!infinite) {
      this.changePage(normalizePage(prevPage + 1, slidesCount - slidesPerPage));
      return;
    }

    if (prevPage < 0 || prevPage > slidesCount - 1) {
      const currentPage = (prevPage + slidesCount) % slidesCount;

      this.setState(
        {
          currentPage,
          draft: true,
        },
        () => {
          window.requestAnimationFrame(() => this.changePage(this.state.currentPage + 1));
        }
      );
      return;
    }

    this.changePage(this.state.currentPage + 1);
  };

  previousPage = () => {
    const {items, infinite, slidesPerPage} = this.props;
    const slidesCount = items.length;
    const prevPage = this.state.currentPage;

    if (!infinite) {
      this.changePage(normalizePage(prevPage - 1, slidesCount - slidesPerPage));
      return;
    }

    if (prevPage < 0 || prevPage > slidesCount) {
      this.setState(
        {
          currentPage: (prevPage + slidesCount) % slidesCount,
          draft: true,
        },
        () => {
          window.requestAnimationFrame(() => this.changePage(this.state.currentPage - 1));
        }
      );
      return;
    }

    this.changePage(this.state.currentPage - 1);
  };

  handlePageChange = (page) => {
    const {items, infinite, slidesPerPage} = this.props;
    const slidesCount = items.length;
    const currentPage = infinite
      ? (page + slidesCount) % slidesCount
      : normalizePage(page, slidesCount - slidesPerPage);
    this.changePage(currentPage);
  };
}

export default CarouselBehavior;
