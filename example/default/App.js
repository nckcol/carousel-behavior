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

      <p>
        <label>
          <input
            type="checkbox"
            checked={showReplacement}
            onChange={({target}) => changeShowReplacementState(target.checked)}
          />{' '}
          Show infinite slide replacement
        </label>
        <br />
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
