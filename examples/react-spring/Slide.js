import React, { Component } from 'react';

class Slide extends Component {
  getStyles(width) {
    return {
      flex: `0 0 ${width}%`,
      width: `${width}%`,
      maxWidth: `${width}%`,
      boxSizing: 'border-box',
    };
  }

  render() {
    const { width, children } = this.props;
    const styles = this.getStyles(width);

    return <div style={styles}>{children}</div>;
  }
}

export default Slide;
