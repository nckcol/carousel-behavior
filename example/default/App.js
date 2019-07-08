import React from 'react';
import {render} from 'react-dom';
import Carousel from './Carousel';

import './App.css';

const App = () => {
  return (
    <div>
      <h1>Hello!</h1>
      <Carousel />
    </div>
  );
};

export default App;

render(<App />, document.querySelector('#root'));
