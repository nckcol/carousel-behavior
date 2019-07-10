import React from 'react';
import {render} from 'react-dom';
import Carousel from './Carousel';

import './App.css';

const App = () => {
  const [showReplacement, changeShowReplacementState] = React.useState(false);
  const [isInfinite, changeIsInfiniteState] = React.useState(false);
  return (
    <div className="App">
      <h1>Carousel Behavior Component</h1>
      <h3>
        Using <a href="https://www.react-spring.io/">react-spring</a> as animation library
      </h3>
      <p>
        <label>
          <input
            type="checkbox"
            checked={isInfinite}
            onChange={({target}) => changeIsInfiniteState(target.checked)}
          />{' '}
          Infinite
        </label>
      </p>

      <Carousel showReplacement={showReplacement} isInfinite={isInfinite} />
    </div>
  );
};

export default App;

render(<App />, document.querySelector('#root'));
