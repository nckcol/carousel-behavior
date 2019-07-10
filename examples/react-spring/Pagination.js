import React, { Component, Fragment } from 'react';

class Pagination extends Component {
  handleClick = (page) => (e) => {
    const { pageChange } = this.props;
    pageChange(e, page);
  };

  render() {
    const { slidesCount, perPage, page, current, count, paginationContainer } = this.props;
    const styles = {
      textAlign: 'center',
    };

    const count = slidesCount - perPage + 1;

    return (
      <Fragment>
        {React.cloneElement(paginationContainer, {
          style: { ...styles },
          children: [...new Array(count)].map((_, index) =>
            React.cloneElement(page, {
              key: index,
              children: index + 1,
              page: index,
              current: current === index,
              onClick: this.handleClick(index),
            }),
          ),
        })}
      </Fragment>
    );
  }
}

export default Pagination;
