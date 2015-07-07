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

const env = flux.getStore('env')
env.setEnv("PWD", "/");
const fs = flux.getStore('fs')
const test = fs.writeFileStream(fs.pathFromString('/', 'readme.txt'));
test.write("Commands:");
test.write(`const programs = {
  'sh': sh,
  'cat': cat,
  'ls': ls,
  'clear': clear,
  'pwd': pwd,
  'echo': echo,
  'cd': cd,
  'mkdir': mkdir,
  'rm': rm,
  'rmdir': rmdir
};`);
test.write("Hello world");
test.end();

