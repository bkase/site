import React from 'react';
import Immutable from 'immutable';
import { Terminal } from './views.jsx';
import { Flux } from './flux.jsx';
import FluxComponent from 'flummox/component';

const flux = new Flux();

React.render(
<FluxComponent flux={flux} connectToStores={['lines']}>
  <Terminal />
</FluxComponent>,
  document.getElementById('page')
);

flux.getActions('terminal').newStdoutLines([
  "......Hello there",
  ".....................Brandon played with react today",
  ".....................React is cool",
  "Look at it animate..................This is all CSS",
  "Isn't that cool",
  "...................................................",
  "...................................................",
  "Yes"
]);

setTimeout(() => {
  flux.getActions('terminal').newStdoutLines([
    "................Test delay........................."
  ]);
}, 5000);

