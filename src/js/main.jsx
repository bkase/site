import React from 'react';
import Immutable from 'immutable';
import { Terminal } from './views.jsx';
import { Flux } from './flux.jsx';
import FluxComponent from 'flummox/component';
import { connectTermToDOM } from './term.js';

const flux = new Flux();

React.render(
<FluxComponent flux={flux} connectToStores={['lines']}>
  <Terminal />
</FluxComponent>,
  document.getElementById('page')
);

connectTermToDOM(flux);

const fs = flux.getStore('fs')
const test = fs.writeFileStream(fs.pathFromString('test.txt'));
test.write("Hello world");
test.write("*Hello world*");
test.write("YES Hello world");
test.end();

